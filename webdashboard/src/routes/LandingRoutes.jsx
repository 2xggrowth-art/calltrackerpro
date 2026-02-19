import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';

const LandingRoutes = () => {
  return (
    <Routes>
      {/* Landing Page Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Redirect any other paths to landing page for unauthenticated users */}
      <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
      <Route path="/crm/*" element={<Navigate to="/" replace />} />
      
      {/* Catch all for unauthenticated users - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default LandingRoutes;