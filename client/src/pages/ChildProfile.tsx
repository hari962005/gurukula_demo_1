import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { api } from '../api/client.js';
import { Child, Guardian, EnrollmentHistoryItem, AcademicProgressItem, SkillItem, ResponsibilityItem, AchievementItem, ObservationItem, FollowUpItem, HealthRecordItem, DocumentItem, TimelineEvent } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Users,
  Calendar,
  BookOpen,
  Sparkles,
  Compass,
  Trophy,
  Heart,
  Eye,
  CheckSquare,
  Files,
  Milestone,
  FileText,
  Lock,
  ArrowUpRight,
  GraduationCap,
  Clock,
  CheckCircle,
  Plus,
  Download,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';

export const ChildProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, canViewHealth, canPromoteChild } = useAuth();
  const { openQuickObservation } = useOutletContext<{ openQuickObservation: () => void }>();

  const [childData, setChildData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Sub-module data states
  const [academicProgress, setAcademicProgress] = useState<AcademicProgressItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [responsibilities, setResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [observations, setObservations] = useState<ObservationItem[]>([]);
  const [followups, setFollowups] = useState<FollowUpItem[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecordItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Promotion modal
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [targetGradeId, setTargetGradeId] = useState('');
  const [targetYearId, setTargetYearId] = useState('');
  const [priorReflection, setPriorReflection] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    if (id) {
      loadFullProfile();
    }
  }, [id]);

  useEffect(() => {
    if (id && childData) {
      loadTabData(activeTab);
    }
  }, [activeTab, id, childData]);

  const loadFullProfile = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/children/${id}`);
      if (res?.success) {
        setChildData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTabData = async (tab: string) => {
    if (!id) return;
    try {
      if (tab === 'academic') {
        const res: any = await api.get(`/academic/progress/${id}`);
        if (res?.success) setAcademicProgress(res.data?.progress || []);
      } else if (tab === 'skills') {
        const res: any = await api.get(`/skills/${id}`);
        if (res?.success) setSkills(res.data || []);
      } else if (tab === 'responsibilities') {
        const res: any = await api.get(`/responsibilities/${id}`);
        if (res?.success) setResponsibilities(res.data || []);
      } else if (tab === 'achievements') {
        const res: any = await api.get(`/achievements/${id}`);
        if (res?.success) setAchievements(res.data || []);
      } else if (tab === 'observations') {
        const res: any = await api.get(`/observations?childId=${id}`);
        if (res?.success) setObservations(res.data || []);
      } else if (tab === 'followups') {
        const res: any = await api.get(`/followups?childId=${id}`);
        if (res?.success) setFollowups(res.data || []);
      } else if (tab === 'health' && canViewHealth) {
        const res: any = await api.get(`/health/${id}`);
        if (res?.success) setHealthRecords(res.data || []);
      } else if (tab === 'documents') {
        const res: any = await api.get(`/documents/child/${id}`);
        if (res?.success) setDocuments(res.data || []);
      } else if (tab === 'timeline') {
        const res: any = await api.get(`/children/${id}/timeline`);
        if (res?.success) setTimelineEvents(res.data?.timeline || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const openPromoteDialog = async () => {
    try {
      const [gRes, yRes]: any = await Promise.all([
        api.get('/academic/grades'),
        api.get('/academic/years'),
      ]);
      if (gRes?.success) {
        setGrades(gRes.data || []);
        if (gRes.data.length > 0) setTargetGradeId(gRes.data[0]._id);
      }
      if (yRes?.success) {
        setYears(yRes.data || []);
        const active = yRes.data.find((y: any) => y.isCurrent) || yRes.data[0];
        if (active) setTargetYearId(active._id);
      }
      setShowPromoteModal(true);
    } catch (e) {
      // ignore
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPromoting(true);
    try {
      await api.post(`/children/${id}/promote`, {
        newGradeId: targetGradeId,
        newAcademicYearId: targetYearId,
        priorYearQualitativeSummary: priorReflection,
      });
      setShowPromoteModal(false);
      loadFullProfile();
    } catch (err: any) {
      alert(err.message || 'Promotion failed.');
    } finally {
      setIsPromoting(false);
    }
  };

  const downloadPdfReport = () => {
    window.open(`/api/v1/reports/child-journey/${id}/pdf`, '_blank');
  };

  if (isLoading || !childData) {
    return (
      <div className="py-20 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 animate-spin text-[#1B4332]" />
        <span>Loading holistic child journey...</span>
      </div>
    );
  }

  const child: Child = childData.child;
  const guardians: Guardian[] = childData.guardians || [];
  const enrollmentHistory: EnrollmentHistoryItem[] = childData.enrollmentHistory || [];
  const counts = childData.counts || {};

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Milestone },
    { id: 'personal', label: 'Personal Details', icon: Users },
    { id: 'family', label: 'Family & Guardians', icon: Users, count: guardians.length },
    { id: 'academic', label: 'Academic Journey', icon: BookOpen, count: counts.academic },
    { id: 'skills', label: 'Skills & Talents', icon: Sparkles, count: counts.skills },
    { id: 'responsibilities', label: 'Responsibilities', icon: Compass, count: counts.responsibilities },
    { id: 'achievements', label: 'Achievements', icon: Trophy, count: counts.achievements },
    {
      id: 'health',
      label: 'Health & Well-being',
      icon: Heart,
      restricted: !canViewHealth,
      count: canViewHealth ? counts.health : undefined,
    },
    { id: 'observations', label: 'Mentor Observations', icon: Eye, count: counts.observations },
    { id: 'followups', label: 'Corrective Actions', icon: CheckSquare, count: counts.openFollowUps },
    { id: 'documents', label: 'Documents', icon: Files, count: counts.documents },
    { id: 'timeline', label: 'Full Journey Timeline', icon: Milestone, badge: 'Signature' },
  ];

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Top Banner Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-amber-300 font-serif font-bold text-xl flex items-center justify-center shadow-md flex-shrink-0">
            {child.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md">
                {child.studentId}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EFE6] text-stone-700">
                {child.currentGradeName}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                child.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {child.status.toUpperCase()}
              </span>
            </div>

            <h2 className="text-lg font-serif font-bold text-stone-900 mt-1 flex items-center gap-2">
              <span>{child.fullName}</span>
              {child.vernacularName && (
                <span className="text-sm text-amber-800 font-normal">({child.vernacularName})</span>
              )}
            </h2>

            <p className="text-[11px] text-stone-500">
              Gurukula Pravesha: {new Date(child.admissionDate).toLocaleDateString()} | DOB: {new Date(child.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openQuickObservation}
            className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Quick Observe</span>
          </button>

          <button
            onClick={downloadPdfReport}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 shadow-sm"
            title="Download printable PDF Child Journey Report"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Journey PDF</span>
          </button>

          {canPromoteChild && (
            <button
              onClick={openPromoteDialog}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Promote Grade</span>
            </button>
          )}
        </div>
      </div>

      {/* 12 Tabs Navigation Bar */}
      <div className="border-b border-[#EAE4D7] overflow-x-auto scrollbar-none">
        <div className="flex gap-1 min-w-max pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                disabled={tab.restricted}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-t-xl font-medium flex items-center gap-1.5 transition-all text-xs ${
                  isActive
                    ? 'bg-white text-[#1B4332] font-bold border-t-2 border-[#1B4332] shadow-sm'
                    : tab.restricted
                    ? 'opacity-40 cursor-not-allowed text-stone-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {tab.badge}
                  </span>
                )}
                {tab.restricted && <Lock className="w-3 h-3 text-stone-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-[#EAE4D7] p-4 sm:p-6 shadow-sm min-h-[350px]">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-2">
                <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wide">
                  Historical Grade Progression
                </span>
                <div className="space-y-1.5">
                  {enrollmentHistory.map((e) => (
                    <div key={e._id} className="p-2 rounded-lg bg-white border border-stone-200">
                      <div className="font-bold text-stone-900">{e.gradeName}</div>
                      <div className="text-[10px] text-stone-500">
                        {e.yearName} — Status: <span className="font-semibold">{e.status}</span>
                      </div>
                      {e.isReadOnlyHistory && (
                        <span className="text-[9px] text-stone-400 font-mono italic">
                          (Read-only Historical Evidence)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-2">
                <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wide">
                  Key Holistic Strengths
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Demonstrates innate aptitude for Vedic chanting with accurate swara intonation. Highly compassionate in peer support, consistently participates in Morning Assembly prayer anchor duties.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Taittiriya Upanishad
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Gita Chapter 12
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                    Carnatic Vocal
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-2">
                <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wide">
                  Emergency & Guardian Info
                </span>
                <div className="text-stone-800">
                  <div className="font-semibold">{child.emergencyContact?.name}</div>
                  <div className="text-stone-500">Relation: {child.emergencyContact?.relation}</div>
                  <div className="text-stone-500">Phone: {child.emergencyContact?.phone}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL DETAILS */}
        {activeTab === 'personal' && (
          <div className="max-w-2xl space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">Personal Demographic Information</h3>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7]">
              <div>
                <span className="text-stone-400 text-[10px]">Student Identifier</span>
                <p className="font-bold text-stone-900">{child.studentId}</p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Full Name</span>
                <p className="font-bold text-stone-900">{child.fullName}</p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Date of Birth</span>
                <p className="text-stone-800">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Gender</span>
                <p className="text-stone-800">{child.gender}</p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Blood Group</span>
                <p className="text-stone-800">{child.bloodGroup || 'Not recorded'}</p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Educational History</span>
                <p className="text-stone-800">{child.educationalHistory || 'Direct enrollment'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FAMILY & GUARDIANS */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Guardians & Family Seva Involvement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guardians.map((g) => (
                <div key={g._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{g.fullName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                      {g.relationship}
                    </span>
                  </div>
                  <div className="text-stone-600">Phone: {g.primaryPhone}</div>
                  {g.email && <div className="text-stone-600">Email: {g.email}</div>}
                  <div className="text-stone-600">Occupation: {g.occupation || '—'}</div>
                  {g.skillsAndInterests?.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {g.skillsAndInterests.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-900 border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {g.canContributeSeva && (
                    <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                      ✓ Willing to contribute Seva during campus gatherings
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMIC JOURNEY */}
        {activeTab === 'academic' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Subject Progress & Qualitative Indicators</h3>
              <span className="text-[11px] text-stone-500 italic">
                Evaluated with descriptive rubrics (Pravesha, Abhyasa, Praveena, Visharada)
              </span>
            </div>

            {academicProgress.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No academic term evaluations recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {academicProgress.map((p) => (
                  <div key={p._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{p.subjectName}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1B4332] text-amber-300">
                        {p.evaluationStage}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{p.qualitativeFeedback}</p>
                    {p.observedStrengths && (
                      <p className="text-[11px] text-emerald-800">Strengths: {p.observedStrengths}</p>
                    )}
                    <div className="text-[10px] text-stone-400 pt-1">
                      Period: {p.period} | Mentor: {p.evaluatedByName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SKILLS & TALENTS */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Holistic Vedic Arts & Practical Competencies</h3>
            {skills.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No skills recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((s) => (
                  <div key={s._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{s.skillName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                        {s.stage}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">{s.category}</div>
                    <p className="text-stone-700">{s.mentorNotes}</p>
                    {s.demonstratedMilestones?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {s.demonstratedMilestones.map((m, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-stone-200 text-stone-600">
                            ★ {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: RESPONSIBILITIES */}
        {activeTab === 'responsibilities' && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Gurukula Campus Responsibilities & Leadership Roles</h3>
            {responsibilities.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No responsibilities recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {responsibilities.map((r) => (
                  <div key={r._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{r.roleName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {r.participationQuality}
                      </span>
                    </div>
                    <p className="text-stone-700">{r.mentorNotes}</p>
                    <p className="text-[11px] text-stone-500">Learning Outcome: {r.learningAndGrowth}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Honors, Performances & Certifications</h3>
            {achievements.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No achievements recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map((a) => (
                  <div key={a._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{a.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {a.level}
                      </span>
                    </div>
                    <p className="text-stone-700">{a.description}</p>
                    <div className="text-[10px] text-stone-400">Date: {new Date(a.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: HEALTH & WELL-BEING */}
        {activeTab === 'health' && canViewHealth && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Restricted Well-being & Vitality Observations</h3>
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-bold">
                CONFIDENTIAL RECORD
              </span>
            </div>

            {healthRecords.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No health notes recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {healthRecords.map((h) => (
                  <div key={h._id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{h.category}</span>
                      <span className="text-[10px] text-stone-500">{new Date(h.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-stone-700">{h.supportiveObservations}</p>
                    <p className="text-[11px] text-amber-900 font-medium">Care: {h.careProvidedOrSuggested}</p>
                    <div className="text-[10px] text-stone-400">Staff: {h.responsibleStaffName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: MENTOR OBSERVATIONS */}
        {activeTab === 'observations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Mentor Quick Observation Stream</h3>
              <button
                onClick={openQuickObservation}
                className="px-3 py-1 rounded-xl bg-[#1B4332] text-amber-300 font-bold text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New</span>
              </button>
            </div>

            {observations.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No observations logged yet.</p>
            ) : (
              <div className="space-y-2">
                {observations.map((o) => (
                  <div key={o._id} className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B4332] text-white">
                        {o.category}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(o.recordedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-stone-800 text-xs mt-1">{o.note}</p>
                    <div className="text-[10px] text-stone-500 pt-1">Author: {o.authorName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: FOLLOW-UPS & CORRECTIVE ACTIONS */}
        {activeTab === 'followups' && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Support Action Items & Follow-ups</h3>
            {followups.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No follow-ups for this child.</p>
            ) : (
              <div className="space-y-2.5">
                {followups.map((f) => (
                  <div key={f._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{f.concernOrGoal}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {f.status}
                      </span>
                    </div>
                    <p className="text-stone-700">Plan: {f.actionPlan}</p>
                    <div className="text-[10px] text-stone-500">
                      Assigned to: {f.assignedToName} | Due: {new Date(f.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 11: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Child Document Vault</h3>
            {documents.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">No documents uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((d) => (
                  <div key={d._id} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{d.title}</div>
                      <div className="text-[10px] text-stone-500">{d.documentType}</div>
                    </div>
                    <a
                      href={`/api/v1/documents/download/${d._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-[10px]"
                    >
                      View / Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 12: SIGNATURE FULL JOURNEY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Milestone className="w-4 h-4 text-[#1B4332]" />
                  <span>Signature Multi-Year Developmental Timeline</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Past-to-present holistic continuum from admission enquiry to the present day.
                </p>
              </div>
            </div>

            {timelineEvents.length === 0 ? (
              <p className="text-stone-400 py-6 text-center">Loading timeline milestones...</p>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE4D7]">
                {timelineEvents.map((ev) => (
                  <div key={ev.id} className="relative group">
                    {/* Timeline bullet dot */}
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#1B4332] border-2 border-white shadow-sm" />

                    <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EAE4D7] space-y-1 hover:border-[#1B4332] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-xs">{ev.title}</span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {new Date(ev.date).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-stone-700 text-xs leading-relaxed">{ev.description}</p>

                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-stone-100 text-stone-700">
                          {ev.category}
                        </span>
                        {ev.authorOrMentor && (
                          <span className="text-stone-400 italic">By: {ev.authorOrMentor}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grade Promotion Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">
                Promote {child.fullName} to Next Grade
              </h3>
              <button onClick={() => setShowPromoteModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePromote} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Academic Year</label>
                <select
                  value={targetYearId}
                  onChange={(e) => setTargetYearId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                >
                  {years.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.yearName} {y.isCurrent ? '(Current Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Grade / Varga</label>
                <select
                  value={targetGradeId}
                  onChange={(e) => setTargetGradeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                >
                  {grades.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Concluding Qualitative Reflection for Previous Grade
                </label>
                <textarea
                  rows={2}
                  value={priorReflection}
                  onChange={(e) => setPriorReflection(e.target.value)}
                  placeholder="Summary of character and learning progression archived in immutable history..."
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoting}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  {isPromoting ? 'Promoting...' : 'Confirm Grade Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
