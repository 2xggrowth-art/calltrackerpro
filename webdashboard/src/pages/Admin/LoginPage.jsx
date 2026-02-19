import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/common';
import BackendSetup from '../../components/Admin/BackendSetup';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showBackendSetup, setShowBackendSetup] = useState(false);
  const { login, isAuthenticated, error, clearError } = useAuth();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Login successful!');
    } catch (error) {
      // Error handling is done in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="p-8 bg-white/95 backdrop-blur-sm">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-gradient rounded-2xl flex items-center justify-center mb-4">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Login</h1>
            <p className="text-gray-600">Access CallTracker Pro Admin Dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@calltrackerpro.com"
              icon={UserIcon}
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={LockClosedIcon}
                required
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('rememberMe')}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500"
                onClick={() => toast.info('Please contact your system administrator')}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-3">Available Demo Credentials</h4>
            
            <div className="space-y-2 mb-3">
              <div className="bg-blue-100 p-2 rounded text-xs">
                <div className="font-semibold text-blue-800 mb-1">Super Admin</div>
                <div className="font-mono">admin@calltrackerpro.com / Admin@123</div>
              </div>
              
              <div className="bg-blue-100 p-2 rounded text-xs">
                <div className="font-semibold text-blue-800 mb-1">Manager</div>
                <div className="font-mono">manager@demo.com / Manager@123</div>
              </div>
              
              <div className="bg-blue-100 p-2 rounded text-xs">
                <div className="font-semibold text-blue-800 mb-1">Agent</div>
                <div className="font-mono">agent@demo.com / Agent@123</div>
              </div>
              
              <div className="bg-blue-100 p-2 rounded text-xs">
                <div className="font-semibold text-blue-800 mb-1">Legacy</div>
                <div className="font-mono">anas@anas.com / password</div>
              </div>
            </div>
            
            <p className="text-xs text-blue-600 mb-2">
              ✨ These demo accounts are now available in the live backend!
            </p>
            <button
              onClick={() => setShowBackendSetup(true)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <WrenchScrewdriverIcon className="w-4 h-4" />
              <span>Create Custom Admin</span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 This is a secure admin area. Your login attempt will be logged for security purposes.
            </p>
          </div>
        </Card>

        {/* Back to Landing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            ← Back to CallTracker Pro
          </button>
        </motion.div>
      </motion.div>

      {/* Backend Setup Modal */}
      <BackendSetup 
        isOpen={showBackendSetup} 
        onClose={() => setShowBackendSetup(false)} 
      />
    </div>
  );
};

export default LoginPage;