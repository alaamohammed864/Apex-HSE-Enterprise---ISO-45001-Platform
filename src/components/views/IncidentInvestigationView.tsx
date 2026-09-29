import React from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentManagementModule } from '../incidents/IncidentManagementModule';

export const IncidentInvestigationView: React.FC = () => {
  const { setActiveNav } = useApp();

  return (
    <IncidentManagementModule
      onNavigateToCapa={() => setActiveNav('corrective-actions-capa')}
    />
  );
};

export { IncidentManagementModule };
