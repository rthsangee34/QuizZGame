export interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'open_ended';
  title: string;
  choices: string[];
  correctAnswer: string; // for MCQ, index as string; for true_false, "true"/"false"; for open_ended, lowercase text
  timeLimit: number; // in seconds
  points: number; // base points (e.g. 1000)
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export interface PlayerAnswer {
  questionId: string;
  selected: string;
  timeTaken: number; // ms
  isCorrect: boolean;
  points: number;
}

export interface Player {
  socketId: string;
  sessionId: string;
  nickname: string;
  score: number;
  streak: number;
  answers: Record<string, PlayerAnswer>;
}

export interface GameSession {
  id: string;
  quizId: string;
  hostSocketId: string;
  pin: string;
  status: 'lobby' | 'countdown' | 'question' | 'leaderboard' | 'finished';
  currentQuestionIndex: number;
  questionStartTime: number; // ms timestamp
  players: Record<string, Player>; // socketId -> Player
  answersReceived: Record<string, string>; // socketId -> selectedChoice
}

// In-memory Database
class MemoryDb {
  public quizzes: Record<string, Quiz> = {};
  public sessions: Record<string, GameSession> = {}; // pin -> GameSession
  public sessionBySocketId: Record<string, string> = {}; // playerSocketId / hostSocketId -> pin

  constructor() {
    // Seed with a default demo quiz
    const demoQuizId = 'demo-quiz-1';
    this.quizzes[demoQuizId] = {
      id: demoQuizId,
      title: 'General Trivia & Tech Challenge',
      description: 'Test your knowledge on technology, science, and history!',
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          title: 'Which programming language is predominantly used in NestJS?',
          choices: ['Python', 'TypeScript', 'Java', 'C#'],
          correctAnswer: '1', // TypeScript (index 1)
          timeLimit: 20,
          points: 1000,
        },
        {
          id: 'q2',
          type: 'true_false',
          title: 'HTTP stands for HyperText Transfer Protocol.',
          choices: ['True', 'False'],
          correctAnswer: 'true',
          timeLimit: 15,
          points: 1000,
        },
        {
          id: 'q3',
          type: 'open_ended',
          title: 'What does CSS stand for?',
          choices: [],
          correctAnswer: 'cascading style sheets',
          timeLimit: 30,
          points: 1500,
        },
        {
          id: 'q4',
          type: 'mcq',
          title: 'Which cloud provider has the service named "BigQuery"?',
          choices: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Alibaba Cloud'],
          correctAnswer: '2', // Google Cloud
          timeLimit: 20,
          points: 1000,
        }
      ]
    };
  }

  // Quiz Methods
  getQuiz(id: string): Quiz | undefined {
    return this.quizzes[id];
  }

  createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Quiz {
    const id = Math.random().toString(36).substring(2, 11);
    const newQuiz: Quiz = {
      ...quiz,
      id,
      createdAt: new Date().toISOString(),
    };
    this.quizzes[id] = newQuiz;
    return newQuiz;
  }

  updateQuiz(id: string, updatedQuiz: Partial<Quiz>): Quiz | undefined {
    const existing = this.quizzes[id];
    if (!existing) return undefined;
    this.quizzes[id] = { ...existing, ...updatedQuiz, id };
    return this.quizzes[id];
  }

  deleteQuiz(id: string): boolean {
    if (this.quizzes[id]) {
      delete this.quizzes[id];
      return true;
    }
    return false;
  }

  getAllQuizzes(): Quiz[] {
    return Object.values(this.quizzes);
  }

  // Game Session Methods
  createSession(quizId: string, hostSocketId: string): GameSession {
    // Generate a unique 6-digit PIN
    let pin = '';
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.sessions[pin]);

    const session: GameSession = {
      id: Math.random().toString(36).substring(2, 11),
      quizId,
      hostSocketId,
      pin,
      status: 'lobby',
      currentQuestionIndex: -1,
      questionStartTime: 0,
      players: {},
      answersReceived: {},
    };

    this.sessions[pin] = session;
    this.sessionBySocketId[hostSocketId] = pin;
    return session;
  }

  getSessionByPin(pin: string): GameSession | undefined {
    return this.sessions[pin];
  }

  getSessionBySocketId(socketId: string): GameSession | undefined {
    const pin = this.sessionBySocketId[socketId];
    if (!pin) return undefined;
    return this.sessions[pin];
  }

  removeSession(pin: string) {
    const session = this.sessions[pin];
    if (session) {
      delete this.sessionBySocketId[session.hostSocketId];
      Object.keys(session.players).forEach(socketId => {
        delete this.sessionBySocketId[socketId];
      });
      delete this.sessions[pin];
    }
  }
}

export const db = new MemoryDb();
