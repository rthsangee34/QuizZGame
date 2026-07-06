import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { db, Quiz, Question, GameSession, Player } from './store';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Past Game Reports Store (In-Memory)
interface GameReport {
  id: string;
  quizTitle: string;
  pin: string;
  date: string;
  playersCount: number;
  averageScore: number;
  playerDetails: { nickname: string; score: number }[];
}
const reports: GameReport[] = [
  {
    id: 'rep-1',
    quizTitle: 'General Trivia & Tech Challenge',
    pin: '123456',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    playersCount: 3,
    averageScore: 2450,
    playerDetails: [
      { nickname: 'Sarah', score: 3200 },
      { nickname: 'David', score: 2800 },
      { nickname: 'Alex', score: 1350 },
    ],
  },
  {
    id: 'rep-2',
    quizTitle: 'General Trivia & Tech Challenge',
    pin: '987654',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    playersCount: 4,
    averageScore: 2150,
    playerDetails: [
      { nickname: 'Jordan', score: 3100 },
      { nickname: 'Taylor', score: 2900 },
      { nickname: 'Morgan', score: 1800 },
      { nickname: 'Casey', score: 800 },
    ],
  }
];

// --- REST API ROUTES ---

// Auth mockup
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  // Return dummy credentials
  res.json({
    token: 'jwt-mock-token-xyz',
    user: {
      id: 'teacher-1',
      name: email.split('@')[0],
      email,
      role: 'teacher',
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  res.json({
    token: 'jwt-mock-token-xyz',
    user: {
      id: 'teacher-1',
      name: name || email.split('@')[0],
      email,
      role: 'teacher',
    },
  });
});

// Quiz CRUD
app.get('/api/quizzes', (req, res) => {
  res.json(db.getAllQuizzes());
});

app.get('/api/quizzes/:id', (req, res) => {
  const quiz = db.getQuiz(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

app.post('/api/quizzes', (req, res) => {
  const { title, description, questions } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const quiz = db.createQuiz({
    title,
    description: description || '',
    questions: questions || [],
  });
  res.status(201).json(quiz);
});

app.put('/api/quizzes/:id', (req, res) => {
  const updated = db.updateQuiz(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Quiz not found' });
  res.json(updated);
});

app.delete('/api/quizzes/:id', (req, res) => {
  const deleted = db.deleteQuiz(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ message: 'Quiz deleted successfully' });
});

// Game Reports API
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// --- SOCKET.IO EVENT HANDLER ---

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Host creates a live game session
  socket.on('host:create-session', ({ quizId }: { quizId: string }) => {
    const quiz = db.getQuiz(quizId);
    if (!quiz) {
      socket.emit('error', { message: 'Quiz not found' });
      return;
    }

    const session = db.createSession(quizId, socket.id);
    socket.join(session.pin);

    console.log(`Session created: ${session.pin} by host ${socket.id}`);
    socket.emit('host:session-created', {
      pin: session.pin,
      quizTitle: quiz.title,
      questionsCount: quiz.questions.length,
    });
  });

  // 2. Player joins the game session via PIN
  socket.on('player:join', ({ pin, nickname }: { pin: string; nickname: string }) => {
    const session = db.getSessionByPin(pin);
    if (!session) {
      socket.emit('player:join-failed', { message: 'Session not found. Check the PIN.' });
      return;
    }

    if (session.status !== 'lobby') {
      socket.emit('player:join-failed', { message: 'Game has already started!' });
      return;
    }

    // Check if nickname already taken
    const nameTaken = Object.values(session.players).some(p => p.nickname.toLowerCase() === nickname.toLowerCase());
    if (nameTaken) {
      socket.emit('player:join-failed', { message: 'Nickname is already taken!' });
      return;
    }

    const player: Player = {
      socketId: socket.id,
      sessionId: session.id,
      nickname,
      score: 0,
      streak: 0,
      answers: {},
    };

    session.players[socket.id] = player;
    db.sessionBySocketId[socket.id] = pin;
    socket.join(pin);

    console.log(`Player ${nickname} (${socket.id}) joined session ${pin}`);

    // Acknowledge player
    socket.emit('player:joined-success', {
      pin,
      nickname,
      quizId: session.quizId,
    });

    // Notify host and other players
    const playerList = Object.values(session.players).map(p => ({
      socketId: p.socketId,
      nickname: p.nickname,
      score: p.score,
    }));

    io.to(pin).emit('game:player-list-update', playerList);
  });

  // 3. Host starts countdown
  socket.on('host:start-game', () => {
    const session = db.getSessionBySocketId(socket.id);
    if (!session || session.hostSocketId !== socket.id) return;

    session.status = 'countdown';
    io.to(session.pin).emit('game:state-update', { status: 'countdown' });

    let countdown = 5;
    const interval = setInterval(() => {
      io.to(session.pin).emit('game:countdown-tick', countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(interval);
        sendNextQuestion(session);
      }
    }, 1000);
  });

  // Helper: Send next question
  function sendNextQuestion(session: GameSession) {
    const quiz = db.getQuiz(session.quizId);
    if (!quiz) return;

    session.currentQuestionIndex++;
    if (session.currentQuestionIndex >= quiz.questions.length) {
      endGame(session);
      return;
    }

    const question = quiz.questions[session.currentQuestionIndex];
    session.status = 'question';
    session.questionStartTime = Date.now();
    session.answersReceived = {};

    console.log(`Sending question ${session.currentQuestionIndex + 1} for session ${session.pin}`);

    // Host gets full question details
    io.to(session.hostSocketId).emit('host:question-start', {
      questionIndex: session.currentQuestionIndex,
      question: {
        id: question.id,
        type: question.type,
        title: question.title,
        choices: question.choices,
        timeLimit: question.timeLimit,
        points: question.points,
      },
      answersReceived: 0,
      totalPlayers: Object.keys(session.players).length,
    });

    // Players get question details WITHOUT choices text for MCQ (only colors/shapes), or full question if open ended/true-false
    // For Kahoot, player screens usually only display color grids for MCQ, but we can send options so they see what they click,
    // let's send options but hide correct answers.
    io.to(session.pin).except(session.hostSocketId).emit('player:question-start', {
      questionIndex: session.currentQuestionIndex,
      questionType: question.type,
      choicesCount: question.choices.length,
      choices: question.type === 'mcq' ? question.choices : question.choices, // Send choices text to players too for premium readability
      timeLimit: question.timeLimit,
      title: question.title, // Send title so player sees what they answer
    });
  }

  // 4. Player submits answer
  socket.on('player:submit-answer', ({ selected }: { selected: string }) => {
    const session = db.getSessionBySocketId(socket.id);
    if (!session || session.status !== 'question') return;

    const quiz = db.getQuiz(session.quizId);
    if (!quiz) return;

    const player = session.players[socket.id];
    if (!player) return;

    // Prevent double answering
    if (session.answersReceived[socket.id]) return;

    session.answersReceived[socket.id] = selected;

    const question = quiz.questions[session.currentQuestionIndex];
    const timeTaken = Date.now() - session.questionStartTime;
    const timeLimitMs = question.timeLimit * 1000;

    let isCorrect = false;
    if (question.type === 'mcq' || question.type === 'true_false') {
      isCorrect = selected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    } else if (question.type === 'open_ended') {
      isCorrect = selected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    }

    // Score calculation algorithm
    let pointsEarned = 0;
    if (isCorrect) {
      // Base Points (usually 1000)
      const basePoints = question.points;
      
      // Time Bonus: Up to 500 bonus points based on speed
      const timeLeftRatio = Math.max(0, (timeLimitMs - timeTaken) / timeLimitMs);
      const timeBonus = Math.floor(timeLeftRatio * 500);

      // Streak Bonus: 100 points per streak level (max 500)
      player.streak++;
      const streakBonus = Math.min(500, (player.streak - 1) * 100);

      pointsEarned = basePoints + timeBonus + streakBonus;
      player.score += pointsEarned;
    } else {
      player.streak = 0; // Reset streak
    }

    player.answers[question.id] = {
      questionId: question.id,
      selected,
      timeTaken,
      isCorrect,
      points: pointsEarned,
    };

    console.log(`Player ${player.nickname} answered: ${selected}. Correct: ${isCorrect}. Points: ${pointsEarned}. Total Score: ${player.score}`);

    // Update Host on answer counts
    const answersCount = Object.keys(session.answersReceived).length;
    const totalPlayers = Object.keys(session.players).length;

    io.to(session.hostSocketId).emit('host:answer-update', {
      answersReceived: answersCount,
    });

    // Notify player that answer was recorded
    socket.emit('player:answer-received', {
      isCorrect,
      pointsEarned,
      currentScore: player.score,
      streak: player.streak,
    });

    // If all players have answered, trigger question end automatically
    if (answersCount === totalPlayers) {
      endActiveQuestion(session);
    }
  });

  // 5. Host forces end of question (or timer expires)
  socket.on('host:end-question', () => {
    const session = db.getSessionBySocketId(socket.id);
    if (!session || session.status !== 'question') return;
    endActiveQuestion(session);
  });

  function endActiveQuestion(session: GameSession) {
    const quiz = db.getQuiz(session.quizId);
    if (!quiz) return;

    session.status = 'leaderboard';
    const question = quiz.questions[session.currentQuestionIndex];

    // Compute distribution of choices
    const choiceDistribution: Record<string, number> = {};
    if (question.type === 'mcq' || question.type === 'true_false') {
      question.choices.forEach((_, index) => {
        choiceDistribution[index.toString()] = 0;
      });
      // True/False index mapping
      if (question.type === 'true_false') {
        choiceDistribution['true'] = 0;
        choiceDistribution['false'] = 0;
      }
    }

    Object.values(session.answersReceived).forEach(ans => {
      choiceDistribution[ans] = (choiceDistribution[ans] || 0) + 1;
    });

    // Emit question ended state to host
    io.to(session.hostSocketId).emit('host:question-ended', {
      correctAnswer: question.correctAnswer,
      choices: question.choices,
      choiceDistribution,
    });

    // Emit results to players
    Object.values(session.players).forEach(p => {
      const pAns = p.answers[question.id];
      io.to(p.socketId).emit('player:question-ended', {
        hasAnswered: !!pAns,
        isCorrect: pAns ? pAns.isCorrect : false,
        pointsEarned: pAns ? pAns.points : 0,
        correctAnswer: question.type === 'mcq' 
          ? question.choices[parseInt(question.correctAnswer)] || question.correctAnswer
          : question.correctAnswer,
        currentScore: p.score,
        streak: p.streak,
      });
    });
  }

  // 6. Host requests current leaderboard
  socket.on('host:show-leaderboard', () => {
    const session = db.getSessionBySocketId(socket.id);
    if (!session) return;

    // Get sorted leaderboard
    const leaderboard = Object.values(session.players)
      .map(p => ({
        nickname: p.nickname,
        score: p.score,
        streak: p.streak,
      }))
      .sort((a, b) => b.score - a.score);

    io.to(session.pin).emit('game:leaderboard', {
      leaderboard: leaderboard.slice(0, 5), // Top 5
    });
  });

  // 7. Host requests next question
  socket.on('host:next-question', () => {
    const session = db.getSessionBySocketId(socket.id);
    if (!session || session.status !== 'leaderboard') return;
    sendNextQuestion(session);
  });

  // 8. End game and show final podium
  function endGame(session: GameSession) {
    session.status = 'finished';
    const quiz = db.getQuiz(session.quizId);

    const sortedPlayers = Object.values(session.players)
      .map(p => ({
        nickname: p.nickname,
        score: p.score,
      }))
      .sort((a, b) => b.score - a.score);

    console.log(`Game ended for session ${session.pin}. Podium:`, sortedPlayers.slice(0, 3));

    // Emit final podium (top 3)
    io.to(session.pin).emit('game:finished', {
      podium: sortedPlayers.slice(0, 3),
    });

    // Save game report
    if (quiz && sortedPlayers.length > 0) {
      const totalScore = sortedPlayers.reduce((sum, p) => sum + p.score, 0);
      reports.push({
        id: `rep-${Math.random().toString(36).substring(2, 11)}`,
        quizTitle: quiz.title,
        pin: session.pin,
        date: new Date().toISOString(),
        playersCount: sortedPlayers.length,
        averageScore: Math.round(totalScore / sortedPlayers.length),
        playerDetails: sortedPlayers,
      });
    }

    // Clean up session in memory
    db.removeSession(session.pin);
  }

  // 9. Client disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Check if player or host
    const session = db.getSessionBySocketId(socket.id);
    if (session) {
      if (session.hostSocketId === socket.id) {
        console.log(`Host disconnected. Ending session ${session.pin}`);
        io.to(session.pin).emit('game:terminated', { message: 'Host disconnected. Game ended.' });
        db.removeSession(session.pin);
      } else {
        const player = session.players[socket.id];
        if (player) {
          console.log(`Player ${player.nickname} left session ${session.pin}`);
          delete session.players[socket.id];
          delete db.sessionBySocketId[socket.id];

          // Notify host and other players
          const playerList = Object.values(session.players).map(p => ({
            socketId: p.socketId,
            nickname: p.nickname,
            score: p.score,
          }));

          io.to(session.pin).emit('game:player-list-update', playerList);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
