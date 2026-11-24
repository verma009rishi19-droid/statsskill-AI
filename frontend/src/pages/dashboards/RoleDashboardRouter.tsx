import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { OverviewPage } from '../OverviewPage';
import { ManagerDashboard } from './ManagerDashboard';
import { TrainerDashboard } from './TrainerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { AnalystDashboard } from './AnalystDashboard';

export const RoleDashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    case 'analyst':
      return <AnalystDashboard />;
    case 'learner':
    default:
      return <OverviewPage />;
  }
};
