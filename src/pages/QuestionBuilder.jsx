import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Trash2, Play, Home, Download, Upload, Pencil } from 'lucide-react';
import Button from '../components/Button';
import { playSound } from '../utils/sounds';
import {
  defaultEmojiQuestions,
  defaultFunctionQuestions,
  defaultThisOrThatQuestions,
  defaultRapidFireQuestions,
} from '../data/customQuestions';

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
// Round 1: Emoji-based Identification builder
// ──────────────────────────────────────────────────────────
function EmojiBuilder({ data, onChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ emoji: '', answer: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const add = () => {
    setForm({ emoji: '', answer: '' });
    setEditing('new');
  };

  const startEdit = (i) => {
    setForm({ emoji: data[i].emoji, answer: data[i].answer });
    setEditing(i);
  };

  const saveEdit = () => {
    if (!form.emoji.trim() || !form.answer.trim()) return;
    
    if (editing === 'new') {
      onChange([...data, { emoji: form.emoji, answer: form.answer }]);
    } else {
      const updated = [...data];
      updated[editing] = { emoji: form.emoji, answer: form.answer };
      onChange(updated);
    }
    setEditing(null);
    setForm({ emoji: '', answer: '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ emoji: '', answer: '' });
  };

  const remove = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
  };

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">Emoji-based identification questions. Students see the emoji clue and type their answer.</p>
      
      {/* Edit Form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass rounded-xl p-4 border border-indigo-500/40">
              <p className="text-xs font-bold text-indigo-300 mb-3">
                {editing === 'new' ? '➕ Add Emoji Question' : '✏️ Edit Question'}
              </p>
              <Input 
                label="Emoji Clue" 
                placeholder="e.g. 💉💦🦷" 
                value={form.emoji} 
                onChange={v => setForm(f => ({ ...f, emoji: v }))} 
              />
              <Input 
                label="Answer" 
                placeholder="e.g. Irrigation Syringe" 
                value={form.answer} 
                onChange={v => setForm(f => ({ ...f, answer: v }))} 
              />
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={saveEdit}>Save</Button>
                <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question List */}
      {data.map((q, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5 group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-xs text-indigo-400 font-bold">Question {i + 1}</span>
              <div className="text-3xl my-2">{q.emoji}</div>
              <p className="text-white text-sm">Answer: <span className="font-bold">{q.answer}</span></p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => startEdit(i)} 
                className="w-7 h-7 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 flex items-center justify-center text-indigo-300"
                title="Edit"
              >
                <Pencil size={12} />
              </button>
              <button 
                onClick={() => setConfirmDelete(i)} 
                className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      
      {editing === null && (
        <Button onClick={add} variant="secondary" size="sm" icon={<Plus size={14} />}>
          Add Emoji Question
        </Button>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 max-w-sm w-full border border-red-500/30"
            >
              <p className="text-white text-sm mb-4">Are you sure you want to delete this question?</p>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={() => remove(confirmDelete)}>Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 2: MCQ with 4 options builder
// ──────────────────────────────────────────────────────────
function FunctionMCQBuilder({ data, onChange }) {
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
      <p className="text-xs text-slate-500 mb-4">Multiple choice questions with 4 options.</p>
      {data.map((q, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-400 font-bold">Question {i + 1}</span>
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
          <Input placeholder="Explanation (optional)" value={q.explanation} onChange={v => update(i, 'explanation', v)} />
        </motion.div>
      ))}
      <Button onClick={add} variant="secondary" size="sm" icon={<Plus size={14} />}>Add Question</Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 3: This or That builder (2 options)
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
      <p className="text-xs text-slate-500 mb-4">This or That questions with 2 options.</p>
      {data.map((q, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cyan-400 font-bold">Question {i + 1}</span>
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
  // Initialize with preloaded Endodontic Champion questions
  const [emojiQuestions, setEmojiQuestions] = useState(() => [...defaultEmojiQuestions]);
  const [functionMCQ, setFunctionMCQ] = useState(() => [...defaultFunctionQuestions]);
  const [thisOrThat, setThisOrThat] = useState(() => [...defaultThisOrThatQuestions]);
  const [rapidFire, setRapidFire] = useState(() => [...defaultRapidFireQuestions]);

  const handleStart = () => {
    // Pass emoji questions as 'images' to maintain compatibility with game flow
    onStart({ 
      images: emojiQuestions,  // Emoji-based questions for Round 1
      mcq: functionMCQ,        // Function MCQ for Round 2
      thisOrThat,              // This or That for Round 3
      riddles: [],             // Empty - Round 4 uses Rapid Fire instead
      rapidFire,               // Rapid Fire for Round 4 (not Round 5)
    });
  };

  const exportJSON = () => {
    const data = { emojiQuestions, functionMCQ, thisOrThat, rapidFire };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'endodontic-custom.json'; a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.emojiQuestions) setEmojiQuestions(data.emojiQuestions);
        if (data.functionMCQ) setFunctionMCQ(data.functionMCQ);
        if (data.thisOrThat) setThisOrThat(data.thisOrThat);
        if (data.rapidFire) setRapidFire(data.rapidFire);
      } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  };

  const totalQ = emojiQuestions.length + functionMCQ.length + thisOrThat.length + rapidFire.length;

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
            <h2 className="text-4xl font-black gradient-text">✏️ Custom Game Builder</h2>
            <p className="text-slate-400 text-sm">Endodontic Champion — Pre-loaded with endodontic instrument questions. Edit, delete, or add more.</p>
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
        <Section title="Round 1 – Identify the Instrument Through Emojis" emoji="🖼️" color="border-indigo-500/30" defaultOpen>
          <EmojiBuilder data={emojiQuestions} onChange={setEmojiQuestions} />
        </Section>
        <Section title="Round 2 – Identify the Instrument Through Function" emoji="⚖️" color="border-purple-500/30">
          <FunctionMCQBuilder data={functionMCQ} onChange={setFunctionMCQ} />
        </Section>
        <Section title="Round 3 – This or That" emoji="🧩" color="border-cyan-500/30">
          <ThisOrThatBuilder data={thisOrThat} onChange={setThisOrThat} />
        </Section>
        <Section title="Round 4 – Rapid Fire" emoji="⚡" color="border-green-500/30">
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
              <span className="text-white font-bold">{totalQ}</span> questions loaded · Round 5 will use admin bank
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
