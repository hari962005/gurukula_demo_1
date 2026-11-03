import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, HealthRecordItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Heart, Lock, Plus, Clock, ShieldCheck, AlertCircle, X } from 'lucide-react';

const CATEGORIES = [
  'General Vitality & Stamina',
  'Physical Growth & Posture',
  'Rest, Sleep & Routine',
  'Emotional Well-being & Calmness',
  'Seasonal Sensitivity & Traditional Care',
  'Dietary Habits & Satvic Nourishment',
];

export const HealthPage: React.FC = () => {
  const { user, canViewHealth } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [records, setRecords] = useState<HealthRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [supportiveObservations, setSupportiveObservations] = useState('');
  const [careProvidedOrSuggested, setCareProvidedOrSuggested] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (canViewHealth) {
      fetchChildren();
    }
  }, [canViewHealth]);

  useEffect(() => {
    if (canViewHealth && selectedChildId) {
      fetchRecords(selectedChildId);
    }
  }, [selectedChildId, canViewHealth]);

  const fetchChildren = async () => {
    try {
      const res: any = await api.get('/children?status=active');
      if (res?.success) {
        setChildren(res.data || []);
        if (res.data.length > 0) setSelectedChildId(res.data[0]._id);
      }
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  const fetchRecords = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/health/${cId}`);
      if (res?.success) setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !supportiveObservations.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/health', {
        childId: selectedChildId,
        category,
        supportiveObservations: supportiveObservations.trim(),
        careProvidedOrSuggested: careProvidedOrSuggested.trim(),
      });
      setShowModal(false);
      setSupportiveObservations('');
      setCareProvidedOrSuggested('');
      fetchRecords(selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Failed to save health record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canViewHealth) {
    return (
      <div className="p-8 max-w-md mx-auto text-center bg-white rounded-2xl border border-red-200 shadow-sm space-y-3 mt-10 text-xs">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-sm text-stone-900">Restricted Access Module</h3>
        <p className="text-stone-600 leading-relaxed">
          Health and supportive well-being logs are restricted to authorized teachers, coordinators, and medical matrons under Gurukula child-protection guidelines.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span>Health & General Well-being (Restricted Access)</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Supportive well-being observations, seasonal routines, and traditional Ayurvedic nourishment notes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Well-being Note</span>
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

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Restricted Audit Logging Active</span>
        </span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading well-being notes...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No well-being observations recorded for this child.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div
              key={r._id}
              className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{r.category}</span>
                <span className="text-[10px] text-stone-400">{new Date(r.date).toLocaleDateString()}</span>
              </div>

              <p className="text-stone-700 text-xs bg-[#FDFBF7] p-2.5 rounded-xl border border-stone-100">
                "{r.supportiveObservations}"
              </p>

              {r.careProvidedOrSuggested && (
                <div className="text-[11px] text-amber-900 font-medium">
                  Traditional Care / Guidance: {r.careProvidedOrSuggested}
                </div>
              )}

              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
                <span>Staff: {r.responsibleStaffName}</span>
                <span className="font-semibold text-emerald-800">Support Logged</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">Record Supportive Well-being Note</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Observation Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Supportive Observation Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={supportiveObservations}
                  onChange={(e) => setSupportiveObservations(e.target.value)}
                  placeholder="Record general energy, sleep patterns, seasonal response, posture..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Care Provided or Suggested</label>
                <input
                  type="text"
                  value={careProvidedOrSuggested}
                  onChange={(e) => setCareProvidedOrSuggested(e.target.value)}
                  placeholder="e.g. Warm ginger tea in the morning, restful afternoon reading"
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
                  {isSubmitting ? 'Saving...' : 'Save Well-being Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
