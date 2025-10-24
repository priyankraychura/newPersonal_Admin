import React, { useEffect, useState } from 'react';
import {
    Mail,
    Phone,
    Building,
    ChevronDown,
    ChevronUp,
    User,
    Globe,
    Database,
    Link,
    MapPin,
    Calendar,
    ExternalLink,
    Edit,
    ToggleLeft,
    ToggleRight,
    PlayCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/user/userSlice';
import axios from 'axios';
import AdminAPI from '../services/adminAPI';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            AdminAPI.get('/getAllUsers')
                .then((res) => {
                    setUsers(res.data.userData)
                    setLoading(false)
                })
                .catch((err) => {
                    setLoading(false)
                })
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            console.error("token not available");
            dispatch(logout());
            navigate('/')
        } else {
            fetchAllUsers();
        }
    }, []);

    const toggleRowExpansion = (id) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(id)) {
            newExpandedRows.delete(id);
        } else {
            newExpandedRows.add(id);
        }
        setExpandedRows(newExpandedRows);
    };

    const toggleUserStatus = (id) => {
        setUsers(users.map(user =>
            user?._id === id ? { ...user, status: !user.status } : user
        ));
    };

    const getStatusBadge = (status) => {
        // status is now a boolean
        if (status) { // true for active
            return 'bg-green-100 text-green-800 border-green-200';
        }
        // false for inactive
        return 'bg-gray-200 text-gray-800 border-gray-300';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Users</h1>
                <div className="text-sm text-gray-600">
                    Total Users: {users.length}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sr. No.
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User Details
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Designation
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading users...</td></tr>
                            ) : users.length > 0 ?
                                (users?.map((user, index) => (
                                    <React.Fragment key={user?._id}>
                                        <tr className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                                                {index + 1}
                                            </td> 
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                                                            {
                                                                user?.profilePath
                                                                    ? <img className='h-10 w-10 rounded-full' src={user?.profilePath?.imageUrl} alt="" />
                                                                    : <span className="text-white text-sm font-medium">
                                                                        {user?.name?.charAt(0) || 'N/A'}
                                                                    </span>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user?.name || 'Name not available'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {user?.email}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Phone className="w-3 h-3 mr-1" />
                                                            {user?.mobileNumber || 'Number not available'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Building className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                                                    <span>{user?.companyName || 'Company name not available'}</span>
                                                    <a
                                                        href={`https://${user?.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={user?.website}
                                                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user?.designation || 'Designation not available'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(user.status)}`}>
                                                    {user.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(user?._id)}
                                                        className={`p-2 rounded-md transition-colors duration-200 ${user.status ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                                        title={user.status ? 'Deactivate User' : 'Activate User'}
                                                    >
                                                        {user.status ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                                                        title="Edit Details"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRowExpansion(user?._id)}
                                                        className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                                                        title={expandedRows.has(user?._id) ? 'Hide Details' : 'View Details'}
                                                    >
                                                        {expandedRows.has(user?._id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRows?.has(user?._id) && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                    <div className="space-y-6">
                                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                                <User className="w-5 h-5 text-blue-500 mr-2" />
                                                                Personal Information
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">DOB</span>
                                                                    <span className="text-sm font-bold text-gray-800">{new Date(user?.dob).toLocaleDateString('en-IN')}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                                    <User className="w-4 h-4 text-green-600" />
                                                                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Gender</span>
                                                                    <span className="text-sm font-bold text-gray-800">{user?.gender || 'Gender not available'}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                                                                    <MapPin className="w-4 h-4 text-purple-600" />
                                                                    <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">City</span>
                                                                    <span className="text-sm font-bold text-gray-800">{user?.city || 'City not available'}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
                                                                    <MapPin className="w-4 h-4 text-yellow-600" />
                                                                    <span className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pincode</span>
                                                                    <span className="text-sm font-bold text-gray-800">{user?.pincode || 'PIN code not available'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <Database className="w-5 h-5 text-orange-500 mr-2" />
                                                                    Database Connection
                                                                </div>
                                                                <button className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium">
                                                                    <PlayCircle className="w-4 h-4 mr-1.5" />
                                                                    Test Connection
                                                                </button>
                                                            </h4>
                                                            <div className="flex flex-wrap items-start gap-4">
                                                                <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                                                    <Database className="w-4 h-4 text-orange-600" />
                                                                    <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Connection Name</span>
                                                                    <span className="text-sm font-semibold text-gray-800">{user?.connectionName || 'Connection name not available'}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-100 flex-1 min-w-[300px]">
                                                                    <Link className="w-4 h-4 text-gray-600" />
                                                                    {/* <div className="flex flex-col"> */}
                                                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Connection String</span>
                                                                    <span className="text-sm font-semibold text-gray-800">{user?.connectionString || 'Connection string not available'}</span>
                                                                    {/* </div> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )))
                                : (
                                    <tr><td colSpan="6" className="text-center py-10 text-gray-500">No users found </td></tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;