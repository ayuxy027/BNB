'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../../../common/Navbar';
import WaitlistMarquee from './WaitlistMarquee';
import WaitlistBadge from './WaitlistBadge';
import underline from '../assets/underline.svg';

const poppinsFontUrl =
    "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";

const WaitlistHero: React.FC = () => {
    // Add font to head
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = 'poppins-font-link';
            if (!document.getElementById(id)) {
                const link = document.createElement('link');
                link.id = id;
                link.rel = 'stylesheet';
                link.href = poppinsFontUrl;
                document.head.appendChild(link);
            }
        }
    }, []);

    // Add global font-family
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.style.fontFamily = "'Poppins', sans-serif";
        }
        return () => {
            if (typeof window !== 'undefined') {
                document.body.style.fontFamily = '';
            }
        };
    }, []);

    return (
        <section className="flex flex-col items-center bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gradientBg.svg')] bg-cover text-gray-800 pb-16 text-sm">
            <Navbar />

            

            <div className="relative text-center mt-20">
                <h1
                    className="text-4xl md:text-6xl font-medium max-w-4xl mt-5 bg-gradient-to-r from-black to-[#748298] text-transparent bg-clip-text">
                    Create. Display. Monetize. With AI & Web3.
                </h1>
                {/* Decorative underline positioned under the text */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Image
                        src={underline}
                        alt=""
                        width={224}
                        height={50}
                        className="w-56 h-auto"
                        style={{ maxWidth: '14rem' }}
                    />
                </div>
                {/* Second underline line */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <Image
                        src={underline}
                        alt=""
                        width={192}
                        height={50}
                        className="w-48 h-auto"
                        style={{ maxWidth: '12rem' }}
                    />
                </div>
            </div>
            <p className="text-slate-600 md:text-base max-md:px-2 text-center max-w-xl mt-7">
            An AI-driven image generator that turns text prompts into stunning visuals, enables seamless showcasing, and uses Web3 for transparent, decentralized licensing.
            </p>

            <div className="mt-5">
                <WaitlistBadge />
            </div>

            <div className="mt-16">
                <WaitlistMarquee />
            </div>
        </section>
    );
};

export default WaitlistHero;
