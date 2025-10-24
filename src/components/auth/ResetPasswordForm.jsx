import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Spinner from '../common/Spinner';

const ResetPasswordForm = ({ resetForm, setResetForm, handleResetPassword, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={resetForm.newPassword} onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter new password" disabled={isLoading} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} value={resetForm.confirmNewPassword} onChange={(e) => setResetForm({ ...resetForm, confirmNewPassword: e.target.value })} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Confirm new password" disabled={isLoading} required />
            {/* CORRECTED: Changed 'top-1/t' to 'top-1/2' here */}
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
        </div>
        <button onClick={handleResetPassword} disabled={isLoading} className={`w-full py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-lg flex items-center justify-center min-h-[48px] ${isLoading ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'}`}>{isLoading ? <Spinner /> : <span className="text-white">Reset Password</span>}</button>
      </div>
    </>
  );
};

export default ResetPasswordForm;