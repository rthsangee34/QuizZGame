import React, { useEffect, useState } from 'react';
import { Trash2, Save, ArrowLeft, AlertCircle, Sparkles, Check, HelpCircle } from 'lucide-react';

interface QuizBuilderProps {
  setPage: (page: string) => void;
  selectedQuizId: string | null;
}

interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'open_ended';
  title: string;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
  points: number;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ setPage, selectedQuizId }) => {
  // no user destructuring needed
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch quiz to edit if selectedQuizId is set
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!selectedQuizId) {
        // Initialize with one default MCQ question
        setQuestions([createDefaultQuestion('mcq')]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/${selectedQuizId}`);
        if (res.ok) {
          const data = await res.json();
          setQuizTitle(data.title);
          setQuizDescription(data.description);
          setQuestions(data.questions || []);
          setActiveIndex(0);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz details.');
      }
    };

    fetchQuiz();
  }, [selectedQuizId]);

  const createDefaultQuestion = (type: 'mcq' | 'true_false' | 'open_ended'): Question => {
    const id = 'q-' + Math.random().toString(36).substring(2, 9);
    if (type === 'mcq') {
      return {
        id,
        type,
        title: 'New Multiple Choice Question',
        choices: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: '0',
        timeLimit: 20,
        points: 1000,
      };
    } else if (type === 'true_false') {
      return {
        id,
        type,
        title: 'New True or False Question',
        choices: ['True', 'False'],
        correctAnswer: 'true',
        timeLimit: 15,
        points: 1000,
      };
    } else {
      return {
        id,
        type,
        title: 'New Open Ended Question',
        choices: [],
        correctAnswer: 'answer text',
        timeLimit: 30,
        points: 1500,
      };
    }
  };

  const handleAddQuestion = (type: 'mcq' | 'true_false' | 'open_ended') => {
    const newQ = createDefaultQuestion(type);
    setQuestions(prev => [...prev, newQ]);
    setActiveIndex(questions.length);
  };

  const handleDeleteQuestion = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (questions.length <= 1) {
      setError('A quiz must have at least one question.');
      return;
    }
    
    const updated = questions.filter((_, idx) => idx !== indexToDelete);
    setQuestions(updated);
    
    if (activeIndex >= updated.length) {
      setActiveIndex(updated.length - 1);
    }
  };

  const handleQuestionChange = (field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[activeIndex] = {
      ...updated[activeIndex],
      [field]: value,
    };
    
    // Automatically reset correct answer and choices if question type changes
    if (field === 'type') {
      const type = value as 'mcq' | 'true_false' | 'open_ended';
      const defaults = createDefaultQuestion(type);
      updated[activeIndex].choices = defaults.choices;
      updated[activeIndex].correctAnswer = defaults.correctAnswer;
    }

    setQuestions(updated);
  };

  const handleChoiceChange = (choiceIndex: number, value: string) => {
    const updated = [...questions];
    const choices = [...updated[activeIndex].choices];
    choices[choiceIndex] = value;
    updated[activeIndex].choices = choices;
    setQuestions(updated);
  };

  // Mock AI Question Generation
  const handleAIGenerateQuestion = () => {
    const topics = [
      {
        title: 'How does React Virtual DOM work?',
        choices: [
          'It re-renders the whole browser DOM directly',
          'It compares a virtual representation with the real DOM and updates changes',
          'It is stored in the database for indexing',
          'It works only on mobile devices'
        ],
        correctAnswer: '1',
        type: 'mcq' as const,
        timeLimit: 20,
        points: 1000
      },
      {
        title: 'Which command initializes a new Git repository?',
        choices: ['git commit', 'git clone', 'git init', 'git push'],
        correctAnswer: '2',
        type: 'mcq' as const,
        timeLimit: 15,
        points: 1000
      },
      {
        title: 'NodeJS runs on the V8 engine.',
        choices: ['True', 'False'],
        correctAnswer: 'true',
        type: 'true_false' as const,
        timeLimit: 15,
        points: 1000
      },
      {
        title: 'What represents the style declarations in a web app?',
        choices: [],
        correctAnswer: 'css',
        type: 'open_ended' as const,
        timeLimit: 20,
        points: 1500
      }
    ];

    // Pick a random topic to simulate AI generation
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const newQ: Question = {
      id: 'q-' + Math.random().toString(36).substring(2, 9),
      ...randomTopic
    };

    setQuestions(prev => [...prev, newQ]);
    setActiveIndex(questions.length);
  };

  const handleSaveQuiz = async () => {
    setError('');
    if (!quizTitle.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    // Basic validation of questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim()) {
        setError(`Question ${i + 1} title cannot be empty.`);
        return;
      }
      if (q.type === 'mcq') {
        for (let j = 0; j < q.choices.length; j++) {
          if (!q.choices[j].trim()) {
            setError(`Choice ${j + 1} in Question ${i + 1} cannot be empty.`);
            return;
          }
        }
      }
      if (q.type === 'open_ended' && !q.correctAnswer.trim()) {
        setError(`Correct Answer in Question ${i + 1} cannot be empty.`);
        return;
      }
    }

    setSaving(true);
    try {
      const url = selectedQuizId 
        ? `http://localhost:5000/api/quizzes/${selectedQuizId}`
        : 'http://localhost:5000/api/quizzes';
      const method = selectedQuizId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
          questions
        })
      });

      if (res.ok) {
        setPage('dashboard');
      } else {
        setError('Failed to save the quiz. Please verify input fields.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error saving quiz.');
    } finally {
      setSaving(false);
    }
  };

  const activeQuestion = questions[activeIndex];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Quiz Builder Header */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        margin: '20px 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={() => setPage('dashboard')} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input 
              type="text" 
              placeholder="Enter Quiz Title..." 
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--panel-border)',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: 800,
                outline: 'none',
                paddingBottom: '4px',
                width: '300px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setPage('dashboard')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveQuiz} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </header>

      {/* Editor Content Grid */}
      <main style={{
        flexGrow: 1,
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '0 40px 40px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '30px'
      }}>
        
        {/* Left Panel: Questions List */}
        <section className="glass-panel" style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>
            Questions ({questions.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
            {questions.map((q, idx) => (
              <div 
                key={q.id} 
                onClick={() => setActiveIndex(idx)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: `1px solid ${idx === activeIndex ? 'var(--primary-color)' : 'var(--panel-border)'}`,
                  background: idx === activeIndex ? 'rgba(99, 102, 241, 0.1)' : 'rgba(9, 9, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {idx + 1}. {q.type.toUpperCase().replace('_', ' ')}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '180px'
                  }}>
                    {q.title || 'Untitled Question'}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => handleDeleteQuestion(idx, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Question Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderTop: '1px solid var(--panel-border)',
            paddingTop: '16px'
          }}>
            <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => handleAddQuestion('mcq')}>
              + MCQ Question
            </button>
            <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => handleAddQuestion('true_false')}>
              + True/False
            </button>
            <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => handleAddQuestion('open_ended')}>
              + Open Ended
            </button>
            
            <button 
              className="btn btn-cyan" 
              style={{ padding: '10px 12px', fontSize: '0.85rem', marginTop: '8px', display: 'flex', gap: '6px' }}
              onClick={handleAIGenerateQuestion}
            >
              <Sparkles size={14} /> AI Generate Question
            </button>
          </div>
        </section>

        {/* Center Panel: Active Question Editor */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div className="glass-panel" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {activeQuestion ? (
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Question Meta Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Question Type</label>
                  <select 
                    value={activeQuestion.type}
                    onChange={(e) => handleQuestionChange('type', e.target.value)}
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="true_false">True / False</option>
                    <option value="open_ended">Open Ended (Text Answer)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Time Limit</label>
                  <select 
                    value={activeQuestion.timeLimit}
                    onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value))}
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value={10}>10 Seconds</option>
                    <option value={15}>15 Seconds</option>
                    <option value={20}>20 Seconds</option>
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Base Points</label>
                  <select 
                    value={activeQuestion.points}
                    onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value={1000}>1000 Points (Standard)</option>
                    <option value={1500}>1500 Points (Medium)</option>
                    <option value={2000}>2000 Points (Hard)</option>
                  </select>
                </div>
              </div>

              {/* Question Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Question Prompt</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., What is the capital of France?" 
                  value={activeQuestion.title}
                  onChange={(e) => handleQuestionChange('title', e.target.value)}
                />
              </div>

              {/* Choices / Answers Input based on Type */}
              {activeQuestion.type === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Choices & Correct Answer <HelpCircle size={14} style={{ color: 'var(--text-muted)' }} />
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                  }}>
                    {activeQuestion.choices.map((choice, index) => {
                      const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
                      const isCorrect = activeQuestion.correctAnswer === index.toString();
                      
                      return (
                        <div key={index} className="glass-panel" style={{
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          borderColor: isCorrect ? colors[index] : 'var(--panel-border)',
                          boxShadow: isCorrect ? `0 0 10px ${colors[index]}44` : 'none',
                        }}>
                          {/* Color marker */}
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            background: colors[index]
                          }} />
                          
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ flexGrow: 1, border: 'none', background: 'none', padding: '4px' }}
                            value={choice}
                            onChange={(e) => handleChoiceChange(index, e.target.value)}
                          />

                          {/* Radio selector for correct answer */}
                          <button 
                            onClick={() => handleQuestionChange('correctAnswer', index.toString())}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: `2px solid ${isCorrect ? colors[index] : 'var(--text-muted)'}`,
                              background: isCorrect ? colors[index] : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            {isCorrect && <Check size={14} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeQuestion.type === 'true_false' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Correct Option</label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {['true', 'false'].map((option) => {
                      const isCorrect = activeQuestion.correctAnswer === option;
                      const color = option === 'true' ? '#10b981' : '#ef4444';
                      
                      return (
                        <button 
                          key={option}
                          onClick={() => handleQuestionChange('correctAnswer', option)}
                          className="glass-panel"
                          style={{
                            flexGrow: 1,
                            padding: '24px',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: isCorrect ? color : 'var(--text-primary)',
                            background: isCorrect ? `${color}11` : 'var(--panel-bg)',
                            borderColor: isCorrect ? color : 'var(--panel-border)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `2px solid ${isCorrect ? color : 'var(--text-muted)'}`,
                            background: isCorrect ? color : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            {isCorrect && <Check size={12} />}
                          </div>
                          {option.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeQuestion.type === 'open_ended' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Correct Answer Text (Case-insensitive)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., Cascading Style Sheets" 
                    value={activeQuestion.correctAnswer}
                    onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Note: Students will type their answers. Score is awarded if spelling matches exactly (ignoring spacing and capitalization).
                  </span>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Select a question to edit, or add a new one.
            </div>
          )}
        </section>

      </main>
    </div>
  );
};
