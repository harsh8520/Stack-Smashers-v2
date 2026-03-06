import React, { useState } from 'react';
import { signUp, confirmSignUp, signIn, resendSignUpCode } from 'aws-amplify/auth';
import { Zap, Mail, Lock, User, Shield, CheckCircle2 } from 'lucide-react';

type SignUpProps = {
  onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
  onAuthSuccess: () => void;
};

export default function SignUp({ onNavigate, onAuthSuccess }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
      
      setNeedsConfirmation(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      if (err.name === 'UsernameExistsException') {
        setError('An account with this email already exists.');
      } else if (err.name === 'InvalidPasswordException') {
        setError('Password must be at least 8 characters with uppercase, lowercase, and numbers.');
      } else if (err.name === 'InvalidParameterException') {
        setError('Please check your input and try again.');
      } else {
        setError('Sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Trim whitespace from confirmation code
      const trimmedCode = confirmationCode.trim();
      
      const result = await confirmSignUp({
        username: email,
        confirmationCode: trimmedCode,
      });
      
      console.log('Confirmation successful:', result);
      
      // Try to auto sign in, but if it fails, just redirect to login
      try {
        await signIn({ username: email, password });
        onAuthSuccess();
      } catch (signInError: any) {
        console.error('Auto sign-in failed:', signInError);
        // Confirmation succeeded but auto sign-in failed
        // Redirect to login page
        alert('Account confirmed successfully! Please log in with your credentials.');
        onNavigate('login');
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      if (err.name === 'CodeMismatchException') {
        setError('Invalid confirmation code. Please check and try again.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Confirmation code expired. Click "Resend confirmation code" below.');
      } else if (err.name === 'NotAuthorizedException') {
        setError('Invalid code provided. Please request a new code.');
      } else if (err.name === 'AliasExistsException') {
        setError('This email is already verified. Please try logging in.');
        setTimeout(() => onNavigate('login'), 2000);
      } else {
        setError(`Confirmation failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationCode = async () => {
    setError('');
    try {
      await resendSignUpCode({ username: email });
      setConfirmationCode(''); // Clear the old code
      alert('New confirmation code sent to your email. Please check your inbox.');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(`Failed to resend code: ${err.message || 'Please try again.'}`);
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
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-sm text-gray-600">Start reviewing content with AI today</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {needsConfirmation ? (
            <form onSubmit={handleConfirmSignUp} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  We've sent a confirmation code to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming...' : 'Confirm Account'}
              </button>

              <button
                type="button"
                onClick={resendConfirmationCode}
                className="w-full text-sm text-[#2563EB] hover:underline"
              >
                Resend confirmation code
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          )}

          {/* Removed social sign-up options for now */}

          {/* Trust Indicators */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">Your privacy matters</h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    We never share your content with third parties
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    All data is encrypted in transit and at rest
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    You can delete your account anytime
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-[#2563EB] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#2563EB] hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button 
            onClick={() => onNavigate('login')}
            className="text-[#2563EB] font-medium hover:underline"
          >
            Log in
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