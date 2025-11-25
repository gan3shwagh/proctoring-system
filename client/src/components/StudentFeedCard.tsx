import React from 'react';
import clsx from 'clsx';

export interface StudentFeedCardProps {
    studentName: string;
    studentId: string;
    status: 'ok' | 'warning' | 'alert';
    imageUrl?: string;
    hasAudio: boolean;
    isScreenSharing: boolean;
    alertMessage?: string;
    onClick?: () => void;
}

export const StudentFeedCard: React.FC<StudentFeedCardProps> = ({
    studentName,
    studentId,
    status,
    imageUrl,
    hasAudio,
    isScreenSharing,
    alertMessage,
    onClick
}) => {
    const statusColors = {
        ok: 'border-success',
        warning: 'border-warning',
        alert: 'border-danger'
    };

    const statusBgColors = {
        ok: 'bg-success/80',
        warning: 'bg-warning/80',
        alert: 'bg-danger/80'
    };

    const statusIcons = {
        ok: 'check_circle',
        warning: 'warning',
        alert: 'error'
    };

    const statusText = {
        ok: 'OK',
        warning: 'WARNING',
        alert: 'ALERT'
    };

    return (
        <div
            className={clsx(
                "flex flex-col rounded-xl overflow-hidden border-2 bg-surface-light dark:bg-surface-dark cursor-pointer transition-transform hover:scale-[1.02]",
                statusColors[status]
            )}
            onClick={onClick}
        >
            <div className="relative aspect-video bg-black">
                {imageUrl ? (
                    <img
                        alt={`Live feed of ${studentName}`}
                        className="h-full w-full object-cover"
                        src={imageUrl}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900 text-gray-500">
                        <span className="material-symbols-outlined text-4xl">videocam_off</span>
                    </div>
                )}

                <div className={clsx(
                    "absolute top-2 left-2 flex items-center gap-1.5 text-white text-xs font-semibold px-2 py-1 rounded-full",
                    statusBgColors[status],
                    status === 'warning' && 'text-black'
                )}>
                    <span className="material-symbols-outlined !text-sm">{statusIcons[status]}</span>
                    {statusText[status]}
                </div>

                {alertMessage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                        {alertMessage}
                    </div>
                )}
            </div>

            <div className="p-3">
                <p className="font-semibold text-sm text-text-light-primary dark:text-dark-primary">
                    {studentName} <span className="text-text-light-secondary dark:text-dark-secondary font-normal">(ID: {studentId})</span>
                </p>
                <div className="flex items-center gap-3 text-text-light-secondary dark:text-dark-secondary mt-1">
                    <span
                        className={clsx("material-symbols-outlined text-lg", isScreenSharing ? "text-primary" : "opacity-50")}
                        title={isScreenSharing ? "Screen sharing active" : "Screen sharing inactive"}
                    >
                        desktop_windows
                    </span>
                    <span
                        className={clsx(
                            "material-symbols-outlined text-lg",
                            hasAudio ? "text-success" : "text-danger"
                        )}
                        title={hasAudio ? "Audio on" : "Audio off"}
                    >
                        {hasAudio ? 'mic' : 'mic_off'}
                    </span>
                </div>
            </div>
        </div>
    );
};
