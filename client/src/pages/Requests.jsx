import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Requests = () => {
    const { user } = useAuth();
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const navigate = useNavigate();

    const fetchRequests = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const resReceived = await axios.get('http://localhost:5000/api/requests/received', config);
            const resSent = await axios.get('http://localhost:5000/api/requests/sent', config);
            setReceived(resReceived.data);
            setSent(resSent.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user.token]);

    const handleAction = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`http://localhost:5000/api/requests/${id}`, { status }, config);

            if (status === 'accepted' && data.session) {
                alert(`Request Accepted! Session generated with Passkey: ${data.session.passkey}`);
                // navigate(`/session/${data.session._id}`); // Ideally let them navigate manually or auto
            }
            fetchRequests();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h2>Received Requests</h2>
                    {received.length === 0 && <p>No requests received.</p>}
                    {received.map(req => (
                        <div key={req._id} className="card" style={{ marginBottom: '1rem' }}>
                            <h4>From: {req.sender.name}</h4>
                            <p>Skill: <strong>{req.skillName}</strong></p>
                            <p>Message: {req.message}</p>
                            <p>Status: <span style={{ textTransform: 'capitalize' }}>{req.status}</span></p>
                            {req.status === 'pending' && (
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleAction(req._id, 'accepted')} className="btn btn-primary">Accept</button>
                                    <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-danger">Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div>
                    <h2>Sent Requests</h2>
                    {sent.length === 0 && <p>No requests sent.</p>}
                    {sent.map(req => (
                        <div key={req._id} className="card" style={{ marginBottom: '1rem', background: '#f9fafb' }}>
                            <h4>To: {req.receiver.name}</h4>
                            <p>Skill: <strong>{req.skillName}</strong></p>
                            <p>Status: <span style={{
                                fontWeight: 'bold',
                                color: req.status === 'accepted' ? 'green' : req.status === 'rejected' ? 'red' : 'orange'
                            }}>{req.status}</span></p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Requests;
