import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Lightbulb, CheckCircle, ChevronRight, RotateCcw } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';

export default function Round1Crossword({ crosswordData, onComplete, totalScore }) {
  const { grid, words } = crosswordData;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // userGrid tracks typed letters
  const [userGrid, setUserGrid] = useState(() =>
    Array.from({ length: rows }, () => Array(cols).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [direction, setDirection] = useState('across');
  const [checkedWords, setCheckedWords] = useState({}); // wordNum -> 'correct'|'wrong'
  const [showHints, setShowHints] = useState(true);
  const [roundScore, setRoundScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState(new Set());

  const inputRef = useRef(null);

  // Build a cell-to-word mapping
  const cellWords = useCallback(() => {
    const map = {};
    words.forEach(w => {
      for (let i = 0; i < w.word.length; i++) {
        const r = w.direction === 'down' ? w.row + i : w.row;
        const c = w.direction === 'across' ? w.col + i : w.col;
        const key = `${r},${c}`;
        if (!map[key]) map[key] = [];
        map[key].push(w);
      }
    });
    return map;
  }, [words]);

  const cMap = cellWords();

  const selectCell = (row, col) => {
    if (grid[row]?.[col] === null) return;
    const key = `${row},${col}`;
    const ws = cMap[key] || [];
    if (!ws.length) return;

    // If same cell clicked, toggle direction
    if (selectedCell?.r === row && selectedCell?.c === col) {
      const next = direction === 'across' ? 'down' : 'across';
      setDirection(next);
      const w = ws.find(x => x.direction === next) || ws[0];
      setSelectedWord(w);
    } else {
      setSelectedCell({ r: row, c: col });
      const prefer = ws.find(x => x.direction === direction) || ws[0];
      setSelectedWord(prefer);
      setDirection(prefer.direction);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = useCallback((e) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newGrid = userGrid.map(row => [...row]);
      if (newGrid[r][c]) {
        newGrid[r][c] = '';
        setUserGrid(newGrid);
      } else {
        // Move back
        const prev = direction === 'across' ? { r, c: c - 1 } : { r: r - 1, c };
        if (prev.r >= 0 && prev.c >= 0 && grid[prev.r]?.[prev.c] !== null) {
          setSelectedCell(prev);
          const newG2 = userGrid.map(row => [...row]);
          newG2[prev.r][prev.c] = '';
          setUserGrid(newG2);
        }
      }
      return;
    }

    if (e.key === 'ArrowRight') { setDirection('across'); return; }
    if (e.key === 'ArrowDown') { setDirection('down'); return; }
    if (e.key === 'ArrowLeft') { const prev = { r, c: c - 1 }; if (prev.c >= 0 && grid[r]?.[prev.c] !== null) setSelectedCell(prev); return; }
    if (e.key === 'ArrowUp') { const prev = { r: r - 1, c }; if (prev.r >= 0 && grid[prev.r]?.[c] !== null) setSelectedCell(prev); return; }
    if (e.key === 'Tab') { e.preventDefault(); setDirection(d => d === 'across' ? 'down' : 'across'); return; }

    if (/^[a-zA-Z]$/.test(e.key)) {
      const letter = e.key.toUpperCase();
      const newGrid = userGrid.map(row => [...row]);
      newGrid[r][c] = letter;
      setUserGrid(newGrid);
      // Auto-advance
      const next = direction === 'across' ? { r, c: c + 1 } : { r: r + 1, c };
      if (next.r < rows && next.c < cols && grid[next.r]?.[next.c] !== null) {
        setSelectedCell(next);
      }
    }
  }, [selectedCell, direction, userGrid, grid, rows, cols]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const checkWord = (w) => {
    let correct = true;
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === 'down' ? w.row + i : w.row;
      const c = w.direction === 'across' ? w.col + i : w.col;
      if (userGrid[r]?.[c] !== w.word[i]) { correct = false; break; }
    }
    return correct;
  };

  const handleAutoCheck = () => {
    const newChecked = { ...checkedWords };
    let newScore = 0;
    words.forEach(w => {
      if (!newChecked[w.number]) {
        if (checkWord(w)) {
          newChecked[w.number] = 'correct';
          newScore += 10;
          playSound('correct');
        }
      }
    });
    setCheckedWords(newChecked);
    setRoundScore(prev => prev + newScore);
  };

  const revealLetter = () => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const letter = grid[r][c];
    if (!letter) return;
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = letter;
    setUserGrid(newGrid);
    setRevealedLetters(prev => new Set([...prev, `${r},${c}`]));
    playSound('click');
  };

  const revealWord = () => {
    if (!selectedWord) return;
    const newGrid = userGrid.map(row => [...row]);
    const newRevealed = new Set(revealedLetters);
    for (let i = 0; i < selectedWord.word.length; i++) {
      const r = selectedWord.direction === 'down' ? selectedWord.row + i : selectedWord.row;
      const c = selectedWord.direction === 'across' ? selectedWord.col + i : selectedWord.col;
      newGrid[r][c] = selectedWord.word[i];
      newRevealed.add(`${r},${c}`);
    }
    setUserGrid(newGrid);
    setRevealedLetters(newRevealed);
    playSound('click');
  };

  const handleFinish = () => {
    handleAutoCheck();
    let finalScore = 0;
    words.forEach(w => {
      if (checkedWords[w.number] === 'correct' || checkWord(w)) finalScore += 10;
    });
    setCompleted(true);
    setConfetti(true);
    playSound('complete');
    setTimeout(() => onComplete(finalScore), 2500);
  };

  const isCellInSelectedWord = (r, c) => {
    if (!selectedWord) return false;
    for (let i = 0; i < selectedWord.word.length; i++) {
      const wr = selectedWord.direction === 'down' ? selectedWord.row + i : selectedWord.row;
      const wc = selectedWord.direction === 'across' ? selectedWord.col + i : selectedWord.col;
      if (wr === r && wc === c) return true;
    }
    return false;
  };

  const getCellStatus = (r, c) => {
    const key = `${r},${c}`;
    for (const w of words) {
      if (checkedWords[w.number]) {
        for (let i = 0; i < w.word.length; i++) {
          const wr = w.direction === 'down' ? w.row + i : w.row;
          const wc = w.direction === 'across' ? w.col + i : w.col;
          if (wr === r && wc === c) return checkedWords[w.number];
        }
      }
    }
    return null;
  };

  const getCellNumber = (r, c) => {
    const w = words.find(w => w.row === r && w.col === c);
    return w?.number;
  };

  const isRevealed = (r, c) => revealedLetters.has(`${r},${c}`);

  const solvedCount = words.filter(w => checkedWords[w.number] === 'correct').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-12 px-4"
    >
      <Confetti trigger={confetti} type="burst" />

      <div className="max-w-6xl mx-auto">
        <ProgressBar currentRound={1} />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black gradient-text">🔤 Round 1</h2>
            <p className="text-slate-400 text-sm">Dental Crossword — {solvedCount}/{words.length} words solved</p>
          </div>
          <div className="flex gap-3">
            <ScoreDisplay score={roundScore} label="Round" />
            <ScoreDisplay score={totalScore} label="Total" highlight />
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar mb-6 w-full">
          <motion.div
            className="progress-fill"
            animate={{ width: `${(solvedCount / words.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Crossword Grid */}
          <div className="flex-1">
            {/* Hidden input for mobile */}
            <input
              ref={inputRef}
              className="opacity-0 absolute pointer-events-none"
              onKeyDown={(e) => handleKeyDown(e)}
              readOnly
            />

            <div className="glass rounded-2xl p-4 overflow-auto">
              <div
                className="inline-grid gap-px"
                style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    if (cell === null) {
                      return <div key={`${r}-${c}`} style={{ width: 40, height: 40 }} />;
                    }
                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                    const inWord = isCellInSelectedWord(r, c);
                    const status = getCellStatus(r, c);
                    const cellNum = getCellNumber(r, c);
                    const revealed = isRevealed(r, c);

                    return (
                      <motion.div
                        key={`${r}-${c}`}
                        onClick={() => selectCell(r, c)}
                        whileHover={{ scale: 1.05 }}
                        className={`crossword-cell
                          ${isSelected ? 'active ring-2 ring-indigo-500' : ''}
                          ${inWord && !isSelected ? 'bg-indigo-500/10 border-indigo-500/40' : ''}
                          ${status === 'correct' ? 'correct' : ''}
                          ${status === 'wrong' ? 'wrong' : ''}
                          ${revealed ? 'border-yellow-500/50 text-yellow-400' : ''}
                        `}
                      >
                        {cellNum && (
                          <span className="cell-number">{cellNum}</span>
                        )}
                        <span className={`
                          ${status === 'correct' ? 'text-green-400' : ''}
                          ${status === 'wrong' ? 'text-red-400' : ''}
                          ${revealed ? 'text-yellow-400' : 'text-white'}
                          ${!status && !revealed ? 'text-white' : ''}
                        `}>
                          {userGrid[r]?.[c] || ''}
                        </span>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={revealLetter} variant="secondary" size="sm" icon={<Eye size={14} />}>
                Reveal Letter
              </Button>
              <Button onClick={revealWord} variant="secondary" size="sm" icon={<Lightbulb size={14} />}>
                Reveal Word
              </Button>
              <Button onClick={handleAutoCheck} variant="secondary" size="sm" icon={<CheckCircle size={14} />}>
                Auto Check
              </Button>
              <Button onClick={handleFinish} variant="gradient" size="sm" icon={<ChevronRight size={14} />} sound="complete">
                Finish Round
              </Button>
            </div>
          </div>

          {/* Hints Panel */}
          <div className="lg:w-72">
            <button
              onClick={() => setShowHints(h => !h)}
              className="w-full glass rounded-xl p-3 flex items-center justify-between mb-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>💡 Clues & Hints</span>
              <span>{showHints ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass rounded-xl p-4 max-h-96 overflow-y-auto space-y-2">
                    {/* Across */}
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Across</div>
                    {words.filter(w => w.direction === 'across').map(w => (
                      <HintItem
                        key={w.number}
                        w={w}
                        checked={checkedWords[w.number]}
                        active={selectedWord?.number === w.number}
                        onClick={() => { setSelectedWord(w); setDirection('across'); setSelectedCell({ r: w.row, c: w.col }); }}
                      />
                    ))}
                    {/* Down */}
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mt-3 mb-2">Down</div>
                    {words.filter(w => w.direction === 'down').map(w => (
                      <HintItem
                        key={w.number}
                        w={w}
                        checked={checkedWords[w.number]}
                        active={selectedWord?.number === w.number}
                        onClick={() => { setSelectedWord(w); setDirection('down'); setSelectedCell({ r: w.row, c: w.col }); }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Completion overlay */}
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
                <p className="text-slate-400 mb-4">You solved {solvedCount} out of {words.length} words</p>
                <div className="text-4xl font-black text-white">+{roundScore} pts</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function HintItem({ w, checked, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2 rounded-lg text-xs transition-all duration-200
        ${active ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5'}
        ${checked === 'correct' ? 'opacity-50 line-through' : ''}
      `}
    >
      <span className={`font-bold mr-1 ${active ? 'text-indigo-400' : 'text-slate-400'}`}>{w.number}.</span>
      <span className="text-slate-300">{w.hint}</span>
      {checked === 'correct' && <span className="ml-1 text-green-400">✓</span>}
    </button>
  );
}
