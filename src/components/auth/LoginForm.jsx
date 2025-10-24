import React, { useState } from 'react';
import { Eye, EyeOff, Fingerprint } from 'lucide-react';
import Spinner from '../common/Spinner';

const LoginForm = ({ loginForm, setLoginForm, handleLogin, handlePasskeyLogin, isLoading, setMode }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter your email" disabled={isLoading} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter your password" disabled={isLoading} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
          <div className="text-right mt-2">
            <button onClick={() => setMode('forgotPassword')} disabled={isLoading} className="text-sm font-medium text-blue-600 hover:underline">Forgot Password?</button>
          </div>
        </div>
        <button onClick={handleLogin} disabled={isLoading} className={`w-full py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-lg flex items-center justify-center min-h-[48px] ${isLoading ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'}`}>{isLoading ? <Spinner /> : <span className="text-white">Sign In</span>}</button>

        <div className="flex items-center justify-center !my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handlePasskeyLogin}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-md flex items-center justify-center min-h-[48px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <Fingerprint className="w-5 h-5 mr-2" />
          <span>Sign in with Passkey</span>
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-600">Don't have an account? <button onClick={() => setMode('register')} disabled={isLoading} className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200">Sign Up</button></p>
      </div>
    </>
  );
};

export default LoginForm;