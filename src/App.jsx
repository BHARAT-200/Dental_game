import Background from './components/Background';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import QuestionBuilder from './pages/QuestionBuilder';
import Round1Images from './pages/Round1Images';
import Round2MCQ from './pages/Round4MCQ'; // MCQ is Round 2
import Round3ThisOrThat from './pages/Round2ThisOrThat'; // This or That is Round 3
import Round4Riddles from './pages/Round3Riddles'; // Riddles move to Round 4
import Round5RapidFire from './pages/Round5RapidFire'; // Rapid Fire is Round 5
import ResultPage from './pages/ResultPage';
import { useGameState, SCREENS } from './hooks/useGameState';
import { useSettings } from './hooks/useSettings';

export default function App() {
  const game = useGameState();
  const { settings, updateSettings } = useSettings();

  const handleRoundComplete = (round, score) => {
    game.addScore(round, score);
    game.proceedToNextRound(round);
  };

  return (
    <div className="relative min-h-screen" style={{ background: '#0F172A' }}>
      <Background />
      <Navbar
        settings={settings}
        updateSettings={updateSettings}
        scores={game.scores}
        onHome={() => game.setScreen(SCREENS.HOME)}
        screen={game.screen}
      />

      <div className="relative z-10">
        {game.screen === SCREENS.HOME && (
          <Home
            onRandom={game.startRandomGame}
            onCustom={() => game.setScreen(SCREENS.BUILDER)}
          />
        )}

        {game.screen === SCREENS.BUILDER && (
          <QuestionBuilder
            onStart={game.startCustomGame}
            onHome={() => game.setScreen(SCREENS.HOME)}
          />
        )}

        {game.screen === SCREENS.INSTRUCTIONS && (
          <Instructions 
            onStart={() => game.setScreen(game.getFirstEnabledRound())}
            enabledRounds={game.enabledRounds}
          />
        )}

        {game.screen === SCREENS.ROUND1 && game.questions && game.isRoundEnabled('round1') && (
          <Round1Images
            currentRound={1}
            questions={game.questions.images}
            totalScore={game.scores.total}
            onComplete={(score) => handleRoundComplete('round1', score)}
            onQuestionAnswered={(qData) => game.addQuestionResult('round1', qData)}
          />
        )}

        {game.screen === SCREENS.ROUND2 && game.questions && game.isRoundEnabled('round2') && (
          <Round2MCQ
            currentRound={2}
            questions={game.questions.mcq}
            totalScore={game.scores.total}
            onComplete={(score) => handleRoundComplete('round2', score)}
            onQuestionAnswered={(qData) => game.addQuestionResult('round2', qData)}
          />
        )}

        {game.screen === SCREENS.ROUND3 && game.questions && game.isRoundEnabled('round3') && (
          <Round3ThisOrThat
            currentRound={3}
            questions={game.questions.thisOrThat}
            totalScore={game.scores.total}
            onComplete={(score) => handleRoundComplete('round3', score)}
            onQuestionAnswered={(qData) => game.addQuestionResult('round3', qData)}
          />
        )}

        {game.screen === SCREENS.ROUND4 && game.questions && game.isRoundEnabled('round4') && (
          <Round4Riddles
            currentRound={4}
            riddles={game.questions.riddles}
            totalScore={game.scores.total}
            onComplete={(score) => handleRoundComplete('round4', score)}
            onQuestionAnswered={(qData) => game.addQuestionResult('round4', qData)}
          />
        )}

        {game.screen === SCREENS.ROUND5 && game.questions && game.isRoundEnabled('round5') && (
          <Round5RapidFire
            currentRound={5}
            questions={game.questions.rapidFire}
            totalScore={game.scores.total}
            onComplete={(score) => handleRoundComplete('round5', score)}
            onQuestionAnswered={(qData) => game.addQuestionResult('round5', qData)}
          />
        )}

        {game.screen === SCREENS.RESULT && (
          <ResultPage
            scores={game.scores}
            roundResults={game.roundResults}
            elapsedTime={game.getElapsedTime()}
            onPlayAgain={game.startRandomGame}
            onHome={game.resetGame}
            enabledRounds={game.enabledRounds}
          />
        )}
      </div>
    </div>
  );
}
