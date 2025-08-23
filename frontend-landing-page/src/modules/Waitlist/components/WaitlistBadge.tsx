'use client';

import Link from 'next/link';

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
                    <Link href="/dashboard" className="bg-white border border-gray-500/30 rounded-2xl px-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                        <p>Explore Gallery</p>
                    </Link>
                    
                </div>
            </div>
        </>
    );
};