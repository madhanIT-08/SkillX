import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const Dashboard = () => {
    const { user } = useAuth();
    const [upcoming, setUpcoming] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Fetch scheduled requests
                const { data } = await axios.get(`${API_URL}/api/requests/received`, config);
                const { data: sent } = await axios.get(`${API_URL}/api/requests/sent`, config);

                const allAccepted = [...data, ...sent]
                    .filter(req => req.status === 'accepted' && req.scheduledDate)
                    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

                setUpcoming(allAccepted);

                // Fetch active joinable sessions
                const { data: sessions } = await axios.get(`${API_URL}/api/sessions`, config);
                setActiveSessions(sessions);
            } catch (error) {
                console.error(error);
            }
        };
        fetchDashboardData();
    }, [user.token]);

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div className="flex justify-between items-center">
                <div>
                    <h1>Welcome, {user.name}!</h1>
                    <p className="text-muted">Member since {new Date(user.createdAt).getFullYear()}</p>
                </div>
                <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⭐</span>
                    <span style={{ fontWeight: 'bold' }}>{user.reputation || 'N/A'} Reputation</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
                <div className="card">
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                    <h3>Find Skills</h3>
                    <p className="text-muted">Search for peers who can teach you something new.</p>
                    <Link to="/search" className="btn btn-outline mt-4" style={{ width: '100%' }}>Search Skills</Link>
                </div>

                <div className="card">
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👤</div>
                    <h3>Your Expertise</h3>
                    <p className="text-muted">Update your profile and offer your skills to others.</p>
                    <Link to="/profile" className="btn btn-outline mt-4" style={{ width: '100%' }}>Manage Profile</Link>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#bfdbfe' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📥</div>
                    <h3>Inbox</h3>
                    <p className="text-muted">Check your incoming requests and sent invites.</p>
                    <Link to="/requests" className="btn btn-primary mt-4" style={{ width: '100%' }}>View Requests</Link>
                </div>
            </div>

            <div className="mt-4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3>📅 Your Schedule</h3>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Your upcoming mentorship sessions.</p>

                    {upcoming.length === 0 ? (
                        <div style={{ border: '2px dashed #e2e8f0', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                            No sessions scheduled. Start by sending a request!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {upcoming.map(session => (
                                <div key={session._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{session.skillName}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            With {session.sender._id === user._id ? session.receiver.name : session.sender.name}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Date(session.scheduledDate).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.85rem' }}>{new Date(session.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: '#fafafa' }}>
                        <h3>Quick Guide</h3>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem', color: '#475569', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            <li>Accept requests to create a secure session</li>
                            <li>Find the <b>Passkey</b> in request details</li>
                            <li>Join the live session at the scheduled time</li>
                            <li>Don't forget to rate your peer afterward!</li>
                        </ul>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#bbf7d0' }}>
                        <h3>🚀 Joinable Now</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Active sessions ready for you.</p>
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {activeSessions.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: '#166534' }}>No joinable sessions at the moment.</p>
                            ) : (
                                activeSessions.map(s => (
                                    <div key={s._id} style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.skillName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#166534' }}>Key: {s.passkey}</div>
                                        </div>
                                        <Link to={`/session/${s._id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Join</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
