import React, { useEffect, useState } from 'react';
import { useQuizVerse } from '../contexts/QuizVerseContext';
import { Play, Users, Volume2, Trophy, ArrowRight, Award, Flame, XCircle } from 'lucide-react';

interface HostGameViewProps {
  setPage: (page: string) => void;
}

export const HostGameView: React.FC<HostGameViewProps> = ({ setPage }) => {
  const {
    gamePin,
    gameState,
    playerList,
    countdown,
    currentQuestion,
    questionIndex,
    totalQuestions,
    answersReceived,
    totalPlayers,
    correctAnswer,
    choiceDistribution,
    leaderboard,
    podium,
    gameError,
    startGame,
    endQuestion,
    nextQuestion,
    resetGame
  } = useQuizVerse();

  const [timeLeft, setTimeLeft] = useState(0);
  const [showResultsChart, setShowResultsChart] = useState(false);

  // Synchronized question timer
  useEffect(() => {
    if (gameState === 'question' && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      setShowResultsChart(false);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time expired, end question
            endQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, currentQuestion, endQuestion]);

  // If question ends, show results charts
  useEffect(() => {
    if (gameState === 'leaderboard') {
      setShowResultsChart(true);
    }
  }, [gameState]);

  const handleExit = () => {
    resetGame();
    setPage('dashboard');
  };

  // Color mappings
  const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#09090b',
      backgroundAttachment: 'fixed',
      color: '#f4f4f5',
      padding: '30px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-15%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.1)',
        filter: 'blur(150px)',
        zIndex: 0
      }} />

      {/* Header bar */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 30px',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Quiz<span className="title-gradient">Verse Live</span>
          </span>
          {gameState === 'question' && currentQuestion && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              Question {questionIndex + 1} of {totalQuestions}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {gameState === 'lobby' && (
            <div style={{
              fontSize: '1rem',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-color)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700
            }}>
              Waiting for players...
            </div>
          )}
          <button className="btn btn-secondary" onClick={handleExit} style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#ef4444' }}>
            <XCircle size={16} /> End Game
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        
        {gameError && (
          <div className="glass-panel animate-shake" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            color: '#f87171',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {gameError}
          </div>
        )}

        {/* 1. LOBBY STATE */}
        {gameState === 'lobby' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', flexGrow: 1 }}>
            
            {/* PIN Column */}
            <div className="glass-panel" style={{
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                Join at <strong>http://localhost:5173</strong>
              </span>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, var(--accent-color), var(--primary-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                padding: '10px 20px',
                border: '2px dashed var(--panel-border)',
                borderRadius: '12px',
                letterSpacing: '4px',
                margin: '20px 0',
                boxShadow: '0 0 20px var(--accent-glow)'
              }}>
                {gamePin}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '1.2rem', margin: '20px 0' }}>
                <Users size={24} />
                <strong>{playerList.length}</strong> joined
              </div>

              <button 
                className="btn btn-primary animate-pulse-glow" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '20px' }}
                onClick={startGame}
                disabled={playerList.length === 0}
              >
                <Play size={20} /> Start Game
              </button>
            </div>

            {/* Players Grid Column */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>
                Players Lobby
              </h3>
              
              {playerList.length === 0 ? (
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Waiting for players to enter PIN...
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '16px',
                  alignContent: 'flex-start',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {playerList.map((player) => (
                    <div 
                      key={player.socketId}
                      className="animate-fade-in"
                      style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {player.nickname}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. COUNTDOWN STATE */}
        {gameState === 'countdown' && (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '20px' }}>
              Game Commencing in
            </span>
            <div style={{
              fontSize: '8rem',
              fontWeight: 900,
              color: 'var(--accent-color)',
              textShadow: '0 0 40px var(--accent-glow)',
              transform: 'scale(1.2)',
              transition: 'transform 0.5s ease'
            }} className="animate-float">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </div>
        )}

        {/* 3. ACTIVE QUESTION STATE */}
        {gameState === 'question' && currentQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1, justifyContent: 'space-between' }}>
            {/* Question Prompt */}
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: '1.3' }}>
                {currentQuestion.title}
              </h2>
            </div>

            {/* Timer and Response Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px', alignItems: 'center' }}>
              {/* Circular Timer (Left) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '8px solid rgba(255, 255, 255, 0.05)',
                  borderColor: timeLeft <= 5 ? '#ef4444' : 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${timeLeft <= 5 ? 'rgba(239,68,68,0.2)' : 'var(--primary-glow)'}`
                }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{timeLeft}</span>
                </div>
                <span style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Time Left</span>
              </div>

              {/* Graphic/Media placeholder (Center) */}
              <div className="glass-panel flex-center" style={{ height: '200px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
                <Volume2 size={36} style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontSize: '0.9rem' }}>Read prompt on screen and submit answer on device</span>
              </div>

              {/* Submissions count (Right) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-color)' }}>
                  {answersReceived}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  out of {totalPlayers} answers
                </span>
                <button 
                  className="btn btn-secondary" 
                  style={{ marginTop: '16px', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={endQuestion}
                >
                  Skip Question
                </button>
              </div>
            </div>

            {/* Answer Choices Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              {currentQuestion.choices.map((choice, index) => (
                <div 
                  key={index} 
                  className="glass-panel" 
                  style={{
                    padding: '20px 30px',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    borderLeft: `8px solid ${colors[index] || 'var(--panel-border)'}`
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: colors[index] || 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{choice}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RESULTS / QUESTION SUMMARY STATE */}
        {gameState === 'leaderboard' && showResultsChart && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1, justifyContent: 'space-between' }}>
            
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Question Results</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Let's see how everyone answered!</p>
            </div>

            {/* Response bar graph distribution */}
            <div className="glass-panel" style={{ padding: '40px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {currentQuestion && currentQuestion.type === 'open_ended' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--color-green)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Correct Answer:</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>{correctAnswer}</h3>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Player Responses:</h4>
                  {Object.keys(choiceDistribution).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>No answers submitted.</div>
                  ) : (
                    Object.entries(choiceDistribution).map(([answer, count], index) => {
                      const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                      const maxCount = Math.max(...Object.values(choiceDistribution), 1);
                      const percentage = Math.round((count / maxCount) * 100);
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ width: '200px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{answer}"
                          </div>
                          <div style={{ flexGrow: 1, background: 'rgba(255, 255, 255, 0.04)', height: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: isCorrect ? '1px solid #10b981' : '1px solid transparent' }}>
                            <div style={{
                              width: `${percentage}%`,
                              background: isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                              height: '100%',
                              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                            }} />
                            {isCorrect && (
                              <span style={{ position: 'absolute', right: '12px', top: '2px', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
                                CORRECT
                              </span>
                            )}
                          </div>
                          <div style={{ width: '40px', fontWeight: 800, textAlign: 'right' }}>
                            {count}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : currentQuestion ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {currentQuestion.choices.map((choice, index) => {
                    const isCorrect = correctAnswer === index.toString() || correctAnswer === choice.toLowerCase();
                    const count = choiceDistribution[index.toString()] || choiceDistribution[choice.toLowerCase()] || 0;
                    const maxCount = Math.max(...Object.values(choiceDistribution), 1);
                    const percentage = Math.round((count / maxCount) * 100);
                    
                    return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Choice Marker */}
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: colors[index] || 'var(--text-muted)',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + index)}
                        </div>

                        {/* Choice Text */}
                        <div style={{ width: '200px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {choice}
                        </div>

                        {/* Bar */}
                        <div style={{ flexGrow: 1, background: 'rgba(255, 255, 255, 0.04)', height: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: isCorrect ? '1px solid #10b981' : '1px solid transparent' }}>
                          <div style={{
                            width: `${percentage}%`,
                            background: isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                            height: '100%',
                            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                          }} />
                          
                          {/* Correct marker checkmark */}
                          {isCorrect && (
                            <span style={{
                              position: 'absolute',
                              right: '12px',
                              top: '2px',
                              color: '#10b981',
                              fontSize: '0.8rem',
                              fontWeight: 800
                            }}>
                              CORRECT
                            </span>
                          )}
                        </div>

                        {/* Count */}
                        <div style={{ width: '40px', fontWeight: 800, textAlign: 'right' }}>
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowResultsChart(false)}>
                Show Scoreboard
              </button>
              <button className="btn btn-primary" onClick={nextQuestion}>
                Next Question <ArrowRight size={18} />
              </button>
            </div>

          </div>
        )}

        {/* 5. SCOREBOARD LEADERBOARD STATE */}
        {gameState === 'leaderboard' && !showResultsChart && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1 }}>
            
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Trophy size={28} style={{ color: '#f59e0b' }} /> Leaderboard Scoreboard
              </h2>
            </div>

            <div className="glass-panel" style={{ padding: '30px', flexGrow: 1 }}>
              {leaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No player scores recorded yet.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <th style={{ padding: '16px 20px' }}>Rank</th>
                      <th style={{ padding: '16px 20px' }}>Nickname</th>
                      <th style={{ padding: '16px 20px', textAlign: 'right' }}>Score</th>
                      <th style={{ padding: '16px 20px', textAlign: 'right' }}>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, idx) => (
                      <tr 
                        key={idx}
                        className="animate-fade-in"
                        style={{
                          borderBottom: '1px solid rgba(63, 63, 70, 0.15)',
                          background: idx === 0 ? 'rgba(245, 158, 11, 0.05)' : 'none',
                          fontWeight: idx === 0 ? 700 : 500
                        }}
                      >
                        <td style={{ padding: '16px 20px', color: idx === 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {player.nickname}
                          {player.streak > 1 && (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#f87171',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              <Flame size={10} fill="#f87171" /> {player.streak}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800 }}>
                          {player.score} pts
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right', color: '#f87171' }}>
                          {player.streak > 0 ? `${player.streak} 🔥` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowResultsChart(true)}>
                Back to Distribution
              </button>
              <button className="btn btn-primary" onClick={nextQuestion}>
                Next Question <ArrowRight size={18} />
              </button>
            </div>

          </div>
        )}

        {/* 6. PODIUM FINAL RESULTS STATE */}
        {gameState === 'finished' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1, justifyContent: 'space-between' }}>
            
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Award size={48} /></div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Final Standings Podium</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Congratulations to our winners!</p>
            </div>

            {/* Podium Visual */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '20px',
              height: '300px',
              margin: '30px 0'
            }}>
              {/* 2nd Place (Left) */}
              {podium[1] && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '8px' }}>{podium[1].nickname}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{podium[1].score} pts</div>
                  <div style={{
                    width: '120px',
                    height: '140px',
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.05), rgba(255,255,255,0.15))',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#94a3b8'
                  }}>
                    2nd
                  </div>
                </div>
              )}

              {/* 1st Place (Center) */}
              {podium[0] && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>👑</div>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '8px', color: '#f59e0b' }}>{podium[0].nickname}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{podium[0].score} pts</div>
                  <div style={{
                    width: '140px',
                    height: '180px',
                    background: 'linear-gradient(to top, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.3))',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    fontWeight: 900,
                    color: '#f59e0b',
                    boxShadow: '0 0 25px rgba(245, 158, 11, 0.3)'
                  }}>
                    1st
                  </div>
                </div>
              )}

              {/* 3rd Place (Right) */}
              {podium[2] && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>{podium[2].nickname}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{podium[2].score} pts</div>
                  <div style={{
                    width: '120px',
                    height: '100px',
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.03), rgba(255,255,255,0.1))',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#b45309'
                  }}>
                    3rd
                  </div>
                </div>
              )}
            </div>

            {/* Finish actions */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-primary" style={{ padding: '16px 40px' }} onClick={handleExit}>
                Exit to Dashboard
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
