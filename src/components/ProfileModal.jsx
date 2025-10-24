import React, { useRef, useState } from 'react';
import {
  X,
  Camera,
  User,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Shield,
  ShieldCheck,
  Building,
  Globe,
  Database,
  Link
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/user/userSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import AdminAPI from '../services/adminAPI';

const ProfileModal = ({
  showProfileModal,
  setShowProfileModal,
}) => {
  const currentUser = useSelector(state => state?.userReducer?.userData);
  const [profileForm, setProfileForm] = useState(currentUser || {});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cloudName = 'dsy7gcbrj';
  const uploadPreset = 'profile';

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      setProfileForm(prevForm => ({
        ...prevForm,
        profilePath: {
          ...prevForm.profilePath,
          imageUrl: URL.createObjectURL(selectedFile)
        }
      }));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      // setMessage('Please select an image to upload.');
      return null;
    }

    // setMessage('Uploading image...');
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: data,
        }
      );

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.secure_url;
        const publicId = result.public_id;
        toast.success(`Image uploaded successfully!`);
        return { imageUrl, publicId };
      } else {
        toast.error('Upload failed. Please try again.');
        console.error('Upload failed:', await response.text());
        setLoading(false);
        return null;
      }
    } catch (error) {
      toast.error('An error occurred during upload.');
      console.error('API call error:', error);
      setLoading(false);
      return null;
    }
  };

  const handleProfileUpdate = async () => {
    let finalProfileForm = { ...profileForm };
    setLoading(true)

    const originalImageExists = !!currentUser.profilePath;
    const newImageWasSelected = !!file;

    // If a new image was selected, upload it and update the user data
    if (newImageWasSelected) {
      const uploadResult = await handleUpload();
      if (uploadResult && uploadResult.imageUrl) {
        // Update the profilePath to the permanent Cloudinary URL
        finalProfileForm.profilePath = uploadResult;
      } else {
        // If upload fails, stop the submission process
        console.error("Image upload failed. Profile update cancelled.");
        // setMessage("Could not update profile because image upload failed.");
        return;
      }
    }

    const updateProfilePromise = AdminAPI.post('/update-profile', finalProfileForm)

    toast.promise(updateProfilePromise, {
      loading: 'Updating profile...',
      success: (response) => {
        dispatch(login(response.data.user));
        setShowProfileModal(false);
        setLoading(false)

        return <b>{response.data.msg}</b>;
      },
      error: (error) => {
        setLoading(false)
        return <b>{error.response?.data?.msg || 'Profile update failed.'}</b>;
      }
    });

  };

  const handleSendVerification = () => {
    const sentMailPromise = AdminAPI.post('/send-email', { email: profileForm.email })

    toast.promise(sentMailPromise, {
      loading: 'Sending email...',
      success: (response) => {
        return <b>Verification email sent!</b>;
      },
      error: (error) => {
        setShowProfileModal(false);
        navigate('/dashboard');
        return <b>{error.response?.data?.msg || 'Could not send verification email.'}</b>;
      }
    });
  };

  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {
                  profileForm?.profilePath?.imageUrl
                    ? <div className='h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white ring-opacity-30'>
                      <img className='rounded-full' src={profileForm?.profilePath?.imageUrl} alt={profileForm?.profilePath?.publicId} />
                    </div>
                    : <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white ring-opacity-30">
                      <span className="text-2xl font-bold text-blue-600">{profileForm?.name?.charAt(0) || 'U'}</span>
                    </div>
                }
                <button className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110">
                  <Camera className="w-4 h-4" onClick={handleImageButtonClick} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <p className="text-blue-100">Update your account information</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body with Custom Scrollbar */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="p-8 space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                  <input
                    type="tel"
                    value={profileForm.mobile || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter mobile number"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={profileForm.dob || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                      disabled={loading}
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Gender</label>
                  <select
                    value={profileForm.gender || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">City</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.city || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                      placeholder="Enter your city"
                      disabled={loading}
                    />
                    <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Pincode</label>
                  <input
                    type="text"
                    value={profileForm.pincode || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter pincode"
                    maxLength="6"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Designation</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.designation || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                      placeholder="Enter your designation"
                      disabled={loading}
                    />
                    <Briefcase className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="bg-green-100 p-3 rounded-full">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Company Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.companyName || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                      placeholder="Enter company name"
                      disabled={loading}
                    />
                    <Building className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Website</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={profileForm.website || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                      placeholder="https://company.com"
                      disabled={loading}
                    />
                    <Globe className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      disabled
                      className="w-full px-4 py-4 pr-24 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    {profileForm.isEmailVarified ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold border border-green-200">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSendVerification}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-full text-xs font-bold border border-red-200 transition-all duration-300 hover:scale-105"
                        disabled={loading}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Verify</span>
                      </button>
                    )}
                  </div>
                  {!profileForm.isEmailVarified && (
                    <p className="text-xs text-red-600 font-medium">Click 'Verify' to send verification email</p>
                  )}
                </div>
              </div>
            </div>

            {/* Database Connection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Database Connection</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Connection Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.connectionName || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, connectionName: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-400"
                      placeholder="Enter connection name"
                      disabled={loading}
                    />
                    <Database className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700">Connection String</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.connectionString || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, connectionString: e.target.value })}
                      className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-400"
                      placeholder="Enter database connection string"
                      disabled={loading}
                    />
                    <Link className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex justify-end space-x-4 border-t border-gray-200">
          <button
            onClick={() => setShowProfileModal(false)}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleProfileUpdate}
            className="relative px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            disabled={loading}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <BeatLoader color="#fff" size={8} margin={2} />
              </div>
            )}

            <span className={loading ? 'text-transparent' : 'text-white'}>
              Save Changes
            </span>
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;