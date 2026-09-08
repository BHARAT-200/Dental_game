import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Lightbulb } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';
import { answersMatch } from '../utils/helpers';

export default function Round1Images({ questions, onComplete, totalScore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    // Reset answer state when question changes
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  }, [currentIndex]);

  const handleSubmit = () => {
    if (!userAnswer.trim() || isAnswered) return;

    const correct = answersMatch(userAnswer, currentQuestion.answer);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      playSound('correct');
      setRoundScore(prev => prev + 10);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Round complete
      setCompleted(true);
      setConfetti(true);
      playSound('complete');
      setTimeout(() => onComplete(roundScore), 2500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isAnswered) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-12 px-4"
    >
      <Confetti trigger={confetti} type="burst" />

      <div className="max-w-4xl mx-auto">
        <ProgressBar currentRound={1} />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black gradient-text">🖼️ Round 1</h2>
            <p className="text-slate-400 text-sm">
              Identify the Image — Question {currentIndex + 1} / {totalQuestions}
            </p>
          </div>
          <div className="flex gap-3">
            <ScoreDisplay score={roundScore} label="Round" />
            <ScoreDisplay score={totalScore + roundScore} label="Total" highlight />
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar mb-6 w-full">
          <motion.div
            className="progress-fill"
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Main Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 mb-6 border border-indigo-500/30"
          >
            {/* Question Title */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                What is this?
              </h3>
              <p className="text-slate-400 text-sm">
                Look at both images and type your answer
              </p>
            </div>

            {/* Images or Emoji Clue */}
            {currentQuestion.emoji ? (
              // Emoji-based question (Custom Game)
              <div className="flex justify-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-800/50 p-8"
                >
                  <div className="text-8xl text-center">
                    {currentQuestion.emoji}
                  </div>
                </motion.div>
              </div>
            ) : (
              // Image-based question (Admin Game)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-800/50"
                >
                  <img
                    src={currentQuestion.image1}
                    alt="Image 1"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-500 text-sm">Image not available</div>';
                    }}
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-800/50"
                >
                  <img
                    src={currentQuestion.image2}
                    alt="Image 2"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-500 text-sm">Image not available</div>';
                    }}
                  />
                </motion.div>
              </div>
            )}

            {/* Hint Button (before answering) */}
            {!isAnswered && currentQuestion.hint && (
              <div className="mb-4 text-center">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-medium transition-colors"
                >
                  <Lightbulb size={14} />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            )}

            <AnimatePresence>
              {showHint && !isAnswered && currentQuestion.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                >
                  <p className="text-yellow-300 text-sm text-center">
                    💡 {currentQuestion.hint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer Input */}
            <div className="max-w-md mx-auto mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2 text-center">
                Your Answer:
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAnswered}
                placeholder="Type your answer here..."
                className={`w-full px-4 py-3 rounded-xl text-center text-lg font-medium outline-none transition-all
                  ${isAnswered
                    ? isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                      : 'bg-red-500/20 border-2 border-red-500 text-red-300'
                    : 'bg-slate-800 border-2 border-slate-700 text-white focus:border-indigo-500'
                  }`}
              />
            </div>

            {/* Submit/Next Button */}
            <div className="flex justify-center">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmit}
                  variant="gradient"
                  size="lg"
                  disabled={!userAnswer.trim()}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="gradient"
                  size="lg"
                  icon={<ChevronRight size={20} />}
                >
                  {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Round'}
                </Button>
              )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="mt-6"
                >
                  {isCorrect ? (
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/20 border border-green-500/50">
                      <CheckCircle size={28} className="text-green-400 shrink-0" />
                      <div>
                        <p className="text-green-300 font-bold text-lg">Correct! +10 points</p>
                        <p className="text-green-400/80 text-sm">Great job! 🎉</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <XCircle size={28} className="text-red-400 shrink-0" />
                        <div>
                          <p className="text-red-300 font-bold text-lg">Incorrect</p>
                        </div>
                      </div>
                      <p className="text-red-400/80 text-sm text-center">
                        The correct answer is: <span className="font-bold text-red-300">{currentQuestion.answer}</span>
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  {currentQuestion.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-slate-300 text-sm text-center">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
          >
            <div className="glass rounded-3xl p-10 text-center max-w-sm mx-4 border border-indigo-500/50">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-black gradient-text mb-2">Round Complete!</h3>
              <p className="text-slate-400 mb-4">
                You answered {Math.floor(roundScore / 10)} out of {totalQuestions} correctly
              </p>
              <div className="text-4xl font-black text-white">+{roundScore} pts</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
