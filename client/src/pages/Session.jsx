import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import io from 'socket.io-client';
import Peer from 'simple-peer';

let socket;

const Session = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [passkey, setPasskey] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [error, setError] = useState('');

    // Resources State
    const [resources, setResources] = useState([]);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', link: '' });

    // Chat State
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    // WebRTC State
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    // Name of peer
    const [name, setName] = useState("");

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${API_URL}/api/sessions/verify`, { passkey }, config);

            setSessionData(data.session);
            setIsVerified(true);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    useEffect(() => {
        if (isVerified && sessionData) {
            // Fetch Resources
            const fetchResources = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get(`${API_URL}/api/resources/${sessionData._id}`, config);
                    setResources(data);
                } catch (error) {
                    console.error("Error fetching resources", error);
                }
            };
            fetchResources();

            // Set user media
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            });

            socket = io.connect(API_URL);

            // Join Room using Passkey as Room ID
            socket.emit("join_room", sessionData.passkey);

            // Listen for Messages
            socket.on("receive_message", (data) => {
                setMessageList((list) => [...list, data]);
            });

            // WebRTC Listeners
            socket.on("callUser", (data) => {
                setReceivingCall(true);
                setCaller(data.from);
                setName(data.name);
                setCallerSignal(data.signal);
            });

            // Hacky: When someone joins the room, we can store their ID if we want to call them. 
            // Ideally, we'd list participants. For now, this assumes a P2P scenario. 
            // In a better real world app we would broadcast "user joined" and populate a list.

            return () => {
                socket.disconnect();
                // cleanup mediastream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            };
        }
    }, [isVerified, sessionData]);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: sessionData.passkey,
                author: user.name,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    const handleAddResource = async () => {
        if (!newResource.title || !newResource.link) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                sessionId: sessionData._id,
                passkey: sessionData.passkey,
                title: newResource.title,
                link: newResource.link,
                type: 'link'
            };
            const { data } = await axios.post(`${API_URL}/api/resources`, payload, config);
            setResources([...resources, data]);
            setNewResource({ title: '', link: '' });
            setShowResourceForm(false);
        } catch (error) {
            alert("Failed to add resource");
        }
    };

    // WebRTC Functions
    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id, // In a real app we'd select a user. Here we might need a workaround to know WHO to call. 
                // Suggestion: Broadcast "I am here" to room, get list of socketIDs. 
                // Or simplified: Just wait for someone to call OR implement a user list.
                // For this demo, let's just use the 'caller' state if we are answering, 
                // BUT initiating is tricky without a target ID.
                // Let's implement a "Broadcast ID" mechanism or rely on user knowing ID?
                // Better approach for this scope: When 'join_room', server broadcasts "user_connected" {socketId}.
                // We'll update the server to emit that.

                // For now, let's assume we copy-paste ID or simplistic: 
                // Actually, let's assume 1-on-1 and we might not have the ID easily without listing.
                // Let's rely on 'callUser' receiving an ID from the UI.
                signalData: data,
                from: socket.id,
                name: user.name
            });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();
    };

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

    const handleLeaveSession = async () => {
        setShowFeedbackModal(true);
    };

    const submitFeedback = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const peerId = sessionData.userA === user._id ? sessionData.userB : sessionData.userA;
            await axios.post(`${API_URL}/api/feedback`, {
                sessionId: sessionData._id,
                toUserId: peerId,
                rating: feedback.rating,
                comment: feedback.comment
            }, config);
            alert("Feedback submitted!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            window.location.reload();
        }
    };

    if (isVerified && sessionData) {
        return (
            <div className="container" style={{ marginTop: '2rem' }}>
                {/* ... existing content ... */}
                {/* I will replace the end button and add the modal later, for now just adding state and helpers */}
                <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#166534', fontWeight: 'bold' }}>Session Active & Verified</span>
                    <span style={{ fontSize: '0.9rem' }}>Passkey: {sessionData.passkey}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                    <div className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h3>Skill Exchange: {sessionData.skillName}</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <p className="text-muted" style={{ marginBottom: 0 }}>Real-time Secure Chat</p>
                                <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>My ID: {socket?.id}</span>
                            </div>
                        </div>

                        {/* WebRTC Video Area */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center', background: '#000', padding: '1rem', borderRadius: '0.5rem' }}>
                            {/* My Video */}
                            <div style={{ position: 'relative' }}>
                                <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px', borderRadius: '0.5rem', transform: 'scaleX(-1)' }} />
                                <span style={{ position: 'absolute', bottom: 5, left: 5, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.8rem' }}>You</span>
                            </div>

                            {/* User Video */}
                            {callAccepted && !callEnded ? (
                                <div style={{ position: 'relative' }}>
                                    <video playsInline ref={userVideo} autoPlay style={{ width: '300px', borderRadius: '0.5rem' }} />
                                    <span style={{ position: 'absolute', bottom: 5, left: 5, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.8rem' }}>{name || "Peer"}</span>
                                </div>
                            ) : null}
                        </div>

                        {/* Call Controls */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            {receivingCall && !callAccepted ? (
                                <div style={{ display: "flex", gap: "1rem", alignItems: 'center', background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                                    <span style={{ color: '#1e40af' }}>{name || "Someone"} is calling...</span>
                                    <button className="btn btn-primary" onClick={answerCall}>Answer</button>
                                </div>
                            ) : null}

                            {!callAccepted && !receivingCall ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        placeholder="ID to call"
                                        value={idToCall}
                                        onChange={(e) => setIdToCall(e.target.value)}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                                    />
                                    <button className="btn btn-primary" onClick={() => callUser(idToCall)}>Call ID</button>
                                </div>
                            ) : null}

                            {callAccepted && !callEnded ? (
                                <button className="btn btn-danger" onClick={leaveCall}>End Call</button>
                            ) : null}
                        </div>


                        {/* Chat Window */}
                        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '0.5rem', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {messageList.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>
                                    <h4>Start the conversation!</h4>
                                    <p>Discuss, share ideas, or schedule a video call.</p>
                                </div>
                            ) : (
                                messageList.map((msg, index) => {
                                    const isMe = msg.author === user.name;
                                    return (
                                        <div key={index} style={{
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                        }}>
                                            <div style={{
                                                background: isMe ? '#4f46e5' : '#e2e8f0',
                                                color: isMe ? 'white' : 'black',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '1rem',
                                                borderBottomRightRadius: isMe ? '0' : '1rem',
                                                borderBottomLeftRadius: isMe ? '1rem' : '0'
                                            }}>
                                                <p style={{ margin: 0 }}>{msg.message}</p>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                                                {msg.time} • {msg.author}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex' }}>
                            <input
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                style={{ flex: 1, marginRight: '1rem' }}
                            />
                            <button onClick={sendMessage} className="btn btn-primary">Send</button>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Resources</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Shared files will appear here.</p>
                        {!showResourceForm ? (
                            <button onClick={() => setShowResourceForm(true)} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>+ Share Link/Docs</button>
                        ) : (
                            <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                <input
                                    placeholder="Title (e.g. React Docs)"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                    style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}
                                />
                                <input
                                    placeholder="URL (e.g. drive.google.com/...)"
                                    value={newResource.link}
                                    onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                                    style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleAddResource} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Add</button>
                                    <button onClick={() => setShowResourceForm(false)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                            {resources.map(res => (
                                <div key={res._id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                    <a href={res.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontWeight: 'bold' }}>
                                        🔗 {res.title}
                                    </a>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                        By {res.uploader.name}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3>Participants</h3>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '30px', height: '30px', background: '#ccc', borderRadius: '50%' }}></div>
                                    User (You)
                                </div>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '30px', height: '30px', background: '#ccc', borderRadius: '50%' }}></div>
                                    Peer (Remote)
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-danger" style={{ marginTop: 'auto', width: '100%' }} onClick={handleLeaveSession}>Leave Session</button>
                    </div>
                </div>

                {/* Feedback Modal */}
                {showFeedbackModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
                            <h3>Leave Feedback</h3>
                            <p className="text-muted">How was your session?</p>

                            <div className="form-group mt-4">
                                <label>Rating (1-5)</label>
                                <select
                                    value={feedback.rating}
                                    onChange={(e) => setFeedback({ ...feedback, rating: Number(e.target.value) })}
                                >
                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Comments</label>
                                <textarea
                                    rows="3"
                                    value={feedback.comment}
                                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                                    placeholder="Write a quick review..."
                                ></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button className="btn btn-primary" onClick={submitFeedback} style={{ flex: 1 }}>Submit & Exit</button>
                                <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ flex: 1 }}>Skip</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '4rem', maxWidth: '500px' }}>
            <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                <h2>🔒 Secure Session Gate</h2>
                <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
                    This session is protected. Please enter the shared session passkey provided in your request details.
                </p>

                {error && <div style={{ color: 'red', marginBottom: '1rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.25rem' }}>{error}</div>}

                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        placeholder="Enter Passkey (e.g. SKX-ABC12)"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '2px', marginBottom: '1.5rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Unlock Session</button>
                </form>
            </div>
        </div>
    );
};

export default Session;
