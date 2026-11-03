import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, AchievementItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Trophy, Plus, Clock, Award, X } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Vedic & Cultural' | 'Academic & Literary' | 'Arts & Performance' | 'Sports & Physical' | 'Seva & Community'>('Vedic & Cultural');
  const [level, setLevel] = useState<'Gurukula' | 'Inter-School' | 'District' | 'State' | 'National' | 'International'>('State');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) fetchAchievements(selectedChildId);
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

  const fetchAchievements = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/achievements/${cId}`);
      if (res?.success) setAchievements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/achievements', {
        childId: selectedChildId,
        title: title.trim(),
        category,
        level,
        date,
        description: description.trim(),
        organizer: organizer.trim() || undefined,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setOrganizer('');
      fetchAchievements(selectedChildId);
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
            <Trophy className="w-5 h-5 text-amber-600" />
            <span>Honors, Competitions & Certificates</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Recognizing Vedic chanting, arts, debate, science, and Seva accomplishments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Achievement</span>
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
          <span>Loading achievements...</span>
        </div>
      ) : achievements.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No achievements recorded yet for this child.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {achievements.map((a) => (
            <div
              key={a._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{a.title}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  {a.level}
                </span>
              </div>

              <div className="text-[10px] text-stone-500 font-medium">{a.category}</div>

              <p className="text-stone-700 text-xs bg-[#FDFBF7] p-2.5 rounded-xl border border-stone-100">
                "{a.description}"
              </p>

              {a.organizer && (
                <div className="text-[11px] text-stone-600">Organizer: {a.organizer}</div>
              )}

              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
                <span>Date: {new Date(a.date).toLocaleDateString()}</span>
                <span>By: {a.recordedByName}</span>
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
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">Record Child Achievement</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. First Prize in State Bhagavad Gita Recitation"
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
                    <option value="Vedic & Cultural">Vedic & Cultural</option>
                    <option value="Academic & Literary">Academic & Literary</option>
                    <option value="Arts & Performance">Arts & Performance</option>
                    <option value="Sports & Physical">Sports & Physical</option>
                    <option value="Seva & Community">Seva & Community</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Recognition Level</label>
                  <select
                    value={level}
                    onChange={(e: any) => setLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Gurukula">Gurukula</option>
                    <option value="Inter-School">Inter-School</option>
                    <option value="District">District</option>
                    <option value="State">State</option>
                    <option value="National">National</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event details, citation received, scholar comments..."
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
                  {isSubmitting ? 'Saving...' : 'Save Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
