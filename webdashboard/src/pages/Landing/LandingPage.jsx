import React from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  Header, 
  Hero, 
  Features, 
  About, 
  Pricing, 
  Contact, 
  Footer 
} from '../../components/landing';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
    </div>
  );
};

export default LandingPage;