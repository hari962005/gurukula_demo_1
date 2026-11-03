// Demo-only API layer.
// The Vercel demo intentionally runs without the Express/MongoDB backend.
// It returns realistic mock data so every page remains navigable and interactive.

import { UserRole } from '../types/index.js';

export class ApiError extends Error {
  statusCode: number;
  data: any;
  constructor(message: string, statusCode = 400, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

const today = new Date();
const iso = (days = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const grades = [
  { _id: 'grade-1', name: 'Pravesha', code: 'P1', levelOrder: 1, academicYearId: 'ay-2026', description: 'Foundation level' },
  { _id: 'grade-2', name: 'Abhyasa', code: 'A1', levelOrder: 2, academicYearId: 'ay-2026', description: 'Developing level' },
  { _id: 'grade-3', name: 'Praveena', code: 'PR1', levelOrder: 3, academicYearId: 'ay-2026', description: 'Proficient level' },
];

const years = [
  { _id: 'ay-2026', yearName: '2026–27', startDate: '2026-06-01', endDate: '2027-03-31', isCurrent: true, status: 'active' },
  { _id: 'ay-2025', yearName: '2025–26', startDate: '2025-06-01', endDate: '2026-03-31', isCurrent: false, status: 'completed' },
];

const subjects = [
  { _id: 'sub-sanskrit', name: 'Sanskrit & Vedic Studies', code: 'SAN', category: 'Languages', qualitativeIndicators: ['Recitation', 'Understanding', 'Practice'] },
  { _id: 'sub-math', name: 'Mathematics', code: 'MAT', category: 'Academics', qualitativeIndicators: ['Concepts', 'Problem Solving', 'Application'] },
  { _id: 'sub-science', name: 'Science & Nature', code: 'SCI', category: 'Academics', qualitativeIndicators: ['Observation', 'Inquiry', 'Application'] },
  { _id: 'sub-life', name: 'Life Skills', code: 'LIF', category: 'Holistic Growth', qualitativeIndicators: ['Self-management', 'Collaboration', 'Responsibility'] },
];

const children = [
  {
    _id: 'child-001', studentId: 'SKMG-001', fullName: 'Aarav Sharma', vernacularName: 'आरव शर्मा',
    dateOfBirth: '2014-08-12', gender: 'Male', bloodGroup: 'B+', admissionDate: '2024-06-10',
    currentGradeId: grades[1], currentGradeName: 'Abhyasa', currentAcademicYearId: years[0], status: 'active',
    educationalHistory: 'Joined Gurukula in 2024 and has shown steady holistic growth.',
    emergencyContact: { name: 'Meera Sharma', phone: '+91 98765 43210', relation: 'Mother' },
    createdAt: iso(-300),
  },
  {
    _id: 'child-002', studentId: 'SKMG-002', fullName: 'Ananya Rao', vernacularName: 'अनन्या राव',
    dateOfBirth: '2013-03-22', gender: 'Female', bloodGroup: 'O+', admissionDate: '2023-06-05',
    currentGradeId: grades[2], currentGradeName: 'Praveena', currentAcademicYearId: years[0], status: 'active',
    educationalHistory: 'Strong interest in music, nature studies and community activities.',
    emergencyContact: { name: 'Ravi Rao', phone: '+91 99887 66554', relation: 'Father' },
    createdAt: iso(-500),
  },
  {
    _id: 'child-003', studentId: 'SKMG-003', fullName: 'Vedant Iyer', vernacularName: 'वेदांत अय्यर',
    dateOfBirth: '2015-11-03', gender: 'Male', bloodGroup: 'A+', admissionDate: '2025-06-09',
    currentGradeId: grades[0], currentGradeName: 'Pravesha', currentAcademicYearId: years[0], status: 'active',
    educationalHistory: 'Enjoys hands-on learning, stories and group activities.',
    emergencyContact: { name: 'Kavya Iyer', phone: '+91 91234 56780', relation: 'Mother' },
    createdAt: iso(-180),
  },
];

const demoUsers: Record<UserRole, any> = {
  admin: { id: 'u-admin', _id: 'u-admin', email: 'admin@gurukula.org', fullName: 'Gurukula Administrator', role: 'admin', assignedGrades: [], canViewHealthRecords: true, isActive: true },
  admissions: { id: 'u-admissions', _id: 'u-admissions', email: 'admissions@gurukula.org', fullName: 'Anjali Menon', role: 'admissions', assignedGrades: grades.map(g => g._id), canViewHealthRecords: false, isActive: true },
  coordinator: { id: 'u-coordinator', _id: 'u-coordinator', email: 'coordinator@gurukula.org', fullName: 'Raghav Kulkarni', role: 'coordinator', assignedGrades: grades.map(g => g._id), canViewHealthRecords: true, isActive: true },
  teacher: { id: 'u-teacher', _id: 'u-teacher', email: 'teacher@gurukula.org', fullName: 'Sowmya Krishnan', role: 'teacher', assignedGrades: ['grade-1', 'grade-2'], canViewHealthRecords: false, isActive: true },
  management: { id: 'u-management', _id: 'u-management', email: 'trustee@gurukula.org', fullName: 'Vivek Narayan', role: 'management', assignedGrades: [], canViewHealthRecords: false, isActive: true },
};

const sampleProgress = (childId: string) => [
  { _id: `prog-${childId}-1`, childId, academicYearId: years[0], gradeId: grades[1], subjectId: subjects[0], subjectName: subjects[0].name, period: 'Term 1', evaluationStage: 'Praveena (Proficient)', qualitativeFeedback: 'Confident participation and good retention.', observedStrengths: 'Recitation and comprehension', growthGoals: 'Independent practice', evaluatedByName: 'Sowmya Krishnan', createdAt: iso(-20) },
  { _id: `prog-${childId}-2`, childId, academicYearId: years[0], gradeId: grades[1], subjectId: subjects[1], subjectName: subjects[1].name, period: 'Term 1', evaluationStage: 'Praveena (Proficient)', qualitativeFeedback: 'Strong number sense and logical reasoning.', observedStrengths: 'Problem solving', growthGoals: 'Written explanations', evaluatedByName: 'Sowmya Krishnan', createdAt: iso(-18) },
];

const sampleSkills = (childId: string) => [
  { _id: `skill-${childId}-1`, childId, skillName: 'Collaborative Learning', category: 'Social & Emotional', stage: 'Strong', demonstratedMilestones: ['Helps peers', 'Shares ideas'], mentorNotes: 'Participates positively in group tasks.', supportiveGuidance: 'Continue peer mentoring.', lastObservedDate: iso(-7), evaluatedByName: 'Sowmya Krishnan' },
  { _id: `skill-${childId}-2`, childId, skillName: 'Mindful Practice', category: 'Well-being', stage: 'Consistent', demonstratedMilestones: ['Daily reflection'], mentorNotes: 'Maintains a calm routine.', lastObservedDate: iso(-12), evaluatedByName: 'Sowmya Krishnan' },
];

const sampleResponsibilities = (childId: string) => [
  { _id: `resp-${childId}-1`, childId, roleName: 'Library Helper', category: 'Community', startDate: iso(-45), isCurrent: true, mentorNotes: 'Handles books carefully.', learningAndGrowth: 'Developing responsibility and organization.', participationQuality: 'Consistent', assignedByName: 'Raghav Kulkarni' },
];

const sampleAchievements = (childId: string) => [
  { _id: `ach-${childId}-1`, childId, title: 'Nature Study Presentation', category: 'Learning', level: 'Gurukula', date: iso(-30), description: 'Presented a thoughtful observation journal on local plants.', organizer: 'Gurukula Faculty', recordedByName: 'Sowmya Krishnan' },
];

const sampleObservations = (childId: string) => [
  { _id: `obs-${childId}-1`, childId, childName: children.find(c => c._id === childId)?.fullName || 'Aarav Sharma', authorId: 'u-teacher', authorName: 'Sowmya Krishnan', category: 'Strength', tags: ['Participation', 'Confidence'], note: 'Participated actively in the group discussion and encouraged peers.', recordedAt: iso(-5), requiresFollowUp: false },
];

const sampleFollowups = (childId: string) => [
  { _id: `follow-${childId}-1`, childId, childName: children.find(c => c._id === childId)?.fullName || 'Aarav Sharma', concernOrGoal: 'Independent reading routine', actionPlan: 'Encourage 15 minutes of reading each evening.', assignedToId: 'u-teacher', assignedToName: 'Sowmya Krishnan', createdByName: 'Raghav Kulkarni', dueDate: iso(8), status: 'Open', reviewNotes: [], auditHistory: [], createdAt: iso(-4) },
];

function success(data: any = []) { return { success: true, data }; }

function getChild(id?: string) { return children.find(c => c._id === id) || children[0]; }

function mockGet(endpoint: string): any {
  const path = endpoint.split('?')[0];
  const params = new URLSearchParams(endpoint.split('?')[1] || '');
  const childId = endpoint.match(/children\/([^/]+)/)?.[1] || params.get('childId') || children[0]._id;
  const child = getChild(childId);

  if (path === '/auth/me') {
    const role = (localStorage.getItem('gurukula_demo_role') as UserRole) || 'teacher';
    return { success: true, user: demoUsers[role] };
  }
  if (path === '/children') return success(children);
  if (path === '/academic/grades') return success(grades);
  if (path === '/academic/years') return success(years);
  if (path === '/academic/subjects') return success(subjects);
  if (path === '/dashboard/metrics') return success({
    assignedChildrenCount: 3, dueTodayFollowUps: 2, overdueFollowUps: 1, pendingFollowUpsCount: 4,
    totalChildren: 3, activeChildren: 3, totalStaff: 12, admissionsPending: 5, attendanceRate: 94,
    children, followUps: sampleFollowups(children[0]._id),
    gradeDistribution: grades.map((g, i) => ({ name: g.name, count: i + 1 })),
    categoryDistribution: [{ name: 'Academics', value: 35 }, { name: 'Skills', value: 25 }, { name: 'Well-being', value: 20 }, { name: 'Responsibility', value: 20 }],
  });
  if (path === '/admissions') return success([
    { _id: 'app-001', applicationNumber: 'ADM-2026-001', childFullName: 'Ishaan Patel', dateOfBirth: '2016-02-15', gender: 'Male', applyingForGrade: 'Pravesha', referralSource: 'Family', enquiryDate: iso(-12), interviewDate: iso(3), guardianName: 'Nisha Patel', guardianPhone: '+91 90000 11111', guardianRelation: 'Mother', interviews: [], staffNotes: 'Demo admission application.', currentStatus: 'Selected for Interview', nextAction: 'Interview', followUpDate: iso(2), isEnrolled: false },
    { _id: 'app-002', applicationNumber: 'ADM-2026-002', childFullName: 'Diya Shah', dateOfBirth: '2015-09-10', gender: 'Female', applyingForGrade: 'Abhyasa', referralSource: 'Alumni', enquiryDate: iso(-20), guardianName: 'Amit Shah', guardianPhone: '+91 90000 22222', guardianRelation: 'Father', interviews: [], staffNotes: 'Demo application.', currentStatus: 'Application Received', isEnrolled: false },
  ]);
  if (path === '/children/' + childId) return success(child);
  if (path.includes('/academic/progress/')) return success({ progress: sampleProgress(childId), enrollments: [{ _id: 'enroll-1', childId, academicYearId: years[0], gradeId: grades[1], gradeName: grades[1].name, yearName: years[0].yearName, startDate: years[0].startDate, status: 'current', overallQualitativeSummary: 'Steady and balanced growth across learning areas.', strengthsRecognized: 'Curiosity and consistency', areasForGentleNurture: 'Independent reflection', mentorName: 'Sowmya Krishnan', isReadOnlyHistory: false }] });
  if (path.startsWith('/skills/')) return success(sampleSkills(childId));
  if (path.startsWith('/responsibilities/')) return success(sampleResponsibilities(childId));
  if (path.startsWith('/achievements/')) return success(sampleAchievements(childId));
  if (path.startsWith('/observations')) return success(sampleObservations(childId));
  if (path.startsWith('/followups')) return { ...success(sampleFollowups(childId)), metrics: { open: 2, overdue: 1, completed: 8, total: 11 } };
  if (path.startsWith('/health/')) return success([{ _id: `health-${childId}-1`, childId, date: iso(-14), category: 'General Wellness', supportiveObservations: 'Healthy and active.', careProvidedOrSuggested: 'Continue regular hydration and outdoor activity.', responsibleStaffName: 'Gurukula Care Team', confidentialityLevel: 'standard' }]);
  if (path.startsWith('/documents/child/')) return success([{ _id: `doc-${childId}-1`, childId, title: 'Student Profile', documentType: 'Profile', fileName: 'student-profile-demo.pdf', mimeType: 'application/pdf', fileSizeBytes: 24576, accessLevel: 'Staff', uploadedByName: 'Gurukula Admin', createdAt: iso(-60) }]);
  if (path.startsWith('/family/')) return success({ guardians: [{ _id: 'guardian-1', childId, fullName: child.emergencyContact.name, relationship: child.emergencyContact.relation, primaryPhone: child.emergencyContact.phone, skillsAndInterests: ['Gardening', 'Music'], canContributeSeva: true, isPrimary: true, isEmergencyContact: true }], sevaRecords: [{ _id: 'seva-1', childId, contributorName: child.emergencyContact.name, relationship: child.emergencyContact.relation, activityType: 'Community Support', description: 'Helped with a weekend learning activity.', hoursOrContribution: '3 hours', date: iso(-20), recordedByName: 'Gurukula Admin' }] });
  if (path.startsWith('/children/') && path.endsWith('/timeline')) return success({ child, timeline: [{ id: 'tl-1', date: iso(-120), category: 'Admission', title: 'Joined Gurukula', description: 'Began the Gurukula learning journey.', stageOrBadge: 'Beginning', authorOrMentor: 'Gurukula Team', tags: ['Journey'], icon: '🌱' }, { id: 'tl-2', date: iso(-30), category: 'Achievement', title: 'Nature Study Presentation', description: 'Presented a nature study journal.', stageOrBadge: 'Milestone', authorOrMentor: 'Sowmya Krishnan', tags: ['Learning'], icon: '🏆' }] });
  if (path === '/alumni') return success([{ _id: 'alumni-1', childId: 'child-alumni-1', studentId: 'SKMG-A01', fullName: 'Kiran Nair', completionYear: '2024', highestGradeCompleted: 'Praveena', transitionDate: '2024-04-15', currentPursuit: 'Engineering Studies', currentLocation: 'Bengaluru', hasGivenCommunicationConsent: true, willingnessToMentor: true, specialExpertise: 'Robotics', interactions: [], notes: 'Demo alumni profile.' }]);
  if (path === '/admin/users') return success(Object.values(demoUsers));
  if (path === '/admin/audit-logs') return success([{ _id: 'log-1', action: 'Demo login', userName: 'Gurukula Administrator', createdAt: iso(-1), details: 'Demo environment activity' }]);
  if (path === '/admin/system-health') return success({ database: 'Demo mode', api: 'Demo mode', storage: 'Local mock', uptime: '99.9%' });
  return success([]);
}

function mockPost(endpoint: string, body?: any): any {
  if (endpoint === '/auth/login') {
    const role = (Object.keys(demoUsers) as UserRole[]).find(r => demoUsers[r].email.toLowerCase() === String(body?.email || '').toLowerCase());
    if (!role) throw new ApiError('Use one of the demo accounts shown on the login page.', 401);
    localStorage.setItem('gurukula_demo_role', role);
    return { success: true, token: `demo-${role}`, user: demoUsers[role] };
  }
  if (endpoint === '/auth/logout') return { success: true };
  if (endpoint.startsWith('/admissions/')) return success({ child: children[0] });
  if (endpoint === '/admin/users') return success({ ...body, _id: `demo-user-${Date.now()}`, id: `demo-user-${Date.now()}`, isActive: true });
  if (endpoint === '/admin/seed-demo') return success({ message: 'Demo data refreshed.' });
  return success(body || {});
}

function mockPut(endpoint: string, body?: any): any {
  if (endpoint.includes('/admin/users/') && endpoint.endsWith('/toggle-status')) return success({ isActive: false });
  return success(body || {});
}

async function request<T>(endpoint: string, method: string, body?: any): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, 120));
  switch (method) {
    case 'GET': return mockGet(endpoint) as T;
    case 'POST': return mockPost(endpoint, body) as T;
    case 'PUT': return mockPut(endpoint, body) as T;
    case 'DELETE': return success() as T;
    default: return success() as T;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, 'POST', body),
  put: <T>(endpoint: string, body?: any) => request<T>(endpoint, 'PUT', body),
  delete: <T>(endpoint: string) => request<T>(endpoint, 'DELETE'),
  upload: async <T>(_endpoint: string, _formData: FormData): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return success({ message: 'Demo upload completed locally.' }) as T;
  },
};
