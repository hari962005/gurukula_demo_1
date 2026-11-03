import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import {
  Users,
  GraduationCap,
  Sparkles,
  CheckSquare,
  Clock,
  ArrowRight,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Eye,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#1B4332', '#2D6A4F', '#D97706', '#B45309', '#081C15', '#40916C'];

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const { openQuickObservation } = useOutletContext<{ openQuickObservation: () => void }>();

  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [role]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/dashboard/metrics');
      if (res?.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 text-xs">
        <Clock className="w-5 h-5 animate-spin text-[#1B4332] mr-2" />
        <span>Loading live Gurukula metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in text-xs">
      {/* Welcome & Invocation Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-3 top-3 text-7xl font-serif text-white/5 select-none pointer-events-none">
          ॐ
        </div>

        <div className="relative z-10">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-serif font-bold text-[10px] mb-2 border border-amber-400/30">
            शुभं करोति कल्याणमारोग्यं धनसंपदा
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold tracking-wide">
            Namaste, {user?.fullName}
          </h2>
          <p className="text-emerald-100 text-[11px] sm:text-xs mt-0.5 max-w-xl">
            Child Journey Dashboard — Dedicated to documenting and nurturing each child's holistic growth, Vedic samskaras, and character.
          </p>

          {/* Quick Observe CTA for Teachers */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={openQuickObservation}
              className="px-4 py-2 rounded-xl bg-amber-400 text-[#1B4332] font-bold hover:bg-amber-300 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 text-xs"
            >
              <Sparkles className="w-4 h-4 text-[#1B4332]" />
              <span>+ Record Quick Observation (10s)</span>
            </button>

            <Link
              to="/children"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Children Directory</span>
            </Link>

            <Link
              to="/timeline"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 font-medium border border-amber-400/20 transition-all flex items-center gap-1.5"
            >
              <span>Explore Signature Timelines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role-Specific Dashboard Views */}
      {role === 'teacher' && <TeacherDashboardView data={metrics} openQuickObs={openQuickObservation} />}
      {role === 'coordinator' && <CoordinatorDashboardView data={metrics} />}
      {role === 'management' && <ManagementDashboardView data={metrics} />}
      {role === 'admin' && <AdminDashboardView data={metrics} />}
      {role === 'admissions' && <AdmissionsDashboardView data={metrics} />}
    </div>
  );
};

// 1. Teacher Dashboard Component
const TeacherDashboardView: React.FC<{ data: any; openQuickObs: () => void }> = ({ data, openQuickObs }) => {
  return (
    <div className="space-y-5">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="font-medium text-[11px]">Assigned Children</span>
            <Users className="w-4 h-4 text-[#1B4332]" />
          </div>
          <div className="text-xl font-bold text-stone-900">{data?.assignedChildrenCount || 0}</div>
          <span className="text-[10px] text-stone-400">In your care</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="font-medium text-[11px]">Actions Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-800">{data?.dueTodayFollowUps || 0}</div>
          <span className="text-[10px] text-amber-600">Requires follow-up</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="font-medium text-[11px]">Overdue Actions</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-bold text-red-700">{data?.overdueFollowUps || 0}</div>
          <span className="text-[10px] text-red-500">Urgent attention</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="font-medium text-[11px]">Pending Workload</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-900">{data?.pendingFollowUpsCount || 0}</div>
          <span className="text-[10px] text-stone-400">Total support items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Follow-ups */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <h3 className="font-semibold text-stone-900 flex items-center gap-1.5 text-xs">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Assigned Corrective Actions & Follow-ups</span>
            </h3>
            <Link to="/followups" className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]">
              View All →
            </Link>
          </div>

          {data?.followUps?.length === 0 ? (
            <p className="text-stone-400 py-6 text-center text-xs">No pending actions assigned. All clear!</p>
          ) : (
            <div className="space-y-2">
              {data?.followUps?.map((f: any) => (
                <div key={f._id} className="p-2.5 rounded-xl border border-stone-100 bg-[#FDFBF7] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900">{f.childId?.fullName || f.childName}</span>
                    <p className="text-[11px] text-stone-600 line-clamp-1">{f.actionPlan}</p>
                    <span className="text-[10px] text-amber-700 font-medium">
                      Due: {new Date(f.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Children Quick Observation Launcher */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <h3 className="font-semibold text-stone-900 flex items-center gap-1.5 text-xs">
              <Users className="w-4 h-4 text-[#1B4332]" />
              <span>My Assigned Children</span>
            </h3>
            <Link to="/children" className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]">
              All Children →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data?.children?.map((c: any) => (
              <div key={c._id} className="p-2.5 rounded-xl border border-[#EAE4D7] bg-[#FDFBF7] flex items-center justify-between">
                <div>
                  <Link to={`/children/${c._id}`} className="font-bold text-stone-900 hover:text-emerald-800">
                    {c.fullName}
                  </Link>
                  <p className="text-[10px] text-stone-500">{c.currentGradeName}</p>
                </div>
                <button
                  onClick={openQuickObs}
                  className="px-2 py-1 rounded-lg bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] text-[10px]"
                >
                  Observe
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Coordinator Dashboard Component
const CoordinatorDashboardView: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Enrolled Children</span>
          <div className="text-xl font-bold text-[#1B4332]">{data?.totalActiveChildren || 0}</div>
          <span className="text-[10px] text-stone-400">Active students</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Open Follow-ups</span>
          <div className="text-xl font-bold text-amber-700">{data?.totalOpenFollowUps || 0}</div>
          <span className="text-[10px] text-amber-600">{data?.overdueFollowUps || 0} overdue</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Admissions Pipeline</span>
          <div className="text-xl font-bold text-blue-700">{data?.totalApplicants || 0}</div>
          <span className="text-[10px] text-stone-400">Total in review</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Alumni Network</span>
          <div className="text-xl font-bold text-purple-700">{data?.totalAlumni || 0}</div>
          <span className="text-[10px] text-stone-400">Graduates preserved</span>
        </div>
      </div>

      {/* Grade Group Breakdown */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-3 text-xs">
          Grade & Group Enrollment Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.gradeStats?.map((g: any) => (
            <div key={g.id} className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7]">
              <div className="font-bold text-stone-900">{g.name}</div>
              <div className="text-lg font-bold text-[#1B4332] mt-1">{g.childrenCount} Children</div>
              <p className="text-[10px] text-stone-500 mt-0.5">{g.code}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Management / Trustee Dashboard Component
const ManagementDashboardView: React.FC<{ data: any }> = ({ data }) => {
  const gradeData = (data?.gradeDistribution || []).map((item: any) => ({
    name: item._id,
    value: item.count,
  }));

  const skillData = (data?.skillsCategoryAggregation || []).map((item: any) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Total Active Enrolled</span>
          <div className="text-xl font-bold text-[#1B4332]">{data?.totalActiveChildren || 0}</div>
          <span className="text-[10px] text-emerald-600">Stable community</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Alumni Graduated</span>
          <div className="text-xl font-bold text-purple-700">{data?.totalAlumni || 0}</div>
          <span className="text-[10px] text-purple-600">Lifelong relationship</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Admission Applications</span>
          <div className="text-xl font-bold text-blue-700">{data?.totalApplicants || 0}</div>
          <span className="text-[10px] text-stone-400">Current cycle</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Well-being Reviews Logged</span>
          <div className="text-xl font-bold text-amber-700">{data?.totalWellBeingReviews || 0}</div>
          <span className="text-[10px] text-amber-600">Proactive care index</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grade Distribution Chart */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-3 text-xs">Enrollment by Grade / Varga</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1B4332" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holistic Skills Distribution */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-3 text-xs">Holistic Talent & Skill Domains</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#D97706" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Admin Dashboard Component
const AdminDashboardView: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">System Users</span>
          <div className="text-xl font-bold text-stone-900">{data?.totalUsers || 0}</div>
          <span className="text-[10px] text-emerald-600">{data?.activeUsers || 0} active</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Security Audit Logs</span>
          <div className="text-xl font-bold text-purple-700">{data?.totalAuditLogs || 0}</div>
          <span className="text-[10px] text-stone-400">Events audited</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Total Observations</span>
          <div className="text-xl font-bold text-[#1B4332]">{data?.stats?.observations || 0}</div>
          <span className="text-[10px] text-stone-400">Logged to date</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
          <span className="text-[11px] text-stone-500">Actions & Follow-ups</span>
          <div className="text-xl font-bold text-amber-700">{data?.stats?.followUps || 0}</div>
          <span className="text-[10px] text-stone-400">Total support items</span>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
          <h3 className="font-semibold text-stone-900 text-xs">Security & System Audit Log</h3>
          <Link to="/admin" className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]">
            Manage System →
          </Link>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          {data?.recentAuditLogs?.map((log: any) => (
            <div key={log._id} className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800">[{log.action}]</span>{' '}
                <span className="text-stone-600">{log.resourceType}</span>
                {log.userEmail && <span className="text-stone-400"> by {log.userEmail}</span>}
              </div>
              <span className="text-stone-400 text-[10px]">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. Admissions Coordinator View
const AdmissionsDashboardView: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900 text-xs">Admissions Hub</h3>
          <Link to="/admissions" className="px-3 py-1 rounded-xl bg-[#1B4332] text-amber-300 font-bold text-xs">
            Open Admissions Kanban & Table →
          </Link>
        </div>
        <p className="text-stone-600 text-xs">
          Manage enquiry pipeline, interview activities, assessments, and authorized applicant-to-student conversions.
        </p>
      </div>
    </div>
  );
};
