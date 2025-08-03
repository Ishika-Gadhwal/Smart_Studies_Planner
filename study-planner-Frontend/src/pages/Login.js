import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Login.css';
import API from '../services/api';

function Login({ setIsLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/login', { email, password });
            if (res.status === 200) {
                localStorage.setItem('token', res.data.token);
                setIsLoggedIn(true);
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError('Login failed. Please try again.');
        }
    }

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login to Your Account</h2>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                </div>

                <button type="submit" className="login-button">
                    Login
                </button>

                {error && <p className="error">{error}</p>}

                <p className="register-link">
                    Don't have an account?{' '}
                    <a href="/register">Register</a>
                </p>
            </form>

            <div className="login-img">

                <img src='/login_img.jpg'></img>
            </div>
        </div>

        // <div className="login-page">
        //     <div className="login-form-container">
        //         <form onSubmit={handleSubmit} className="login-form">
        //             <h2>Login to Your Account</h2>

        //             <div className="form-group">
        //                 <label htmlFor="email">Email</label>
        //                 <input
        //                     id="email"
        //                     type="email"
        //                     value={email}
        //                     onChange={(e) => setEmail(e.target.value)}
        //                     required
        //                     placeholder="Enter your email"
        //                 />
        //             </div>

        //             <div className="form-group">
        //                 <label htmlFor="password">Password</label>
        //                 <input
        //                     id="password"
        //                     type="password"
        //                     value={password}
        //                     onChange={(e) => setPassword(e.target.value)}
        //                     required
        //                     placeholder="Enter your password"
        //                 />
        //             </div>

        //             <button type="submit" className="login-button">
        //                 Login
        //             </button>

        //             {error && <p className="error">{error}</p>}

        //             <p className="register-link">
        //                 Don't have an account? <a href="/register">Register</a>
        //             </p>
        //         </form>
        //     </div>
        // </div>

    )
};

export default Login;




