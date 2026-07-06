import React, { useEffect, useState } from 'react';
import { useQuizVerse } from '../contexts/QuizVerseContext';
import { Play, Plus, Trash2, Edit, BarChart2, Calendar, Users, LogOut, Sun, Moon, Sparkles, BookOpen } from 'lucide-react';

interface TeacherDashboardProps {
  setPage: (page: string) => void;
  setSelectedQuizId: (id: string | null) => void;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  createdAt: string;
}

interface GameReport {
  id: string;
  quizTitle: string;
  pin: string;
  date: string;
  playersCount: number;
  averageScore: number;
  playerDetails: { nickname: string; score: number }[];
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ setPage, setSelectedQuizId }) => {
  const { user, logout, theme, toggleTheme, createSession } = useQuizVerse();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [reports, setReports] = useState<GameReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Quizzes and Reports
  const fetchData = async () => {
    try {
      setLoading(true);
      const quizzesRes = await fetch('http://localhost:5000/api/quizzes');
      const reportsRes = await fetch('http://localhost:5000/api/reports');
      
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData);
      }
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteQuiz = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setQuizzes(prev => prev.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHostGame = (quizId: string) => {
    createSession(quizId);
    setPage('host');
  };

  const handleEditQuiz = (quizId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQuizId(quizId);
    setPage('builder');
  };

  const handleCreateNew = () => {
    setSelectedQuizId(null);
    setPage('builder');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Nav Header */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        margin: '20px 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>QV</div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Teacher<span className="title-gradient">Hub</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Hi, <strong>{user?.name || 'Teacher'}</strong>
          </span>
          <button className="btn btn-secondary" onClick={toggleTheme} style={{ padding: '8px 12px' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-secondary" onClick={logout} style={{ padding: '8px 16px', display: 'flex', gap: '8px' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main style={{
        flexGrow: 1,
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '0 40px 40px',
        display: 'grid',
        gridTemplateColumns: '1.8fr 1.2fr',
        gap: '40px'
      }}>
        
        {/* Left Section: Quiz Library */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Quizzes</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Create, manage and launch live quiz experiences</p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateNew}>
              <Plus size={18} /> Create Quiz
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              Loading your quiz library...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--text-muted)' }}><BookOpen size={48} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your library is empty</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                Start creating quizzes with MCQs, True/False, and Open Ended questions to play with your students!
              </p>
              <button className="btn btn-primary" onClick={handleCreateNew}>
                <Plus size={16} /> Create Your First Quiz
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="glass-card" style={{
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }} onClick={() => handleHostGame(quiz.id)}>
                  <div style={{ flexGrow: 1, marginRight: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary-color)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {quiz.questions.length} Questions
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Created {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>{quiz.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{quiz.description || 'No description provided.'}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-cyan" onClick={() => handleHostGame(quiz.id)} style={{ padding: '10px 16px' }}>
                      <Play size={16} /> Host
                    </button>
                    <button className="btn btn-secondary" onClick={(e) => handleEditQuiz(quiz.id, e)} style={{ padding: '10px' }}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-secondary" onClick={(e) => handleDeleteQuiz(quiz.id, e)} style={{ padding: '10px', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Section: Past Game Reports & Analytics */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Recent Reports</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Review class accuracy and student scores</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '12px' }}><BarChart2 size={36} /></div>
              <p>No games played yet. Host a live session to see analytics reports here!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {reports.map((report) => (
                <div key={report.id} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{report.quizTitle}</h4>
                      <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span>PIN: {report.pin}</span>
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: 'var(--accent-color)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Users size={12} /> {report.playersCount} Players
                    </span>
                  </div>

                  {/* Summary Stats */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(9, 9, 11, 0.4)',
                    borderRadius: '8px',
                    padding: '12px',
                    justifyContent: 'space-around',
                    marginBottom: '14px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{report.averageScore} pts</strong>
                    </div>
                    <div style={{ width: '1px', background: 'var(--panel-border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Player</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--color-green)' }}>
                        {report.playerDetails[0]?.nickname || 'N/A'}
                      </strong>
                    </div>
                  </div>

                  {/* Score breakdown list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Scoreboard:</span>
                    {report.playerDetails.slice(0, 3).map((p, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        padding: '4px 0',
                        borderBottom: '1px solid rgba(63, 63, 70, 0.15)'
                      }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {idx + 1}. {p.nickname}
                        </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{p.score} pts</strong>
                      </div>
                    ))}
                    {report.playerDetails.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                        + {report.playerDetails.length - 3} more players
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--panel-border)',
        padding: '30px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--primary-color)' }} />
          <span>Powered by QuizVerse Real-Time Sync</span>
        </div>
      </footer>
    </div>
  );
};
