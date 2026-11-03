import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Child, TimelineEvent } from '../types/index.js';
import {
  Milestone,
  Filter,
  Calendar,
  Sparkles,
  Download,
  BookOpen,
  Award,
  Compass,
  CheckCircle,
  Eye,
  GraduationCap,
  HeartHandshake,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const JourneyTimelinePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('childId');

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState(childIdParam || '');
  const [childInfo, setChildInfo] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [yearsAvailable, setYearsAvailable] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchTimeline();
    }
  }, [selectedChildId, selectedCategory, selectedYear]);

  const fetchChildren = async () => {
    try {
      const res: any = await api.get('/children?status=all');
      if (res?.success) {
        setChildren(res.data || []);
        if (!selectedChildId && res.data.length > 0) {
          setSelectedChildId(childIdParam || res.data[0]._id);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      let query = '?';
      if (selectedCategory !== 'all') query += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedYear !== 'all') query += `year=${selectedYear}&`;

      const res: any = await api.get(`/children/${selectedChildId}/timeline${query}`);
      if (res?.success) {
        setTimelineEvents(res.data?.timeline || []);
        setChildInfo(res.data?.child);
        if (res.meta?.categories) setCategories(res.meta.categories);
        if (res.meta?.yearsAvailable) setYearsAvailable(res.meta.yearsAvailable);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Admission':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Grade & Academic':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Skills & Talents':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Responsibilities':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Achievements':
        return 'bg-yellow-100 text-yellow-900 border-yellow-200';
      case 'Observations':
        return 'bg-stone-100 text-stone-900 border-stone-200';
      case 'Follow-ups':
        return 'bg-orange-100 text-orange-900 border-orange-200';
      case 'Alumni':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Milestone className="w-5 h-5 text-amber-600" />
            <span>Signature Multi-Year Developmental Timeline</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Longitudinal developmental narrative preserving every step from admission enquiry through Gurukula education into alumni life.
          </p>
        </div>

        {selectedChildId && (
          <a
            href={`/api/v1/reports/child-journey/${selectedChildId}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Download Journey PDF</span>
          </a>
        )}
      </div>

      {/* Child Selector & Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-stone-700">Select Child:</label>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          >
            {children.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName} ({c.studentId}) — {c.currentGradeName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs"
          >
            <option value="all">All Academic Years</option>
            {yearsAvailable.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs"
          >
            <option value="all">All Developmental Domains</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Child Identity Banner */}
      {childInfo && (
        <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#EAE4D7] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {childInfo.studentId}
              </span>
              <span className="font-serif font-bold text-sm text-stone-900">
                {childInfo.fullName}
              </span>
              {childInfo.vernacularName && (
                <span className="text-xs text-amber-800">({childInfo.vernacularName})</span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Current Grade: {childInfo.currentGradeName} | Status: <strong className="uppercase">{childInfo.status}</strong>
            </p>
          </div>

          <Link
            to={`/children/${childInfo.id}`}
            className="px-3 py-1 rounded-xl bg-white border border-[#EAE4D7] text-[#1B4332] font-semibold hover:bg-stone-50 flex items-center gap-1"
          >
            <span>Child Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Chronological Timeline Stream */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Assembling multi-year longitudinal timeline...</span>
        </div>
      ) : timelineEvents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No timeline events recorded matching the criteria.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE4D7]">
          {timelineEvents.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#1B4332] border-2 border-white shadow-md group-hover:scale-110 transition-transform" />

              <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{ev.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(
                        ev.category
                      )}`}
                    >
                      {ev.category}
                    </span>
                    {ev.stageOrBadge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {ev.stageOrBadge}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ev.date).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-stone-700 text-xs leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-stone-100">
                  {ev.description}
                </p>

                {/* Tags and Author info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  {ev.tags && ev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ev.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-600">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {ev.authorOrMentor && (
                    <div className="text-stone-400 italic text-[10px]">
                      Recorded by: {ev.authorOrMentor}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
