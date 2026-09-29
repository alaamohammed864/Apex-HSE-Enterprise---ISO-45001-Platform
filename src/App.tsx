import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CommandDashboard } from './components/dashboard/CommandDashboard';
import { DocumentLibrary } from './components/documents/DocumentLibrary';
import { DynamicFormBuilder } from './components/formBuilder/DynamicFormBuilder';
import { RiskMatrixAlarp } from './components/risk/RiskMatrixAlarp';
import { IncidentInvestigationView } from './components/views/IncidentInvestigationView';
import { GenericIsoView } from './components/views/GenericIsoView';
import { NewRecordModal } from './components/modals/NewRecordModal';
import { AuditLedgerModal } from './components/modals/AuditLedgerModal';
import { BilingualViewerModal } from './components/modals/BilingualViewerModal';
import { PtwBoardModal } from './components/modals/PtwBoardModal';
import { UserSwitcherModal } from './components/modals/UserSwitcherModal';

const AppContent: React.FC = () => {
  const { activeNav, language, theme, toastMessage } = useApp();

  const renderActiveView = () => {
    switch (activeNav) {
      case 'command-dashboard':
        return <CommandDashboard />;
      case 'controlled-document-library':
        return <DocumentLibrary />;
      case 'dynamic-form-builder':
        return <DynamicFormBuilder />;
      case 'formal-hse-plan-generator':
        return <DynamicFormBuilder initialCategory="PLANS" initialTemplateCode="TMPL-HSE-PLN" />;
      case 'risk-assessments-alarp':
        return <RiskMatrixAlarp />;
      case 'incident-investigations':
        return <IncidentInvestigationView />;
      case 'bilingual-document-viewer':
        return (
          <div className="p-6">
            <BilingualViewerModal />
            <DocumentLibrary />
          </div>
        );
      default:
        return <GenericIsoView path={activeNav} />;
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#0f172a] text-[#f1f5f9]' : 'bg-[#f8f9ff] text-[#0b1c30]'
      } flex flex-col font-['IBM_Plex_Sans','Cairo',sans-serif]`}
    >
      <Sidebar />
      <Header />

      <main
        className={`flex-1 w-full pt-16 pb-12 transition-all ${
          language === 'ar' ? 'pr-72 pl-0' : 'pl-72 pr-0'
        }`}
      >
        {renderActiveView()}
      </main>

      <Footer />

      {/* Global Modals */}
      <NewRecordModal />
      <AuditLedgerModal />
      <BilingualViewerModal />
      <PtwBoardModal />
      <UserSwitcherModal />

      {/* Interactive Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-12 right-12 z-50 bg-[#213145] text-[#eaf1ff] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs border border-[#c6c6cd]/30 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#82f5c1] text-[18px]">
            task_alt
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
