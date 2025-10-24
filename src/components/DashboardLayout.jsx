import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ProfileModal from './ProfileModal';
import ConfirmationDialog from './ConfirmationDialog';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State to manage the confirmation dialog
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false });

  // Function to show the confirmation dialog with custom options
  const showConfirmation = (config) => {
    setDialogConfig({ isOpen: true, ...config });
  };

  const handleCloseDialog = () => {
    setDialogConfig({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans ">
      {/* Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowProfileModal={setShowProfileModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
        />
      )}

      {/* Confirmation Dialog (Global) */}
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmButtonText={dialogConfig.confirmButtonText}
        variant={dialogConfig.variant}
        icon={dialogConfig.icon}
      />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarHovered={sidebarHovered}
        setSidebarHovered={setSidebarHovered}
      // activeTab={activeTab}
      />

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen || sidebarHovered ? 'ml-64' : 'ml-16'}`}>
        <div className="p-8">
          {/* Outlet will render the matched nested route component */}
          <Outlet context={{ searchQuery, showConfirmation }} />
        </div>
      </main>

      {/* Mobile overlay */}
      {(sidebarOpen || sidebarHovered) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;