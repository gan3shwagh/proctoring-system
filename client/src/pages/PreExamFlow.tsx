import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { CheckCircle, CircleDot, Clock, Shield, Video, Mic, Monitor, Wifi, IdCard, Scan, ScrollText, DoorOpen } from 'lucide-react';

type StepKey = 'system' | 'id' | 'room' | 'rules' | 'waiting';

const steps: { key: StepKey; label: string; icon: React.ComponentType<any>; desc: string }[] = [
    { key: 'system', label: 'System Check', icon: Shield, desc: 'Webcam, mic, internet, screen' },
    { key: 'id', label: 'ID Verification', icon: IdCard, desc: 'Photo match & ID capture' },
    { key: 'room', label: 'Room Scan', icon: Scan, desc: 'Show surroundings' },
    { key: 'rules', label: 'Rules', icon: ScrollText, desc: 'Agree to guidelines' },
    { key: 'waiting', label: 'Waiting Room', icon: Clock, desc: 'Join when ready' },
];

export const PreExamFlow: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<StepKey>('system');
    const [systemPassed, setSystemPassed] = useState(false);
    const [idPassed, setIdPassed] = useState(false);
    const [roomPassed, setRoomPassed] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const canProceed = useMemo(() => ({
        system: systemPassed,
        id: idPassed,
        room: roomPassed,
        rules: agreed,
        waiting: true
    }), [systemPassed, idPassed, roomPassed, agreed]);

    const goNext = () => {
        const order: StepKey[] = ['system', 'id', 'room', 'rules', 'waiting'];
        const idx = order.indexOf(activeStep);
        const next = order[idx + 1];
        if (!next) return;
        setActiveStep(next);
    };

    const handleStartExam = () => {
        navigate(`/exam/${id}`);
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 'system':
                return (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">System Check</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Webcam', icon: Video, status: 'ok' },
                                { label: 'Microphone', icon: Mic, status: 'ok' },
                                { label: 'Internet', icon: Wifi, status: 'ok' },
                                { label: 'Screen', icon: Monitor, status: 'ok' },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <Icon className="w-5 h-5 text-blue-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{item.label}</p>
                                            <p className="text-xs text-slate-500">Ready</p>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => { setSystemPassed(true); goNext(); }}
                                className="btn-primary px-5 py-2"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 'id':
                return (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <IdCard className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">Identity Verification</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">Hold your government ID close to the webcam and capture a selfie.</p>
                        <div className="h-40 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-500">
                            Webcam preview placeholder
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIdPassed(true)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Mark Verified</button>
                            <button
                                onClick={() => { if (idPassed) goNext(); }}
                                disabled={!idPassed}
                                className={`btn-primary px-5 py-2 ${!idPassed ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 'room':
                return (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Scan className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">Room & Environment Scan</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">Show your desk, under the desk, walls, and surroundings. If live proctoring is enabled, follow proctor instructions.</p>
                        <ul className="space-y-2 text-sm text-slate-700 mb-4">
                            <li>• Show left, right, and behind you</li>
                            <li>• Show under the desk</li>
                            <li>• Ensure no unauthorized materials</li>
                        </ul>
                        <div className="h-32 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-500">
                            Room scan placeholder
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setRoomPassed(true)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Mark Complete</button>
                            <button
                                onClick={() => { if (roomPassed) goNext(); }}
                                disabled={!roomPassed}
                                className={`btn-primary px-5 py-2 ${!roomPassed ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 'rules':
                return (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ScrollText className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">Rules & Guidelines</h2>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-700 mb-4">
                            <li>• No phones or secondary devices</li>
                            <li>• Stay in view; avoid leaving your seat</li>
                            <li>• No talking; avoid background people</li>
                            <li>• Screen/tab switching is restricted</li>
                        </ul>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                            I agree to follow these rules
                        </label>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => { if (agreed) goNext(); }}
                                disabled={!agreed}
                                className={`btn-primary px-5 py-2 ${!agreed ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 'waiting':
                return (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">Waiting Room</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">If live proctoring is enabled, a proctor will join shortly. Otherwise, you can start once the exam window opens.</p>
                        <div className="flex items-center gap-3 mb-4">
                            <CircleDot className="w-4 h-4 text-green-500 animate-pulse" />
                            <span className="text-sm text-slate-700">Queue position: #3 • Est. wait 2-3 mins</span>
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <DoorOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-slate-700">You will enter the exam once the proctor admits you or the window opens.</span>
                        </div>
                        <button onClick={handleStartExam} className="btn-primary px-6 py-2">
                            Go to Exam
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--background)]">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--text)]">Pre-Exam Checks</h1>
                                <p className="text-sm text-[var(--text-muted)]">Complete these steps before starting your exam.</p>
                            </div>
                        </div>

                        {/* Stepper */}
                        <div className="bg-white dark:bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                {steps.map((step) => {
                                    const Icon = step.icon;
                                    const isActive = activeStep === step.key;
                                    const isDone = steps.findIndex(s => s.key === step.key) < steps.findIndex(s => s.key === activeStep);
                                    return (
                                        <div
                                            key={step.key}
                                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                                                isActive
                                                    ? 'border-blue-200 bg-blue-50'
                                                    : 'border-[var(--border)] bg-white dark:bg-[var(--card)]'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-[var(--text)]">{step.label}</p>
                                                <p className="text-[var(--text-muted)]">{step.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {renderStepContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

