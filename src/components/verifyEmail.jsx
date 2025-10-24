// pages/VerifyEmailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../features/user/userSlice';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import AdminAPI from '../services/adminAPI';

const VerifyEmail = () => {
    const { token } = useParams(); // Get token from URL
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying your email...');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const dispatch = useDispatch();

    useEffect(() => {
        const verifyUserEmail = async () => {
            if (!token) {
                setError(true);
                setMessage('Invalid verification link.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await AdminAPI.post(`/verify-email`, { token });
                const updatedUser = response.data.user;
                setMessage(response.data.msg);
                dispatch(login(updatedUser));
                setError(false);
                setIsLoading(false);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } catch (err) {
                setError(true);
                setMessage(err.response?.data?.msg || 'Verification failed. Please try again.');
                setIsLoading(false);
            }
        };

        verifyUserEmail();
    }, [token, navigate, dispatch]);

    const getStatusIcon = () => {
        if (isLoading) {
            return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
        }
        return error
            ? <XCircle className="w-16 h-16 text-red-500" />
            : <CheckCircle className="w-16 h-16 text-green-500" />;
    };

    const getStatusColor = () => {
        if (isLoading) return 'text-blue-600';
        return error ? 'text-red-600' : 'text-green-600';
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4`}>
            <div className="max-w-md w-full">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Email Verification
                        </h1>
                        <p className="text-blue-100 text-sm">
                            Please wait while we verify your email address
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 text-center">
                        {/* Status Icon */}
                        <div className="mb-6 flex justify-center">
                            {getStatusIcon()}
                        </div>

                        {/* Status Message */}
                        <div className="space-y-4">
                            <p className={`text-lg font-semibold ${getStatusColor()}`}>
                                {message}
                            </p>

                            {/* Loading Dots Animation */}
                            {isLoading && (
                                <div className="flex justify-center space-x-1 mt-4">
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            )}

                            {/* Success State - Redirect Message */}
                            {!isLoading && !error && (
                                <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mt-4">
                                    <div className="flex items-center justify-center space-x-2 text-green-700">
                                        <span className="text-sm font-medium">Redirecting to dashboard</span>
                                        <ArrowRight className="w-4 h-4 animate-pulse" />
                                    </div>
                                </div>
                            )}

                            {/* Error State - Retry Button */}
                            {!isLoading && error && (
                                <div className="space-y-4 mt-6">
                                    <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                                        <p className="text-red-700 text-sm">
                                            If you continue to experience issues, please contact support or request a new verification email.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-600 text-sm">
                        🔒 Secure email verification powered by your application
                    </p>
                </div>


            </div>
            <style jsx>{`
        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: multiply;
          filter: blur(40px);
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, #10b981, #3b82f6);
          top: 70%;
          right: 10%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, #f59e0b, #ef4444);
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .floating-shape {
            opacity: 0.1;
          }
          
          .shape-1 {
            width: 150px;
            height: 150px;
          }
          
          .shape-2 {
            width: 100px;
            height: 100px;
          }
          
          .shape-3 {
            width: 80px;
            height: 80px;
          }
        }

        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>


        </div>
    );
};

export default VerifyEmail;