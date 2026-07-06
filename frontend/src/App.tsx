import { useState } from 'react';
import { QuizVerseProvider } from './contexts/QuizVerseContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { QuizBuilder } from './pages/QuizBuilder';
import { JoinGamePage } from './pages/JoinGamePage';
import { HostGameView } from './pages/HostGameView';
import { PlayerGameView } from './pages/PlayerGameView';

function AppContent() {
  const [page, setPage] = useState<string>('landing');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage setPage={setPage} />;
      case 'login':
        return <AuthPage setPage={setPage} initialMode="login" />;
      case 'register':
        return <AuthPage setPage={setPage} initialMode="register" />;
      case 'dashboard':
        return <TeacherDashboard setPage={setPage} setSelectedQuizId={setSelectedQuizId} />;
      case 'builder':
        return <QuizBuilder setPage={setPage} selectedQuizId={selectedQuizId} />;
      case 'join':
        return <JoinGamePage setPage={setPage} />;
      case 'host':
        return <HostGameView setPage={setPage} />;
      case 'player':
        return <PlayerGameView setPage={setPage} />;
      default:
        return <LandingPage setPage={setPage} />;
    }
  };

  return <>{renderPage()}</>;
}

export default function App() {
  return (
    <QuizVerseProvider>
      <AppContent />
    </QuizVerseProvider>
  );
}
