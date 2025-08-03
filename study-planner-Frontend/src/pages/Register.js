// import axios from 'axios';
import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import './Register.css'
import API from '../services/api';

function Register({ setIsLoggedIn }) {
    const [formData, setFromData] = useState({
        name: '',
        email: '',
        password: '',
    })
    // const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFromData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res = await API.post('/auth/register', formData);
            setMessage("Register Successfully ! ");
            if (res.status === 200) {
                localStorage.setItem('token', res.data.token);
                setIsLoggedIn(true);
                // navigate('/dashboard');
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Registration failed');
        }
    }

    return (

        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2 className="register-title">Register</h2>

                <div className="input-wrapper">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="register-input"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="register-input"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="register-input"
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="register-button">
                    Register
                </button>

                <p className="register-login">
                    Already have an account? <a href="/login">Login</a>
                </p>

                {/* {message && <p className="register-message">{message}</p>} */}
                {message && (
                    <p className={`register-message ${message.includes('Success') ? 'success' : 'error'}`}>
                        {message}
                    </p>
                )}

            </form>

            <div className="register-img">
                <img src="/login.jpg"></img>
            </div>
        </div>
    )
}

export default Register
