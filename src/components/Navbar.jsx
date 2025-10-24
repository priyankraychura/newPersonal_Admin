import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, X } from 'lucide-react'; // Import the 'X' icon
import { useSelector } from 'react-redux';

const Navbar = ({
  sidebarOpen,
  setSidebarOpen,
  setShowProfileModal,
  searchQuery,
  setSearchQuery
}) => {
  const currentUser = useSelector(state => state?.userReducer?.userData);

  // State for search functionality
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Refs for DOM elements
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Effect to handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event) {
      // Close only if the search bar is empty
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        !searchQuery
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery]); // Rerun effect if searchQuery changes

  // Effect to auto-focus the input when the search bar opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handler to clear search and keep the input focused
  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentUser?.companyName || "Admin Panel"}
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">

            {/* --- Final Animated Search Bar --- */}
            <div
              ref={searchContainerRef}
              className={`flex items-center justify-center bg-white rounded-full transition-all duration-300 ease-in-out
                ${isSearchOpen ? 'ring-2 ring-blue-500 shadow-md' : 'ring-1 ring-transparent'}`}
            >
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSearchOpen ? "Search..." : ""}
                className={`font-medium text-gray-700 bg-transparent text-sm focus:outline-none transition-all duration-300 ease-in-out
                  ${isSearchOpen ? 'w-48 sm:w-56 py-2 pl-4 pr-2' : 'w-0 p-0'}`}
              />

              {/* --- Clear Button --- */}
              {searchQuery && isSearchOpen && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 mr-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => setIsSearchOpen(true)} // Always opens the search bar
                className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Other Icons */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.designation}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 transform hover:scale-110"
              >
                <span className="text-white text-sm font-medium">{currentUser?.name?.charAt(0)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;