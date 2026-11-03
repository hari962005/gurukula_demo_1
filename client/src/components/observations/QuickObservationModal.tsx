import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Child, User } from '../../types/index.js';
import { Sparkles, Mic, MicOff, X, Check, Clock, AlertCircle } from 'lucide-react';

interface QuickObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  defaultChildId?: string;
}

const CATEGORIES = [
  'Academics',
  'Skills',
  'Participation',
  'Responsibility',
  'Well-being',
  'Strength',
  'Concern',
  'Other',
] as const;

const COMMON_TAGS = [
  'Vedic Chanting',
  'Compassion',
  'Focus & Dhyana',
  'Peer Support',
  'Morning Prayer',
  'Curiosity',
  'Vedic Math',
  'Goshala Seva',
  'Rest Needed',
  'Perseverance',
  'Art & Kala',
  'Leadership',
];

export const QuickObservationModal: React.FC<QuickObservationModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  defaultChildId,
}) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedChildId, setSelectedChildId] = useState(defaultChildId || '');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Strength');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Follow-up toggle fields
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [concernOrGoal, setConcernOrGoal] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Load children list & draft
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      loadDraft();
      checkSpeechRecognition();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const res: any = await api.get('/children?status=active');
      if (res?.success) {
        setChildren(res.data || []);
        if (!selectedChildId && res.data.length > 0) {
          setSelectedChildId(defaultChildId || res.data[0]._id);
        }
      }
    } catch (err) {
      // ignore
    }
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('gurukula_observation_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.note) setNote(parsed.note);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.selectedTags) setSelectedTags(parsed.selectedTags);
        if (parsed.childId && !defaultChildId) setSelectedChildId(parsed.childId);
      } catch (e) {
        // ignore
      }
    }
  };

  const saveDraft = (updatedNote: string) => {
    localStorage.setItem(
      'gurukula_observation_draft',
      JSON.stringify({
        note: updatedNote,
        category,
        selectedTags,
        childId: selectedChildId,
      })
    );
  };

  const checkSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English / terms

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newNote = note ? `${note} ${transcript}` : transcript;
        setNote(newNote);
        saveDraft(newNote);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
      setErrorMsg('Please select a child.');
      return;
    }
    if (!note.trim()) {
      setErrorMsg('Please enter a brief observation note.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/observations', {
        childId: selectedChildId,
        category,
        tags: selectedTags,
        note: note.trim(),
        requiresFollowUp,
        followUp: requiresFollowUp
          ? {
              concernOrGoal,
              actionPlan,
              assignedToId: assignedToId || undefined,
              dueDate: dueDate || undefined,
            }
          : undefined,
      });

      // Clear draft
      localStorage.removeItem('gurukula_observation_draft');
      setSuccessMsg('Observation recorded successfully in child journey!');
      setTimeout(() => {
        setSuccessMsg('');
        setNote('');
        setSelectedTags([]);
        setRequiresFollowUp(false);
        setActionPlan('');
        onClose();
        if (onSaved) onSaved();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save observation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-sm tracking-wide text-amber-300">
                Quick Mentor Observation
              </h3>
              <p className="text-[10px] text-emerald-200">Mobile-First Instant Capture (10 Seconds)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* 1. Select Child */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Child <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE4D7] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="">-- Choose Child --</option>
              {children.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.studentId}) — {c.currentGradeName}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Observation Category */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                    category === cat
                      ? 'bg-[#1B4332] text-white shadow-sm font-semibold'
                      : 'bg-white border border-[#EAE4D7] text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Predefined Quick Tags */}
          <div>
            <label className="block text-stone-600 font-medium mb-1">Select Quick Tags (Optional)</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Observation Note with Speech-to-Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-700 font-semibold">
                Observation Note <span className="text-red-500">*</span>
              </label>

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  title="Speak note"
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-[#1B4332]" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                saveDraft(e.target.value);
              }}
              placeholder="e.g. Demonstrated profound reverence during the evening Gita recitation; willingly assisted junior peers in folding the mats..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE4D7] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">
              Auto-saves drafts in browser. Timestamp and your mentor name recorded automatically.
            </p>
          </div>

          {/* 5. Optional Follow-up Action Toggle */}
          <div className="pt-2 border-t border-[#EAE4D7]">
            <label className="flex items-center gap-2 cursor-pointer text-stone-800 font-semibold">
              <input
                type="checkbox"
                checked={requiresFollowUp}
                onChange={(e) => setRequiresFollowUp(e.target.checked)}
                className="w-4 h-4 rounded text-[#1B4332] focus:ring-[#1B4332]"
              />
              <span>Trigger Corrective Action / Follow-up Plan</span>
            </label>

            {requiresFollowUp && (
              <div className="mt-3 p-3 rounded-xl bg-[#F4EFE6]/70 border border-[#EAE4D7] space-y-2.5 animate-fade-in">
                <div>
                  <label className="block text-stone-600 text-[11px] font-medium mb-1">
                    Goal or Focus
                  </label>
                  <input
                    type="text"
                    value={concernOrGoal}
                    onChange={(e) => setConcernOrGoal(e.target.value)}
                    placeholder="e.g. Reinforce Sanskrit Sandhi rules with flashcards"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 text-[11px] font-medium mb-1">
                    Action Plan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="e.g. 15-minute daily pair study during afternoon self-study hour"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 text-[11px] font-medium mb-1">
                    Follow-up Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Observation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
