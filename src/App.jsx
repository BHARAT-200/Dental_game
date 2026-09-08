import { AnimatePresence, motion } from 'framer-motion';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import QuestionBuilder from './pages/QuestionBuilder';
import AdminPanel from './pages/AdminPanel';
import Round1Images from './pages/Round1Images';
import Round2ThisOrThat from './pages/Round2ThisOrThat';
import Round3Riddles from './pages/Round3Riddles';
import Round4MCQ from './pages/Round4MCQ';
import Round5RapidFire from './pages/Round5RapidFire';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import { useGameState, SCREENS } from './hooks/useGameState';
import { useSettings } from './hooks/useSettings';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const game = useGameState();
  const { settings, updateSettings } = useSettings();

  const handleRoundComplete = (round, score) => {
    game.addScore(round, score);
    const nextMap = {
      round1: SCREENS.ROUND2,
      round2: SCREENS.ROUND3,
      round3: SCREENS.ROUND4,
      round4: SCREENS.ROUND5,
      round5: SCREENS.RESULT,
    };
    game.setScreen(nextMap[round]);
  };

  return (
    <div className="relative min-h-screen" style={{ background: '#0F172A' }}>
      <Background />
      <Navbar
        settings={settings}
        updateSettings={updateSettings}
        scores={game.scores}
        onHome={() => game.setScreen(SCREENS.HOME)}
        onLeaderboard={() => game.setScreen(SCREENS.LEADERBOARD)}
        screen={game.screen}
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {game.screen === SCREENS.HOME && (
            <PageWrapper key="home">
              <Home
                onRandom={game.startRandomGame}
                onCustom={() => game.setScreen(SCREENS.BUILDER)}
                onLeaderboard={() => game.setScreen(SCREENS.LEADERBOARD)}
                onAdmin={() => game.setScreen(SCREENS.ADMIN)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.ADMIN && (
            <PageWrapper key="admin">
              <AdminPanel onHome={() => game.setScreen(SCREENS.HOME)} />
            </PageWrapper>
          )}

          {game.screen === SCREENS.BUILDER && (
            <PageWrapper key="builder">
              <QuestionBuilder
                onStart={game.startCustomGame}
                onHome={() => game.setScreen(SCREENS.HOME)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.INSTRUCTIONS && (
            <PageWrapper key="instructions">
              <Instructions onStart={() => game.setScreen(SCREENS.ROUND1)} />
            </PageWrapper>
          )}

          {game.screen === SCREENS.ROUND1 && game.questions && (
            <PageWrapper key="round1">
              <Round1Images
                questions={game.questions.images}
                totalScore={game.scores.total}
                onComplete={(score) => handleRoundComplete('round1', score)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.ROUND2 && game.questions && (
            <PageWrapper key="round2">
              <Round2ThisOrThat
                questions={game.questions.thisOrThat}
                totalScore={game.scores.total}
                onComplete={(score) => handleRoundComplete('round2', score)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.ROUND3 && game.questions && (
            <PageWrapper key="round3">
              <Round3Riddles
                riddles={game.questions.riddles}
                totalScore={game.scores.total}
                onComplete={(score) => handleRoundComplete('round3', score)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.ROUND4 && game.questions && (
            <PageWrapper key="round4">
              <Round4MCQ
                questions={game.questions.mcq}
                totalScore={game.scores.total}
                onComplete={(score) => handleRoundComplete('round4', score)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.ROUND5 && game.questions && (
            <PageWrapper key="round5">
              <Round5RapidFire
                questions={game.questions.rapidFire}
                totalScore={game.scores.total}
                onComplete={(score) => handleRoundComplete('round5', score)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.RESULT && (
            <PageWrapper key="result">
              <ResultPage
                scores={game.scores}
                roundResults={game.roundResults}
                elapsedTime={game.getElapsedTime()}
                onPlayAgain={game.startRandomGame}
                onHome={game.resetGame}
                onLeaderboard={() => game.setScreen(SCREENS.LEADERBOARD)}
              />
            </PageWrapper>
          )}

          {game.screen === SCREENS.LEADERBOARD && (
            <PageWrapper key="leaderboard">
              <Leaderboard onHome={() => game.setScreen(SCREENS.HOME)} />
            </PageWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
