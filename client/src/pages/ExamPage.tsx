import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebcamFeed } from '../components/WebcamFeed';
import type { WebcamFeedHandle } from '../components/WebcamFeed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useExamIntegrity } from '../hooks/useExamIntegrity';
import { useAudioMonitor } from '../hooks/useAudioMonitor';
import { useScreenMonitor } from '../hooks/useScreenMonitor';
import { useWebRTC } from '../hooks/useWebRTC';
import { AlertTriangle, Maximize, Mic, Loader2 } from 'lucide-react';
import { examApi, violationApi, type Exam } from '../services/api';

export const ExamPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState<Exam | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3600); // Will be set from exam data
    const [violations, setViolations] = useState<{ message: string, severity: 'critical' | 'warning', timestamp: string }[]>([]);
    const lastAudioViolationTime = useRef<number>(0);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    const { compareFaces } = useMediaPipe();
    const lastVerificationTime = useRef<number>(0);
    const webcamRef = useRef<WebcamFeedHandle>(null);

    // Fetch user face photo
    useEffect(() => {
        const fetchUserPhoto = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('user_profiles')
                .select('face_photo')
                .eq('user_id', user.id)
                .single();

            if (data?.face_photo) {
                setUserPhoto(data.face_photo);
            }
        };

        fetchUserPhoto();
    }, [user]);

    // Fetch exam and start session
    useEffect(() => {
        const initExam = async () => {
            if (!id || !user) return;

            try {
                setLoading(true);
                const examData = await examApi.getById(id);
                setExam(examData);
                setTimeLeft(examData.duration_minutes * 60);

                // Start exam session with authenticated user ID
                const session = await examApi.startSession(id, user.id);
                setSessionId(session.id);
            } catch (error) {
                console.error('Error loading exam:', error);
                alert('Failed to load exam. Returning to dashboard.');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        initExam();
    }, [id, user, navigate]);

    const handleViolation = useCallback(async (type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'AUDIO_DETECTED' | 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' | 'USER_MISMATCH' | 'FOCUS_LOST' | 'LIVENESS_FAILURE') => {
        const now = Date.now();
        let message = "";
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

        if (type === 'TAB_SWITCH') {
            message = "Tab switching detected!";
            severity = 'critical';
        } else if (type === 'FULLSCREEN_EXIT') {
            message = "Full-screen exited!";
            severity = 'critical';
        } else if (type === 'AUDIO_DETECTED') {
            if (now - lastAudioViolationTime.current < 2000) return;
            lastAudioViolationTime.current = now;
            message = "Audio detected!";
            severity = 'critical';
        } else if (type === 'NO_FACE') {
            message = "No face detected!";
            severity = 'critical';
        } else if (type === 'MULTIPLE_FACES') {
            message = "Multiple people detected!";
            severity = 'critical';
        } else if (type === 'LOOKING_AWAY') {
            message = "Looking away from screen";
            severity = 'medium';
        } else if (type === 'USER_MISMATCH') {
            message = "User identity mismatch!";
            severity = 'critical';
        } else if (type === 'FOCUS_LOST') {
            message = "Window focus lost!";
            severity = 'high';
        } else if (type === 'LIVENESS_FAILURE') {
            message = "Liveness check failed (No blink detected)!";
            severity = 'critical';
        }

        const violationData = {
            message,
            severity: severity as 'critical' | 'warning',
            timestamp: new Date().toLocaleTimeString()
        };

        setViolations(prev => [...prev, violationData]);

        // Log violation to backend
        if (sessionId) {
            try {
                await violationApi.log({
                    session_id: sessionId,
                    type,
                    severity,
                });
            } catch (error) {
                console.error('Failed to log violation:', error);
            }
        }
    }, [sessionId]);

    const { isFullscreen, enterFullscreen } = useExamIntegrity({ onViolation: (type) => handleViolation(type) });
    const { isTalking } = useAudioMonitor({ onViolation: () => handleViolation('AUDIO_DETECTED') });
    // WebRTC Broadcasting
    const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);
    const { stream: screenStream } = useScreenMonitor({
        sessionId,
        onViolation: (type) => handleViolation(type)
    });

    // Combine Webcam + Screen into one stream (or just send screen if active)
    useEffect(() => {
        if (screenStream) {
            // If screen sharing is active, prioritize it. 
            // Ideally we'd send both tracks, but for simplicity let's send the screen stream.
            // We can add the webcam audio track if needed.
            setCombinedStream(screenStream);
        } else if (webcamRef.current?.video) {
            // Fallback to webcam if no screen share (though screen share is mandatory)
            // We need to capture the stream from the webcam component
            // This is a bit tricky since WebcamFeed encapsulates the logic.
            // For now, let's rely on screenStream being the primary broadcast.
        }
    }, [screenStream]);

    useWebRTC({
        roomId: id || 'default-room', // Use Exam ID so all students are in the same room
        userId: user?.id || 'unknown-student',
        isBroadcaster: true,
        localStream: combinedStream
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert("Time's up! Submitting exam.");
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Periodic Face Verification
    useEffect(() => {
        if (!userPhoto || !webcamRef.current) return;

        const verifyFace = async () => {
            const now = Date.now();
            if (now - lastVerificationTime.current < 5000) return; // Check every 5s

            // Access the video element exposed by WebcamFeed
            const videoElement = webcamRef.current?.video;
            if (videoElement && videoElement.readyState === 4) {
                // Create an image element from the userPhoto base64
                const refImage = new Image();
                refImage.src = userPhoto;
                await refImage.decode();

                const similarity = compareFaces(videoElement, refImage);
                // console.log("Face Similarity:", similarity);

                // Threshold for MobileNetV3 cosine similarity
                // Usually > 0.8 is a match, but let's be lenient for now
                if (similarity < 0.75) {
                    // Double check: if similarity is 0, it might mean no face detected by embedder or model not loaded
                    // We only flag if we are sure it's a mismatch (similarity > 0 but low)
                    if (similarity > 0) {
                        handleViolation('USER_MISMATCH');
                    }
                }
                lastVerificationTime.current = now;
            }
            requestAnimationFrame(verifyFace);
        };

        const intervalId = setInterval(verifyFace, 1000); // Trigger check loop
        return () => clearInterval(intervalId);
    }, [userPhoto, compareFaces, handleViolation]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Integrity Warning Overlay */}
            {!isFullscreen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white p-4">
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Full-Screen Required</h2>
                    <p className="mb-6 text-center max-w-md">
                        You must remain in full-screen mode during the exam.
                        Exiting full-screen is recorded as a violation.
                    </p>
                    <button
                        onClick={enterFullscreen}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                        <Maximize className="w-5 h-5" />
                        Return to Full-Screen
                    </button>
                </div>
            )}

            <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Exam #{id}</h1>
                    {isTalking && (
                        <div className="flex items-center gap-1 text-red-500 animate-pulse bg-red-50 px-2 py-1 rounded">
                            <Mic className="w-5 h-5" />
                            <span className="text-xs font-bold">AUDIO DETECTED</span>
                        </div>
                    )}
                </div>
                <div className={`font-mono font-bold text-xl ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex-1 p-6 flex gap-6 max-w-7xl mx-auto w-full">
                {/* Question Section */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-8 flex-1">
                        {loading || !exam ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-3 text-gray-600">Loading exam...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
                                    <span className="text-sm font-medium text-gray-400">Multiple Choice</span>
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                                    {exam.questions[currentQuestionIndex].question}
                                </h2>

                                <div className="space-y-4">
                                    {exam.questions[currentQuestionIndex].options.map((option: string, idx: number) => (
                                        <label key={idx} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                            <input type="radio" name="answer" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="ml-3 text-gray-700 group-hover:text-gray-900">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0 || !exam}
                            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {currentQuestionIndex === (exam?.questions.length || 1) - 1 ? (
                            <button
                                onClick={async () => {
                                    if (!sessionId) return;

                                    const confirmed = window.confirm('Are you sure you want to submit your exam? This action cannot be undone.');
                                    if (!confirmed) return;

                                    try {
                                        // Submit exam
                                        await examApi.submitSession(id!, sessionId);
                                        alert('Exam submitted successfully!');
                                        navigate('/');
                                    } catch (error) {
                                        console.error('Error submitting exam:', error);
                                        alert('Failed to submit exam. Please try again.');
                                    }
                                }}
                                disabled={!exam || !sessionId}
                                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                Submit Exam
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min((exam?.questions.length || 1) - 1, prev + 1))}
                                disabled={currentQuestionIndex === (exam?.questions.length || 1) - 1 || !exam}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar: Camera & Violations */}
                <div className="w-80 flex flex-col gap-6">
                    <div className="w-full h-60 bg-black rounded-xl overflow-hidden relative shadow-lg">
                        <WebcamFeed onViolation={handleViolation} />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 flex-1 overflow-y-auto max-h-[calc(100vh-24rem)]">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Session Log
                        </h3>
                        {violations.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No violations detected yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {violations.map((v, i) => (
                                    <li
                                        key={i}
                                        className={`text-xs p-3 rounded border flex flex-col gap-1 ${v.severity === 'critical'
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>{v.message}</span>
                                            <span className="text-[10px] opacity-75">{v.timestamp}</span>
                                        </div>
                                        {v.severity === 'critical' && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider bg-red-100 w-fit px-1 rounded">Critical</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
