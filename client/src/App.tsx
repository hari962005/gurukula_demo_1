import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

// Pages
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { Admissions } from './pages/Admissions.js';
import { ChildrenList } from './pages/ChildrenList.js';
import { ChildProfile } from './pages/ChildProfile.js';
import { AcademicProgressPage } from './pages/AcademicProgressPage.js';
import { SkillsPage } from './pages/SkillsPage.js';
import { ResponsibilitiesPage } from './pages/ResponsibilitiesPage.js';
import { AchievementsPage } from './pages/AchievementsPage.js';
import { HealthPage } from './pages/HealthPage.js';
import { ObservationsPage } from './pages/ObservationsPage.js';
import { FollowUpsPage } from './pages/FollowUpsPage.js';
import { FamilySevaPage } from './pages/FamilySevaPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { JourneyTimelinePage } from './pages/JourneyTimelinePage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { AlumniPage } from './pages/AlumniPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { ProfileSettings } from './pages/ProfileSettings.js';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs text-stone-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin mr-2" />
        <span>Authenticating Gurukula session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="children" element={<ChildrenList />} />
            <Route path="children/:id" element={<ChildProfile />} />
            <Route path="academic" element={<AcademicProgressPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="responsibilities" element={<ResponsibilitiesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="observations" element={<ObservationsPage />} />
            <Route path="followups" element={<FollowUpsPage />} />
            <Route path="family" element={<FamilySevaPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="timeline" element={<JourneyTimelinePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="alumni" element={<AlumniPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
