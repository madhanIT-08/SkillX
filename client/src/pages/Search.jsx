import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Search = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [requestData, setRequestData] = useState({ message: '', scheduledDate: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/api/users/search?skill=${query}`, config);
            setResults(data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async () => {
        if (!requestData.message || !requestData.scheduledDate) return alert("Please fill all fields");

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/api/requests`, {
                receiverId: selectedPeer._id,
                skillName: query || selectedPeer.skillsOffered[0],
                message: requestData.message,
                scheduledDate: requestData.scheduledDate
            }, config);
            setMessage('Request sent successfully!');
            setShowRequestModal(false);
            setRequestData({ message: '', scheduledDate: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert(error.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2>Find a Mentor/Peer</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a skill (e.g. React)"
                />
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {message && <div style={{ marginTop: '1rem', color: 'green' }}>{message}</div>}

            <div className="mt-4">
                {results.map((peer) => (
                    <div key={peer._id} className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>{peer.name}</h3>
                            <div style={{ background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                ⭐ {peer.reputation || 'No ratings'}
                            </div>
                        </div>
                        <p className="text-muted">Offers: {peer.skillsOffered.join(', ')}</p>
                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => { setSelectedPeer(peer); setShowRequestModal(true); }}
                        >
                            Request Mentorship
                        </button>
                    </div>
                ))}
                {results.length === 0 && query && <p className="mt-4">No peers found.</p>}
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
                        <h3>Request Mentorship from {selectedPeer.name}</h3>
                        <p className="text-muted">Propose a time and send a message.</p>

                        <div className="form-group mt-4">
                            <label>Propose Date & Time</label>
                            <input
                                type="datetime-local"
                                value={requestData.scheduledDate}
                                onChange={(e) => setRequestData({ ...requestData, scheduledDate: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                rows="3"
                                value={requestData.message}
                                onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                placeholder="Hi! I'd love to learn about..."
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button className="btn btn-primary" onClick={sendRequest} style={{ flex: 1 }}>Send Request</button>
                            <button className="btn btn-outline" onClick={() => setShowRequestModal(false)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
