import { createSlice } from "@reduxjs/toolkit";
import toast from 'react-hot-toast';

const initialState = {
    isLoggedIn: false,
    userData: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.userData = action.payload;
        },
        logout: (state) => {
            localStorage.removeItem('token');
            state.isLoggedIn = false;
            state.userData = null;
            toast.success('Logged out successfully')
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;