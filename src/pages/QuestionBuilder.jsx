import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Trash2, Play, Home, Download, Upload } from 'lucide-react';
import Button from '../components/Button';
import { playSound } from '../utils/sounds';

// ──────────────────────────────────────────────────────────
// Helper: Collapsible Section
// ──────────────────────────────────────────────────────────
function Section({ title, emoji, color, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`glass rounded-2xl border ${color} overflow-hidden mb-4`}>
      <button
        onClick={() => { setOpen(o => !o); playSound('click'); }}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-white flex items-center gap-2 text-lg">
          <span>{emoji}</span> {title}
        </span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-white/10">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-xs text-slate-400 mb-1 font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-xs text-slate-400 mb-1 font-medium">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 1: Crossword builder
// ──────────────────────────────────────────────────────────
function CrosswordBuilder({ data, onChange }) {
  const addWord = () => onChange([...data, { answer: '', hint: '' }]);
  const removeWord = i => onChange(data.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = [...data];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">Add 5–12 dental words. The crossword will be auto-generated.</p>
      {data.map((w, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-indigo-400 font-bold">Word {i + 1}</span>
            <button onClick={() => removeWord(i)} className="ml-auto text-red-400 hover:text-red-300">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Answer (e.g. ENAMEL)" value={w.answer} onChange={v => update(i, 'answer', v.toUpperCase())} />
            <Input placeholder="Hint / Clue" value={w.hint} onChange={v => update(i, 'hint', v)} />
          </div>
        </motion.div>
      ))}
      <Button onClick={addWord} variant="secondary" size="sm" icon={<Plus size={14} />}>
        Add Word
      </Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 2: This or That builder
// ──────────────────────────────────────────────────────────
function ThisOrThatBuilder({ data, onChange }) {
  const add = () => onChange([...data, { question: '', optionA: '', optionB: '', correct: 'A', explanation: '' }]);
  const remove = i => onChange(data.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = [...data];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div>
      {data.map((q, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-400 font-bold">Question {i + 1}</span>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
          </div>
          <Input placeholder="Question" value={q.question} onChange={v => update(i, 'question', v)} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Option A" value={q.optionA} onChange={v => update(i, 'optionA', v)} />
            <Input placeholder="Option B" value={q.optionB} onChange={v => update(i, 'optionB', v)} />
          </div>
          <Select label="Correct Answer" value={q.correct} onChange={v => update(i, 'correct', v)}
            options={[{ value: 'A', label: 'Option A' }, { value: 'B', label: 'Option B' }]} />
          <Input placeholder="Explanation (optional)" value={q.explanation} onChange={v => update(i, 'explanation', v)} />
        </motion.div>
      ))}
      <Button onClick={add} variant="secondary" size="sm" icon={<Plus size={14} />}>Add Question</Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 3: Riddles builder
// ──────────────────────────────────────────────────────────
function RiddleBuilder({ data, onChange }) {
  const add = () => onChange([...data, { riddle: '', answer: '', hint: '' }]);
  const remove = i => onChange(data.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = [...data];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div>
      {data.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cyan-400 font-bold">Riddle {i + 1}</span>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
          </div>
          <Input placeholder="Riddle text" value={r.riddle} onChange={v => update(i, 'riddle', v)} />
          <Input placeholder="Answer" value={r.answer} onChange={v => update(i, 'answer', v)} />
          <Input placeholder="Hint (optional)" value={r.hint} onChange={v => update(i, 'hint', v)} />
        </motion.div>
      ))}
      <Button onClick={add} variant="secondary" size="sm" icon={<Plus size={14} />}>Add Riddle</Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 4: MCQ builder
// ──────────────────────────────────────────────────────────
function MCQBuilder({ data, onChange }) {
  const add = () => onChange([...data, { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]);
  const remove = i => onChange(data.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = [...data];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };
  const updateOption = (i, optIdx, val) => {
    const updated = [...data];
    updated[i].options[optIdx] = val;
    onChange(updated);
  };

  return (
    <div>
      {data.map((q, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-400 font-bold">MCQ {i + 1}</span>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
          </div>
          <Input placeholder="Question" value={q.question} onChange={v => update(i, 'question', v)} />
          <div className="grid grid-cols-2 gap-2">
            {['A', 'B', 'C', 'D'].map((l, oi) => (
              <Input key={oi} placeholder={`Option ${l}`} value={q.options[oi]} onChange={v => updateOption(i, oi, v)} />
            ))}
          </div>
          <Select label="Correct Option" value={q.correct} onChange={v => update(i, 'correct', parseInt(v))}
            options={[0,1,2,3].map(n => ({ value: n, label: `Option ${'ABCD'[n]}` }))} />
          <Input placeholder="Explanation" value={q.explanation} onChange={v => update(i, 'explanation', v)} />
        </motion.div>
      ))}
      <Button onClick={add} variant="secondary" size="sm" icon={<Plus size={14} />}>Add MCQ</Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 5: Rapid Fire builder
// ──────────────────────────────────────────────────────────
function RapidFireBuilder({ data, onChange }) {
  const add = () => onChange([...data, { question: '', answer: '', timeLimit: 10 }]);
  const remove = i => onChange(data.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = [...data];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div>
      {data.map((q, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-yellow-400 font-bold">Q{i + 1}</span>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Question" value={q.question} onChange={v => update(i, 'question', v)} className="col-span-2" />
            <Input placeholder="Time (s)" value={q.timeLimit} type="number" onChange={v => update(i, 'timeLimit', parseInt(v) || 10)} />
          </div>
          <Input placeholder="Answer" value={q.answer} onChange={v => update(i, 'answer', v)} />
        </motion.div>
      ))}
      <Button onClick={add} variant="secondary" size="sm" icon={<Plus size={14} />}>Add Question</Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Builder Page
// ──────────────────────────────────────────────────────────
export default function QuestionBuilder({ onStart, onHome }) {
  const [crosswordWords, setCrosswordWords] = useState([
    { answer: 'ENAMEL', hint: 'Hardest tissue in the human body' },
    { answer: 'DENTIN', hint: 'Yellow tissue beneath enamel' },
    { answer: 'PULP', hint: 'Vascular core of tooth' },
  ]);
  const [thisOrThat, setThisOrThat] = useState([]);
  const [riddles, setRiddles] = useState([]);
  const [mcq, setMcq] = useState([]);
  const [rapidFire, setRapidFire] = useState([]);

  const handleStart = () => {
    onStart({ crosswordWords, thisOrThat, riddles, mcq, rapidFire });
  };

  const exportJSON = () => {
    const data = { crosswordWords, thisOrThat, riddles, mcq, rapidFire };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'quiz-custom.json'; a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.crosswordWords) setCrosswordWords(data.crosswordWords);
        if (data.thisOrThat) setThisOrThat(data.thisOrThat);
        if (data.riddles) setRiddles(data.riddles);
        if (data.mcq) setMcq(data.mcq);
        if (data.rapidFire) setRapidFire(data.rapidFire);
      } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  };

  const totalQ = crosswordWords.length + thisOrThat.length + riddles.length + mcq.length + rapidFire.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-20 pb-12 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-black gradient-text">✏️ Question Builder</h2>
            <p className="text-slate-400 text-sm">Customize questions for each round. Empty rounds use random dental questions.</p>
          </div>
          <Button onClick={onHome} variant="secondary" size="sm" icon={<Home size={14} />}>Home</Button>
        </div>

        {/* Import/Export */}
        <div className="flex gap-3 mb-6">
          <Button onClick={exportJSON} variant="secondary" size="sm" icon={<Download size={14} />}>Export JSON</Button>
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            <span className="flex items-center gap-2 glass glass-hover border border-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
              <Upload size={14} /> Import JSON
            </span>
          </label>
        </div>

        {/* Sections */}
        <Section title="Round 1 – Crossword" emoji="🔤" color="border-indigo-500/30" defaultOpen>
          <CrosswordBuilder data={crosswordWords} onChange={setCrosswordWords} />
        </Section>
        <Section title="Round 2 – This or That" emoji="⚖️" color="border-purple-500/30">
          <ThisOrThatBuilder data={thisOrThat} onChange={setThisOrThat} />
        </Section>
        <Section title="Round 3 – Riddles" emoji="🧩" color="border-cyan-500/30">
          <RiddleBuilder data={riddles} onChange={setRiddles} />
        </Section>
        <Section title="Round 4 – MCQ" emoji="📝" color="border-green-500/30">
          <MCQBuilder data={mcq} onChange={setMcq} />
        </Section>
        <Section title="Round 5 – Rapid Fire" emoji="⚡" color="border-yellow-500/30">
          <RapidFireBuilder data={rapidFire} onChange={setRapidFire} />
        </Section>

        {/* Start */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="sticky bottom-4 mt-6"
        >
          <div className="glass rounded-2xl p-4 flex items-center justify-between border border-indigo-500/30">
            <div className="text-sm text-slate-400">
              <span className="text-white font-bold">{totalQ}</span> custom questions · empty rounds use random dental questions
            </div>
            <Button onClick={handleStart} variant="gradient" size="md" icon={<Play size={16} />} sound="start">
              Start Game
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
