import { useEffect, useState, useCallback } from 'react';

interface ExamIntegrityOptions {
    onViolation: (type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT') => void;
}

export const useExamIntegrity = ({ onViolation }: ExamIntegrityOptions) => {
    const [isFullscreen, setIsFullscreen] = useState(true); // Assume true initially or check
    const [isTabActive, setIsTabActive] = useState(true);

    const enterFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.error("Error attempting to enable full-screen mode:", err);
        }
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsTabActive(false);
                onViolation('TAB_SWITCH');
            } else {
                setIsTabActive(true);
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                onViolation('FULLSCREEN_EXIT');
            } else {
                setIsFullscreen(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Attempt to enter fullscreen on mount
        enterFullscreen();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [onViolation, enterFullscreen]);

    return {
        isFullscreen,
        isTabActive,
        enterFullscreen
    };
};
