import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Send, Clock, RefreshCw, UserCheck, Paperclip, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { logout } from '../features/user/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminAPI from '../services/adminAPI';

// --- Helper Function to format dates ---
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// --- New Helper to Calculate Time Remaining ---
const formatTimeRemaining = (expiryIsoString) => {
    if (!expiryIsoString) return '—';

    const now = new Date();
    const expiryDate = new Date(expiryIsoString);
    const diffMs = expiryDate - now;

    if (diffMs <= 0) {
        return <span className="text-red-600 font-medium">Expired</span>;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 1) {
        return `in ${diffDays} days in ${diffHours}h`;
    }
    if (diffDays === 1) {
        return `in 1 day`;
    }
    if (diffHours > 0) {
        return `in ${diffHours}h ${diffMinutes}m`;
    }
    if (diffMinutes > 0) {
        return `in ${diffMinutes}m`;
    }
    return <span className="text-yellow-600">Expires soon</span>;
};


// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block capitalize";
    const statusConfig = {
        Pending: { icon: <Clock className="w-3 h-3 mr-1.5" />, classes: "bg-yellow-100 text-yellow-800" },
        Registered: { icon: <UserCheck className="w-3 h-3 mr-1.5" />, classes: "bg-green-100 text-green-800" },
        Expired: { icon: <Clock className="w-3 h-3 mr-1.5" />, classes: "bg-gray-100 text-gray-700" },
    };
    const config = statusConfig[status] || {};
    return (
        <span className={`${baseClasses} ${config.classes} flex items-center`}>
            {config.icon}
            {status}
        </span>
    );
};

// --- Main AdminPanel Component ---
const AdminInvitationPanel = () => {
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchInvitations = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            await AdminAPI.get('/get-client-invitations')
                .then((response) => {
                    const sortedInvitations = response.data.invitationData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setInvitations(sortedInvitations);
                })
                .catch((err) => {
                    console.error(err)
                    if (err.response.status === 403) {
                        console.error("expired token")
                        dispatch(logout());
                        navigate('/')
                    }
                })
        } catch (err) {
            console.error("Failed to fetch invitations:", err);
            setApiError("Could not load invitation data. Please try refreshing.");
            toast.error("Failed to fetch invitations.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            console.error("token not available");
            dispatch(logout());
            navigate('/')
        } else {
            fetchInvitations();
        }
    }, [fetchInvitations]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) setEmailError('');
    };

    const handleMobileChange = (e) => {
        setMobile(e.target.value);
    };

    const validateEmail = () => {
        if (!email) {
            setEmailError('Email address is required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            return false;
        }
        return true;
    };

    const handleSendInvite = async () => {
        if (!validateEmail()) return;
        setIsSending(true);

        const apiPromise = AdminAPI.post('/sent-invitation', { email, mobile });

        toast.promise(apiPromise, {
            loading: 'Sending invitation...',
            success: (response) => {
                fetchInvitations();
                setEmail('');
                setMobile('');
                return `Invitation sent to ${email}!`;
            },
            error: (error) => {
                return error.response?.data?.msg || 'Failed to send invitation.';
            }
        }).finally(() => {
            setIsSending(false);
        });
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Registration link copied!');
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2500);
        }).catch(err => {
            toast.error('Failed to copy link.');
        });
    };

    return (
        <div className="bg-gray-50">
            <div className="mx-auto">
                {/* --- Send Invitation Section --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Send New Invitation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.5fr_2fr_auto] items-start gap-4">
                        <div className="w-full">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="email" value={email} onChange={handleEmailChange} placeholder="Enter client's email" className={`w-full pl-12 pr-4 py-3 bg-white border-2 rounded-xl text-gray-900 ${emailError ? 'border-red-400' : 'border-gray-200'}`} disabled={isSending} />
                            </div>
                            {emailError && <p className="text-red-600 text-xs mt-1.5 ml-1">{emailError}</p>}
                        </div>
                        <div className="relative w-full">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="tel" value={mobile} onChange={handleMobileChange} placeholder="Mobile number (optional)" className="w-full pl-12 pr-4 py-3 bg-white border-2 rounded-xl border-gray-200" disabled={isSending} />
                        </div>
                        <button onClick={handleSendInvite} disabled={isSending} className="w-full lg:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400">
                            {isSending ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Sending...</> : <><Send className="w-5 h-5 mr-2" />Send Invite</>}
                        </button>
                    </div>
                </div>

                {/* --- Invitations Table --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Invitation History</h2>
                        <button onClick={fetchInvitations} className="text-sm text-blue-600 font-semibold flex items-center gap-2 hover:text-blue-800" disabled={isLoading}>
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Sr. No.</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date Sent</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expires In</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading invitations...</td></tr>
                                ) : apiError ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-red-600"> <AlertTriangle className="inline w-5 h-5 mr-2" /> {apiError}</td></tr>
                                ) : invitations.length > 0 ? (
                                    invitations.map((invite, index) => (
                                        <tr key={invite._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                                                <div className="text-xs text-gray-500">{invite.mobile || 'No mobile provided'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={invite.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(invite.createdAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                {invite.status === 'Registered' ? 'Registered' : formatTimeRemaining(invite.expiresAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {invite.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => copyToClipboard(`http://localhost:5173/client-register?token=${invite.inviteToken}`, invite._id)}
                                                        className="flex items-center gap-1.5 transition-colors duration-200 disabled:cursor-default"
                                                        disabled={copiedId === invite._id}
                                                    >
                                                        {copiedId === invite._id ? (
                                                            <span className="text-green-600 flex items-center gap-1.5">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Copied!
                                                            </span>
                                                        ) : (
                                                            <span className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
                                                                <Paperclip className="w-4 h-4" />
                                                                Copy Link
                                                            </span>
                                                        )}
                                                    </button>
                                                ) : invite.status === 'Registered' ? (
                                                    <div className="flex items-center text-sm text-gray-600" title={`Registered on ${formatDate(invite.updatedAt)}`}>
                                                        <UserCheck className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold">Registered</p>
                                                            <p className="text-xs text-gray-500">{formatDate(invite.updatedAt)}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">No actions available</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No Invitations Found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInvitationPanel;

