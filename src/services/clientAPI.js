import axios from 'axios';

// 1. Get the API URL and Key from environment variables
const apiUrl = import.meta.env.VITE_CLIENT_API_URL;
const apiKey = import.meta.env.VITE_API_SECRET_KEY;

// 2. Create a new Axios instance with a custom configuration
const clientAPI = axios.create({
  // Set the base URL for all requests made with this instance
  baseURL: apiUrl,
  // Automatically include credentials (like cookies) in every request
  withCredentials: true,
  // Set default headers that will be sent with every request
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  },
});

// 3. Export the configured instance to be used throughout your application
export default clientAPI;
