import React, { useEffect, useState } from 'react';
import {
    Eye,
    EyeOff,
    User,
    Mail,
    Lock,
    CheckCircle,
    AlertCircle,
    Building2,
    Phone,
    Globe,
    Database,
    Users
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import welcomeAnimationData from '../assets/Welcome.json'
import Lottie from 'lottie-react';

// --- Lottie Animation Data ---
// I've embedded the Welcome.json data directly here to keep the component self-contained.
// const welcomeAnimationData = { "v": "5.5.7", "fr": 30, "ip": 0, "op": 150, "w": 512, "h": 512, "nm": "Welcome", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "Checkmark", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [256, 256, 0], "ix": 2 }, "a": { "a": 0, "k": [0, 0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ty": "shape", "ks": { "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-81.85, -16.85], [4.15, 69.15], [103.15, -92.85]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape", "hd": false }, { "ty": "stroke", "c": { "a": 0, "k": [0.29, 0.69, 0.31, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 30, "ix": 5 }, "lc": 2, "lj": 2, "ml": 4, "nm": "Stroke 1", "mn": "ADBE Vector Shape - Stroke", "hd": false }, { "ty": "trim", "s": { "a": 1, "k": [{ "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 20, "s": [0] }, { "t": 59, "s": [100] }], "ix": 2 }, "e": { "a": 1, "k": [{ "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 20, "s": [0] }, { "t": 59, "s": [100] }], "ix": 3 }, "o": { "a": 0, "k": 0, "ix": 4 }, "m": 1, "ix": 9, "nm": "Trim Paths 1" }], "nm": "Shape Group", "np": 3, "cix": 2, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 19, "op": 170, "st": 19, "bm": 0 }, { "ddd": 0, "ind": 2, "ty": 4, "nm": "Circle", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [256, 256, 0], "ix": 2 }, "a": { "a": 0, "k": [0, 0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "shape", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 110.88], [-110.88, 0], [0, -110.88], [110.88, 0]], "o": [[0, -110.88], [110.88, 0], [0, 110.88], [-110.88, 0]], "v": [[0, 201], [-201, 0], [0, -201], [201, 0]], "c": true }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape", "hd": false }, { "ty": "stroke", "c": { "a": 0, "k": [0.29, 0.69, 0.31, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 30, "ix": 5 }, "lc": 1, "lj": 1, "ml": 4, "nm": "Stroke 1", "mn": "ADBE Vector Shape - Stroke", "hd": false }, { "ty": "trim", "s": { "a": 0, "k": 0, "ix": 2 }, "e": { "a": 1, "k": [{ "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [0] }, { "t": 40, "s": [100] }], "ix": 3 }, "o": { "a": 0, "k": 270, "ix": 4 }, "m": 1, "ix": 9, "nm": "Trim Paths 1" }], "nm": "Shape Group", "np": 3, "cix": 2, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 150, "st": 0, "bm": 0 }] };


// --- InputField Component (Stable) ---
const InputField = ({
    icon: Icon,
    type,
    name,
    placeholder,
    value,
    error,
    isSubmitting,
    focusedField,
    onChange,
    onBlur,
    onFocus,
    showToggle = false,
    showValue = false,
    onToggle = () => { },
    required = true,
    className: fieldClassName = "",
    description = ""
}) => (
    <div className={`relative ${fieldClassName}`}>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 transition-colors duration-200 ${focusedField === name ? 'text-blue-500' : 'text-gray-400'
                    }`} />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={() => onFocus(name)}
                placeholder={placeholder}
                className={`w-full pl-12 pr-${showToggle ? '12' : '4'} py-4 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-0 ${error
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : focusedField === name
                        ? 'border-blue-500 shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                    }`}
                disabled={isSubmitting}
                required={required}
            />
            {showToggle && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                    onClick={onToggle}
                    disabled={isSubmitting}
                >
                    {showValue ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                </button>
            )}
        </div>
        {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
        {error && (
            <div className="mt-2 flex items-center text-red-600 animate-in slide-in-from-left-5 duration-200">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
            </div>
        )}
    </div>
);

// --- Main ClientRegistration Component ---
const ClientRegistration = ({
    apiEndpoint = '/api/clients/register',
    onSuccess = () => { },
    onError = () => { },
    className = '',
    prefilledEmail,
    token
}) => {
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        mobile: '',
        website: '',
        email: '',
        password: '',
        confirmPassword: '',
        connectionName: '',
        connectionString: '',
        agreedToTerms: false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [focusedField, setFocusedField] = useState(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false); // New state to control success view

    useEffect(() => {
        setFormData(prev => ({ ...prev, email: prefilledEmail }));
    }, [prefilledEmail]);

    // Enhanced validation rules
    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                return value.trim().length < 2 ? 'Full name must be at least 2 characters long' : '';
            case 'companyName':
                return value.trim().length < 2 ? 'Company name must be at least 2 characters long' : '';
            case 'mobile':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                return !phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? 'Please enter a valid mobile number' : '';
            case 'website':
                if (!value.trim()) return ''; // Optional field
                const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                return !urlRegex.test(value) ? 'Please enter a valid website URL' : '';
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
            case 'password':
                if (value.length < 8) return 'Password must be at least 8 characters long';
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                }
                return '';
            case 'confirmPassword':
                return value !== formData.password ? 'Passwords do not match' : '';
            case 'connectionName':
                return value.trim().length < 2 ? 'Connection name must be at least 2 characters long' : '';
            case 'connectionString':
                return value.trim().length < 10 ? 'Please enter a valid connection string' : '';
            case 'agreedToTerms':
                return !value ? 'You must agree to the terms and conditions' : '';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: newValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (submitStatus) {
            setSubmitStatus(null);
        }
    };

    const handleBlur = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        const error = validateField(name, fieldValue);
        setErrors(prev => ({ ...prev, [name]: error }));
        setFocusedField(null);
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['name', 'companyName', 'mobile', 'email', 'password', 'confirmPassword', 'connectionName', 'connectionString', 'agreedToTerms'];

        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        requiredFields.forEach(key => {
            if (key === 'agreedToTerms') {
                if (!formData[key]) newErrors[key] = 'You must agree to the terms and conditions';
            } else if (!formData[key] || !formData[key].toString().trim()) {
                newErrors[key] = 'This field is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const finalFormData = { ...formData, token }

        setIsSubmitting(true);
        setSubmitStatus(null);

        const apiUrl = import.meta.env.VITE_CLIENT_API_URL;
        const apiKey = import.meta.env.VITE_API_SECRET_KEY;

        const config = {
            headers: {
                'X-API-Key': apiKey
            }
        };

        const registerPromise = axios.post(`${apiUrl}/register`, finalFormData, config);

        toast.promise(registerPromise, {
            loading: 'Creating your account...',
            success: (response) => {
                setRegistrationSuccess(true); // Trigger the success view
                onSuccess(response.data.msg);
                return <b>Account created! Please log in.</b>;
            },
            error: (error) => {
                setSubmitStatus('error');
                onError(error.response?.data?.msg);
                return <b>{error.response?.data?.msg || 'Registration failed.'}</b>;
            }
        }).finally(() => {
            setIsSubmitting(false);
        });
    };


    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 ${className}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
                        <Users className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        {registrationSuccess ? 'Welcome Aboard!' : 'Create Your Account'}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {registrationSuccess
                            ? "We're thrilled to have you. You can now proceed to log in to your dashboard."
                            : "Join our platform and unlock powerful features for your business. Fill in the details below to get started."
                        }
                    </p>
                </div>

                {registrationSuccess ? (
                    // --- Success View ---
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8 lg:pt-0 lg:p-12 flex flex-col items-center justify-center text-center">
                        <Lottie animationData={welcomeAnimationData} loop={true} style={{ width: 250, height: 250 }} />
                        <div className="mt-6 max-w-md w-full">
                            <div className="p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center shadow-sm">
                                <CheckCircle className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
                                <div>
                                    <h3 className="text-green-800 font-semibold text-lg text-left">Registration Successful!</h3>
                                    <p className="text-green-700 text-sm mt-1 text-left">Your account has been created.</p>
                                </div>
                            </div>
                        </div>
                        <a href="https://priyank.space" className="mt-8 w-full max-w-xs py-3 px-8 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105">
                            Proceed to Login
                        </a>
                    </div>

                ) : (
                    // --- Form View ---
                    <>
                        {submitStatus === 'error' && (
                            <div className="mb-8 max-w-2xl mx-auto">
                                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center shadow-sm">
                                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-red-800 font-medium">Registration Failed</h3>
                                        <p className="text-red-700 text-sm mt-1">Something went wrong. Please check your details and try again.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Form */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-8 lg:p-12">
                                <div className="space-y-8">

                                    {/* Personal Information Section */}
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                            <User className="h-6 w-6 mr-3 text-blue-600" />
                                            Personal Information
                                        </h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <InputField icon={User} type="text" name="name" placeholder="Full Name" value={formData.name} error={errors.name} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                            <InputField icon={Mail} type="email" name="email" placeholder="Email Address" value={formData.email} error={errors.email} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} disabled={true} />
                                            <InputField icon={Phone} type="tel" name="mobile" placeholder="Mobile Number" description="Include country code (e.g., +1 555-123-4567)" value={formData.mobile} error={errors.mobile} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                        </div>
                                    </div>

                                    {/* Company Information Section */}
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                            <Building2 className="h-6 w-6 mr-3 text-purple-600" />
                                            Company Information
                                        </h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <InputField icon={Building2} type="text" name="companyName" placeholder="Company Name" value={formData.companyName} error={errors.companyName} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                            <InputField icon={Globe} type="url" name="website" placeholder="Website (optional)" required={false} description="e.g., https://www.example.com" value={formData.website} error={errors.website} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                        </div>
                                    </div>

                                    {/* Security Section */}
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                            <Lock className="h-6 w-6 mr-3 text-green-600" />
                                            Security
                                        </h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <InputField icon={Lock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" showToggle={true} showValue={showPassword} onToggle={() => setShowPassword(!showPassword)} value={formData.password} error={errors.password} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                            <InputField icon={Lock} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" showToggle={true} showValue={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} value={formData.confirmPassword} error={errors.confirmPassword} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                        </div>
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li className="flex items-center">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>At least 8 characters long
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>One uppercase and one lowercase letter
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>At least one number
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Database Connection Section */}
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                            <Database className="h-6 w-6 mr-3 text-indigo-600" />
                                            Database Connection
                                        </h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <InputField icon={Database} type="text" name="connectionName" placeholder="Connection Name" description="A friendly name for your database connection" value={formData.connectionName} error={errors.connectionName} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                            <InputField icon={Database} type="text" name="connectionString" placeholder="Connection String" description="Your database connection string" className="lg:col-span-1" value={formData.connectionString} error={errors.connectionString} onChange={handleInputChange} onBlur={handleBlur} onFocus={handleFocus} isSubmitting={isSubmitting} focusedField={focusedField} />
                                        </div>
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="border-t border-gray-200 pt-8">
                                        <div className="flex items-start space-x-3">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="agreedToTerms"
                                                    checked={formData.agreedToTerms}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-sm text-gray-700 cursor-pointer">
                                                    I agree to the{' '}
                                                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium underline">Terms of Service</a>{' '}
                                                    and{' '}
                                                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium underline">Privacy Policy</a>
                                                </label>
                                                {errors.agreedToTerms && (
                                                    <div className="mt-2 flex items-center text-red-600">
                                                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                                        <p className="text-sm">{errors.agreedToTerms}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className={`w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-200 transform ${isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed scale-100'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                                                } text-white`}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                    Creating Your Account...
                                                </div>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-8">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors duration-200">
                                    Sign in here
                                </a>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientRegistration;

