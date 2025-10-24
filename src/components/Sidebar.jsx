import React, { useState } from 'react';
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Send,
  NotepadText,
  ChevronDown,
  UserCog,
  MessageSquareText,
  LayoutList,
  Info,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarHovered,
  setSidebarHovered,
}) => {
  const navItems = [
    { id: '/dashboard', label: 'Dashboard', icon: Home },
    { id: '/notes', label: 'Notes', icon: NotepadText },
    { id: '/todo', label: 'Tasks', icon: LayoutList },
    {
      id: '/management',
      label: 'Management',
      icon: Users,
      children: [
        { id: '/management/users', label: 'Users', icon: Users },
        { id: '/management/invitations', label: 'Client Invitation', icon: Send },
        { id: '/management/user-management', label: 'User Management', icon: UserCog },
      ],
    },
    { id: '/contact-form', label: 'Contact Table', icon: MessageSquareText },
    { id: '/analytics', label: 'Analytics', icon: BarChart3 },
    { id: '/settings', label: 'Settings', icon: Settings },
    { id: '/about', label: 'About & Info', icon: Info },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const isExpanded = sidebarOpen || sidebarHovered;

  return (
    <aside
      className={`fixed left-0 top-16 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out z-20 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      <div className="p-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isParentActive = item.children && location.pathname.startsWith(item.id);

            return item.children ? (
              <div key={item.id}>
                {/* Main Tab (Dropdown Trigger) */}
                <button
                  onClick={() => handleDropdownToggle(item.id)}
                  className={`w-full flex items-center rounded-lg text-left transition-all duration-200 relative group 
                    ${isExpanded ? 'justify-between px-3 py-3' : 'justify-center px-3 py-3'} 
                    ${isParentActive
                      ? isExpanded
                        ? 'bg-blue-50 text-blue-600 font-semibold' // Active style when EXPANDED
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' // Active style when COLLAPSED
                      : 'text-gray-700 hover:bg-gray-100' // Default inactive style
                    }`
                  }
                >
                  {/* Conditionally render content for proper centering */}
                  {isExpanded ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openDropdown === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    </>
                  ) : (
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
                
                {/* Sub Tabs (Dropdown Content) */}
                {isExpanded && openDropdown === item.id && (
                  <div className="pl-5 pt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.id}
                        className={({ isActive }) =>
                          `w-full flex items-center rounded-lg text-left transition-all duration-200 relative group space-x-3 px-3 py-2.5 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`
                        }
                      >
                        <child.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap text-sm">
                          {child.label}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Regular NavLink Item
              <NavLink
                key={item.id}
                to={item.id}
                className={({ isActive }) =>
                  `w-full flex items-center rounded-lg text-left transition-all duration-200 relative group ${
                    isExpanded ? 'space-x-3 px-3 py-3' : 'justify-center px-3 py-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                    isExpanded ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                >
                  {item.label}
                </span>
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg text-left text-red-600 hover:bg-red-50 transition-all duration-200 mt-8 relative group ${
              isExpanded ? 'space-x-3 px-3 py-3' : 'justify-center px-3 py-3'
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span
              className={`font-medium whitespace-nowrap transition-all duration-300 ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 absolute'
              }`}
            >
              Logout
            </span>
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;