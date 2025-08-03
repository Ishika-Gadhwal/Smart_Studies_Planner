import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
// import Dashboard from './Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './Dashboard'
import './App.css'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange)
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  }

  return (
    <Router>
      <nav className="navbar" style={{ position: "fixed", zIndex: "2", width: "100%" }}>
        <div className="nav-left">
          {/* <Link className="nav-link" to="/">Home</Link> */}
          <NavLink style={{ textDecoration: "none" }} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")} to="/">Dashboard</NavLink>
          {/* {isLoggedIn && <Link className="nav-link" to="/dashboard">Dashboard</Link>} */}
          {!isLoggedIn && (
            <>
              <NavLink style={{ textDecoration: "none" }} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")} to="/login">Login</NavLink>
              <NavLink style={{ textDecoration: "none" }} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")} to="/register">Register</NavLink>
            </>
          )}
        </div>
        {isLoggedIn && (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        )}
      </nav>

      <div className="content">
        <Routes>
          {/* <Route path="/" element={<h1 className="home-title">Welcome to Smart Study Planner</h1>} /> */}
          {/* <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} /> */}
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />
          <Route path="/register" element={!isLoggedIn ? <Register setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
