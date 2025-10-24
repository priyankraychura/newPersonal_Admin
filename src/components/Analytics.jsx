import React, { useState } from 'react';

const Analytics = () => {
  const [isVisible, setIsVisible] = useState(true); // State to control the visibility of the message

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>

      {/* Main content of the Settings page */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Application settings would go here.</p>
        <button
          onClick={toggleVisibility}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Toggle Message
        </button>
      </div>

      {/* The improved modal overlay with a more modern design */}
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop with blur and dimming effect */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

          {/* Message box with improved design and animation */}
          <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl p-8 max-w-sm text-center transform scale-100 transition-transform duration-300 ease-out animate-fade-in border-4 border-white-300-50">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">Coming Soon!</h2>
            <p className="text-lg text-gray-700 mb-6 font-medium">This feature is not yet available. We're working hard to bring it to you soon. 🚀</p>
            <button
              onClick={toggleVisibility}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;