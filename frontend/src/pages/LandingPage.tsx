import React from 'react';
import { useQuizVerse } from '../contexts/QuizVerseContext';
import { Play, BookOpen, Layers, Award, Shield, Sparkles, Moon, Sun, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  setPage: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setPage }) => {
  const { user, theme, toggleTheme } = useQuizVerse();

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Animated Background Shapes */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(100px)',
        zIndex: 0,
      }} className="animate-float" />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.15)',
        filter: 'blur(120px)',
        zIndex: 0,
      }} />

      {/* Navigation Header */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        margin: '20px 40px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage('landing')}>
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
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
            Quiz<span className="title-gradient">Verse</span>
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={toggleTheme} style={{ padding: '8px 12px' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="btn btn-secondary" onClick={() => setPage('join')}>
            <Play size={18} /> Join Game
          </button>

          {user ? (
            <button className="btn btn-primary" onClick={() => setPage('dashboard')}>
              Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setPage('login')}>
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => setPage('register')}>
                Sign Up Free
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '80px auto 40px',
        padding: '0 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '6px 16px',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--primary-color)',
          marginBottom: '24px'
        }}>
          <Sparkles size={14} /> Reimagining Interactive Classrooms
        </div>
        
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 800,
          lineHeight: '1.15',
          marginBottom: '24px',
          letterSpacing: '-0.03em'
        }}>
          Engage Students with <br />
          <span className="title-gradient">Real-Time Interactive Quizzes</span>
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          QuizVerse is the premium live game platform built for schools, bootcamps, and professional environments. No installation, instant PIN login, and stunning analytics.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button className="btn btn-cyan" style={{ padding: '16px 36px', fontSize: '1.1rem' }} onClick={() => setPage('join')}>
            <Play size={20} /> Join a Game Now
          </button>
          <button className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }} onClick={() => setPage(user ? 'dashboard' : 'register')}>
            Create a Quiz <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '100px auto',
        padding: '0 40px',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 800, marginBottom: '50px' }}>
          Features Beyond The ordinary
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ color: 'var(--primary-color)', marginBottom: '16px' }}><BookOpen size={36} /></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Smart Quiz Builder</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Create multiple question formats seamlessly: MCQ, True/False, Puzzle, and open-ended text inputs, complete with custom explanations.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ color: 'var(--secondary-color)', marginBottom: '16px' }}><Layers size={36} /></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Real-time Synchronized Engine</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Built with state-of-the-art WebSockets for instant player updates, score adjustments, streak multiplier feedback, and live response tickers.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ color: 'var(--accent-color)', marginBottom: '16px' }}><Award size={36} /></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Adaptive Score Formula</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Calculate scores based on a composite matrix: correctness, response velocity, and answers streaks. Kept live in a glassmorphic leaderboard.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ color: 'var(--color-green)', marginBottom: '16px' }}><Shield size={36} /></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Rich Analytics & Reports</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Review past game histories, detailed breakdowns of player stats, and review average scores and question response distributions.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Mock */}
      <section className="glass-panel" style={{
        maxWidth: '1000px',
        margin: '100px auto',
        padding: '60px 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>Simple, transparent Pricing</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '50px' }}>Everything you need for classrooms and enterprise teams.</p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          textAlign: 'left'
        }}>
          <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Free Starter</h3>
            <span style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>$0</span>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
              <li>✓ Host up to 20 players</li>
              <li>✓ Limitless MCQ & T/F Quizzes</li>
              <li>✓ Basic Web Leaderboard</li>
              <li>✓ Static Live Reports</li>
            </ul>
            <button className="btn btn-secondary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setPage('register')}>Get Started</button>
          </div>

          <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', borderColor: 'var(--primary-color)', boxShadow: '0 0 15px var(--primary-glow)' }}>
            <div style={{
              alignSelf: 'flex-start',
              background: 'var(--primary-color)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>Popular</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Teacher Pro</h3>
            <span style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>$12<span style={{ fontSize: '1rem', fontWeight: 400 }}>/mo</span></span>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
              <li>✓ Host up to 200 players</li>
              <li>✓ AI Quiz Generator (50/mo)</li>
              <li>✓ PDF/Excel Data Exports</li>
              <li>✓ Interactive Open-ended text Qs</li>
              <li>✓ Unlimited Game History Logs</li>
            </ul>
            <button className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setPage('register')}>Start Free Trial</button>
          </div>

          <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Organization</h3>
            <span style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>$49<span style={{ fontSize: '1rem', fontWeight: 400 }}>/mo</span></span>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
              <li>✓ Host up to 1000 players</li>
              <li>✓ Dedicated Organization Admins</li>
              <li>✓ Team Collaboration Workspace</li>
              <li>✓ LMS integrations (Moodle, G-Classroom)</li>
              <li>✓ 24/7 Priority Support</li>
            </ul>
            <button className="btn btn-secondary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setPage('register')}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--panel-border)',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        position: 'relative',
        zIndex: 10
      }}>
        <p>© 2026 QuizVerse. Recreating Kahoot professionally for classrooms & organizations worldwide.</p>
      </footer>
    </div>
  );
};
