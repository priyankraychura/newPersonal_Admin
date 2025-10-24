import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Lottie from 'lottie-react';
import LoadingAnimation from '../assets/Loading.json';
import { login, logout } from '../features/user/userSlice';
import MainRoute from '../routes/MainRoute'; // Import your router
import AdminAPI from '../services/adminAPI';

const AuthWrapper = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Skip auth check for public routes
        const publicRoutes = ['/client-register', '/'];
        if (publicRoutes.includes(location.pathname)) {
            setIsAppLoading(false);
            return;
        }

        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await AdminAPI.get('/profile');
                    dispatch(login(response.data.user));
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    dispatch(logout());
                    localStorage.removeItem('token');
                    navigate('/');
                }
            } else {
                dispatch(logout());
                navigate('/');
            }
            setIsAppLoading(false);
        };

        fetchUserData();
    }, [dispatch, navigate, location.pathname]);

    if (isAppLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-64 h-64">
                    <Lottie
                        animationData={LoadingAnimation}
                        loop={true}
                    />
                </div>
            </div>
        );
    }

    // Return the router instead of App
    return <MainRoute />;
};

export default AuthWrapper;