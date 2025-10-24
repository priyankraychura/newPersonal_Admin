import React, { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { useSelector } from 'react-redux';
import AdminAPI from '../services/adminAPI';
import { useOutletContext } from 'react-router-dom';

// Define backend URL based on environment
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname.includes('localhost')
  ? 'http://localhost:1008/api/v1/admin'
  : 'https://passkeywebauth-mern-backend.onrender.com/api/v1/admin';

// Ensure AdminAPI is configured correctly
const api = AdminAPI;

const Settings = () => {
  const user = useSelector(state => state?.userReducer?.userData);// Adjust based on your Redux slice

  // Security State
  const [isPasskeyEnabled, setIsPasskeyEnabled] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isLoadingTwoFactor, setIsLoadingTwoFactor] = useState(false);
  const [twoFactorStatus, setTwoFactorStatus] = useState({ text: '', type: '' });
  const [passkeyStatus, setPasskeyStatus] = useState({ text: '', type: '' });
  const [isLoadingPasskey, setIsLoadingPasskey] = useState(false);

  // Notification State
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(true);
  const [isActivityAlertsEnabled, setIsActivityAlertsEnabled] = useState(true);

  // Account State
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const { searchQuery, showConfirmation } = useOutletContext();

  // --- Check if current device has a registered passkey ---
  useEffect(() => {
    if (user) {
      // Set initial 2FA state from user object
      setIsTwoFactorEnabled(user.isTwoFactorEnabled || false);

      if (Array.isArray(user.passkeys) && user.passkeys.length > 0) {
        // Get stored credentialIDs from localStorage
        const storedCredentialIDs = JSON.parse(localStorage.getItem('passkeyCredentialIDs') || '[]');

        // Check if any server-side passkey matches a locally stored credentialID
        const hasDevicePasskey = user.passkeys.some((passkey) =>
          storedCredentialIDs.includes(passkey.credentialID)
        );

        setIsPasskeyEnabled(hasDevicePasskey);
        if (!hasDevicePasskey && user.passkeys.length > 0) {
          setPasskeyStatus({
            text: 'Passkey registered on another device. Register one on this device to enable.',
            type: 'warning',
          });
        }
      } else {
        setIsPasskeyEnabled(false);
      }
    }
  }, [user]);

  const confirmPasskyToggle = () => {
    if (!isPasskeyEnabled) {
      showConfirmation({
        title: 'Create passkey?',
        description: `Are you sure you want to create passkey for this device?`,
        confirmButtonText: 'Yes, Create Passkey',
        variant: 'info',
        onConfirm: handlePasskeyToggle,
      });
    } else {
      showConfirmation({
        title: 'Delete passkey?',
        description: `Are you sure you want to permanently delete passkey? This will delete passkey for all your devices.`,
        confirmButtonText: 'Yes, Delete Passkey',
        variant: 'warning',
        onConfirm: handlePasskeyToggle,
      });
    }
  }

  const confirmTwoFactorToggle = () => {
    if (!isTwoFactorEnabled) {
      // confirm before enabling as not enabled
      showConfirmation({
        title: 'Enable 2FA?',
        description: `Are you sure you want to enable 2 Factor Authentication, you will be required to enter OTP before every login?`,
        confirmButtonText: 'Yes, Enable 2FA',
        variant: 'info',
        onConfirm: handleTwoFactorToggle,
      });
    } else {
      showConfirmation({
        title: 'Disable 2FA?',
        description: `Are you sure you want to disable 2 Factor Authentication.`,
        confirmButtonText: 'Yes, Disable 2FA',
        variant: 'warning',
        onConfirm: handleTwoFactorToggle,
      });
    }
  }

  // --- Handlers for toggles ---
  const handlePasskeyToggle = async () => {
    if (!isPasskeyEnabled) {
      // Registering a new passkey
      setIsLoadingPasskey(true);
      setPasskeyStatus({ text: 'Starting passkey registration...', type: 'info' });

      try {
        // 1. Get registration options from the server
        const regOptionsResponse = await api.get('/passkey/register/options', {
          withCredentials: true,
        });
        const regOptions = regOptionsResponse.data;

        // 2. Start WebAuthn registration in the browser
        let attestationResponse;
        try {
          attestationResponse = await startRegistration(regOptions);
        } catch (browserError) {
          console.error('Browser registration error:', browserError);
          setIsLoadingPasskey(false);
          if (browserError.name === 'InvalidStateError') {
            setPasskeyStatus({
              text: 'This authenticator is already registered. Try a different device or authenticator.',
              type: 'warning',
            });
            return;
          } else if (browserError.name === 'NotAllowedError') {
            setPasskeyStatus({
              text: 'Passkey registration cancelled by user.',
              type: 'warning',
            });
            return;
          }
          setPasskeyStatus({
            text: `Registration failed: ${browserError.message}`,
            type: 'error',
          });
          return;
        }

        // 3. Send attestation response to server for verification
        setPasskeyStatus({ text: 'Verifying registration with server...', type: 'info' });
        const verificationResponse = await api.post(
          '/passkey/register/verify',
          { registrationResponse: attestationResponse },
          { withCredentials: true }
        );
        const verificationResult = verificationResponse.data;

        if (verificationResult.verified && !verificationResult.error) {
          // Save credentialID to localStorage
          const newCredentialID = attestationResponse.id;
          const storedCredentialIDs = JSON.parse(localStorage.getItem('passkeyCredentialIDs') || '[]');
          if (!storedCredentialIDs.includes(newCredentialID)) {
            storedCredentialIDs.push(newCredentialID);
            localStorage.setItem('passkeyCredentialIDs', JSON.stringify(storedCredentialIDs));
          }

          setIsPasskeyEnabled(true);
          setPasskeyStatus({
            text: 'Passkey registered successfully!',
            type: 'success',
          });
        } else if (verificationResult.verified && verificationResult.error) {
          setPasskeyStatus({
            text: verificationResult.message,
            type: 'warning',
          });
        } else {
          setPasskeyStatus({
            text: 'Passkey verification failed on server.',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Passkey Registration Error:', error);
        setPasskeyStatus({
          text: error.response?.data?.error || `Error: ${error.message}`,
          type: 'error',
        });
        setIsPasskeyEnabled(false);
      } finally {
        setIsLoadingPasskey(false);
        setTimeout(() => setPasskeyStatus({ text: '', type: '' }), 5000);
      }
    } else {
      // Disabling passkey (placeholder for backend call)
      setIsLoadingPasskey(true);
      setPasskeyStatus({ text: 'Disabling passkey authentication...', type: 'info' });

      try {
        // Call backend to remove all passkeys
        const response = await AdminAPI.get('/passkey/remove', {}, { withCredentials: true });

        // Clear localStorage
        localStorage.removeItem('passkeyCredentialIDs');

        setIsPasskeyEnabled(false);
        setPasskeyStatus({
          text: response.data.message || 'Passkey authentication disabled.',
          type: 'success'
        });
      } catch (error) {
        console.error('Passkey Disable Error:', error);
        setPasskeyStatus({
          text: error.response?.data?.error || `Error disabling passkey: ${error.message}`,
          type: 'error',
        });
      } finally {
        setIsLoadingPasskey(false);
        setTimeout(() => setPasskeyStatus({ text: '', type: '' }), 3000);
      }
    }
  };

  // --- UPDATED: Handler for 2FA toggle with API call ---
  const handleTwoFactorToggle = async () => {
    setIsLoadingTwoFactor(true);
    const action = isTwoFactorEnabled ? 'Disabling' : 'Enabling';
    setTwoFactorStatus({ text: `${action} 2FA...`, type: 'info' });

    try {
      // We assume the backend route is '/settings/toggle-2fa'
      const response = await AdminAPI.get('/settings/toggle-2fa');

      if (response.data.status === 'success') {
        setIsTwoFactorEnabled(response.data.isTwoFactorEnabled);
        setTwoFactorStatus({
          text: response.data.message,
          type: 'success',
        });
      } else {
        // Handle case where API returns a non-error but unsuccessful status
        setTwoFactorStatus({
          text: response.data.message || 'An unexpected error occurred.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('2FA Toggle Error:', error);
      // Revert UI state on failure
      setIsTwoFactorEnabled(!isTwoFactorEnabled);
      setTwoFactorStatus({
        text: error.response?.data?.message || 'Failed to update 2FA status.',
        type: 'error',
      });
    } finally {
      setIsLoadingTwoFactor(false);
      setTimeout(() => setTwoFactorStatus({ text: '', type: '' }), 5000);
    }
  };


  const handleEmailNotificationsToggle = () => setIsEmailNotificationsEnabled(!isEmailNotificationsEnabled);
  const handleActivityAlertsToggle = () => setIsActivityAlertsEnabled(!isActivityAlertsEnabled);

  const handleDeleteAccount = () => {
    setShowDeleteMessage(true);
    setTimeout(() => setShowDeleteMessage(false), 3000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

      {/* Security Settings Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">
          Security Settings
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Passkey Setting Row */}
          <div className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Passkey Authentication
              </h3>
              <p className="text-sm text-gray-500">
                Enable passwordless login using passkeys (WebAuthn).
              </p>
              {passkeyStatus.text && (
                <p
                  className={`text-sm mt-2 ${passkeyStatus.type === 'error'
                    ? 'text-red-600'
                    : passkeyStatus.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                    }`}
                >
                  {passkeyStatus.text}
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPasskeyEnabled}
              onClick={confirmPasskyToggle}
              disabled={isLoadingPasskey}
              className={`${isPasskeyEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                aria-hidden="true"
                className={`${isPasskeyEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {/* Two-Factor Authentication Setting Row */}
          <div className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-500">
                Add an extra layer of security with 2FA.
              </p>
              {/* --- New status message for 2FA --- */}
              {twoFactorStatus.text && (
                <p
                  className={`text-sm mt-2 ${twoFactorStatus.type === 'error'
                    ? 'text-red-600'
                    : 'text-green-600'
                    }`}
                >
                  {twoFactorStatus.text}
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isTwoFactorEnabled}
              onClick={confirmTwoFactorToggle}
              disabled={isLoadingTwoFactor} // Disable button while loading
              className={`${isTwoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                aria-hidden="true"
                className={`${isTwoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">
          Notification Settings
        </h2>
        <div className="divide-y divide-gray-200">
          <div className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-500">
                Receive email updates about your account.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEmailNotificationsEnabled}
              onClick={handleEmailNotificationsToggle}
              className={`${isEmailNotificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${isEmailNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Activity Alerts
              </h3>
              <p className="text-sm text-gray-500">
                Get alerts for suspicious account activity.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActivityAlertsEnabled}
              onClick={handleActivityAlertsToggle}
              className={`${isActivityAlertsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${isActivityAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">
          Danger Zone
        </h2>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Delete Account
              </h3>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data.
              </p>
              {showDeleteMessage && (
                <p className="text-sm text-red-600 mt-2">
                  Account deletion request sent (demo).
                </p>
              )}
            </div>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;