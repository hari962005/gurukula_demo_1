import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, ResponsibilityItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Compass, Plus, Clock, CheckCircle, X } from 'lucide-react';

export const ResponsibilitiesPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [responsibilities, setResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [category, setCategory] = useState<'Seva & Campus' | 'Cultural & Ritual' | 'Academic & Library' | 'Dormitory & Living' | 'Environmental & Krishi'>('Seva & Campus');
  const [mentorNotes, setMentorNotes] = useState('');
  const [learningAndGrowth, setLearningAndGrowth] = useState('');
  const [participationQuality, setParticipationQuality] = useState<'Dedicated & Inspiring' | 'Consistent & Diligent' | 'Growing in Responsibility'>('Consistent & Diligent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) fetchResponsibilities(selectedChildId);
  }, [selectedChildId]);

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

  const fetchResponsibilities = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/responsibilities/${cId}`);
      if (res?.success) setResponsibilities(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !roleName.trim() || !mentorNotes.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/responsibilities', {
        childId: selectedChildId,
        roleName: roleName.trim(),
        category,
        mentorNotes: mentorNotes.trim(),
        learningAndGrowth: learningAndGrowth.trim(),
        participationQuality,
      });
      setShowModal(false);
      setRoleName('');
      setMentorNotes('');
      setLearningAndGrowth('');
      fetchResponsibilities(selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-600" />
            <span>Gurukula Responsibilities & Campus Seva Roles</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Cultivating self-discipline, shared leadership, and respectful community living.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Assign Responsibility</span>
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
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading responsibilities...</span>
        </div>
      ) : responsibilities.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No campus responsibilities assigned yet for this child.
        </div>
      ) : (
        <div className="space-y-3">
          {responsibilities.map((r) => (
            <div
              key={r._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{r.roleName}</h3>
                  <span className="text-[10px] text-stone-500">{r.category}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {r.participationQuality}
                </span>
              </div>

              <p className="text-stone-700 text-xs bg-[#FDFBF7] p-2.5 rounded-xl border border-stone-100">
                "{r.mentorNotes}"
              </p>

              <div className="text-[11px] text-stone-600 font-medium">
                Learning & Character Growth: {r.learningAndGrowth}
              </div>

              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
                <span>Assigned by: {r.assignedByName}</span>
                <span>Active since: {new Date(r.startDate).toLocaleDateString()}</span>
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
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">Assign Campus Seva Responsibility</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Responsibility Role *</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Kitchen Seva Lead / Morning Assembly Anchor"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Seva & Campus">Seva & Campus</option>
                    <option value="Cultural & Ritual">Cultural & Ritual</option>
                    <option value="Academic & Library">Academic & Library</option>
                    <option value="Dormitory & Living">Dormitory & Living</option>
                    <option value="Environmental & Krishi">Environmental & Krishi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Participation Quality</label>
                  <select
                    value={participationQuality}
                    onChange={(e: any) => setParticipationQuality(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Dedicated & Inspiring">Dedicated & Inspiring</option>
                    <option value="Consistent & Diligent">Consistent & Diligent</option>
                    <option value="Growing in Responsibility">Growing in Responsibility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mentor Observation Notes *</label>
                <textarea
                  rows={2}
                  required
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Punctuality, care for tools and surroundings, respect for peers..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Learning & Character Outcome</label>
                <input
                  type="text"
                  value={learningAndGrowth}
                  onChange={(e) => setLearningAndGrowth(e.target.value)}
                  placeholder="e.g. Values dignity of labor, fosters teamwork"
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
                  {isSubmitting ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
