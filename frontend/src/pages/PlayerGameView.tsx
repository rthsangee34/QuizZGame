import React, { useState, useEffect } from 'react';
import { useQuizVerse } from '../contexts/QuizVerseContext';
import { Award, Flame, CheckCircle, XCircle, RotateCcw, Download, AlertTriangle } from 'lucide-react';

interface PlayerGameViewProps {
  setPage: (page: string) => void;
}

export const PlayerGameView: React.FC<PlayerGameViewProps> = ({ setPage }) => {
  const {
    gameState,
    playerNickname,
    currentQuestion,
    questionIndex,
    answerSubmitted,
    submitFeedback,
    playerQuestionResult,
    podium,
    gameError,
    submitAnswer,
    resetGame
  } = useQuizVerse();

  const [openEndedAnswer, setOpenEndedAnswer] = useState('');

  const [timeLeft, setTimeLeft] = useState(0);

  // local timer for player to know how much time is left
  useEffect(() => {
    if (gameState === 'question' && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      setOpenEndedAnswer('');
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, currentQuestion]);

  const handleAnswerClick = (index: number) => {
    submitAnswer(index.toString());
  };

  const handleTFClick = (val: 'true' | 'false') => {
    submitAnswer(val);
  };

  const handleOpenEndedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openEndedAnswer.trim()) {
      submitAnswer(openEndedAnswer.trim());
    }
  };

  const handleExit = () => {
    resetGame();
    setPage('landing');
  };

  // Find player ranking at the end
  const getPlayerRank = () => {
    if (!podium) return -1;
    return podium.findIndex(p => p.nickname === playerNickname) + 1;
  };

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const rank = getPlayerRank();
    const rankText = rank > 0 ? `${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'} Place` : 'Participant';
    const score = podium.find(p => p.nickname === playerNickname)?.score || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>QuizVerse Certificate</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; }
            .cert-box { border: 15px double #6366f1; padding: 40px; text-align: center; width: 700px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; }
            h1 { color: #6366f1; font-size: 2.8rem; margin-top: 0; }
            h2 { color: #3f3f46; font-size: 1.8rem; }
            p { font-size: 1.1rem; color: #71717a; margin: 20px 0; }
            .name { font-size: 2.2rem; font-weight: bold; border-bottom: 2px solid #6366f1; display: inline-block; padding: 0 40px 10px; margin: 15px 0; color: #18181b; }
            .score-badge { font-weight: bold; color: #a855f7; font-size: 1.3rem; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h1>CERTIFICATE OF ACHIEVEMENT</h1>
            <p>This is proudly presented to</p>
            <div class="name">${playerNickname}</div>
            <p>for outstanding performance in the QuizVerse Live challenge,</p>
            <h2>Achieving ${rankText}</h2>
            <div class="score-badge">Final Score: ${score} points</div>
            <p style="margin-top:40px; font-size:0.85rem;">Date: ${new Date().toLocaleDateString()} &bull; Verified by QuizVerse Engine</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

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
      {/* Background radial overlay */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'var(--primary-glow)',
        filter: 'blur(100px)',
        zIndex: 0
      }} />

      {/* Main player box */}
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Error message */}
        {gameError && (
          <div className="animate-shake" style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={18} />
            <span>{gameError}</span>
          </div>
        )}

        {/* 1. LOBBY WAITING STATE */}
        {gameState === 'lobby' && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }} className="animate-float">🎮</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>You are In!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Your Nickname: <strong style={{ color: 'var(--accent-color)' }}>{playerNickname}</strong>
            </p>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              padding: '16px',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem'
            }}>
              Look at the main screen shared by the teacher. The game will start shortly!
            </div>
          </div>
        )}

        {/* 2. COUNTDOWN STATE */}
        {gameState === 'countdown' && (
          <div style={{ padding: '40px 0' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Get Ready!
            </span>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '20px' }}>
              Game Starting
            </h2>
          </div>
        )}

        {/* 3. ACTIVE QUESTION ANSWER CHANNELS */}
        {gameState === 'question' && currentQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Q{questionIndex + 1}: {currentQuestion.title}
              </span>
              <span style={{
                background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                color: timeLeft <= 5 ? '#ef4444' : 'var(--text-primary)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {timeLeft}s
              </span>
            </div>

            {/* Answer layouts */}
            {!answerSubmitted ? (
              <>
                {currentQuestion.type === 'mcq' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    height: '240px'
                  }}>
                    {currentQuestion.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerClick(idx)}
                        className="glass-card"
                        style={{
                          background: colors[idx],
                          color: 'white',
                          border: 'none',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '12px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{String.fromCharCode(65 + idx)}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{choice}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true_false' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                      onClick={() => handleTFClick('true')}
                      className="glass-card"
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '24px',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      TRUE
                    </button>
                    <button
                      onClick={() => handleTFClick('false')}
                      className="glass-card"
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '24px',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      FALSE
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'open_ended' && (
                  <form onSubmit={handleOpenEndedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Type your answer here..."
                      value={openEndedAnswer}
                      onChange={(e) => setOpenEndedAnswer(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '14px' }}>
                      Submit Answer
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div style={{ padding: '40px 0' }}>
                <div style={{
                  border: '4px solid var(--panel-border)',
                  borderTopColor: 'var(--primary-color)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  animation: 'spin 1s linear infinite'
                }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Answer Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Waiting for other players or timer expiration...</p>
                
                {submitFeedback && (
                  <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Streak: {submitFeedback.streak} 🔥 &bull; Score: {submitFeedback.currentScore}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. QUESTION RESULT / SCORE FEEDBACK */}
        {gameState === 'leaderboard' && (
          <div style={{ padding: '20px 0' }}>
            {playerQuestionResult ? (
              !playerQuestionResult.hasAnswered ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: 'var(--color-yellow)', marginBottom: '16px' }}><AlertTriangle size={56} /></div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-yellow)' }}>Time's Up!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Correct answer was: <strong style={{ color: 'var(--text-primary)' }}>
                      {playerQuestionResult.correctAnswer === 'true' ? 'True' : playerQuestionResult.correctAnswer === 'false' ? 'False' : playerQuestionResult.correctAnswer}
                    </strong>
                  </p>
                  <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '12px' }}>
                    Streak reset to 0
                  </p>
                  
                  <div style={{ marginTop: '24px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Total Score: <strong>{playerQuestionResult.currentScore} points</strong>
                  </div>
                </div>
              ) : playerQuestionResult.isCorrect ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: '#10b981', marginBottom: '16px' }}><CheckCircle size={56} /></div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>Correct!</h2>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: '12px 0 6px'
                  }}>
                    + {playerQuestionResult.pointsEarned} pts
                  </span>
                  
                  {playerQuestionResult.streak > 1 && (
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#f87171',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '10px'
                    }}>
                      <Flame size={14} fill="#f87171" /> Answer Streak: {playerQuestionResult.streak}! 🔥
                    </span>
                  )}
                  
                  <div style={{ marginTop: '24px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Total Score: <strong>{playerQuestionResult.currentScore} points</strong>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: '#ef4444', marginBottom: '16px' }}><XCircle size={56} /></div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>Incorrect</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Correct answer was: <strong style={{ color: 'var(--text-primary)' }}>
                      {playerQuestionResult.correctAnswer === 'true' ? 'True' : playerQuestionResult.correctAnswer === 'false' ? 'False' : playerQuestionResult.correctAnswer}
                    </strong>
                  </p>
                  <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '12px' }}>
                    Streak reset to 0
                  </p>
                  
                  <div style={{ marginTop: '24px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Total Score: <strong>{playerQuestionResult.currentScore} points</strong>
                  </div>
                </div>
              )
            ) : (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Times Up!</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Look at the host screen for statistics details.</p>
              </div>
            )}
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '30px' }}>
              Look at host screen for the leaderboard scoreboard.
            </p>
          </div>
        )}

        {/* 5. FINISHED / PODIUM PLAYER REPORT STATE */}
        {gameState === 'finished' && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ color: 'var(--accent-color)', marginBottom: '16px' }}><Award size={56} /></div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Game Finished!</h2>
            
            {podium.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--panel-border)',
                borderRadius: '8px',
                padding: '20px',
                margin: '20px 0'
              }}>
                {getPlayerRank() > 0 ? (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      You placed <strong style={{ color: 'var(--accent-color)' }}>#{getPlayerRank()}</strong>!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
                      Final score: {podium.find(p => p.nickname === playerNickname)?.score} points
                    </p>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Thank you for playing!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
                      Look at host screen for the final scoreboard.
                    </p>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              {getPlayerRank() > 0 && (
                <button className="btn btn-cyan" onClick={handlePrintCertificate} style={{ width: '100%' }}>
                  <Download size={16} /> Download Certificate
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleExit} style={{ width: '100%' }}>
                <RotateCcw size={16} /> Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
