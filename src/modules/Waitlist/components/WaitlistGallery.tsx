'use client';

import React, { useEffect } from "react";
import Image from "next/image";

const images = [
    {
        src: "https://images.unsplash.com/photo-1562619371-b67725b6fde2?q=80&w=600&h=900&auto=format&fit=crop",
        alt: "image 1",
    },
    {
        src: "https://images.unsplash.com/photo-1633983482450-bfb7b566fe6a?q=80&w=600&h=900&auto=format&fit=crop",
        alt: "image 2",
    },
    {
        src: "https://plus.unsplash.com/premium_photo-1671209879721-3082e78307e3?q=80&w=600&h=900&auto=format&fit=crop",
        alt: "image 3",
    },
    {
        src: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&h=900&auto=format&fit=crop",
        alt: "image 4",
    },
];

export default function WaitlistGallery() {
    // Dynamically load the Poppins font for client-side rendering
    useEffect(() => {
        const id = "poppins-font-link";
        if (!document.getElementById(id)) {
            const link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            link.href =
                "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";
            document.head.appendChild(link);
        }
        document.body.style.fontFamily = "'Poppins', sans-serif";
        return () => {
            document.body.style.fontFamily = "";
        };
    }, []);

    return (
        <div className="relative">
            {/* Person SVG Background */}
            <div className="absolute right-0 top-0 w-96 h-full opacity-20 pointer-events-none z-0 transform translate-x-8 -translate-y-64 -rotate-40 hidden md:block">
                <Image
                    src="/person.svg"
                    alt="Person background"
                    width={384}
                    height={400}
                    className="w-full h-full object-contain"
                />
            </div>

            <h1 className="text-3xl font-semibold text-center mx-auto relative z-10">Crystal Clear Presentations</h1>
            <p className="text-sm text-slate-500 text-center mt-2 max-w-lg mx-auto relative z-10">
                Uses images of Chromatic Aberration and Visual Acuity because Stock photos are so 2013s.
            </p>
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center mt-10 mx-auto gap-4 relative z-10">
                {images.map((img, idx) => (
                    <div key={idx} className="max-w-72 h-96 relative rounded-lg overflow-hidden hover:-translate-y-1 transition-all duration-300">
                        <Image
                            src={img.src}
                            alt={img.alt}
                            width={288}
                            height={384}
                            className="w-full h-full object-cover rounded-lg"
                            draggable="false"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}