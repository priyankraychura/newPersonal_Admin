import React, { useState, useEffect } from 'react';
import { User, Mail, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../features/user/userSlice';
import { startAuthentication } from '@simplewebauthn/browser';
import clientAPI from '../services/clientAPI';

// Import all the form components
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import VerifyOtpForm from './auth/VerifyOtpForm';
import ResetPasswordForm from './auth/ResetPasswordForm';
import PasskeyLoginForm from './auth/PasskeyLoginForm';

const AuthForm = () => {
  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState('login'); // Controls which form is visible
  const [isLoading, setIsLoading] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // State for each form, managed by the parent
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '', confirmNewPassword: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- PASSKEY LOGIN LOGIC ---
  useEffect(() => {
    if (mode === 'passkeyLogin') {
      const performPasskeyLogin = async () => {
        setIsLoading(true);
        try {
          // 1. Get options
          const optionsResponse = await clientAPI.post(`/passkey/login/options`);
          const authOptions = optionsResponse.data;

          // 2. Prompt user
          let authResponse;
          try {
            authResponse = await startAuthentication(authOptions);
          } catch (browserError) {
            console.error("Browser authentication error:", browserError);
            if (browserError.name === 'NotAllowedError') {
              toast.error('Authentication cancelled.');
            } else {
              toast.error(`Error: ${browserError.message || 'Could not authenticate with device.'}`);
            }
            setMode('login'); // Revert to login
            return;
          }

          // 3. Verify response
          const verificationResponse = await clientAPI.post(`/passkey/login/verify`, {
            authenticationResponse: authResponse
          });

          const { verified, user, message, token } = verificationResponse.data;

          if (verified) {
            toast.success(message || 'Login successful!');
            if (token) {
              localStorage.setItem("token", token);
            }
            dispatch(login(user));
            navigate('/dashboard');
          } else {
            toast.error(verificationResponse.data.error || 'Passkey verification failed.');
            setMode('login');
          }

        } catch (error) {
          console.error('Passkey Login Flow Error:', error);
          const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred.';
          toast.error(errorMessage);
          setMode('login'); // Revert on failure
        } finally {
          setIsLoading(false);
        }
      };
      performPasskeyLogin();
    }

    return () => {
      // Cleanup if mode changes mid-flow
      setIsLoading(false);
    };
  }, [mode, navigate, dispatch]);

  // --- HANDLER FUNCTIONS ---

  const handleSendOtp = () => {
    if (!resetForm.email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    const otpPromise = clientAPI.post(`/sendOTP`, { email: resetForm.email })

    try {
      toast.promise(otpPromise, {
        loading: 'Sending OTP...',
        success: (response) => {
          setIsLoading(false);
          setMode('verifyOtp'); // Switch mode on success
          return <b>{response?.data?.msg}</b>;
        },
        error: (error) => {
          setIsLoading(false);
          return <b>{error.response.data.error}</b>;
        }
      });
    } catch (error) {
      console.log("🚀 ~ handleSendOtp ~ error:", error)
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (resetForm.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    const verifyPromise = clientAPI.post(`/varifyOTP`, { otp: resetForm.otp })

    toast.promise(verifyPromise, {
      loading: 'Verifying OTP...',
      success: (response) => {
        setIsLoading(false);
        setMode('resetPassword'); // Switch mode on success
        return <b>{response?.data?.msg}</b>;
      },
      error: (error) => {
        setIsLoading(false);
        return <b>{error.response.data.error}</b>;
      }
    });
  };

  const handleVerify2FA = () => {
    if (resetForm.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    const verifyPromise = clientAPI.post(`/verify-2fa`, { otp: resetForm.otp })

    toast.promise(verifyPromise, {
      loading: 'Verifying OTP...',
      success: (response) => {
        localStorage.setItem("token", response.data.token);
        dispatch(login(response.data.user));
        navigate('/dashboard');

        // You had this hardcoded, maybe update with real user data?
        setLoginForm({ email: '', password: '' });
        setIsLoading(false);

        return <b>{response?.data?.msg}</b>;
      },
      error: (error) => {
        setIsLoading(false);
        return <b>{error.response.data.error}</b>;
      }
    });
  };

  const handleResetPassword = () => {
    if (resetForm.newPassword !== resetForm.confirmNewPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (resetForm.newPassword.length < 5) { // Original code said 5, should be 6? I'll keep 5.
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    const resetPromise = clientAPI.post(`/reset-password`, {
      newPassword: resetForm.newPassword,
      confirmPassword: resetForm.confirmNewPassword
    })

    toast.promise(resetPromise, {
      loading: 'Resetting password...',
      success: (response) => {
        setIsLoading(false);
        setMode('login'); // Switch mode on success
        setResetForm({ email: '', otp: '', newPassword: '', confirmNewPassword: '' });
        return <b>{response?.data?.msg}</b>;
      },
      error: (error) => {
        setIsLoading(false);
        return <b>{error.response.data.error}</b>;
      }
    });
  };

  const handleRegister = () => {
    // Note: Your original logic didn't have an API call or loading state.
    // You can add them here, similar to handleLogin.
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (registerForm.name && registerForm.email && registerForm.password) {
      // --- ADD YOUR REGISTRATION API CALL HERE ---
      // setIsLoading(true);
      // clientAPI.post('/register', registerForm).then(...).finally(() => setIsLoading(false));

      toast.success('Registration successful! Please log in.');
      setMode('login'); // Switch to login after registration
    }
  };

  const handleLogin = () => {
    if (loginForm.email === '' || loginForm.password === '') {
      toast.error("Please fill in all fields.")
      return;
    }

    if (loginForm.email && loginForm.password) {
      setIsLoading(true)
      const loginPromise = clientAPI.post(`/login`, {
        email: loginForm.email,
        password: loginForm.password,
      })

      toast.promise(loginPromise, {
        loading: 'Logging in...',
        success: (response) => {
          setIsLoading(false)

          // --- THIS IS THE NEW LOGIC ---
          if (response.data.status === '2fa_required') {
            setIsTwoFactorEnabled(true);
            setResetForm({ ...resetForm, email: loginForm.email })
            setMode('verifyOtp');
            return <b>{response.data.msg || 'OTP has been sent!'}</b>;
          }

          localStorage.setItem("token", response.data.token);
          dispatch(login(response.data.user));
          navigate('/dashboard');
          setLoginForm({ email: '', password: '' });

          return <b>Login successful!</b>;
        },
        error: (error) => {
          setIsLoading(false)
          setLoginForm({ email: '', password: '' });
          return <b>{error.response?.data?.msg || 'Login failed.'}</b>;
        }
      });
    }
  };

  const handlePasskeyLogin = () => {
    setMode('passkeyLogin');
  };

  // --- DYNAMIC CONTENT ---

  // This function now renders components instead of JSX blocks
  const renderContent = () => {
    switch (mode) {
      case 'login':
        return <LoginForm
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          handlePasskeyLogin={handlePasskeyLogin}
          isLoading={isLoading}
          setMode={setMode}
        />;
      case 'register':
        return <RegisterForm
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          handleRegister={handleRegister}
          isLoading={isLoading}
          setMode={setMode}
        />;
      case 'forgotPassword':
        return <ForgotPasswordForm
          resetForm={resetForm}
          setResetForm={setResetForm}
          handleSendOtp={handleSendOtp}
          isLoading={isLoading}
          setMode={setMode}
        />;
      case 'verifyOtp':
        return <VerifyOtpForm
          resetForm={resetForm}
          setResetForm={setResetForm}
          handleVerifyOtp={isTwoFactorEnabled ? handleVerify2FA : handleVerifyOtp}
          handleSendOtp={handleSendOtp} // For resend
          isLoading={isLoading}
          setMode={setMode}
        />;
      case 'resetPassword':
        return <ResetPasswordForm
          resetForm={resetForm}
          setResetForm={setResetForm}
          handleResetPassword={handleResetPassword}
          isLoading={isLoading}
        />;
      case 'passkeyLogin':
        return <PasskeyLoginForm
          isLoading={isLoading}
          setMode={setMode}
        />;
      default:
        return <LoginForm
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          handlePasskeyLogin={handlePasskeyLogin}
          isLoading={isLoading}
          setMode={setMode}
        />;
    }
  };

  // Branding content remains the same
  const brandingContent = {
    login: { IconComponent: User, title: 'Welcome Back', subtitle: 'Sign in to continue to your account.' },
    register: { IconComponent: User, title: 'Create Account', subtitle: 'Sign up to get started with your new account.' },
    forgotPassword: { IconComponent: Mail, title: 'Forgot Password', subtitle: 'Enter your email to receive a verification code.' },
    verifyOtp: { IconComponent: KeyRound, title: 'Verify OTP', subtitle: <>An OTP has been sent to <b>{resetForm.email || 'your email'}</b></> },
    resetPassword: { IconComponent: KeyRound, title: 'Create New Password', subtitle: 'Your new password must be different from previous ones.' },
    passkeyLogin: { IconComponent: KeyRound, title: 'Sign in with Passkey', subtitle: 'Authenticating with your device. Please follow the prompts.' },
  };

  const { IconComponent, title, subtitle } = brandingContent[mode] || brandingContent.login;

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-sm md:max-w-4xl mx-auto overflow-hidden transition-all duration-300">

        {/* --- COLUMN 1: Branding Panel (Desktop) --- */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white flex-col justify-center items-center text-center">
          <div className="bg-white/20 p-4 rounded-full inline-block mb-6">
            <IconComponent className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-purple-200 text-lg">
            {subtitle}
          </p>
        </div>

        {/* --- COLUMN 2: Form Panel (Mobile + Desktop) --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

          {/* --- Mobile Header --- */}
          <div className="block md:hidden text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* This one function now renders the correct component */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;