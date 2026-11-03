import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../api/client.js';
import { Child, GradeGroup } from '../types/index.js';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Milestone,
  ArrowRight,
  Clock,
  Heart,
  Phone,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const ChildrenList: React.FC = () => {
  const { openQuickObservation } = useOutletContext<{ openQuickObservation: () => void }>();

  const [children, setChildren] = useState<Child[]>([]);
  const [grades, setGrades] = useState<GradeGroup[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'alumni' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
    fetchChildren();
  }, [selectedGrade, statusFilter, searchQuery]);

  const fetchGrades = async () => {
    try {
      const res: any = await api.get('/academic/grades');
      if (res?.success) setGrades(res.data || []);
    } catch (e) {
      // ignore
    }
  };

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      let query = `?status=${statusFilter}&grade=${selectedGrade}`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;

      const res: any = await api.get(`/children${query}`);
      if (res?.success) {
        setChildren(res.data || []);
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
            <Users className="w-5 h-5 text-amber-600" />
            <span>Gurukula Children Directory</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Permanent longitudinal profiles documenting character, academic journey, talents, and Seva.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openQuickObservation}
            className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all shadow-sm flex items-center gap-1.5 active:scale-95 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Quick Observe</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student ID, child name, or vernacular script..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />
        </div>

        {/* Grade Filter */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none"
        >
          <option value="all">All Grades / Vargas</option>
          {grades.map((g) => (
            <option key={g._id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Active vs Alumni */}
        <div className="flex items-center rounded-xl border border-stone-200 bg-white p-0.5">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'active' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Active Students
          </button>
          <button
            onClick={() => setStatusFilter('alumni')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'alumni' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Alumni
          </button>
        </div>
      </div>

      {/* Children Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading children profiles...</span>
        </div>
      ) : children.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7]">
          <p className="text-stone-500 font-medium">No children match the current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {children.map((child) => (
            <div
              key={child._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header: Student ID & Grade Tag */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {child.studentId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EFE6] text-stone-700">
                    {child.currentGradeName}
                  </span>
                </div>

                {/* Child Name & Details */}
                <div className="mt-2.5">
                  <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    <span>{child.fullName}</span>
                    {child.vernacularName && (
                      <span className="text-xs text-amber-800 font-normal">({child.vernacularName})</span>
                    )}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Admitted: {new Date(child.admissionDate).toLocaleDateString()}
                  </p>
                </div>

                {child.educationalHistory && (
                  <p className="mt-2 text-[11px] text-stone-600 bg-[#FDFBF7] p-2 rounded-xl border border-stone-100 line-clamp-2">
                    {child.educationalHistory}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <Link
                  to={`/timeline?childId=${child._id}`}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 font-medium text-[10px] flex items-center gap-1"
                  title="View Signature Journey Timeline"
                >
                  <Milestone className="w-3 h-3 text-amber-700" />
                  <span>Timeline</span>
                </Link>

                <Link
                  to={`/children/${child._id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] text-[11px] flex items-center gap-1 shadow-sm"
                >
                  <span>Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
