import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { analyzeViolation, type ViolationStatus } from '../utils/visionLogic';
import { AlertTriangle, UserX, Users } from 'lucide-react';

export interface WebcamFeedHandle {
    captureSnapshot: () => string | null;
    video: HTMLVideoElement | null;
}

interface WebcamFeedProps {
    onViolation?: (type: 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' | 'LIVENESS_FAILURE') => void;
}

export const WebcamFeed = forwardRef<WebcamFeedHandle, WebcamFeedProps>(({ onViolation }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { faceLandmarker, isLoading } = useMediaPipe();
    const [violation, setViolation] = useState<ViolationStatus | null>(null);
    const requestRef = useRef<number>(0);
    const lastViolationTime = useRef<number>(0);
    const lastBlinkTime = useRef<number>(Date.now());

    useImperativeHandle(ref, () => ({
        captureSnapshot: () => {
            if (videoRef.current) {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0);
                    return canvas.toDataURL('image/jpeg');
                }
            }
            return null;
        },
        video: videoRef.current
    }));

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startCamera();

        return () => {
            // Cleanup stream
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const predictWebcam = () => {
        if (faceLandmarker && videoRef.current && videoRef.current.readyState === 4) {
            const startTimeMs = performance.now();
            const results = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

            const status = analyzeViolation(results);
            setViolation(status);

            // Report violations to parent (throttled)
            const now = Date.now();

            // Liveness Check (Blink Detection)
            if (status.isBlinking) {
                lastBlinkTime.current = now;
            } else {
                // If no blink for 60 seconds (60000ms)
                if (now - lastBlinkTime.current > 60000) {
                    if (now - lastViolationTime.current > 5000) { // Throttle liveness alerts
                        onViolation?.('LIVENESS_FAILURE');
                        lastViolationTime.current = now;
                    }
                }
            }

            if (now - lastViolationTime.current > 2000) { // Throttle 2s
                if (status.isNoFace) {
                    onViolation?.('NO_FACE');
                    lastViolationTime.current = now;
                } else if (status.isMultipleFaces) {
                    onViolation?.('MULTIPLE_FACES');
                    lastViolationTime.current = now;
                } else if (status.isLookingAway) {
                    onViolation?.('LOOKING_AWAY');
                    lastViolationTime.current = now;
                }
            }
        }
        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    useEffect(() => {
        if (faceLandmarker && !isLoading) {
            predictWebcam();
        }
    }, [faceLandmarker, isLoading]);

    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-black/50">
                    Loading AI Model...
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
            />

            {/* Overlay Alerts */}
            {violation && (
                <div className="absolute top-4 left-4 right-4 flex flex-col gap-2">
                    {violation.isNoFace && (
                        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <UserX className="w-5 h-5" />
                            <span className="font-semibold">No Face Detected!</span>
                        </div>
                    )}

                    {violation.isMultipleFaces && (
                        <div className="bg-red-600/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">Multiple People Detected!</span>
                        </div>
                    )}

                    {violation.isLookingAway && !violation.isNoFace && !violation.isMultipleFaces && (
                        <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">Please look at the screen ({violation.gazeDirection})</span>
                        </div>
                    )}
                </div>
            )}

            {/* Debug Info (Optional - can be removed in prod) */}
            <div className="absolute bottom-2 right-2 text-xs text-white/50 font-mono">
                {violation?.faceCount} Face(s)
            </div>
        </div>
    );
});

WebcamFeed.displayName = 'WebcamFeed';
