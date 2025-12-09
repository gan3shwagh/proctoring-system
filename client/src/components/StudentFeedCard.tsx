import React from 'react';
import clsx from 'clsx';

export interface StudentFeedCardProps {
    studentName: string;
    studentId: string;
    status: 'ok' | 'warning' | 'alert';
    imageUrl?: string;
    hasAudio: boolean;
    isScreenSharing: boolean;
    screenUrl?: string;
    stream?: MediaStream;
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
    screenUrl,
    stream,
    alertMessage,
    onClick
}) => {
    const statusColors = {
        ok: 'border-green-500',
        warning: 'border-yellow-500',
        alert: 'border-red-500'
    };

    const statusBgColors = {
        ok: 'bg-green-500/80',
        warning: 'bg-yellow-500/80',
        alert: 'bg-red-500/80'
    };

    const statusIcons = {
        ok: '✓',
        warning: '⚠',
        alert: '✕'
    };

    const statusText = {
        ok: 'OK',
        warning: 'WARNING',
        alert: 'ALERT'
    };

    return (
        <div
            className={clsx(
                "flex flex-col rounded-xl overflow-hidden border-2 bg-white cursor-pointer transition-transform hover:scale-[1.02] shadow-sm",
                statusColors[status]
            )}
            onClick={onClick}
        >
            <div className="relative aspect-video bg-black group">
                {/* Main View: WebRTC Stream (if available) */}
                {stream ? (
                    <video
                        ref={ref => {
                            if (ref) ref.srcObject = stream;
                        }}
                        autoPlay
                        playsInline
                        muted={!hasAudio} // Mute if audio is disabled or local
                        className="h-full w-full object-cover"
                    />
                ) : screenUrl ? (
                    <img
                        alt={`Screen of ${studentName}`}
                        className="h-full w-full object-cover"
                        src={screenUrl}
                    />
                ) : imageUrl ? (
                    <img
                        alt={`Live feed of ${studentName}`}
                        className="h-full w-full object-cover"
                        src={imageUrl}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900 text-gray-500">
                        <span className="text-4xl">📹</span>
                    </div>
                )}

                {/* PiP View: Webcam (if screen share is active) */}
                {screenUrl && imageUrl && (
                    <div className="absolute bottom-2 right-2 w-1/3 aspect-video rounded-lg overflow-hidden border border-white/20 shadow-lg">
                        <img
                            alt={`Webcam of ${studentName}`}
                            className="h-full w-full object-cover"
                            src={imageUrl}
                        />
                    </div>
                )}

                <div className={clsx(
                    "absolute top-2 left-2 flex items-center gap-1.5 text-white text-xs font-semibold px-2 py-1 rounded-full",
                    statusBgColors[status],
                    status === 'warning' && 'text-gray-900'
                )}>
                    <span className="text-sm">{statusIcons[status]}</span>
                    {statusText[status]}
                </div>

                {alertMessage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                        {alertMessage}
                    </div>
                )}
            </div>

            <div className="p-3 bg-white">
                <p className="font-semibold text-sm text-gray-900">
                    {studentName} <span className="text-gray-600 font-normal">(ID: {studentId.slice(0, 8)}...)</span>
                </p>
                <div className="flex items-center gap-3 text-gray-600 mt-1">
                    <span
                        className={clsx("text-lg", isScreenSharing ? "text-blue-600" : "opacity-50")}
                        title={isScreenSharing ? "Screen sharing active" : "Screen sharing inactive"}
                    >
                        🖥️
                    </span>
                    <span
                        className={clsx(
                            "text-lg",
                            hasAudio ? "text-green-600" : "text-red-600"
                        )}
                        title={hasAudio ? "Audio on" : "Audio off"}
                    >
                        {hasAudio ? '🎤' : '🔇'}
                    </span>
                </div>
            </div>
        </div>
    );
};
