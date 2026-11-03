import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Applicant, AdmissionStatus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  UserPlus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Plus,
  ArrowRight,
  GraduationCap,
  Sparkles,
  X,
  UserCheck,
} from 'lucide-react';

const EXACT_STATUSES: AdmissionStatus[] = [
  'Application Received',
  'Selected for Interview',
  'Invited',
  'Selected as Student',
  'Not Interested',
  'Not Eligible',
  'Admission Not Taken',
  'To be Followed Up Later',
];

export const Admissions: React.FC = () => {
  const { canManageAdmissions } = useAuth();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Form states for conversion
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState('');
  const [convertError, setConvertError] = useState('');

  useEffect(() => {
    fetchApplicants();
    fetchGrades();
  }, [selectedStatus, selectedGrade, searchQuery, showOverdueOnly]);

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      let query = `?status=${selectedStatus}&grade=${selectedGrade}`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (showOverdueOnly) query += `&overdueOnly=true`;

      const res: any = await api.get(`/admissions${query}`);
      if (res?.success) {
        setApplicants(res.data || []);
        setStatusCounts(res.meta?.statusCounts || {});
        setUpcomingInterviews(res.meta?.upcomingInterviews || []);
        setOverdueCount(res.meta?.overdueCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const res: any = await api.get('/academic/grades');
      if (res?.success) {
        setGrades(res.data || []);
        if (res.data.length > 0) setSelectedGradeId(res.data[0]._id);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    setIsConverting(true);
    setConvertError('');
    setConvertSuccess('');

    try {
      const res: any = await api.post(`/admissions/${selectedApplicant._id}/convert`, {
        gradeId: selectedGradeId,
        admissionDate,
      });

      if (res?.success) {
        setConvertSuccess(`Successfully enrolled as ${res.data.child.studentId}!`);
        setTimeout(() => {
          setShowConvertModal(false);
          setConvertSuccess('');
          fetchApplicants();
        }, 1200);
      }
    } catch (err: any) {
      setConvertError(err.message || 'Failed to convert applicant.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <span>Admissions Management & Candidate Pipeline</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Holistic admissions workflow from enquiry to interview and authorized enrollment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-stone-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {canManageAdmissions && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Applicant</span>
            </button>
          )}
        </div>
      </div>

      {/* Upcoming Interviews & Overdue Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Upcoming Interviews */}
        <div className="p-3 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900">Upcoming Interviews ({upcomingInterviews.length})</span>
              <p className="text-[11px] text-stone-500">Scheduled candidate interactions</p>
            </div>
          </div>
          {upcomingInterviews.length > 0 && (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              Next: {new Date(upcomingInterviews[0].interviewDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Overdue Follow-ups */}
        <div className="p-3 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900">Overdue Admission Follow-ups</span>
              <p className="text-[11px] text-stone-500">{overdueCount} require attention</p>
            </div>
          </div>
          <button
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              showOverdueOnly
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {showOverdueOnly ? 'Show All' : 'Filter Overdue'}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by child name, application #, parent..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none"
        >
          <option value="all">All 8 Statuses</option>
          {EXACT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st} ({statusCounts[st] || 0})
            </option>
          ))}
        </select>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none"
        >
          <option value="all">All Grades</option>
          <option value="Shishu Varga (Age 5-6)">Shishu Varga</option>
          <option value="Bala Varga 1 (Grade 1)">Bala Varga 1</option>
          <option value="Bala Varga 2 (Grade 2)">Bala Varga 2</option>
          <option value="Kishori Varga 1 (Grade 6)">Kishori Varga 1</option>
        </select>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-[1200px]">
            {EXACT_STATUSES.map((st) => {
              const columnApplicants = applicants.filter((a) => a.currentStatus === st);
              return (
                <div key={st} className="w-64 flex-shrink-0 flex flex-col bg-[#F6F3EC]/70 rounded-2xl border border-[#EAE4D7] p-2.5 max-h-[75vh]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE4D7]">
                    <span className="font-bold text-stone-800 text-[11px] truncate" title={st}>
                      {st}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-stone-600 border border-stone-200">
                      {columnApplicants.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {columnApplicants.length === 0 ? (
                      <div className="text-center py-6 text-stone-400 text-[11px] italic">
                        Empty
                      </div>
                    ) : (
                      columnApplicants.map((app) => (
                        <div
                          key={app._id}
                          className="p-2.5 rounded-xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-emerald-800 font-bold">
                              {app.applicationNumber}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium">
                              {app.applyingForGrade.split(' ')[0]}
                            </span>
                          </div>

                          <div className="font-bold text-stone-900 text-xs">
                            {app.childFullName}
                            {app.vernacularName && (
                              <span className="text-[10px] text-stone-500 font-normal ml-1">
                                ({app.vernacularName})
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-600">
                            Parent: {app.guardianName} ({app.guardianPhone})
                          </div>

                          {app.interviewDate && (
                            <div className="text-[10px] text-emerald-800 flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3" />
                              <span>IV: {new Date(app.interviewDate).toLocaleDateString()}</span>
                            </div>
                          )}

                          {app.staffNotes && (
                            <p className="text-[10px] text-stone-500 italic line-clamp-2 bg-stone-50 p-1 rounded">
                              "{app.staffNotes}"
                            </p>
                          )}

                          {/* Action Bar */}
                          <div className="pt-1.5 flex items-center justify-between border-t border-stone-100 text-[10px]">
                            {app.isEnrolled ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> Enrolled
                              </span>
                            ) : (
                              canManageAdmissions && (
                                <button
                                  onClick={() => {
                                    setSelectedApplicant(app);
                                    setShowConvertModal(true);
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] flex items-center gap-0.5"
                                  title="Explicitly enroll candidate as confirmed Gurukula student"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Enroll Student</span>
                                </button>
                              )
                            )}

                            <button
                              onClick={() => {
                                setSelectedApplicant(app);
                                setShowInterviewModal(true);
                              }}
                              className="text-stone-500 hover:text-stone-900"
                            >
                              Interviews ({app.interviews?.length || 0})
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#EAE4D7] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#EAE4D7] text-stone-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3">App #</th>
                <th className="py-2.5 px-3">Child Name</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Guardian Contact</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Interview Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {applicants.map((a) => (
                <tr key={a._id} className="hover:bg-stone-50/70">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{a.applicationNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-stone-900">
                    {a.childFullName}
                    {a.vernacularName && <span className="text-stone-400 text-[10px] ml-1">({a.vernacularName})</span>}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">{a.applyingForGrade}</td>
                  <td className="py-2.5 px-3 text-stone-600">
                    <div>{a.guardianName}</div>
                    <div className="text-[10px] text-stone-400">{a.guardianPhone}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                      {a.currentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {a.interviewDate ? new Date(a.interviewDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {a.isEnrolled ? (
                      <span className="text-emerald-700 font-bold text-[10px]">Enrolled</span>
                    ) : (
                      canManageAdmissions && (
                        <button
                          onClick={() => {
                            setSelectedApplicant(a);
                            setShowConvertModal(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-[#1B4332] text-amber-300 font-bold text-[10px] hover:bg-[#2D6A4F]"
                        >
                          Enroll
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Convert Applicant to Student Modal */}
      {showConvertModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1B4332]" />
                <h3 className="font-serif font-bold text-sm text-[#1B4332]">
                  Authorized Gurukula Enrollment
                </h3>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {convertError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
                {convertError}
              </div>
            )}

            {convertSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                {convertSuccess}
              </div>
            )}

            <div className="p-3 rounded-xl bg-white border border-[#EAE4D7] space-y-1">
              <div className="font-bold text-stone-900 text-sm">{selectedApplicant.childFullName}</div>
              <div className="text-[11px] text-stone-600">Application #: {selectedApplicant.applicationNumber}</div>
              <div className="text-[11px] text-stone-600">Parent: {selectedApplicant.guardianName} ({selectedApplicant.guardianPhone})</div>
              <div className="text-[10px] text-amber-800 font-semibold mt-1">
                Note: Candidate will be assigned a permanent Student ID (e.g. SKMG-2026-XXX) and admission history will be preserved.
              </div>
            </div>

            <form onSubmit={handleConvert} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Confirm Grade / Varga</label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE4D7] text-stone-900"
                >
                  {grades.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Formal Joining / Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE4D7] text-stone-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1.5"
                >
                  {isConverting ? (
                    <span>Enrolling...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm & Enroll Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Applicant Modal */}
      {showCreateModal && (
        <CreateApplicantModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchApplicants();
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Create Applicant Modal
const CreateApplicantModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    childFullName: '',
    vernacularName: '',
    dateOfBirth: '2018-05-15',
    gender: 'Female',
    applyingForGrade: 'Bala Varga 1 (Grade 1)',
    referralSource: 'Direct Enquiry',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelation: 'Mother',
    guardianOccupation: '',
    currentStatus: 'Application Received' as AdmissionStatus,
    staffNotes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childFullName || !formData.guardianName || !formData.guardianPhone) {
      setErrorMsg('Please fill in required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/admissions', formData);
      onCreated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create application.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
          <h3 className="font-serif font-bold text-sm text-[#1B4332]">New Gurukula Admission Application</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Child Full Name *</label>
              <input
                type="text"
                required
                value={formData.childFullName}
                onChange={(e) => setFormData({ ...formData, childFullName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                placeholder="e.g. Gayatri Kulkarni"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Vernacular Name (Kannada/Devanagari)</label>
              <input
                type="text"
                value={formData.vernacularName}
                onChange={(e) => setFormData({ ...formData, vernacularName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                placeholder="e.g. ಗಾಯತ್ರಿ ಕುಲಕರ್ಣಿ"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Applying for Grade *</label>
              <select
                value={formData.applyingForGrade}
                onChange={(e) => setFormData({ ...formData, applyingForGrade: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
              >
                <option value="Shishu Varga (Age 5-6)">Shishu Varga</option>
                <option value="Bala Varga 1 (Grade 1)">Bala Varga 1</option>
                <option value="Bala Varga 2 (Grade 2)">Bala Varga 2</option>
                <option value="Kishori Varga 1 (Grade 6)">Kishori Varga 1</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                placeholder="e.g. Smt. Sumitra Kulkarni"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Parent Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                placeholder="+91 94480 12345"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Initial Staff Observation / Notes</label>
            <textarea
              rows={2}
              value={formData.staffNotes}
              onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
              placeholder="Initial impressions, family background, referral context..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
            >
              {isLoading ? 'Creating...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
