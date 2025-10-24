import React from 'react';
import Spinner from '../common/Spinner';

const VerifyOtpForm = ({ resetForm, setResetForm, handleVerifyOtp, handleSendOtp, isLoading, setMode }) => {
  return (
    <>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input type="email" value={resetForm.email} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-Digit OTP</label>
          <input type="text" value={resetForm.otp} onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })} maxLength="6" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center tracking-[1em]" placeholder="------" disabled={isLoading} required />
        </div>
        {/* Fixed typo: min-h-[4ax] to min-h-[48px] */}
        <button onClick={handleVerifyOtp} disabled={isLoading} className={`w-full py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-lg flex items-center justify-center min-h-[48px] ${isLoading ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'}`}>{isLoading ? <Spinner /> : <span className="text-white">Verify OTP</span>}</button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-600">Didn't receive code? <button onClick={handleSendOtp} disabled={isLoading} className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200">Resend</button></p>
      </div>
    </>
  );
};

export default VerifyOtpForm;