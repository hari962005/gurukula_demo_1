import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api/client.js';
import { ObservationItem, Child } from '../types/index.js';
import {
  Eye,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export const ObservationsPage: React.FC = () => {
  const { openQuickObservation } = useOutletContext<{ openQuickObservation: () => void }>();

  const [observations, setObservations] = useState<ObservationItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
    fetchObservations();
  }, [selectedCategory, selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res: any = await api.get('/children?status=active');
      if (res?.success) setChildren(res.data || []);
    } catch (e) {
      // ignore
    }
  };

  const fetchObservations = async () => {
    setIsLoading(true);
    try {
      let query = '?';
      if (selectedCategory !== 'all') query += `category=${selectedCategory}&`;
      if (selectedChildId !== 'all') query += `childId=${selectedChildId}&`;

      const res: any = await api.get(`/observations${query}`);
      if (res?.success) {
        setObservations(res.data || []);
        if (res.meta?.categories) setCategories(res.meta.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <span>Teacher & Mentor Observations Stream</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Real-time feed of quick mobile developmental notes, strengths, and holistic reflections.
          </p>
        </div>

        <button
          onClick={openQuickObservation}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Quick Observation (10s)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex flex-wrap items-center gap-2.5">
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none"
        >
          <option value="all">All Enrolled Children</option>
          {children.map((c) => (
            <option key={c._id} value={c._id}>
              {c.fullName} ({c.studentId})
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Observations Stream */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading observation feed...</span>
        </div>
      ) : observations.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No observations recorded matching the criteria. Click "+ Quick Observation" to log one!
        </div>
      ) : (
        <div className="space-y-3">
          {observations.map((obs) => (
            <div
              key={obs._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    {obs.childName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B4332] text-amber-300">
                    {obs.category}
                  </span>
                  {obs.requiresFollowUp && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900">
                      ⚡ Action Linked
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(obs.recordedAt).toLocaleString()}
                </span>
              </div>

              <p className="text-stone-800 text-xs leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-stone-100">
                "{obs.note}"
              </p>

              {/* Tags and Author */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <div className="flex flex-wrap gap-1">
                  {obs.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-stone-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-stone-400" />
                  <span>Recorded by: <strong className="text-stone-800">{obs.authorName}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
