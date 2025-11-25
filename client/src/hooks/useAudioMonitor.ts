import { useEffect, useState, useRef } from 'react';

interface AudioMonitorOptions {
    onViolation: () => void;
    threshold?: number; // 0 to 255, default 50
}

export const useAudioMonitor = ({ onViolation, threshold = 15 }: AudioMonitorOptions) => {
    const [isTalking, setIsTalking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        const startAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const audioContext = new AudioContextClass();

                // Resume context if suspended (browser policy)
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);

                source.connect(analyser);
                analyser.fftSize = 256;

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;
                sourceRef.current = source;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const checkAudioLevel = () => {
                    if (!analyserRef.current) return;

                    analyserRef.current.getByteFrequencyData(dataArray);

                    // Calculate average volume
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;

                    // console.log("Audio Level:", average); // Debugging

                    if (average > threshold) {
                        setIsTalking(true);
                        // Debounce violation logging could be handled here or in parent
                        // For now, we'll just set state and let parent handle repeated calls if needed
                        // But to avoid spamming, we might want a cooldown
                    } else {
                        setIsTalking(false);
                    }

                    requestRef.current = requestAnimationFrame(checkAudioLevel);
                };

                checkAudioLevel();

            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        };

        // Add click listener to resume audio context if needed
        const handleUserInteraction = () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };
        document.addEventListener('click', handleUserInteraction);

        startAudio();

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }
            cancelAnimationFrame(requestRef.current);
        };
    }, [threshold]);

    // Trigger violation callback when isTalking becomes true
    useEffect(() => {
        if (isTalking) {
            // Simple debounce/throttle logic could be added here
            // For this MVP, we just call it. Parent should handle deduplication.
            const timeout = setTimeout(() => {
                onViolation();
            }, 500); // Only trigger if sustained for 500ms? Or just trigger immediately.
            // Let's trigger immediately but maybe throttle in parent.
            // Actually, let's just call it.
            return () => clearTimeout(timeout);
        }
    }, [isTalking, onViolation]);

    return { isTalking };
};
