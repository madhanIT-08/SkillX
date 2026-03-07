import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (user) {
            const socket = io(API_URL);
            socket.emit('join_room', user._id); // Join room for personal notifications

            socket.on('new_request', (data) => {
                alert(`New Mentorship Request from ${data.sender.name} for ${data.skillName}!`);
            });

            socket.on('request_status_updated', (data) => {
                alert(`Your request for ${data.skillName} has been ${data.status}!`);
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-brand">SkillX</Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                            <Link to="/search" className={isActive('/search')}>Search</Link>
                            <Link to="/requests" className={isActive('/requests')}>Requests</Link>
                            <Link to="/profile" className={isActive('/profile')}>Profile</Link>
                            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={isActive('/login')}>Login</Link>
                            <Link to="/register" className={isActive('/register')}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
