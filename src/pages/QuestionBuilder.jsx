import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Trash2, Play, Home, Pencil, Check, X } from 'lucide-react';
import { playSound } from '../utils/sounds';
import {
  defaultEmojiQuestions,
  defaultFunctionQuestions,
  defaultThisOrThatQuestions,
  defaultRapidFireQuestions,
  defaultRiddleQuestions,
} from '../data/customQuestions';

// ──────────────────────────────────────────────────────────
// Helper: Collapsible Round Section with Toggle
// ──────────────────────────────────────────────────────────
function RoundSection({ title, emoji, roundKey, enabled, onToggle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className={`glass rounded-2xl border ${enabled ? 'border-indigo-500/30' : 'border-slate-600/30'} overflow-hidden mb-4`}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={() => { setOpen(o => !o); playSound('click'); }}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1">
            <div className="font-bold text-white text-lg">{title}</div>
          </div>
          {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        <button
          onClick={() => { onToggle(roundKey); playSound('click'); }}
          className={`ml-3 w-12 h-6 rounded-full transition-all ${enabled ? 'bg-indigo-500' : 'bg-slate-600'} relative flex items-center`}
        >
          <motion.div
            animate={{ x: enabled ? 24 : 2 }}
            className="w-5 h-5 rounded-full bg-white"
          />
        </button>
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {!enabled && (
                <div className="text-sm text-slate-500 text-center py-8">
                  This round is disabled. Enable it to configure questions.
                </div>
              )}
              {enabled && children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 1: Emoji/Image Mode Selector + Question Builder
// ──────────────────────────────────────────────────────────
function Round1Builder({ data, onChange, mode, onModeChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ emoji: '', image1: '', image2: '', answer: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const add = () => {
    setForm({ emoji: '', image1: '', image2: '', answer: '' });
    setEditing('new');
  };

  const startEdit = (i) => {
    if (mode === 'emoji') {
      setForm({ emoji: data[i].emoji, answer: data[i].answer, image1: '', image2: '' });
    } else {
      setForm({ 
        emoji: '', 
        answer: data[i].answer, 
        image1: data[i].image1 || '', 
        image2: data[i].image2 || '' 
      });
    }
    setEditing(i);
  };

  const saveEdit = () => {
    if (!form.answer.trim()) return;
    
    if (mode === 'emoji' && !form.emoji.trim()) return;
    if (mode === 'image' && (!form.image1.trim() || !form.image2.trim())) return;

    const newQ = mode === 'emoji' 
      ? { emoji: form.emoji, answer: form.answer }
      : { image1: form.image1, image2: form.image2, answer: form.answer };

    if (editing === 'new') {
      onChange([...data, newQ]);
    } else {
      onChange(data.map((q, i) => i === editing ? newQ : q));
    }
    setEditing(null);
    setForm({ emoji: '', image1: '', image2: '', answer: '' });
    playSound('success');
  };

  const deleteQ = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
    playSound('click');
  };

  return (
    <div>
      {/* Mode Selector */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { onModeChange('emoji'); playSound('click'); }}
          className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            mode === 'emoji' 
              ? 'bg-indigo-500 text-white' 
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          💉 Emoji Mode
        </button>
        <button
          onClick={() => { onModeChange('image'); playSound('click'); }}
          className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            mode === 'image' 
              ? 'bg-indigo-500 text-white' 
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          🖼️ Image Mode
        </button>
      </div>

      {/* Question List */}
      <div className="space-y-2 mb-4">
        {data.map((q, i) => (
          <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1">
              {mode === 'emoji' && <div className="text-2xl mb-1">{q.emoji}</div>}
              {mode === 'image' && <div className="text-xs text-slate-500 mb-1">🖼️ {q.image1} / {q.image2}</div>}
              <div className="text-sm font-semibold text-white">{q.answer}</div>
            </div>
            <button
              onClick={() => startEdit(i)}
              className="w-8 h-8 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(i)}
              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-indigo-500/30"
          >
            <div className="text-sm font-semibold text-white mb-3">
              {editing === 'new' ? 'Add Question' : 'Edit Question'}
            </div>
            
            {mode === 'emoji' && (
              <input
                type="text"
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                placeholder="Enter emojis (e.g., 💉💦🦷)"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
              />
            )}
            
            {mode === 'image' && (
              <>
                <input
                  type="text"
                  value={form.image1}
                  onChange={e => setForm(f => ({ ...f, image1: e.target.value }))}
                  placeholder="Image 1 path (e.g., imgq1a.jpg)"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
                />
                <input
                  type="text"
                  value={form.image2}
                  onChange={e => setForm(f => ({ ...f, image2: e.target.value }))}
                  placeholder="Image 2 path (e.g., imgq1b.jpg)"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
                />
              </>
            )}
            
            <input
              type="text"
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Answer"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => { setEditing(null); setForm({ emoji: '', image1: '', image2: '', answer: '' }); }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-red-500/30"
          >
            <div className="text-sm text-white mb-3">Delete this question?</div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteQ(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <button
        onClick={add}
        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-600 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 2: Function MCQ Builder
// ──────────────────────────────────────────────────────────
function Round2Builder({ data, onChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct: 0 });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const add = () => {
    setForm({ question: '', options: ['', '', '', ''], correct: 0 });
    setEditing('new');
  };

  const startEdit = (i) => {
    setForm({
      question: data[i].question,
      options: [...data[i].options],
      correct: data[i].correct,
    });
    setEditing(i);
  };

  const saveEdit = () => {
    if (!form.question.trim() || form.options.some(o => !o.trim())) return;

    const newQ = {
      question: form.question,
      options: form.options,
      correct: form.correct,
      explanation: '',
    };

    if (editing === 'new') {
      onChange([...data, newQ]);
    } else {
      onChange(data.map((q, i) => i === editing ? newQ : q));
    }
    setEditing(null);
    setForm({ question: '', options: ['', '', '', ''], correct: 0 });
    playSound('success');
  };

  const deleteQ = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
    playSound('click');
  };

  return (
    <div>
      {/* Question List */}
      <div className="space-y-2 mb-4">
        {data.map((q, i) => (
          <div key={i} className="glass rounded-xl p-3">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <div className="text-sm font-semibold text-white mb-2">{q.question}</div>
                <div className="text-xs text-green-400">✓ {q.options[q.correct]}</div>
              </div>
              <button
                onClick={() => startEdit(i)}
                className="w-8 h-8 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(i)}
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-indigo-500/30"
          >
            <div className="text-sm font-semibold text-white mb-3">
              {editing === 'new' ? 'Add Question' : 'Edit Question'}
            </div>
            
            <textarea
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Question"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3 h-20 resize-none"
            />
            
            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...form.options];
                    newOpts[i] = e.target.value;
                    setForm(f => ({ ...f, options: newOpts }));
                  }}
                  placeholder={`Option ${'ABCD'[i]}`}
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => setForm(f => ({ ...f, correct: i }))}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                    form.correct === i 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {form.correct === i ? '✓' : 'ABCD'[i]}
                </button>
              </div>
            ))}
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => { setEditing(null); setForm({ question: '', options: ['', '', '', ''], correct: 0 }); }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-red-500/30"
          >
            <div className="text-sm text-white mb-3">Delete this question?</div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteQ(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <button
        onClick={add}
        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-600 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 3: This or That Builder
// ──────────────────────────────────────────────────────────
function Round3Builder({ data, onChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', optionA: '', optionB: '', correct: 'A' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const add = () => {
    setForm({ question: '', optionA: '', optionB: '', correct: 'A' });
    setEditing('new');
  };

  const startEdit = (i) => {
    setForm({
      question: data[i].question,
      optionA: data[i].optionA,
      optionB: data[i].optionB,
      correct: data[i].correct,
    });
    setEditing(i);
  };

  const saveEdit = () => {
    if (!form.question.trim() || !form.optionA.trim() || !form.optionB.trim()) return;

    const newQ = {
      question: form.question,
      optionA: form.optionA,
      optionB: form.optionB,
      correct: form.correct,
      explanation: '',
    };

    if (editing === 'new') {
      onChange([...data, newQ]);
    } else {
      onChange(data.map((q, i) => i === editing ? newQ : q));
    }
    setEditing(null);
    setForm({ question: '', optionA: '', optionB: '', correct: 'A' });
    playSound('success');
  };

  const deleteQ = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
    playSound('click');
  };

  return (
    <div>
      {/* Question List */}
      <div className="space-y-2 mb-4">
        {data.map((q, i) => (
          <div key={i} className="glass rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-white mb-2">{q.question}</div>
                <div className="text-xs text-slate-400 mb-1">A: {q.optionA} | B: {q.optionB}</div>
                <div className="text-xs text-green-400">✓ {q.correct === 'A' ? q.optionA : q.optionB}</div>
              </div>
              <button
                onClick={() => startEdit(i)}
                className="w-8 h-8 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(i)}
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-indigo-500/30"
          >
            <div className="text-sm font-semibold text-white mb-3">
              {editing === 'new' ? 'Add Question' : 'Edit Question'}
            </div>
            
            <textarea
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Question"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3 h-20 resize-none"
            />
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={form.optionA}
                onChange={e => setForm(f => ({ ...f, optionA: e.target.value }))}
                placeholder="Option A"
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={() => setForm(f => ({ ...f, correct: 'A' }))}
                className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                  form.correct === 'A' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {form.correct === 'A' ? '✓' : 'A'}
              </button>
            </div>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={form.optionB}
                onChange={e => setForm(f => ({ ...f, optionB: e.target.value }))}
                placeholder="Option B"
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={() => setForm(f => ({ ...f, correct: 'B' }))}
                className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                  form.correct === 'B' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {form.correct === 'B' ? '✓' : 'B'}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => { setEditing(null); setForm({ question: '', optionA: '', optionB: '', correct: 'A' }); }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-red-500/30"
          >
            <div className="text-sm text-white mb-3">Delete this question?</div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteQ(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <button
        onClick={add}
        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-600 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 4: Rapid Fire Builder
// ──────────────────────────────────────────────────────────
function Round4Builder({ data, onChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const add = () => {
    setForm({ question: '', answer: '' });
    setEditing('new');
  };

  const startEdit = (i) => {
    setForm({ question: data[i].question, answer: data[i].answer });
    setEditing(i);
  };

  const saveEdit = () => {
    if (!form.question.trim() || !form.answer.trim()) return;

    const newQ = {
      question: form.question,
      answer: form.answer,
      timeLimit: 10,
    };

    if (editing === 'new') {
      onChange([...data, newQ]);
    } else {
      onChange(data.map((q, i) => i === editing ? newQ : q));
    }
    setEditing(null);
    setForm({ question: '', answer: '' });
    playSound('success');
  };

  const deleteQ = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
    playSound('click');
  };

  return (
    <div>
      {/* Question List */}
      <div className="space-y-2 mb-4">
        {data.map((q, i) => (
          <div key={i} className="glass rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-white mb-1">{q.question}</div>
                <div className="text-xs text-green-400">✓ {q.answer}</div>
              </div>
              <button
                onClick={() => startEdit(i)}
                className="w-8 h-8 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(i)}
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-indigo-500/30"
          >
            <div className="text-sm font-semibold text-white mb-3">
              {editing === 'new' ? 'Add Question' : 'Edit Question'}
            </div>
            
            <textarea
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Question"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3 h-20 resize-none"
            />
            
            <input
              type="text"
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Answer"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => { setEditing(null); setForm({ question: '', answer: '' }); }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-red-500/30"
          >
            <div className="text-sm text-white mb-3">Delete this question?</div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteQ(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <button
        onClick={add}
        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-600 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Round 5: Riddle Builder
// ──────────────────────────────────────────────────────────
function Round5Builder({ data, onChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ riddle: '', answer: '', hint: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const add = () => {
    setForm({ riddle: '', answer: '', hint: '' });
    setEditing('new');
  };

  const startEdit = (i) => {
    setForm({ riddle: data[i].riddle, answer: data[i].answer, hint: data[i].hint || '' });
    setEditing(i);
  };

  const saveEdit = () => {
    if (!form.riddle.trim() || !form.answer.trim()) return;

    const newQ = {
      riddle: form.riddle,
      answer: form.answer,
      hint: form.hint || '',
    };

    if (editing === 'new') {
      onChange([...data, newQ]);
    } else {
      onChange(data.map((q, i) => i === editing ? newQ : q));
    }
    setEditing(null);
    setForm({ riddle: '', answer: '', hint: '' });
    playSound('success');
  };

  const deleteQ = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
    playSound('click');
  };

  return (
    <div>
      {/* Question List */}
      <div className="space-y-2 mb-4">
        {data.map((q, i) => (
          <div key={i} className="glass rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-white mb-1">{q.riddle}</div>
                <div className="text-xs text-green-400">✓ {q.answer}</div>
                {q.hint && <div className="text-xs text-slate-500 mt-1">💡 {q.hint}</div>}
              </div>
              <button
                onClick={() => startEdit(i)}
                className="w-8 h-8 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(i)}
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-indigo-500/30"
          >
            <div className="text-sm font-semibold text-white mb-3">
              {editing === 'new' ? 'Add Riddle' : 'Edit Riddle'}
            </div>
            
            <textarea
              value={form.riddle}
              onChange={e => setForm(f => ({ ...f, riddle: e.target.value }))}
              placeholder="Riddle (e.g., I protect the crown but I'm not a king...)"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3 h-20 resize-none"
            />
            
            <input
              type="text"
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Answer"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
            />
            
            <input
              type="text"
              value={form.hint}
              onChange={e => setForm(f => ({ ...f, hint: e.target.value }))}
              placeholder="Hint (optional)"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => { setEditing(null); setForm({ riddle: '', answer: '', hint: '' }); }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-red-500/30"
          >
            <div className="text-sm text-white mb-3">Delete this riddle?</div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteQ(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <button
        onClick={add}
        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-600 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={16} /> Add Riddle
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Question Builder Component
// ──────────────────────────────────────────────────────────
export default function QuestionBuilder({ onStart, onHome }) {
  // Round enabled/disabled states
  const [enabledRounds, setEnabledRounds] = useState({
    round1: true,
    round2: true,
    round3: true,
    round4: true,
    round5: true, // Enable Round 5 (Riddles)
  });

  // Round 1 mode: emoji or image
  const [round1Mode, setRound1Mode] = useState('emoji');

  // Question data for each round (preloaded with Endodontic Champion questions)
  const [round1Questions, setRound1Questions] = useState([...defaultEmojiQuestions]);
  const [round2Questions, setRound2Questions] = useState([...defaultFunctionQuestions]);
  const [round3Questions, setRound3Questions] = useState([...defaultThisOrThatQuestions]);
  const [round4Questions, setRound4Questions] = useState([...defaultRiddleQuestions]); // Round 4 is Riddles
  const [round5Questions, setRound5Questions] = useState([...defaultRapidFireQuestions]); // Round 5 is Rapid Fire

  const toggleRound = (roundKey) => {
    setEnabledRounds(prev => ({ ...prev, [roundKey]: !prev[roundKey] }));
  };

  const handleStart = () => {
    // Validation: at least one round must be enabled
    const anyEnabled = Object.values(enabledRounds).some(v => v);
    if (!anyEnabled) {
      alert('Please enable at least one round before starting.');
      playSound('error');
      return;
    }

    // Build the custom question set
    const custom = {
      images: round1Mode === 'emoji' 
        ? round1Questions.map(q => ({ emoji: q.emoji, answer: q.answer }))
        : round1Questions.map(q => ({ image1: q.image1, image2: q.image2, answer: q.answer })),
      mcq: round2Questions, // Round 2 is MCQ
      thisOrThat: round3Questions, // Round 3 is This or That
      riddles: round4Questions, // Round 4 is Riddles
      rapidFire: round5Questions, // Round 5 is Rapid Fire
      enabledRounds,
    };

    playSound('start');
    onStart(custom);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">Custom Game</span>
          </h1>
          <p className="text-slate-400">Configure your quiz rounds and questions</p>
        </div>

        {/* Round Sections */}
        <RoundSection
          title="Round 1 — Identify the Instrument"
          emoji="🖼️"
          roundKey="round1"
          enabled={enabledRounds.round1}
          onToggle={toggleRound}
          defaultOpen={true}
        >
          <Round1Builder
            data={round1Questions}
            onChange={setRound1Questions}
            mode={round1Mode}
            onModeChange={setRound1Mode}
          />
        </RoundSection>

        <RoundSection
          title="Round 2 — Identify Through Function (MCQ)"
          emoji="📝"
          roundKey="round2"
          enabled={enabledRounds.round2}
          onToggle={toggleRound}
        >
          <Round2Builder data={round2Questions} onChange={setRound2Questions} />
        </RoundSection>

        <RoundSection
          title="Round 3 — This or That"
          emoji="⚖️"
          roundKey="round3"
          enabled={enabledRounds.round3}
          onToggle={toggleRound}
        >
          <Round3Builder data={round3Questions} onChange={setRound3Questions} />
        </RoundSection>

        <RoundSection
          title="Round 4 — Riddle"
          emoji="🧩"
          roundKey="round4"
          enabled={enabledRounds.round4}
          onToggle={toggleRound}
        >
          <Round5Builder data={round4Questions} onChange={setRound4Questions} />
        </RoundSection>

        <RoundSection
          title="Round 5 — Rapid Fire"
          emoji="⚡"
          roundKey="round5"
          enabled={enabledRounds.round5}
          onToggle={toggleRound}
        >
          <Round4Builder data={round5Questions} onChange={setRound5Questions} />
        </RoundSection>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onHome}
            className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home size={18} /> Home
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all"
          >
            <Play size={20} /> Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
