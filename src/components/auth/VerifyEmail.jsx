import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, NavLink } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft, Heart, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now access all features of the application.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again or contact support.');
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email or request a new verification link.');
    }
  }, [token, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      setMessage('A new verification email has been sent to your email address.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Verifying your email
            </h2>
            
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>

            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Email verified successfully!
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="space-y-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                Go to Dashboard
              </Link>

              <p className="text-sm text-gray-500">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Email verification failed
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <Mail className="w-5 h-5 mr-2" />
                Resend verification email
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to login
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Need help? <a href="mailto:support@example.com" className="text-blue-600 hover:underline">Contact support</a>
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderContent()}

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center text-gray-600">
            <div 
              className="w-14 h-14 rounded-lg transform group-hover:scale-110 transition-transform duration-300 bg-cover bg-center"
              style={{ backgroundImage: "url('/SMC Logo.png')" }}
            >
            </div>
            <span className="text-sm">Made with care</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;