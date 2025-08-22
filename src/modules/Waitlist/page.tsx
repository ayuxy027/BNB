"use client";

import React from 'react';
import WaitlistHero from './components/WaitlistHero';
import WaitlistGallery from './components/WaitlistGallery';
import Footer from '../../common/Footer';

const WaitlistPage = () => {
    return (
        <div>
            <WaitlistHero />
            <div className="mt-16">
                <WaitlistGallery />
            </div>
            <div className="mt-24">
                <Footer />
            </div>
        </div>
    );
};

export default WaitlistPage;
