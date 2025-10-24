import React from 'react';
import Lottie from "lottie-react";
// Adjust this path based on your project structure
import fingerprintAnimation from "../../assets/FingerPrint.json"; 

const PasskeyLoginForm = ({ isLoading, setMode }) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Lottie container */}
        <div className="w-48 h-48">
          <Lottie
            animationData={fingerprintAnimation}
            loop={true}
            autoplay={true}
          />
        </div>

        <p className="text-lg font-medium text-gray-700">
          Verifying Passkey...
        </p>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Please authenticate using your device (fingerprint, face, or PIN).
        </p>

        {/* Cancel Button */}
        <button
          onClick={() => setMode('login')}
          // The button is disabled while the passkey flow is active (isLoading)
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default PasskeyLoginForm;