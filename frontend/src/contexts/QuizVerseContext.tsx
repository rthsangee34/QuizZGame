import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PlayerInfo {
  socketId: string;
  nickname: string;
  score: number;
}

interface QuestionData {
  id?: string;
  type: 'mcq' | 'true_false' | 'open_ended';
  title: string;
  choices: string[];
  timeLimit: number;
  points: number;
}

interface LeaderboardEntry {
  nickname: string;
  score: number;
  streak: number;
}

interface PodiumEntry {
  nickname: string;
  score: number;
}

interface QuizVerseContextType {
  // Auth & Theme
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Real-time Session State
  socket: Socket | null;
  gamePin: string;
  gameRole: 'host' | 'player' | null;
  gameState: 'lobby' | 'countdown' | 'question' | 'leaderboard' | 'finished' | 'idle';
  playerNickname: string;
  playerList: PlayerInfo[];
  countdown: number;
  currentQuestion: QuestionData | null;
  questionIndex: number;
  totalQuestions: number;
  answersReceived: number;
  totalPlayers: number;
  
  // Game Play Feedback
  answerSubmitted: boolean;
  submitFeedback: {
    isCorrect: boolean;
    pointsEarned: number;
    currentScore: number;
    streak: number;
  } | null;
  
  // Question Results & Summary
  correctAnswer: string;
  choiceDistribution: Record<string, number>;
  playerQuestionResult: {
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer: string;
    currentScore: number;
    streak: number;
  } | null;

  // Final Results
  leaderboard: LeaderboardEntry[];
  podium: PodiumEntry[];
  gameError: string;

  // Game Control Functions
  createSession: (quizId: string) => void;
  joinSession: (pin: string, nickname: string) => void;
  startGame: () => void;
  submitAnswer: (selected: string) => void;
  endQuestion: () => void;
  showLeaderboard: () => void;
  nextQuestion: () => void;
  resetGame: () => void;
}

const QuizVerseContext = createContext<QuizVerseContextType | undefined>(undefined);

export const QuizVerseProvider = ({ children }: { children: ReactNode }) => {
  // Auth & Theme States
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Connection & Game States
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [gamePin, setGamePin] = useState<string>('');
  const [gameRole, setGameRole] = useState<'host' | 'player' | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'question' | 'leaderboard' | 'finished' | 'idle'>('idle');
  const [playerNickname, setPlayerNickname] = useState<string>('');
  const [playerList, setPlayerList] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answersReceived, setAnswersReceived] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [gameError, setGameError] = useState<string>('');

  // Feedbacks & Results
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<QuizVerseContextType['submitFeedback']>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [choiceDistribution, setChoiceDistribution] = useState<Record<string, number>>({});
  const [playerQuestionResult, setPlayerQuestionResult] = useState<QuizVerseContextType['playerQuestionResult']>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [podium, setPodium] = useState<PodiumEntry[]>([]);

  // Initialize Auth
  useEffect(() => {
    const savedUser = localStorage.getItem('qv_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Theme Management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1. Stable Reset Game Function
  const resetGame = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setGamePin('');
    setGameRole(null);
    setGameState('idle');
    setPlayerNickname('');
    setPlayerList([]);
    setCountdown(0);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setTotalQuestions(0);
    setAnswersReceived(0);
    setTotalPlayers(0);
    setGameError('');
    setAnswerSubmitted(false);
    setSubmitFeedback(null);
    setCorrectAnswer('');
    setChoiceDistribution({});
    setPlayerQuestionResult(null);
    setLeaderboard([]);
    setPodium([]);
  }, []);

  // 2. Stable Socket Initialization
  const initSocket = useCallback((): Socket => {
    if (socketRef.current) return socketRef.current;
    const newSocket = io(BACKEND_URL);
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Common Socket Listeners
    newSocket.on('connect', () => {
      console.log('Connected to WS backend', newSocket.id);
    });

    newSocket.on('connect_error', () => {
      setGameError('Unable to connect to the game server. Please make sure the backend is running.');
    });

    newSocket.on('error', (err: { message: string }) => {
      setGameError(err.message);
    });

    newSocket.on('game:player-list-update', (list: PlayerInfo[]) => {
      setPlayerList(list);
      setTotalPlayers(list.length);
    });

    newSocket.on('game:state-update', ({ status }: { status: typeof gameState }) => {
      setGameState(status);
      setGameError('');
    });

    newSocket.on('game:countdown-tick', (val: number) => {
      setCountdown(val);
      setGameState('countdown');
    });

    newSocket.on('game:terminated', ({ message }: { message: string }) => {
      setGameError(message);
      setGameState('idle');
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    });

    // Host-Specific Listeners
    newSocket.on('host:session-created', ({ pin, questionsCount }: { pin: string, questionsCount: number }) => {
      setGamePin(pin);
      setGameState('lobby');
      setTotalQuestions(questionsCount);
    });

    newSocket.on('host:question-start', ({ questionIndex, question, totalPlayers }: any) => {
      setQuestionIndex(questionIndex);
      setCurrentQuestion(question);
      setAnswersReceived(0);
      setTotalPlayers(totalPlayers);
      setGameState('question');
      setAnswerSubmitted(false);
      setSubmitFeedback(null);
      setPlayerQuestionResult(null);
    });

    newSocket.on('host:answer-update', ({ answersReceived }: { answersReceived: number }) => {
      setAnswersReceived(answersReceived);
    });

    newSocket.on('host:question-ended', ({ correctAnswer, choiceDistribution }: any) => {
      setCorrectAnswer(correctAnswer);
      setChoiceDistribution(choiceDistribution);
      setGameState('leaderboard');
    });

    // Player-Specific Listeners
    newSocket.on('player:join-failed', ({ message }: { message: string }) => {
      setGameError(message);
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    });

    newSocket.on('player:joined-success', ({ pin, nickname }: { pin: string; nickname: string }) => {
      setGamePin(pin);
      setPlayerNickname(nickname);
      setGameState('lobby');
    });

    newSocket.on('player:question-start', ({ questionIndex, questionType, choices, timeLimit, title }: any) => {
      setQuestionIndex(questionIndex);
      setCurrentQuestion({
        type: questionType,
        title: title || 'Question',
        choices: choices || [],
        timeLimit,
        points: 0, // Not needed on player client
      });
      setAnswersReceived(0);
      setGameState('question');
      setAnswerSubmitted(false);
      setSubmitFeedback(null);
      setPlayerQuestionResult(null);
    });

    newSocket.on('player:answer-received', (feedback: any) => {
      setAnswerSubmitted(true);
      setSubmitFeedback(feedback);
    });

    newSocket.on('player:question-ended', (result: any) => {
      setPlayerQuestionResult(result);
      setGameState('leaderboard');
    });

    // Global Results Listeners
    newSocket.on('game:leaderboard', ({ leaderboard }: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(leaderboard);
      setGameState('leaderboard');
    });

    newSocket.on('game:finished', ({ podium }: { podium: PodiumEntry[] }) => {
      setPodium(podium);
      setGameState('finished');
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    });

    return newSocket;
  }, []);

  // 3. Stable Auth Operations
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('qv_user', JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('qv_user', JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('qv_user');
    resetGame();
  }, [resetGame]);

  // 4. Stable Game Control Emitters
  const createSession = useCallback((quizId: string) => {
    resetGame();
    const s = initSocket();
    setGameRole('host');
    s.emit('host:create-session', { quizId });
  }, [resetGame, initSocket]);

  const joinSession = useCallback((pin: string, nickname: string) => {
    resetGame();
    const s = initSocket();
    setGameRole('player');
    s.emit('player:join', { pin, nickname });
  }, [resetGame, initSocket]);

  const startGame = useCallback(() => {
    if (socketRef.current && gameRole === 'host') {
      socketRef.current.emit('host:start-game');
    }
  }, [gameRole]);

  const submitAnswer = useCallback((selected: string) => {
    if (socketRef.current && gameRole === 'player' && !answerSubmitted) {
      socketRef.current.emit('player:submit-answer', { selected });
    }
  }, [gameRole, answerSubmitted]);

  const endQuestion = useCallback(() => {
    if (socketRef.current && gameRole === 'host') {
      socketRef.current.emit('host:end-question');
    }
  }, [gameRole]);

  const showLeaderboard = useCallback(() => {
    if (socketRef.current && gameRole === 'host') {
      socketRef.current.emit('host:show-leaderboard');
    }
  }, [gameRole]);

  const nextQuestion = useCallback(() => {
    if (socketRef.current && gameRole === 'host') {
      socketRef.current.emit('host:next-question');
    }
  }, [gameRole]);

  return (
    <QuizVerseContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        theme,
        toggleTheme,
        socket,
        gamePin,
        gameRole,
        gameState,
        playerNickname,
        playerList,
        countdown,
        currentQuestion,
        questionIndex,
        totalQuestions,
        answersReceived,
        totalPlayers,
        answerSubmitted,
        submitFeedback,
        correctAnswer,
        choiceDistribution,
        playerQuestionResult,
        leaderboard,
        podium,
        gameError,
        createSession,
        joinSession,
        startGame,
        submitAnswer,
        endQuestion,
        showLeaderboard,
        nextQuestion,
        resetGame,
      }}
    >
      {children}
    </QuizVerseContext.Provider>
  );
};

export const useQuizVerse = () => {
  const context = useContext(QuizVerseContext);
  if (context === undefined) {
    throw new Error('useQuizVerse must be used within a QuizVerseProvider');
  }
  return context;
};
