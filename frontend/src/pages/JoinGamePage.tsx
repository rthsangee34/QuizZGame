import React, { useState, useEffect } from 'react';
import { useQuizVerse } from '../contexts/QuizVerseContext';
import { ArrowLeft, Play, AlertCircle } from 'lucide-react';

interface JoinGamePageProps {
  setPage: (page: string) => void;
}

export const JoinGamePage: React.FC<JoinGamePageProps> = ({ setPage }) => {
  const { joinSession, gameError, gameState, resetGame } = useQuizVerse();
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [localError, setLocalError] = useState('');

  // Reset game on page load to disconnect past socket instances
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Monitor connection success and transition to player view
  useEffect(() => {
    if (gameState === 'lobby') {
      setPage('player');
    }
  }, [gameState, setPage]);

  // Monitor socket error messages
  useEffect(() => {
    if (gameError) {
      setLocalError(gameError);
      setStep(1); // Reset back to pin entry if socket fails
    }
  }, [gameError]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (pin.length !== 6 || isNaN(Number(pin))) {
      setLocalError('Please enter a valid 6-digit game PIN.');
      return;
    }
    
    setStep(2);
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!nickname.trim()) {
      setLocalError('Nickname cannot be empty.');
      return;
    }

    if (nickname.length > 15) {
      setLocalError('Nickname must be 15 characters or less.');
      return;
    }

    // Call Context socket join
    joinSession(pin, nickname);
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
        top: '30%',
        left: '30%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'var(--secondary-glow)',
        filter: 'blur(100px)',
        zIndex: 0,
      }} />

      {/* Main Container */}
      <div className="glass-panel animate-fade-in responsive-panel" style={{
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
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
          <ArrowLeft size={16} /> Exit
        </button>

        {/* Logo Icon */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.8rem',
          margin: '0 auto 20px',
          boxShadow: '0 4px 14px var(--primary-glow)'
        }}>
          QV
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Join Live Game</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>
          Enter the host's PIN code to enter the lobby
        </p>

        {localError && (
          <div className="animate-shake" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{localError}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input 
              type="text" 
              maxLength={6}
              placeholder="0 0 0 0 0 0" 
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '8px',
                padding: '12px'
              }}
              className="form-input"
              autoFocus
              required
            />
            
            <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%' }}>
              Enter PIN <Play size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleNicknameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Choose Nickname</label>
              <input 
                type="text" 
                placeholder="e.g., CodeNinja" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="form-input"
                maxLength={15}
                autoFocus
                required
              />
            </div>
            
            <button type="submit" className="btn btn-cyan" style={{ padding: '14px', width: '100%' }}>
              Join Lobby!
            </button>
          </form>
        )}

        <div style={{
          marginTop: '30px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          Look at the screen shared by the teacher to obtain the PIN code.
        </div>
      </div>
    </div>
  );
};
