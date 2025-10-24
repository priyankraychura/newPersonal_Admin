import React, { useState, useEffect } from 'react';
import { 
    Mail, Send, Clock, RefreshCw, UserCheck, Paperclip, Phone, Building, 
    ChevronDown, ChevronUp, User, Globe, Database, Link, Users as UsersIcon 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Users from '../components/Users';
import AdminInvitationPanel from './AdminInvitationPanel';

const UserManagementPage = () => {
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        { id: 'users', name: 'All Users', component: <Users />, icon: <UsersIcon className="w-5 h-5 mr-2" /> },
        { id: 'invitations', name: 'Invitations', component: <AdminInvitationPanel />, icon: <Send className="w-5 h-5 mr-2" /> },
    ];
    
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    const totalUsers = 3; 
    const pendingInvitations = 2;

    // A reasonable average width for each tab in 'rem' units.
    // This can be adjusted to give more or less space per tab.
    const averageTabWidthRem = 11; 
    const maxContainerWidthRem = tabs.length * averageTabWidthRem;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto">
                {/* <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage registered clients and send registration invitations.</p>
                </header> */}
                
                {/* --- Slider Tab Navigation --- */}
                <div 
                    className="w-full mx-auto bg-gray-100 rounded-xl p-1 mb-8"
                    style={{ maxWidth: `${maxContainerWidthRem}rem` }}
                >
                    <div className="relative flex items-center bg-gray-100 rounded-xl">
                        <div
                            className="absolute left-0 top-0 h-full bg-white rounded-lg shadow-md transition-transform duration-300 ease-in-out"
                            style={{
                                width: `${100 / tabs.length}%`,
                                transform: `translateX(${activeTabIndex * 100}%)`
                            }}
                        ></div>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative z-10 flex-1 py-2.5 text-center font-semibold transition-colors duration-300 ease-in-out focus:outline-none"
                            >
                                <div className={`flex items-center justify-center ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                                    {tab.icon}
                                    {tab.name}
                                    {tab.id === 'users' && 
                                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                                            {totalUsers}
                                        </span>
                                    }
                                    {tab.id === 'invitations' && 
                                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                                            {pendingInvitations}
                                        </span>
                                    }
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Active Tab Content --- */}
                <main>
                    {tabs.find(tab => tab.id === activeTab).component}
                </main>
            </div>
        </div>
    );
};

export default UserManagementPage;

