import React, { useState } from 'react';
import { signIn, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Zap, Mail, Lock } from 'lucide-react';

type LoginProps = {
  onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
  onAuthSuccess: () => void;
};

export default function Login({ onNavigate, onAuthSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Login attempt started for:', email);
    console.log('Cognito config:', {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION,
    });

    try {
      console.log('Calling signIn...');
      const result = await signIn({ username: email, password });
      console.log('SignIn successful:', result);
      onAuthSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.name === 'UserAlreadyAuthenticatedException') {
        // User is already signed in, just proceed
        onAuthSuccess();
      } else if (err.name === 'UserNotConfirmedException') {
        setError('Please verify your email before logging in.');
      } else if (err.name === 'NotAuthorizedException') {
        setError('Incorrect email or password.');
      } else if (err.name === 'UserNotFoundException') {
        setError('No account found with this email.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword({ username: email });
      setResetStep('code');
      alert('Password reset code sent to your email!');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: resetCode.trim(),
        newPassword,
      });
      
      alert('Password reset successful! Please log in with your new password.');
      setShowForgotPassword(false);
      setResetStep('email');
      setResetCode('');
      setNewPassword('');
      setPassword(newPassword);
    } catch (err: any) {
      console.error('Confirm reset error:', err);
      
      if (err.name === 'CodeMismatchException') {
        setError('Invalid reset code. Please try again.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Reset code expired. Please request a new one.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#2563EB] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-gray-600">Log in to your ContentLens AI account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {showForgotPassword ? (
            resetStep === 'email' ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
                  <p className="text-sm text-gray-600">
                    Enter your email and we'll send you a reset code
                  </p>
                </div>

                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="reset-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold mb-2">Enter Reset Code</h2>
                  <p className="text-sm text-gray-600">
                    We sent a code to <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="reset-code" className="block text-sm font-medium mb-2">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    id="reset-code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    placeholder="Enter code"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetStep('email');
                    setResetCode('');
                    setNewPassword('');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-[#E5E7EB]" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#2563EB] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          )}

          {/* Removed social login options for now - can be added later with Cognito federation */}
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button 
            onClick={() => onNavigate('signup')}
            className="text-[#2563EB] font-medium hover:underline"
          >
            Sign up
          </button>
        </p>

        {/* Back to Home */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-sm text-gray-600 hover:text-gray-900 mx-auto block mt-4"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
  
}