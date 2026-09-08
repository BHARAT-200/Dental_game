import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Plus, Pencil, Trash2, Check, X, RotateCcw,
  AlertTriangle, CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import Button from '../components/Button';
import { useAdminQuestions, genId } from '../hooks/useAdminQuestions';
import { playSound } from '../utils/sounds';

// Memoized option arrays to prevent recreation on every render
const OPTION_AB = [{ value: 'A', label: 'Option A' }, { value: 'B', label: 'Option B' }];

// ─────────────────────────────────────────────────────────────────────────────
// Small shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, children, error }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      )}
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl px-3 py-2 text-sm outline-none ${className}`}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
    />
  );
}

function NumberInput({ value, onChange, placeholder, min = 1 }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onDone }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onAnimationComplete={() => {
            // auto-dismiss after 2.5 s
            const t = setTimeout(onDone, 2500);
            return () => clearTimeout(t);
          }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold
            ${type === 'success'
              ? 'bg-green-500/90 text-white'
              : type === 'error'
                ? 'bg-red-500/90 text-white'
                : 'bg-indigo-500/90 text-white'
            }`}
        >
          {type === 'success' && <CheckCircle2 size={16} />}
          {type === 'error'   && <AlertTriangle size={16} />}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation modal
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        className="glass rounded-2xl p-6 max-w-sm w-full border border-red-500/30 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={22} className="text-red-400 shrink-0" />
          <p className="text-white text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} icon={<X size={14} />}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} icon={<Check size={14} />}>
            Confirm
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Round tab button
// ─────────────────────────────────────────────────────────────────────────────

function RoundTab({ label, emoji, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border
        ${active
          ? 'border-indigo-500/60 bg-indigo-500/20 text-white'
          : 'border-white/10 glass text-slate-400 hover:text-white hover:border-white/20'
        }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="hidden sm:block">{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
        ${active ? 'bg-indigo-500/40 text-indigo-200' : 'bg-white/10 text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question card wrapper (view mode)
// ─────────────────────────────────────────────────────────────────────────────

function QuestionCard({ index, accentColor, children, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-xl p-4 mb-3 border ${accentColor} relative group`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 shrink-0 mt-0.5">#{index + 1}</span>
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            title="Edit"
            className="w-7 h-7 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 flex items-center justify-center text-indigo-300 transition-colors"
          >
            <Pencil size={12} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            title="Delete"
            className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ emoji, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <span className="text-5xl mb-4">{emoji}</span>
      <p className="text-slate-400 text-sm mb-4">No questions added yet.</p>
      <Button variant="primary" size="sm" onClick={onAdd} icon={<Plus size={14} />}>
        Add First Question
      </Button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

function validateThisOrThat(q) {
  const errs = {};
  if (!q.question.trim()) errs.question = 'Question is required.';
  if (!q.optionA.trim()) errs.optionA = 'Option A is required.';
  if (!q.optionB.trim()) errs.optionB = 'Option B is required.';
  if (!['A', 'B'].includes(q.correct)) errs.correct = 'Select the correct answer.';
  return errs;
}

function validateRiddle(q) {
  const errs = {};
  if (!q.riddle.trim()) errs.riddle = 'Riddle text is required.';
  if (!q.answer.trim()) errs.answer = 'Answer is required.';
  return errs;
}

function validateMCQ(q) {
  const errs = {};
  if (!q.question.trim()) errs.question = 'Question is required.';
  q.options.forEach((opt, i) => {
    if (!opt.trim()) errs[`option${i}`] = `Option ${'ABCD'[i]} is required.`;
  });
  const ci = parseInt(q.correct);
  if (isNaN(ci) || ci < 0 || ci > 3) errs.correct = 'Select the correct option.';
  if (!q.explanation.trim()) errs.explanation = 'Explanation is required.';
  return errs;
}

function validateRapidFire(q) {
  const errs = {};
  if (!q.question.trim()) errs.question = 'Question is required.';
  if (!q.answer.trim()) errs.answer = 'Answer is required.';
  const tl = parseInt(q.timeLimit);
  if (isNaN(tl) || tl < 1) errs.timeLimit = 'Time limit must be a positive number.';
  return errs;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND 1 — Image Questions
// ─────────────────────────────────────────────────────────────────────────────

function blankImageQuestion() {
  return { image1: '', image2: '', answer: '', hint: '', explanation: '' };
}

// Helper to convert File to data URL (base64)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper to compress image if needed (max 500KB per image)
async function processImage(file) {
  const MAX_SIZE_KB = 500;
  const dataURL = await fileToDataURL(file);
  
  // Check size (rough estimate: base64 is ~1.37x original)
  const sizeKB = (dataURL.length * 0.75) / 1024;
  
  if (sizeKB <= MAX_SIZE_KB) {
    return dataURL;
  }
  
  // If too large, create canvas and compress
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Scale down if needed - more aggressive for better performance
      const maxDim = 1024; // Reduced from 1200
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress as JPEG with quality 0.65 for smaller file size
      const compressed = canvas.toDataURL('image/jpeg', 0.65);
      resolve(compressed);
    };
    img.src = dataURL;
  });
}

function ImagesPanel({ questions, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankImageQuestion());
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAdd = () => {
    setForm(blankImageQuestion());
    setErrors({});
    setEditingId('new');
  };

  const openEdit = (q) => {
    setForm({
      image1: q.image1,
      image2: q.image2,
      answer: q.answer,
      hint: q.hint ?? '',
      explanation: q.explanation ?? '',
    });
    setErrors({});
    setEditingId(q.id);
  };

  const cancel = () => { setEditingId(null); setErrors({}); };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(e => ({ ...e, [field]: 'Please select a valid image file.' }));
      return;
    }
    
    // Check file size (max 5MB original)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, [field]: 'Image is too large. Please use an image under 5MB.' }));
      return;
    }
    
    try {
      setUploading(true);
      const dataURL = await processImage(file);
      setForm(f => ({ ...f, [field]: dataURL }));
      setErrors(e => ({ ...e, [field]: null }));
    } catch (err) {
      setErrors(e => ({ ...e, [field]: 'Failed to process image.' }));
    } finally {
      setUploading(false);
    }
  };

  const validateImageQuestion = (q) => {
    const errs = {};
    if (!q.image1) errs.image1 = 'Image 1 is required.';
    if (!q.image2) errs.image2 = 'Image 2 is required.';
    if (!q.answer.trim()) errs.answer = 'Answer is required.';
    return errs;
  };

  const save = () => {
    const trimmed = {
      image1: form.image1,
      image2: form.image2,
      answer: form.answer.trim(),
      hint: form.hint.trim(),
      explanation: form.explanation.trim(),
    };
    const errs = validateImageQuestion(trimmed);
    if (Object.keys(errs).length) { setErrors(errs); return null; }

    if (editingId === 'new') {
      onAdd({ id: genId('img'), ...trimmed });
    } else {
      onUpdate({ id: editingId, ...trimmed });
    }
    setEditingId(null);
    return true;
  };

  return (
    <div>
      {/* Form */}
      <AnimatePresence>
        {editingId !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass rounded-xl p-4 border border-indigo-500/40">
              <p className="text-xs font-bold text-indigo-300 mb-3">
                {editingId === 'new' ? '➕ New Image Question' : '✏️ Edit Question'}
              </p>

              {/* Image 1 Upload */}
              <Field label="Image 1 *" error={errors.image1}>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('image1', e.target.files[0])}
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer"
                    disabled={uploading}
                  />
                  {form.image1 && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-800 border border-white/10">
                      <img src={form.image1} alt="Preview 1" className="w-full h-full object-contain" />
                      <button
                        onClick={() => setForm(f => ({ ...f, image1: '' }))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Field>

              {/* Image 2 Upload */}
              <Field label="Image 2 *" error={errors.image2}>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('image2', e.target.files[0])}
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer"
                    disabled={uploading}
                  />
                  {form.image2 && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-800 border border-white/10">
                      <img src={form.image2} alt="Preview 2" className="w-full h-full object-contain" />
                      <button
                        onClick={() => setForm(f => ({ ...f, image2: '' }))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Answer *" error={errors.answer}>
                <TextInput
                  value={form.answer}
                  onChange={v => setForm(f => ({ ...f, answer: v }))}
                  placeholder="e.g. Dental Caries"
                />
              </Field>

              <Field label="Hint (optional)">
                <TextInput
                  value={form.hint}
                  onChange={v => setForm(f => ({ ...f, hint: v }))}
                  placeholder="Optional hint for students"
                />
              </Field>

              <Field label="Explanation (optional)">
                <TextArea
                  value={form.explanation}
                  onChange={v => setForm(f => ({ ...f, explanation: v }))}
                  placeholder="Explanation shown after answering"
                />
              </Field>

              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={save} icon={<Check size={14} />} disabled={uploading}>
                  {uploading ? 'Processing...' : 'Save'}
                </Button>
                <Button variant="secondary" size="sm" onClick={cancel} icon={<X size={14} />} disabled={uploading}>Cancel</Button>
              </div>

              {uploading && (
                <p className="text-xs text-indigo-300 mt-2">⏳ Processing image...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {questions.length === 0 && editingId === null
        ? <EmptyState emoji="🖼️" onAdd={openAdd} />
        : (
          <>
            <AnimatePresence>
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id} index={i}
                  accentColor="border-indigo-500/20"
                  onEdit={() => openEdit(q)}
                  onDelete={() => setDeleteTarget(q.id)}
                >
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="aspect-video rounded overflow-hidden bg-slate-800 border border-white/10">
                      <img src={q.image1} alt="Img 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-video rounded overflow-hidden bg-slate-800 border border-white/10">
                      <img src={q.image2} alt="Img 2" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <p className="text-white font-bold text-sm">Answer: {q.answer}</p>
                  {q.hint && <p className="text-slate-400 text-xs">Hint: {q.hint}</p>}
                </QuestionCard>
              ))}
            </AnimatePresence>
            {editingId === null && (
              <Button variant="secondary" size="sm" onClick={openAdd} icon={<Plus size={14} />} className="mt-1">
                Add Image Question
              </Button>
            )}
          </>
        )
      }

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message="Delete this image question? It will be removed from all future games."
            onConfirm={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND 2 — This or That
// ─────────────────────────────────────────────────────────────────────────────

function blankTOT() {
  return { question: '', optionA: '', optionB: '', correct: 'A', explanation: '' };
}

function ThisOrThatPanel({ questions, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(blankTOT());
  const [errors, setErrors]       = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => { setForm(blankTOT()); setErrors({}); setEditingId('new'); };
  const openEdit = q => {
    setForm({ question: q.question, optionA: q.optionA, optionB: q.optionB, correct: q.correct, explanation: q.explanation ?? '' });
    setErrors({});
    setEditingId(q.id);
  };
  const cancel = () => { setEditingId(null); setErrors({}); };

  const save = () => {
    const trimmed = {
      question: form.question.trim(),
      optionA: form.optionA.trim(),
      optionB: form.optionB.trim(),
      correct: form.correct,
      explanation: form.explanation.trim(),
    };
    const errs = validateThisOrThat(trimmed);
    if (Object.keys(errs).length) { setErrors(errs); return null; }
    if (editingId === 'new') onAdd({ id: genId('tot'), ...trimmed });
    else onUpdate({ id: editingId, ...trimmed });
    setEditingId(null);
    return true;
  };

  return (
    <div>
      <AnimatePresence>
        {editingId !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="glass rounded-xl p-4 border border-purple-500/40">
              <p className="text-xs font-bold text-purple-300 mb-3">
                {editingId === 'new' ? '➕ New This or That' : '✏️ Edit Question'}
              </p>
              <Field label="Question *" error={errors.question}>
                <TextArea value={form.question} onChange={v => setForm(f => ({ ...f, question: v }))} placeholder="Ask a comparison question…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Option A *" error={errors.optionA}>
                  <TextInput value={form.optionA} onChange={v => setForm(f => ({ ...f, optionA: v }))} placeholder="First choice" />
                </Field>
                <Field label="Option B *" error={errors.optionB}>
                  <TextInput value={form.optionB} onChange={v => setForm(f => ({ ...f, optionB: v }))} placeholder="Second choice" />
                </Field>
              </div>
              <Field label="Correct Answer *" error={errors.correct}>
                <SelectInput
                  value={form.correct}
                  onChange={v => setForm(f => ({ ...f, correct: v }))}
                  options={OPTION_AB}
                />
              </Field>
              <Field label="Explanation (optional)">
                <TextArea value={form.explanation} onChange={v => setForm(f => ({ ...f, explanation: v }))} placeholder="Why is this the correct answer?" />
              </Field>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={save} icon={<Check size={14} />}>Save</Button>
                <Button variant="secondary" size="sm" onClick={cancel} icon={<X size={14} />}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {questions.length === 0 && editingId === null
        ? <EmptyState emoji="⚖️" onAdd={openAdd} />
        : (
          <>
            <AnimatePresence>
              {questions.map((q, i) => (
                <QuestionCard key={q.id} index={i} accentColor="border-purple-500/20"
                  onEdit={() => openEdit(q)} onDelete={() => setDeleteTarget(q.id)}>
                  <p className="text-white text-sm font-medium leading-snug">{q.question}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.correct === 'A' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-slate-400'}`}>A: {q.optionA}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.correct === 'B' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-slate-400'}`}>B: {q.optionB}</span>
                  </div>
                  {q.explanation && <p className="text-slate-500 text-xs mt-1 italic truncate">{q.explanation}</p>}
                </QuestionCard>
              ))}
            </AnimatePresence>
            {editingId === null && (
              <Button variant="secondary" size="sm" onClick={openAdd} icon={<Plus size={14} />} className="mt-1">Add Question</Button>
            )}
          </>
        )
      }

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message="Delete this This or That question? It won't appear in future games."
            onConfirm={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND 3 — Riddles
// ─────────────────────────────────────────────────────────────────────────────

function blankRiddle() {
  return { riddle: '', answer: '', hint: '' };
}

function RiddlesPanel({ questions, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(blankRiddle());
  const [errors, setErrors]       = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => { setForm(blankRiddle()); setErrors({}); setEditingId('new'); };
  const openEdit = q => {
    setForm({ riddle: q.riddle, answer: q.answer, hint: q.hint ?? '' });
    setErrors({});
    setEditingId(q.id);
  };
  const cancel = () => { setEditingId(null); setErrors({}); };

  const save = () => {
    const trimmed = { riddle: form.riddle.trim(), answer: form.answer.trim(), hint: form.hint.trim() };
    const errs = validateRiddle(trimmed);
    if (Object.keys(errs).length) { setErrors(errs); return null; }
    if (editingId === 'new') onAdd({ id: genId('rid'), ...trimmed });
    else onUpdate({ id: editingId, ...trimmed });
    setEditingId(null);
    return true;
  };

  return (
    <div>
      <AnimatePresence>
        {editingId !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="glass rounded-xl p-4 border border-cyan-500/40">
              <p className="text-xs font-bold text-cyan-300 mb-3">
                {editingId === 'new' ? '➕ New Riddle' : '✏️ Edit Riddle'}
              </p>
              <Field label="Riddle *" error={errors.riddle}>
                <TextArea value={form.riddle} onChange={v => setForm(f => ({ ...f, riddle: v }))} placeholder="Write the riddle text…" rows={3} />
              </Field>
              <Field label="Answer *" error={errors.answer}>
                <TextInput value={form.answer} onChange={v => setForm(f => ({ ...f, answer: v }))} placeholder="e.g. enamel" />
              </Field>
              <Field label="Hint (optional)">
                <TextInput value={form.hint} onChange={v => setForm(f => ({ ...f, hint: v }))} placeholder="Optional hint for the player" />
              </Field>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={save} icon={<Check size={14} />}>Save</Button>
                <Button variant="secondary" size="sm" onClick={cancel} icon={<X size={14} />}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {questions.length === 0 && editingId === null
        ? <EmptyState emoji="🧩" onAdd={openAdd} />
        : (
          <>
            <AnimatePresence>
              {questions.map((q, i) => (
                <QuestionCard key={q.id} index={i} accentColor="border-cyan-500/20"
                  onEdit={() => openEdit(q)} onDelete={() => setDeleteTarget(q.id)}>
                  <p className="text-slate-300 text-sm italic leading-snug line-clamp-2">"{q.riddle}"</p>
                  <p className="text-cyan-300 text-xs font-bold mt-1">→ {q.answer}</p>
                  {q.hint && <p className="text-slate-500 text-xs">Hint: {q.hint}</p>}
                </QuestionCard>
              ))}
            </AnimatePresence>
            {editingId === null && (
              <Button variant="secondary" size="sm" onClick={openAdd} icon={<Plus size={14} />} className="mt-1">Add Riddle</Button>
            )}
          </>
        )
      }

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message="Delete this riddle? It won't appear in future games."
            onConfirm={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND 4 — MCQ
// ─────────────────────────────────────────────────────────────────────────────

function blankMCQ() {
  return { question: '', options: ['', '', '', ''], correct: 0, explanation: '' };
}

function MCQPanel({ questions, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(blankMCQ());
  const [errors, setErrors]       = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => { setForm(blankMCQ()); setErrors({}); setEditingId('new'); };
  const openEdit = q => {
    setForm({ question: q.question, options: [...q.options], correct: q.correct, explanation: q.explanation ?? '' });
    setErrors({});
    setEditingId(q.id);
  };
  const cancel = () => { setEditingId(null); setErrors({}); };

  const updateOption = (idx, val) => setForm(f => {
    const opts = [...f.options]; opts[idx] = val; return { ...f, options: opts };
  });

  const save = () => {
    const trimmed = {
      question: form.question.trim(),
      options: form.options.map(o => o.trim()),
      correct: parseInt(form.correct),
      explanation: form.explanation.trim(),
    };
    const errs = validateMCQ(trimmed);
    if (Object.keys(errs).length) { setErrors(errs); return null; }
    if (editingId === 'new') onAdd({ id: genId('mcq'), ...trimmed });
    else onUpdate({ id: editingId, ...trimmed });
    setEditingId(null);
    return true;
  };

  return (
    <div>
      <AnimatePresence>
        {editingId !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="glass rounded-xl p-4 border border-green-500/40">
              <p className="text-xs font-bold text-green-300 mb-3">
                {editingId === 'new' ? '➕ New MCQ' : '✏️ Edit MCQ'}
              </p>
              <Field label="Question *" error={errors.question}>
                <TextArea value={form.question} onChange={v => setForm(f => ({ ...f, question: v }))} placeholder="Write the multiple-choice question…" rows={2} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <Field key={idx} label={`Option ${letter} *`} error={errors[`option${idx}`]}>
                    <TextInput
                      value={form.options[idx]}
                      onChange={v => updateOption(idx, v)}
                      placeholder={`Option ${letter}`}
                    />
                  </Field>
                ))}
              </div>
              <Field label="Correct Answer *" error={errors.correct}>
                <SelectInput
                  value={form.correct}
                  onChange={v => setForm(f => ({ ...f, correct: parseInt(v) }))}
                  options={form.options.map((opt, n) => ({ 
                    value: n, 
                    label: `Option ${'ABCD'[n]}${opt ? ` — ${opt.slice(0, 30)}` : ''}` 
                  }))}
                />
              </Field>
              <Field label="Explanation *" error={errors.explanation}>
                <TextArea value={form.explanation} onChange={v => setForm(f => ({ ...f, explanation: v }))} placeholder="Explain why this answer is correct…" />
              </Field>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={save} icon={<Check size={14} />}>Save</Button>
                <Button variant="secondary" size="sm" onClick={cancel} icon={<X size={14} />}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {questions.length === 0 && editingId === null
        ? <EmptyState emoji="📝" onAdd={openAdd} />
        : (
          <>
            <AnimatePresence>
              {questions.map((q, i) => (
                <QuestionCard key={q.id} index={i} accentColor="border-green-500/20"
                  onEdit={() => openEdit(q)} onDelete={() => setDeleteTarget(q.id)}>
                  <p className="text-white text-sm font-medium leading-snug line-clamp-2">{q.question}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5">
                    {q.options.map((opt, oi) => (
                      <span key={oi} className={`text-xs px-2 py-0.5 rounded-full truncate ${oi === q.correct ? 'bg-green-500/20 text-green-300' : 'text-slate-400'}`}>
                        {String.fromCharCode(65 + oi)}: {opt}
                      </span>
                    ))}
                  </div>
                </QuestionCard>
              ))}
            </AnimatePresence>
            {editingId === null && (
              <Button variant="secondary" size="sm" onClick={openAdd} icon={<Plus size={14} />} className="mt-1">Add MCQ</Button>
            )}
          </>
        )
      }

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message="Delete this MCQ? It won't appear in future games."
            onConfirm={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND 5 — Rapid Fire
// ─────────────────────────────────────────────────────────────────────────────

function blankRF() {
  return { question: '', answer: '', timeLimit: 10 };
}

function RapidFirePanel({ questions, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(blankRF());
  const [errors, setErrors]       = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => { setForm(blankRF()); setErrors({}); setEditingId('new'); };
  const openEdit = q => {
    setForm({ question: q.question, answer: q.answer, timeLimit: q.timeLimit ?? 10 });
    setErrors({});
    setEditingId(q.id);
  };
  const cancel = () => { setEditingId(null); setErrors({}); };

  const save = () => {
    const trimmed = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      timeLimit: parseInt(form.timeLimit),
    };
    const errs = validateRapidFire(trimmed);
    if (Object.keys(errs).length) { setErrors(errs); return null; }
    if (editingId === 'new') onAdd({ id: genId('rf'), ...trimmed });
    else onUpdate({ id: editingId, ...trimmed });
    setEditingId(null);
    return true;
  };

  return (
    <div>
      <AnimatePresence>
        {editingId !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="glass rounded-xl p-4 border border-yellow-500/40">
              <p className="text-xs font-bold text-yellow-300 mb-3">
                {editingId === 'new' ? '➕ New Rapid Fire Q' : '✏️ Edit Question'}
              </p>
              <Field label="Question *" error={errors.question}>
                <TextInput value={form.question} onChange={v => setForm(f => ({ ...f, question: v }))} placeholder="Short, punchy question…" />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Field label="Answer *" error={errors.answer}>
                    <TextInput value={form.answer} onChange={v => setForm(f => ({ ...f, answer: v }))} placeholder="Expected answer" />
                  </Field>
                </div>
                <Field label="Time (s) *" error={errors.timeLimit}>
                  <NumberInput value={form.timeLimit} onChange={v => setForm(f => ({ ...f, timeLimit: v }))} placeholder="10" min={1} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={save} icon={<Check size={14} />}>Save</Button>
                <Button variant="secondary" size="sm" onClick={cancel} icon={<X size={14} />}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {questions.length === 0 && editingId === null
        ? <EmptyState emoji="⚡" onAdd={openAdd} />
        : (
          <>
            <AnimatePresence>
              {questions.map((q, i) => (
                <QuestionCard key={q.id} index={i} accentColor="border-yellow-500/20"
                  onEdit={() => openEdit(q)} onDelete={() => setDeleteTarget(q.id)}>
                  <p className="text-white text-sm font-medium">{q.question}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-yellow-300 text-xs font-bold">→ {q.answer}</span>
                    <span className="text-slate-500 text-xs">⏱ {q.timeLimit}s</span>
                  </div>
                </QuestionCard>
              ))}
            </AnimatePresence>
            {editingId === null && (
              <Button variant="secondary" size="sm" onClick={openAdd} icon={<Plus size={14} />} className="mt-1">Add Question</Button>
            )}
          </>
        )
      }

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message="Delete this rapid fire question? It won't appear in future games."
            onConfirm={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Round config
// ─────────────────────────────────────────────────────────────────────────────

const ROUNDS = [
  { key: 'images',     label: 'Image Questions', emoji: '🖼️', color: 'border-indigo-500/30',  accent: 'text-indigo-300' },
  { key: 'thisOrThat', label: 'This or That',    emoji: '⚖️', color: 'border-purple-500/30',  accent: 'text-purple-300' },
  { key: 'riddles',    label: 'Riddles',          emoji: '🧩', color: 'border-cyan-500/30',    accent: 'text-cyan-300'   },
  { key: 'mcq',        label: 'MCQ',              emoji: '📝', color: 'border-green-500/30',   accent: 'text-green-300'  },
  { key: 'rapidFire',  label: 'Rapid Fire',       emoji: '⚡', color: 'border-yellow-500/30',  accent: 'text-yellow-300' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main AdminPanel page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPanel({ onHome }) {
  const { bank, addQuestion, updateQuestion, removeQuestion, resetToDefaults, getCount } = useAdminQuestions();

  const [activeTab, setActiveTab]   = useState('images');
  const [toast, setToast]           = useState(null);  // { message, type }
  const [resetConfirm, setResetConfirm] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    playSound(type === 'success' ? 'correct' : 'wrong');
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  // Wrap CRUD with toast feedback
  const handleAdd = useCallback((round, question) => {
    addQuestion(round, question);
    showToast('Question saved ✓');
  }, [addQuestion, showToast]);

  const handleUpdate = useCallback((round, question) => {
    updateQuestion(round, question);
    showToast('Question updated ✓');
  }, [updateQuestion, showToast]);

  const handleDelete = useCallback((round, id) => {
    removeQuestion(round, id);
    showToast('Question deleted', 'error');
  }, [removeQuestion, showToast]);

  const handleReset = useCallback(() => {
    resetToDefaults();
    setResetConfirm(false);
    showToast('Reset to default questions ✓');
  }, [resetToDefaults, showToast]);

  const activeRound = ROUNDS.find(r => r.key === activeTab);
  const totalCount  = ROUNDS.reduce((sum, r) => sum + getCount(r.key), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-20 pb-24 px-4"
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={20} className="text-indigo-400" />
              <h2 className="text-3xl sm:text-4xl font-black gradient-text">Admin Panel</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Manage the persistent question bank. Changes apply to all future games.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="glass rounded-full px-3 py-1 text-xs text-slate-300">
                <span className="font-bold text-white">{totalCount}</span> total questions
              </span>
              {ROUNDS.map(r => (
                <span key={r.key} className={`hidden sm:inline-flex glass rounded-full px-2 py-1 text-xs ${r.accent}`}>
                  {r.emoji} {getCount(r.key)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setResetConfirm(true)}
              icon={<RotateCcw size={14} />}
              sound="click"
            >
              <span className="hidden sm:inline">Reset to Defaults</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onHome} icon={<Home size={14} />}>
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>

        {/* ── Round Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {ROUNDS.map(r => (
            <RoundTab
              key={r.key}
              label={`Round ${ROUNDS.indexOf(r) + 1} — ${r.label}`}
              emoji={r.emoji}
              count={getCount(r.key)}
              active={activeTab === r.key}
              onClick={() => { setActiveTab(r.key); playSound('click'); }}
            />
          ))}
        </div>

        {/* ── Active panel ── */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`glass rounded-2xl border ${activeRound.color} p-5`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeRound.emoji}</span>
              <div>
                <h3 className="font-bold text-white">
                  Round {ROUNDS.indexOf(activeRound) + 1} — {activeRound.label}
                </h3>
                <p className={`text-xs ${activeRound.accent}`}>
                  {getCount(activeTab)} question{getCount(activeTab) !== 1 ? 's' : ''} in bank
                </p>
              </div>
            </div>
            <RoundHint roundKey={activeTab} />
          </div>

          {/* Panel content */}
          {activeTab === 'images' && (
            <ImagesPanel
              questions={bank.images}
              onAdd={q => handleAdd('images', q)}
              onUpdate={q => handleUpdate('images', q)}
              onDelete={id => handleDelete('images', id)}
            />
          )}
          {activeTab === 'thisOrThat' && (
            <ThisOrThatPanel
              questions={bank.thisOrThat}
              onAdd={q => handleAdd('thisOrThat', q)}
              onUpdate={q => handleUpdate('thisOrThat', q)}
              onDelete={id => handleDelete('thisOrThat', id)}
            />
          )}
          {activeTab === 'riddles' && (
            <RiddlesPanel
              questions={bank.riddles}
              onAdd={q => handleAdd('riddles', q)}
              onUpdate={q => handleUpdate('riddles', q)}
              onDelete={id => handleDelete('riddles', id)}
            />
          )}
          {activeTab === 'mcq' && (
            <MCQPanel
              questions={bank.mcq}
              onAdd={q => handleAdd('mcq', q)}
              onUpdate={q => handleUpdate('mcq', q)}
              onDelete={id => handleDelete('mcq', id)}
            />
          )}
          {activeTab === 'rapidFire' && (
            <RapidFirePanel
              questions={bank.rapidFire}
              onAdd={q => handleAdd('rapidFire', q)}
              onUpdate={q => handleUpdate('rapidFire', q)}
              onDelete={id => handleDelete('rapidFire', id)}
            />
          )}
        </motion.div>

        {/* ── Info footer ── */}
        <p className="text-slate-600 text-xs text-center mt-6">
          All questions are saved to localStorage and persist across page refreshes and browser sessions.
        </p>
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={clearToast} />}

      {/* ── Reset confirmation ── */}
      <AnimatePresence>
        {resetConfirm && (
          <ConfirmModal
            message="Reset to default questions? This will permanently overwrite all your custom questions with the original dental science question bank."
            onConfirm={handleReset}
            onCancel={() => setResetConfirm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contextual hint for each round
// ─────────────────────────────────────────────────────────────────────────────

function RoundHint({ roundKey }) {
  const hints = {
    images:     'Upload 2 images per question. Images are stored as base64 and compressed automatically.',
    thisOrThat: 'Player picks between two options. Mark which one is correct.',
    riddles:    'Player types a free-text answer. Matching is fuzzy — synonyms are accepted.',
    mcq:        '4 options required. Select the correct one from the dropdown.',
    rapidFire:  'Each question has its own countdown timer. Default is 10 seconds.',
  };

  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        title="Round info"
      >
        <HelpCircle size={13} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-0 top-8 z-20 glass rounded-xl p-3 border border-white/10 text-xs text-slate-300 w-60 shadow-xl"
          >
            {hints[roundKey]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
