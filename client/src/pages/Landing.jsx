import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const Landing = () => {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center',
                minHeight: '80vh',
                paddingTop: '2rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Exchange Skills.<br />Grow Together.
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        marginBottom: '2.5rem',
                        maxWidth: '500px'
                    }}>
                        SkillX is a community-driven platform where you can teach what you know and learn what you love. No money involved—just pure knowledge exchange.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                            Get Started
                        </Link>
                        <Link to="/login" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                            Sign In
                        </Link>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>500+</h3>
                            <p className="text-muted">Active Mentors</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>1k+</h3>
                            <p className="text-muted">Skills Shared</p>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '120%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(255,255,255,0) 70%)',
                        zIndex: -1
                    }}></div>
                    <img
                        src={heroImg}
                        alt="Skill Exchange"
                        style={{
                            width: '100%',
                            height: 'auto',
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
                            animation: 'float 6s ease-in-out infinite'
                        }}
                    />
                </div>
            </section>

            {/* Features Section */}
            <section style={{ background: 'white', padding: '6rem 0' }}>
                <div className="container">
                    <h2 className="text-center" style={{ marginBottom: '4rem', fontSize: '2.5rem' }}>How It Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔍</div>
                            <h3>Discover</h3>
                            <p className="text-muted" style={{ marginTop: '1rem' }}>
                                Search for skills you want to learn. Find experts willing to share their knowledge.
                            </p>
                        </div>
                        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🤝</div>
                            <h3>Connect</h3>
                            <p className="text-muted" style={{ marginTop: '1rem' }}>
                                Send a request. Offer a skill in return. Build a connection based on mutual growth.
                            </p>
                        </div>
                        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎥</div>
                            <h3>Learn Live</h3>
                            <p className="text-muted" style={{ marginTop: '1rem' }}>
                                Join secure video sessions. Chat, share resources, and master new skills in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
