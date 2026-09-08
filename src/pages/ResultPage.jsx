import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import Confetti from '../components/Confetti';
import { getPerformanceBadge, formatTime } from '../utils/helpers';
import { setBestScore } from '../utils/storage';
import { playSound } from '../utils/sounds';

export default function ResultPage({ scores, roundResults, elapsedTime, onPlayAgain, onHome, enabledRounds }) {
  const [confetti, setConfetti] = useState(false);
  const [expandedRounds, setExpandedRounds] = useState({});

  const total = scores.total;
  const maxScore = 12 * 10 + 10 * 10 + 8 * 15 + 15 * 10 + 20 * 5;
  const accuracy = Math.round((total / maxScore) * 100);
  const badge = getPerformanceBadge(accuracy);

  useEffect(() => {
    setBestScore(total);
    playSound('gameOver');
    setTimeout(() => setConfetti(true), 400);
  }, [total]);

  const handleShare = () => {
    const text = `I scored ${total} points in Dental Quiz Challenge with ${accuracy}% accuracy! ${badge.emoji} ${badge.label}`;
    if (navigator.share) {
      navigator.share({ title: 'Dental Quiz', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const toggleRound = (roundKey) => {
    setExpandedRounds(prev => ({ ...prev, [roundKey]: !prev[roundKey] }));
  };

  const roundConfig = [
    { key: 'round1', label: 'Round 1 — Identify Instrument', emoji: '🖼️', color: 'indigo' },
    { key: 'round2', label: 'Round 2 — Identify Through Function', emoji: '📝', color: 'purple' },
    { key: 'round3', label: 'Round 3 — This or That', emoji: '⚖️', color: 'cyan' },
    { key: 'round4', label: 'Round 4 — Riddle', emoji: '🧩', color: 'green' },
    { key: 'round5', label: 'Round 5 — Rapid Fire', emoji: '⚡', color: 'yellow' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-12 px-4"
    >
      <Confetti trigger={confetti} type="burst" />

      {/* Fixed Header with Home Button */}
      <div className="fixed top-16 right-4 z-50">
        <button
          onClick={onHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors shadow-lg"
        >
          <Home size={16} />
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Badge & Total Score */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="text-center mb-8"
        >
          <div className="text-7xl mb-4">{badge.emoji}</div>
          <h2 className={`text-4xl font-black mb-2 ${badge.color}`}>Quiz Complete!</h2>
          <p className="text-slate-400 mb-4">{badge.label}</p>
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 border border-indigo-500/30 mb-4"
          >
            <div className="text-slate-400 text-sm uppercase tracking-widest mb-2">Total Score</div>
            <div className="text-6xl font-black gradient-text mb-3">{total}</div>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">Accuracy:</span>
                <span className="ml-2 text-cyan-400 font-semibold">{accuracy}%</span>
              </div>
              <div>
                <span className="text-slate-500">Time:</span>
                <span className="ml-2 text-yellow-400 font-semibold">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </motion.div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
          >
            <Share2 size={14} />
            Share Score
          </button>
        </motion.div>

        {/* Round-by-Round Results */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Round Breakdown</h3>
          
          {roundConfig.map((round, idx) => {
            if (enabledRounds && !enabledRounds[round.key]) return null;
            
            const roundData = roundResults[round.key];
            if (!roundData) return null;

            const isExpanded = expandedRounds[round.key];

            return (
              <motion.div
                key={round.key}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className={`glass rounded-2xl border border-${round.color}-500/30 overflow-hidden`}
              >
                <button
                  onClick={() => toggleRound(round.key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{round.emoji}</span>
                    <div>
                      <div className="font-bold text-white">{round.label}</div>
                      <div className="text-sm text-slate-400">
                        Score: {scores[round.key]} points
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>

                {isExpanded && roundData.questions && (
                  <div className="border-t border-white/10 p-4 space-y-3">
                    {roundData.questions.map((q, qIdx) => (
                      <QuestionResult key={qIdx} question={q} roundKey={round.key} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-3"
        >
          <button
            onClick={onPlayAgain}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all"
          >
            🎮 Play Again
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function QuestionResult({ question, roundKey }) {
  const isCorrect = question.isCorrect;

  return (
    <div className={`glass rounded-xl p-3 border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? '✓' : '✗'}
        </div>
        <div className="flex-1">
          {/* Round 1: Emoji or Image */}
          {roundKey === 'round1' && (
            <div>
              {question.emoji && <div className="text-2xl mb-2">{question.emoji}</div>}
              {question.image1 && question.image2 && (
                <div className="text-xs text-slate-500 mb-2">
                  Images: {question.image1}, {question.image2}
                </div>
              )}
            </div>
          )}

          {/* Round 2: MCQ */}
          {roundKey === 'round2' && (
            <div className="text-sm text-white font-semibold mb-2">{question.question}</div>
          )}

          {/* Round 3: This or That */}
          {roundKey === 'round3' && (
            <div className="text-sm text-white font-semibold mb-2">{question.question}</div>
          )}

          {/* Round 4: Riddle */}
          {roundKey === 'round4' && (
            <div className="text-sm text-white font-semibold mb-2">{question.riddle}</div>
          )}

          {/* Round 5: Rapid Fire */}
          {roundKey === 'round5' && (
            <div className="text-sm text-white font-semibold mb-2">{question.question}</div>
          )}

          {/* User Answer */}
          <div className="text-xs text-slate-400 mb-1">
            Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{question.userAnswer}</span>
          </div>

          {/* Correct Answer (only show if wrong) */}
          {!isCorrect && (
            <div className="text-xs text-slate-400">
              Correct answer: <span className="text-green-400">{question.correctAnswer}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
