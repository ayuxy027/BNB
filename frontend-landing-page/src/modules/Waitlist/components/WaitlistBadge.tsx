'use client';

export default function WaitlistBadge() {
    return (
        <>
            <style jsx>{`
                @keyframes shine {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .badge-bg {
                    background: conic-gradient(from 0deg, #00F5FF, #444, #444, #00F5FF, #444, #444, #444, #00F5FF);
                    background-size: 300% 300%;
                    animation: shine 6s ease-out infinite;
                }
            `}</style>

            <div className="badge-bg rounded-full p-0.5">
                <div className="flex items-center space-x-2.5 border border-gray-500/30 rounded-full p-1 text-sm text-gray-800 bg-white">
                    <div className="bg-white border border-gray-500/30 rounded-2xl px-3 py-1 cursor-pointer">
                        <p>Join Beta 1.0v</p>
                    </div>
                    <p className="pr-3">Beta Version 1.0 Launching Soon</p>
                </div>
            </div>
        </>
    );
};