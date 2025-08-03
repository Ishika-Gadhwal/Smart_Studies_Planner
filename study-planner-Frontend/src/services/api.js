import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api' || process.env.BACKEND_URI,
});


// it will Add JWT token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    
    return req;
});




export default API;
