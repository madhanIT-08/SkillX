import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({ skillsOffered: [], skillsNeeded: [] });
    const [skillInput, setSkillInput] = useState('');
    const [skillType, setSkillType] = useState('offered'); // 'offered' or 'needed'
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/api/auth/profile`, config);
                setProfile(data);

                // Fetch reviews
                const { data: feedbackData } = await axios.get(`${API_URL}/api/feedback/${data._id}`);
                setReviews(feedbackData);

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user.token]);

    const handleAddSkill = async () => {
        if (!skillInput) return;
        const newProfile = { ...profile };
        if (skillType === 'offered') {
            newProfile.skillsOffered.push(skillInput);
        } else {
            newProfile.skillsNeeded.push(skillInput);
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_URL}/api/users/profile`, newProfile, config);
            setProfile(data);
            updateUser(data); // Sync global state and localStorage
            setSkillInput('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveSkill = async (skill, type) => {
        const newProfile = { ...profile };
        if (type === 'offered') {
            newProfile.skillsOffered = newProfile.skillsOffered.filter(s => s !== skill);
        } else {
            newProfile.skillsNeeded = newProfile.skillsNeeded.filter(s => s !== skill);
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_URL}/api/users/profile`, newProfile, config);
            setProfile(data);
            updateUser(data); // Sync global state and localStorage
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div className="flex justify-between items-center">
                <h2>My Profile</h2>
                <div style={{ background: '#fef9c3', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                    ⭐ {profile.reputation || 0} Average Rating
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                <div className="card">
                    <div className="form-group">
                        <label>Add a Skill</label>
                        <div className="flex gap-2">
                            <input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                placeholder="e.g. React, Python"
                            />
                            <select value={skillType} onChange={(e) => setSkillType(e.target.value)} style={{ width: '120px' }}>
                                <option value="offered">I Offer</option>
                                <option value="needed">I Need</option>
                            </select>
                            <button onClick={handleAddSkill} className="btn btn-primary">Add</button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4>Skills I Offer</h4>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {profile.skillsOffered.map((skill, index) => (
                                <span key={index} className="badge" style={{ background: '#e0e7ff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                    {skill} <button onClick={() => handleRemoveSkill(skill, 'offered')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4>Skills I Need</h4>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {profile.skillsNeeded.map((skill, index) => (
                                <span key={index} className="badge" style={{ background: '#fef3c7', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                    {skill} <button onClick={() => handleRemoveSkill(skill, 'needed')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Recent Feedback</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reviews.length === 0 ? (
                            <p className="text-muted">No reviews yet.</p>
                        ) : (
                            reviews.map(rev => (
                                <div key={rev._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <div className="flex justify-between">
                                        <span style={{ fontWeight: 'bold' }}>{rev.rating} ★</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>"{rev.comment}"</p>
                                    <span style={{ fontSize: '0.8rem' }}>— By {rev.fromUser.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
