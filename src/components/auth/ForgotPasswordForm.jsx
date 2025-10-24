import React from 'react';
import Spinner from '../common/Spinner';

const ForgotPasswordForm = ({ resetForm, setResetForm, handleSendOtp, isLoading, setMode }) => {
  return (
    <>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input type="email" value={resetForm.email} onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter your email" disabled={isLoading} required />
        </div>
        <button onClick={handleSendOtp} disabled={isLoading} className={`w-full py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-lg flex items-center justify-center min-h-[48px] ${isLoading ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'}`}>{isLoading ? <Spinner /> : <span className="text-white">Send OTP</span>}</button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-600">Remember your password? <button onClick={() => setMode('login')} disabled={isLoading} className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200">Sign In</button></p>
      </div>
    </>
  );
};

export default ForgotPasswordForm;