import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { AlumniProfileItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  X,
} from 'lucide-react';

export const AlumniPage: React.FC = () => {
  const [alumni, setAlumni] = useState<AlumniProfileItem[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [mentorFilter, setMentorFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Interaction Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfileItem | null>(null);
  const [eventType, setEventType] = useState<'Gurukula Visit' | 'Guest Lecture / Session' | 'Mentorship Meeting' | 'Festival Attendance' | 'Contribution' | 'Phone / Email Check-in'>('Gurukula Visit');
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, [selectedYear, mentorFilter, searchQuery]);

  const fetchAlumni = async () => {
    setIsLoading(true);
    try {
      let query = `?completionYear=${selectedYear}`;
      if (mentorFilter) query += `&mentorOnly=true`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;

      const res: any = await api.get(`/alumni${query}`);
      if (res?.success) {
        setAlumni(res.data || []);
        if (res.meta?.completionYears) setYears(res.meta.completionYears);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumni || !summary.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/alumni/${selectedAlumni._id}/interactions`, {
        eventType,
        summary: summary.trim(),
      });
      setShowModal(false);
      setSummary('');
      fetchAlumni();
    } catch (err: any) {
      alert(err.message || 'Failed to record interaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <span>Alumni Samavartana & Lifelong Engagement</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Preserving longitudinal developmental profiles of graduates, mentorship connections, and campus visits.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alumni name, pursuit, location..."
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs"
          >
            <option value="all">All Graduating Classes</option>
            {years.map((y) => (
              <option key={y} value={y}>
                Class of {y}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 font-medium">
            <input
              type="checkbox"
              checked={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.checked)}
              className="rounded text-[#1B4332] focus:ring-[#1B4332]"
            />
            <span>Willing to Mentor</span>
          </label>
        </div>

        <div className="text-[11px] text-stone-500">
          Graduates Registered: <strong>{alumni.length}</strong>
        </div>
      </div>

      {/* Alumni Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading alumni directory...</span>
        </div>
      ) : alumni.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No alumni profiles match the criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {alumni.map((a) => (
            <div
              key={a._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm">{a.fullName}</h3>
                    <span className="font-mono text-[10px] text-emerald-800 font-bold">{a.studentId}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F0] text-[#1B4332] border border-[#EAE4D7]">
                    Class of {a.completionYear}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-600 mt-2">
                  <div>Completed: <strong>{a.highestGradeCompleted}</strong></div>
                  {a.currentPursuit && <div>Current Pursuit: <strong>{a.currentPursuit}</strong></div>}
                  {a.currentLocation && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{a.currentLocation}</span>
                    </div>
                  )}
                  {a.specialExpertise && (
                    <div className="text-[11px] text-amber-900 font-medium">
                      Special Expertise: {a.specialExpertise}
                    </div>
                  )}
                </div>

                {/* Interaction summary */}
                {a.interactions && a.interactions.length > 0 && (
                  <div className="mt-2 p-2 rounded-xl bg-[#FDFBF7] border border-stone-100 space-y-1">
                    <span className="text-[10px] font-bold text-stone-700 block">Recent Engagement:</span>
                    <div className="text-[11px] text-stone-600 line-clamp-2">
                      "{a.interactions[a.interactions.length - 1].summary}"
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                {a.willingnessToMentor && (
                  <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Active Student Mentor
                  </span>
                )}

                <button
                  onClick={() => {
                    setSelectedAlumni(a);
                    setShowModal(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] text-[10px] flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Log Visit / Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Interaction Modal */}
      {showModal && selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">
                Log Alumni Engagement ({selectedAlumni.fullName})
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordInteraction} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Interaction Type</label>
                <select
                  value={eventType}
                  onChange={(e: any) => setEventType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="Gurukula Visit">Gurukula Visit</option>
                  <option value="Guest Lecture / Session">Guest Lecture / Workshop Session</option>
                  <option value="Mentorship Meeting">Student Mentorship Meeting</option>
                  <option value="Festival Attendance">Festival / Utsav Attendance</option>
                  <option value="Contribution">Contribution / Book Seva</option>
                  <option value="Phone / Email Check-in">Phone / Email Check-in</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Interaction Summary & Reflection *
                </label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe visit discussions, clinic held with current students, advice shared..."
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
                  {isSubmitting ? 'Saving...' : 'Save Interaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
