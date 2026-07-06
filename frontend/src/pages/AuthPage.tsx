import React, { useState } from 'react';
import { useQuizVerse } from '../contexts/QuizVerseContext';
import { Mail, Lock, User, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface AuthPageProps {
  setPage: (page: string) => void;
  initialMode: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ setPage, initialMode }) => {
  const { login, register } = useQuizVerse();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    let success = false;
    if (mode === 'login') {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }
    setLoading(false);

    if (success) {
      setPage('dashboard');
    } else {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'var(--primary-glow)',
        filter: 'blur(100px)',
        zIndex: 0,
      }} />

      {/* Auth Panel */}
      <div className="glass-panel animate-fade-in responsive-panel" style={{
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Back Button */}
        <button 
          onClick={() => setPage('landing')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginBottom: '30px',
            padding: '4px'
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' 
              ? 'Enter credentials to access teacher dashboard' 
              : 'Sign up to start building and hosting quizzes'}
          </p>
        </div>

        {error && (
          <div className="animate-shake" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input 
                type="email" 
                className="form-input" 
                placeholder="teacher@quizverse.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Sign Up Free'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span 
                onClick={() => setMode('register')} 
                style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span 
                onClick={() => setMode('login')} 
                style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In
              </span>
            </>
          )}
        </div>

        <div style={{
          marginTop: '30px',
          borderTop: '1px solid var(--panel-border)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          <Sparkles size={14} /> Powered by QuizVerse Real-Time Engine
        </div>
      </div>
    </div>
  );
};
