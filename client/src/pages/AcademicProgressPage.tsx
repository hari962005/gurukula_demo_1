import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, Subject, AcademicProgressItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  BookOpen,
  Plus,
  CheckCircle,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

export const AcademicProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [progressList, setProgressList] = useState<AcademicProgressItem[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Progress Entry Modal
  const [showModal, setShowModal] = useState(false);
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formPeriod, setFormPeriod] = useState<'Term 1' | 'Term 2' | 'Annual Assessment'>('Term 1');
  const [formStage, setFormStage] = useState('Abhyasa (Developing)');
  const [formFeedback, setFormFeedback] = useState('');
  const [formStrengths, setFormStrengths] = useState('');
  const [formGoals, setFormGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildProgress(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchInitial = async () => {
    try {
      const [cRes, sRes]: any = await Promise.all([
        api.get('/children?status=active'),
        api.get('/academic/subjects'),
      ]);
      if (cRes?.success) {
        setChildren(cRes.data || []);
        if (cRes.data.length > 0) setSelectedChildId(cRes.data[0]._id);
      }
      if (sRes?.success) {
        setSubjects(sRes.data || []);
        if (sRes.data.length > 0) setFormSubjectId(sRes.data[0]._id);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChildProgress = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/academic/progress/${cId}`);
      if (res?.success) {
        setProgressList(res.data?.progress || []);
        setEnrollments(res.data?.enrollments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !formSubjectId || !formFeedback.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/academic/progress', {
        childId: selectedChildId,
        subjectId: formSubjectId,
        period: formPeriod,
        evaluationStage: formStage,
        qualitativeFeedback: formFeedback.trim(),
        observedStrengths: formStrengths.trim(),
        growthGoals: formGoals.trim(),
      });
      setShowModal(false);
      setFormFeedback('');
      setFormStrengths('');
      setFormGoals('');
      fetchChildProgress(selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Failed to save progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>Academic Progress & Qualitative Rubrics</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Holistic assessment without stressful rankings or numeric marks — evaluating conceptual depth and joy of learning.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Subject Evaluation</span>
        </button>
      </div>

      {/* Child Selector */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-stone-700">Select Child:</label>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-[#FDFBF7] text-stone-900 font-bold focus:outline-none"
          >
            {children.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName} ({c.studentId}) — {c.currentGradeName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-stone-500">
          Showing <strong>{progressList.length}</strong> evaluations
        </div>
      </div>

      {/* Evaluation List */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading academic evaluations...</span>
        </div>
      ) : progressList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No subject evaluations recorded yet for this child. Click "Record Subject Evaluation" to add one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {progressList.map((p) => (
            <div
              key={p._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="font-bold text-stone-900 text-sm">{p.subjectName}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1B4332] text-amber-300">
                    {p.evaluationStage}
                  </span>
                </div>

                <div className="text-[10px] text-stone-500 font-medium mt-1">
                  Evaluation Period: {p.period}
                </div>

                <p className="text-stone-700 text-xs mt-2 leading-relaxed bg-[#FDFBF7] p-2.5 rounded-xl border border-stone-100">
                  "{p.qualitativeFeedback}"
                </p>

                {p.observedStrengths && (
                  <p className="text-[11px] text-emerald-800 mt-2 font-medium">
                    ✓ Observed Strengths: {p.observedStrengths}
                  </p>
                )}

                {p.growthGoals && (
                  <p className="text-[11px] text-amber-800 mt-1 font-medium">
                    🎯 Growth Goals: {p.growthGoals}
                  </p>
                )}
              </div>

              <div className="text-[10px] text-stone-400 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>Evaluator: {p.evaluatedByName}</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Progress Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">
                Record Qualitative Subject Evaluation
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Term / Period</label>
                  <select
                    value={formPeriod}
                    onChange={(e: any) => setFormPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Annual Assessment">Annual Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Qualitative Stage</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Pravesha (Beginning)">Pravesha (Beginning)</option>
                    <option value="Abhyasa (Developing)">Abhyasa (Developing)</option>
                    <option value="Praveena (Proficient)">Praveena (Proficient)</option>
                    <option value="Visharada (Exemplary)">Visharada (Exemplary)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Qualitative Feedback & Observations <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formFeedback}
                  onChange={(e) => setFormFeedback(e.target.value)}
                  placeholder="Describe conceptual grasp, application, reverential listening, and engagement..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Demonstrated Strengths</label>
                <input
                  type="text"
                  value={formStrengths}
                  onChange={(e) => setFormStrengths(e.target.value)}
                  placeholder="e.g. Sharp phonetic memory, natural enthusiasm for storytelling"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Growth Goals</label>
                <input
                  type="text"
                  value={formGoals}
                  onChange={(e) => setFormGoals(e.target.value)}
                  placeholder="e.g. Master Devanagari conjunct consonants (Samyuktaksharas)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  {isSubmitting ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
