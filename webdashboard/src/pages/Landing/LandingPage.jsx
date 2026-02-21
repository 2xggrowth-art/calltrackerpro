import React from 'react';
import { Toaster } from 'react-hot-toast';
import {
  Header,
  Hero,
  Features,
  About,
  Pricing,
  Footer,
} from '../../components/landing';

const LandingPage = () => {
  return (
    <div className="landing-page min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <Pricing />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        }}
      />
    </div>
  );
};

export default LandingPage;
