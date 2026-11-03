import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { FollowUpItem, Child } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Search,
  MessageSquare,
  X,
  UserCheck,
} from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const { user } = useAuth();

  const [followups, setFollowups] = useState<FollowUpItem[]>([]);
  const [metrics, setMetrics] = useState({
    dueToday: 0,
    overdue: 0,
    upcoming: 0,
    completed: 0,
    totalOpen: 0,
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Review Note Modal
  const [selectedFollowup, setSelectedFollowup] = useState<FollowUpItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Complete Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [outcomeSummary, setOutcomeSummary] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [newChildId, setNewChildId] = useState('');
  const [newConcern, setNewConcern] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    fetchFollowups();
  }, [filterType, statusFilter]);

  const fetchFollowups = async () => {
    setIsLoading(true);
    try {
      let query = `?status=${statusFilter}`;
      if (filterType !== 'all') query += `&filterType=${filterType}`;

      const res: any = await api.get(`/followups${query}`);
      if (res?.success) {
        setFollowups(res.data || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = async () => {
    try {
      const res: any = await api.get('/children?status=active');
      if (res?.success) {
        setChildren(res.data || []);
        if (res.data.length > 0) setNewChildId(res.data[0]._id);
      }
      setShowCreateModal(true);
    } catch (e) {
      // ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/followups', {
        childId: newChildId,
        concernOrGoal: newConcern,
        actionPlan: newPlan,
        dueDate: newDueDate || undefined,
      });
      setShowCreateModal(false);
      setNewConcern('');
      setNewPlan('');
      fetchFollowups();
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    }
  };

  const handleAddReviewNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowup || !reviewNote.trim()) return;

    try {
      await api.post(`/followups/${selectedFollowup._id}/review-notes`, {
        note: reviewNote.trim(),
      });
      setShowReviewModal(false);
      setReviewNote('');
      fetchFollowups();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowup) return;

    try {
      await api.put(`/followups/${selectedFollowup._id}`, {
        status: 'Completed',
        outcomeSummary: outcomeSummary.trim(),
      });
      setShowCompleteModal(false);
      setOutcomeSummary('');
      fetchFollowups();
    } catch (err: any) {
      alert(err.message || 'Failed to complete action');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-600" />
            <span>Support Actions & Follow-up Center</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Trackable mentorship interventions, progress check-ins, and corrective actions.
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Support Action</span>
        </button>
      </div>

      {/* 4 Workload Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setFilterType('dueToday');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterType === 'dueToday'
              ? 'bg-amber-100/70 border-amber-400 shadow-md ring-2 ring-amber-400/30'
              : 'bg-white border-[#EAE4D7] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 font-medium text-[11px]">
            <span>Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-900 mt-1">{metrics.dueToday}</div>
          <span className="text-[10px] text-amber-700">Needs review today</span>
        </button>

        <button
          onClick={() => {
            setFilterType('overdue');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterType === 'overdue'
              ? 'bg-red-100/70 border-red-400 shadow-md ring-2 ring-red-400/30'
              : 'bg-white border-[#EAE4D7] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-red-800 font-medium text-[11px]">
            <span>Overdue Actions</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-900 mt-1">{metrics.overdue}</div>
          <span className="text-[10px] text-red-700">Immediate attention</span>
        </button>

        <button
          onClick={() => {
            setFilterType('upcoming');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterType === 'upcoming'
              ? 'bg-blue-100/70 border-blue-400 shadow-md ring-2 ring-blue-400/30'
              : 'bg-white border-[#EAE4D7] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-blue-800 font-medium text-[11px]">
            <span>Upcoming Support</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-900 mt-1">{metrics.upcoming}</div>
          <span className="text-[10px] text-blue-700">Scheduled milestones</span>
        </button>

        <button
          onClick={() => {
            setFilterType('all');
            setStatusFilter('Completed');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Completed'
              ? 'bg-emerald-100/70 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
              : 'bg-white border-[#EAE4D7] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 font-medium text-[11px]">
            <span>Completed Actions</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-900 mt-1">{metrics.completed}</div>
          <span className="text-[10px] text-emerald-700">Successfully resolved</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-2xl bg-white border border-[#EAE4D7] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Filter Status:</span>
          {['all', 'Open', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setFilterType('all');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === st && filterType === 'all'
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {(filterType !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setFilterType('all');
              setStatusFilter('all');
            }}
            className="text-stone-500 hover:text-stone-800 text-[11px] underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Follow-ups List */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading support actions...</span>
        </div>
      ) : followups.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No support actions match your filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {followups.map((f) => {
            const isOverdue =
              new Date(f.dueDate).getTime() < new Date().setHours(0, 0, 0, 0) &&
              ['Open', 'In Progress'].includes(f.status);

            return (
              <div
                key={f._id}
                className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{f.childName}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : f.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center gap-3">
                    <span>Assigned to: <strong className="text-stone-800">{f.assignedToName}</strong></span>
                    <span>Due: <strong className={isOverdue ? 'text-red-600 font-bold' : 'text-stone-800'}>{new Date(f.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-stone-100 space-y-1">
                  <div className="font-semibold text-stone-900">{f.concernOrGoal}</div>
                  <p className="text-stone-700 leading-relaxed">Action Plan: {f.actionPlan}</p>
                  {f.outcomeSummary && (
                    <div className="text-emerald-800 text-[11px] font-medium pt-1">
                      Outcome: {f.outcomeSummary}
                    </div>
                  )}
                </div>

                {/* Review Notes Feed */}
                {f.reviewNotes && f.reviewNotes.length > 0 && (
                  <div className="pl-3 border-l-2 border-amber-300 space-y-1 text-[11px]">
                    {f.reviewNotes.map((n, idx) => (
                      <div key={idx} className="text-stone-600">
                        <span className="font-bold text-stone-800">{n.authorName}:</span> "{n.note}"
                        <span className="text-stone-400 text-[10px] ml-1">
                          ({new Date(n.date).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedFollowup(f);
                      setShowReviewModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 font-medium text-stone-700 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                    <span>Add Review Note</span>
                  </button>

                  {f.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        setSelectedFollowup(f);
                        setShowCompleteModal(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Review Note Modal */}
      {showReviewModal && selectedFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-bold text-stone-900">Add Mentor Review Note</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReviewNote} className="space-y-3">
              <textarea
                rows={3}
                required
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Record observation on progress, response to intervention, next steps..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && selectedFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-bold text-stone-900">Complete Support Action</h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleComplete} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Outcome & Closing Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={outcomeSummary}
                  onChange={(e) => setOutcomeSummary(e.target.value)}
                  placeholder="Summarize the outcome achieved and how the child responded to the guidance..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Follow-up Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-bold text-stone-900">Create New Support Action</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Child</label>
                <select
                  value={newChildId}
                  onChange={(e) => setNewChildId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                >
                  {children.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName} ({c.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Concern or Goal *</label>
                <input
                  type="text"
                  required
                  value={newConcern}
                  onChange={(e) => setNewConcern(e.target.value)}
                  placeholder="e.g. Sanskrit Reading Fluency"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Action Plan *</label>
                <textarea
                  rows={2}
                  required
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  placeholder="e.g. 15-minute daily pair study with senior peer mentor..."
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
