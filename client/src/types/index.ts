export type UserRole = 'admin' | 'admissions' | 'coordinator' | 'teacher' | 'management';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  assignedGrades: string[];
  canViewHealthRecords: boolean;
  isActive?: boolean;
}

export type AdmissionStatus =
  | 'Application Received'
  | 'Selected for Interview'
  | 'Invited'
  | 'Selected as Student'
  | 'Not Interested'
  | 'Not Eligible'
  | 'Admission Not Taken'
  | 'To be Followed Up Later';

export interface ApplicantInterview {
  _id?: string;
  date: string;
  interviewerId?: string;
  interviewerName: string;
  activityType: string;
  observations: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Conditional' | 'Not Recommended' | 'Pending';
  strengthsObserved?: string;
}

export interface Applicant {
  _id: string;
  applicationNumber: string;
  childFullName: string;
  vernacularName?: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male' | 'Other';
  photoUrl?: string;
  applyingForGrade: string;
  referralSource: string;
  enquiryDate: string;
  interviewDate?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelation: string;
  guardianOccupation?: string;
  address?: {
    city?: string;
    state?: string;
    pincode?: string;
    details?: string;
  };
  interviews: ApplicantInterview[];
  staffNotes: string;
  currentStatus: AdmissionStatus;
  nextAction?: string;
  followUpDate?: string;
  isEnrolled: boolean;
  convertedToChildId?: string;
  convertedAt?: string;
}

export interface Child {
  _id: string;
  studentId: string;
  applicantId?: any;
  fullName: string;
  vernacularName?: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup?: string;
  photoUrl?: string;
  admissionDate: string;
  currentGradeId: any;
  currentGradeName: string;
  currentAcademicYearId: any;
  status: 'active' | 'alumni' | 'withdrawn';
  educationalHistory?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: string;
}

export interface Guardian {
  _id: string;
  childId: string;
  fullName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  occupation?: string;
  skillsAndInterests: string[];
  canContributeSeva: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  isPrimary: boolean;
  isEmergencyContact: boolean;
}

export interface AcademicYear {
  _id: string;
  yearName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'planning' | 'active' | 'completed';
}

export interface GradeGroup {
  _id: string;
  name: string;
  code: string;
  levelOrder: number;
  academicYearId: any;
  description?: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  category: string;
  qualitativeIndicators: string[];
  description?: string;
}

export interface EnrollmentHistoryItem {
  _id: string;
  childId: string;
  academicYearId: any;
  gradeId: any;
  gradeName: string;
  yearName: string;
  startDate: string;
  endDate?: string;
  status: 'current' | 'promoted' | 'completed' | 'transferred';
  overallQualitativeSummary?: string;
  strengthsRecognized?: string;
  areasForGentleNurture?: string;
  mentorName?: string;
  isReadOnlyHistory: boolean;
}

export interface AcademicProgressItem {
  _id: string;
  childId: string;
  academicYearId: any;
  gradeId: any;
  subjectId: any;
  subjectName: string;
  period: 'Term 1' | 'Term 2' | 'Annual Assessment';
  evaluationStage: 'Pravesha (Beginning)' | 'Abhyasa (Developing)' | 'Praveena (Proficient)' | 'Visharada (Exemplary)';
  qualitativeFeedback: string;
  observedStrengths?: string;
  growthGoals?: string;
  evaluatedByName: string;
  createdAt: string;
}

export interface SkillItem {
  _id: string;
  childId: string;
  skillName: string;
  category: string;
  stage: 'Emerging' | 'Developing' | 'Consistent' | 'Strong';
  demonstratedMilestones: string[];
  mentorNotes: string;
  supportiveGuidance?: string;
  lastObservedDate: string;
  evaluatedByName: string;
}

export interface ResponsibilityItem {
  _id: string;
  childId: string;
  roleName: string;
  category: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  mentorNotes: string;
  learningAndGrowth: string;
  participationQuality: string;
  assignedByName: string;
}

export interface AchievementItem {
  _id: string;
  childId: string;
  title: string;
  category: string;
  level: string;
  date: string;
  description: string;
  organizer?: string;
  recordedByName: string;
}

export interface ObservationItem {
  _id: string;
  childId: any;
  childName: string;
  authorId: any;
  authorName: string;
  category: 'Academics' | 'Skills' | 'Participation' | 'Responsibility' | 'Well-being' | 'Strength' | 'Concern' | 'Other';
  tags: string[];
  note: string;
  recordedAt: string;
  requiresFollowUp: boolean;
  followUpId?: any;
}

export interface FollowUpItem {
  _id: string;
  childId: any;
  childName: string;
  observationId?: any;
  concernOrGoal: string;
  actionPlan: string;
  assignedToId: any;
  assignedToName: string;
  createdByName: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  reviewNotes: Array<{
    _id?: string;
    note: string;
    authorName: string;
    date: string;
  }>;
  outcomeSummary?: string;
  completionDate?: string;
  auditHistory: Array<{
    action: string;
    changedByName: string;
    timestamp: string;
    details?: string;
  }>;
  createdAt: string;
}

export interface HealthRecordItem {
  _id: string;
  childId: string;
  date: string;
  category: string;
  supportiveObservations: string;
  careProvidedOrSuggested: string;
  responsibleStaffName: string;
  confidentialityLevel: 'standard' | 'restricted';
}

export interface FamilySevaItem {
  _id: string;
  childId: string;
  contributorName: string;
  relationship: string;
  activityType: string;
  description: string;
  hoursOrContribution?: string;
  date: string;
  recordedByName: string;
}

export interface DocumentItem {
  _id: string;
  childId: string;
  title: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  accessLevel: string;
  uploadedByName: string;
  createdAt: string;
}

export interface AlumniProfileItem {
  _id: string;
  childId: any;
  studentId: string;
  fullName: string;
  completionYear: string;
  highestGradeCompleted: string;
  transitionDate: string;
  currentPursuit?: string;
  currentLocation?: string;
  permittedEmail?: string;
  permittedPhone?: string;
  hasGivenCommunicationConsent: boolean;
  willingnessToMentor: boolean;
  specialExpertise?: string;
  interactions: Array<{
    _id?: string;
    date: string;
    eventType: string;
    summary: string;
    recordedByName: string;
  }>;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  category: string;
  title: string;
  description: string;
  stageOrBadge?: string;
  authorOrMentor?: string;
  tags?: string[];
  icon: string;
}
