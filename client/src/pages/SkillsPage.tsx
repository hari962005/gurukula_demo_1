import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, SkillItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  Plus,
  Clock,
  CheckCircle,
  Tag,
  Star,
  Award,
  X,
} from 'lucide-react';

const SKILL_CATEGORIES = [
  'Vedic & Stotra Chanting',
  'Classical Music & Instruments',
  'Classical Dance & Abhinaya',
  'Debate, Tarka & Samskritam',
  'Krishi & Organic Farming',
  'Hastakala & Handcrafts',
  'Yoga, Asana & Pranayama',
  'Kalaripayattu & Self-Defense',
  'Paaka-kala & Culinary Arts',
  'Leadership & Seva',
  'Other Talents',
];

const SKILL_STAGES = ['Emerging', 'Developing', 'Consistent', 'Strong'] as const;

export const SkillsPage: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState(SKILL_CATEGORIES[0]);
  const [stage, setStage] = useState<typeof SKILL_STAGES[number]>('Developing');
  const [mentorNotes, setMentorNotes] = useState('');
  const [supportiveGuidance, setSupportiveGuidance] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchSkills(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res: any = await api.get('/children?status=active');
      if (res?.success) {
        setChildren(res.data || []);
        if (res.data.length > 0) setSelectedChildId(res.data[0]._id);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSkills = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/skills/${cId}`);
      if (res?.success) {
        setSkills(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !skillName.trim() || !mentorNotes.trim()) return;

    setIsSubmitting(true);
    try {
      const demonstratedMilestones = milestonesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/skills', {
        childId: selectedChildId,
        skillName: skillName.trim(),
        category,
        stage,
        mentorNotes: mentorNotes.trim(),
        supportiveGuidance: supportiveGuidance.trim() || undefined,
        demonstratedMilestones,
      });

      setShowModal(false);
      setSkillName('');
      setMentorNotes('');
      setSupportiveGuidance('');
      setMilestonesInput('');
      fetchSkills(selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Failed to save skill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStageBadgeColor = (stg: string) => {
    switch (stg) {
      case 'Strong':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'Consistent':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
      case 'Developing':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
      case 'Emerging':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Holistic Growth, Skills & Vedic Talents</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Documenting special abilities, traditional arts, organic farming, and character mastery over time.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record New Talent / Skill</span>
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
          Total Skills: <strong>{skills.length}</strong>
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading talent records...</span>
        </div>
      ) : skills.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No skills or talents recorded yet for this child.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {skills.map((s) => (
            <div
              key={s._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{s.skillName}</h3>
                    <p className="text-[10px] text-stone-500">{s.category}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] border ${getStageBadgeColor(
                      s.stage
                    )}`}
                  >
                    Stage: {s.stage}
                  </span>
                </div>

                <p className="text-stone-700 text-xs mt-2 leading-relaxed bg-[#FDFBF7] p-2.5 rounded-xl border border-stone-100">
                  "{s.mentorNotes}"
                </p>

                {s.supportiveGuidance && (
                  <p className="text-[11px] text-amber-900 mt-2 font-medium">
                    Areas Where Support Helps: {s.supportiveGuidance}
                  </p>
                )}

                {s.demonstratedMilestones && s.demonstratedMilestones.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {s.demonstratedMilestones.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] flex items-center gap-1 font-medium"
                      >
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span>{m}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-stone-400 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>Evaluator: {s.evaluatedByName}</span>
                <span>Observed: {new Date(s.lastObservedDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">
                Record Holistic Skill / Vedic Talent
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Skill / Talent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Taittiriya Samhita Recitation / Organic Seed Sowing"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stage of Mastery</label>
                  <select
                    value={stage}
                    onChange={(e: any) => setStage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {SKILL_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mentor Observations & Growth Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Describe demonstrated proficiency, expression, poise, and enthusiasm..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Demonstrated Milestones (Comma separated)
                </label>
                <input
                  type="text"
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  placeholder="e.g. Chanted Shiksha Valli without book, Prepared Jeevamrita compost"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Supportive Guidance (Constructive areas for nurture)
                </label>
                <input
                  type="text"
                  value={supportiveGuidance}
                  onChange={(e) => setSupportiveGuidance(e.target.value)}
                  placeholder="e.g. Gently encourage solo chanting in front of morning gathering"
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
                  {isSubmitting ? 'Saving...' : 'Save Skill Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
