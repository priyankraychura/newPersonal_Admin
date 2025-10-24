import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle, Building2,
    Phone, Globe, Database, Users, Loader2, XCircle, KeyRound
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import welcomeAnimationData from '../assets/Welcome.json'
import ClientRegistration from './ClientRegistration';
import AdminAPI from '../services/adminAPI';

// --- Main Page Component ---
const ClientRegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your invitation link...');
    const [prefilledEmail, setPrefilledEmail] = useState('');

    useEffect(() => {
        const verifyInvitationToken = async () => {
            if (!token) {
                setVerificationStatus('error');
                setMessage('Invalid registration link. Token is missing.');
                return;
            }

            try {
                // This is the NEW backend endpoint you need to create
                const response = await AdminAPI.post(`/verify-token`, { token });

                setPrefilledEmail(response.data.email); // Get email from backend
                setVerificationStatus('success');
                toast.success('Invitation verified!');
            } catch (err) {
                setVerificationStatus('error');
                setMessage(err.response?.data?.msg || 'Invitation link is invalid or has expired.');
            }
        };
        verifyInvitationToken();
    }, [token, navigate]);

    const getStatusIcon = () => {
        if (verificationStatus === 'verifying') return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
        if (verificationStatus === 'error') return <XCircle className="w-16 h-16 text-red-500" />;
        return <CheckCircle className="w-16 h-16 text-green-500" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {verificationStatus !== 'success' ? (
                    // --- Verification Status Card ---
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Client Registration</h1>
                        </div>
                        <div className="p-8 text-center">
                            <div className="mb-6 flex justify-center">{getStatusIcon()}</div>
                            <p className="text-lg font-semibold">{message}</p>
                            {verificationStatus === 'error' && (
                                <button onClick={() => navigate('/')} className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700">
                                    Back to Homepage
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <ClientRegistration prefilledEmail={prefilledEmail} token={token} />
                )}
            </div>
        </div>
    );
};

export default ClientRegistrationPage;