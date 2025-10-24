import React, { useEffect, useState } from 'react';
import { Mail, User, Calendar, Check, X, LoaderCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../features/user/userSlice';
import toast from 'react-hot-toast';
import AdminAPI from '../services/adminAPI';
import { useNavigate } from 'react-router-dom';

const ContactFormTable = () => {
    // Sample contact form data with simplified fields
    const [contactForms, setContactForms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStatusFilter, setActiveStatusFilter] = useState('all');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getAllContactApplications = async () => {
        AdminAPI.get('/getAllContacts')
            .then((response) => {
                const sortedUsers = response.data.contactData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setContactForms(sortedUsers)
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                if (err?.response?.status === 403) {
                    console.error("expired token")
                    dispatch(logout());
                    navigate();
                }
                setIsLoading(false);
            })

    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            console.error("token not available");
        } else {
            getAllContactApplications();
        }
    }, [])

    // Function to get status badge color based on boolean status
    const getStatusBadge = (status) => {
        return status
            ? 'bg-gray-100 text-gray-600 border-gray-200'
            : 'bg-purple-100 text-purple-800 border-purple-200';
    };

    // Function to handle status change
    const handleStatusChange = (id, currentStatus) => {
        try {
            AdminAPI.patch(`/update-contact-status/${id}`, { status: !currentStatus })
                .then((res) => {
                    toast.success(res?.data.msg)
                    setContactForms(contactForms.map(form =>
                        form._id === id ? { ...form, status: !form.status } : form
                    ));
                })
                .catch((err) => {
                    console.error(err)
                    toast.error("Failed to update status.")
                })

        } catch (error) {
            setContactForms(contactForms.map(form =>
                form.id === id ? { ...form, status: currentStatus } : form
            ));
            console.error(error)
        }
    };

    // Filtering logic based on status
    const filteredForms = contactForms.filter(form => {
        if (activeStatusFilter === 'all') return true;
        if (activeStatusFilter === 'new') return !form.status;
        if (activeStatusFilter === 'read') return form.status;
        return true;
    });

    // Get counts for each status
    const statusCounts = {
        all: contactForms.length,
        new: contactForms.filter(f => !f.status).length,
        read: contactForms.filter(f => f.status).length
    };

    const filterOptions = ['all', 'new', 'read'];

    return (
        <div className="space-y-6 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    Contact Forms
                </h1>

                {/* Filters moved to the header */}
                {/* <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200"> */}
                {/* <span className="text-sm font-medium text-gray-600 mr-2">Total: {filteredForms.length}</span> */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveStatusFilter(filter)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeStatusFilter === filter
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${activeStatusFilter === filter
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-200 text-gray-700'
                                }`}>
                                {statusCounts[filter]}
                            </span>
                        </button>
                    ))}
                </div>
                {/* </div> */}
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sr. No.
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Message
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Mark As
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading invitations...</td></tr>
                            ) : filteredForms.length > 0 ? (
                                filteredForms.map((form, index) => (
                                    <tr key={form._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">
                                                            {form.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{form.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {form.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 max-w-sm overflow-hidden text-ellipsis whitespace-nowrap" title={form.message}>{form.message}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {new Date(form.createdAt).toLocaleDateString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(form.status)}`}>
                                                {form.status ? 'Read' : 'New'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleStatusChange(form._id, form?.status)}
                                                title={form.status ? 'Mark as New' : 'Mark as Read'}
                                                className={`p-2 rounded-full text-white text-xs font-medium transition-colors duration-200 ${form.status ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                                    }`}
                                            >
                                                {form.status ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-500">No data found </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContactFormTable;

