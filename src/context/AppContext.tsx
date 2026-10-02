import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  OperatingUnit,
  NavigationPath,
  RiskAssessment,
  ControlledDocument,
  PermitToWork,
  HseAlert,
} from '../types';
import { translations } from '../translations';
import {
  INITIAL_RISK_ASSESSMENTS,
  INITIAL_CONTROLLED_DOCUMENTS,
  INITIAL_PERMITS,
  INITIAL_ALERTS,
} from '../data/mockData';

export type Theme = 'dark' | 'light';

interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  theme: Theme;
  toggleTheme: () => void;
  activeNav: NavigationPath;
  setActiveNav: (path: NavigationPath) => void;
  operatingUnit: OperatingUnit;
  setOperatingUnit: (unit: OperatingUnit) => void;
  riskAssessments: RiskAssessment[];
  updateRiskAssessment: (id: string, updated: Partial<RiskAssessment>) => void;
  addRiskAssessment: (newRa: RiskAssessment) => void;
  controlledDocuments: ControlledDocument[];
  addControlledDocument: (newDoc: ControlledDocument) => void;
  updateControlledDocument: (code: string, updated: Partial<ControlledDocument>) => void;
  duplicateControlledDocument: (code: string) => void;
  archiveControlledDocument: (code: string) => void;
  selectedDocCode: string;
  setSelectedDocCode: (code: string) => void;
  permits: PermitToWork[];
  alerts: HseAlert[];
  unreadAlertsCount: number;
  markAlertsAsRead: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isNewRecordModalOpen: boolean;
  setIsNewRecordModalOpen: (open: boolean) => void;
  isAuditLedgerOpen: boolean;
  setIsAuditLedgerOpen: (open: boolean) => void;
  isPtwBoardOpen: boolean;
  setIsPtwBoardOpen: (open: boolean) => void;
  isBilingualViewerOpen: boolean;
  setIsBilingualViewerOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  t: typeof translations.en;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [activeNav, setActiveNavState] = useState<NavigationPath>('command-dashboard');
  const [operatingUnit, setOperatingUnit] = useState<OperatingUnit>('Ras Laffan EPC-4');
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>(INITIAL_RISK_ASSESSMENTS);
  const [controlledDocuments, setControlledDocuments] = useState<ControlledDocument[]>(INITIAL_CONTROLLED_DOCUMENTS);
  const [selectedDocCode, setSelectedDocCode] = useState<string>('HSE-PLN-001');
  const [permits] = useState<PermitToWork[]>(INITIAL_PERMITS);
  const [alerts, setAlerts] = useState<HseAlert[]>(INITIAL_ALERTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isAuditLedgerOpen, setIsAuditLedgerOpen] = useState(false);
  const [isPtwBoardOpen, setIsPtwBoardOpen] = useState(false);
  const [isBilingualViewerOpen, setIsBilingualViewerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const setActiveNav = (path: NavigationPath) => {
    setActiveNavState(path);
    setIsMobileSidebarOpen(false); // Auto-close drawer on mobile navigation
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
    showToast(nextLang === 'ar' ? 'تم تحويل لغة النظام إلى العربية' : 'Switched system language to English');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'Industrial Night Vision Theme Activated' : 'Clean Daylight Theme Activated');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const updateRiskAssessment = (id: string, updated: Partial<RiskAssessment>) => {
    setRiskAssessments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const addRiskAssessment = (newRa: RiskAssessment) => {
    setRiskAssessments((prev) => [newRa, ...prev]);
    showToast(`New Risk Assessment ${newRa.id} added to ledger`);
  };

  const addControlledDocument = (newDoc: ControlledDocument) => {
    setControlledDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocCode(newDoc.code);
    showToast(`Controlled Document ${newDoc.code} registered and published`);
  };

  const updateControlledDocument = (code: string, updated: Partial<ControlledDocument>) => {
    setControlledDocuments((prev) =>
      prev.map((doc) => (doc.code === code ? { ...doc, ...updated } : doc))
    );
    showToast(`Document ${code} successfully updated`);
  };

  const duplicateControlledDocument = (code: string) => {
    const existing = controlledDocuments.find((d) => d.code === code);
    if (!existing) return;

    const base = existing.code.replace(/-REV\d+/i, '');
    const newCode = `${base}-REV00-COPY`;
    const copy: ControlledDocument = {
      ...existing,
      code: newCode,
      title: `${existing.title} (Copy)`,
      titleAr: existing.titleAr ? `${existing.titleAr} (نسخة)` : undefined,
      currentRevision: 'Rev 0.1',
      signoffStatus: 'DRAFT',
      signoffStatusLabel: 'DRAFT IN REVIEW',
      totalRevisionsCount: 1,
      revisions: [
        {
          revId: `rev-copy-${Date.now()}`,
          label: 'Rev 0.1',
          date: new Date().toISOString().split('T')[0],
          description: `Duplicated working copy derived from ${existing.code}`,
          signer: 'Safety Engineer',
          isCurrent: true,
        },
      ],
    };
    setControlledDocuments((prev) => [copy, ...prev]);
    setSelectedDocCode(newCode);
    showToast(`Created duplicate draft document: ${newCode}`);
  };

  const archiveControlledDocument = (code: string) => {
    setControlledDocuments((prev) =>
      prev.map((doc) =>
        doc.code === code
          ? {
              ...doc,
              signoffStatus: 'DRAFT',
              signoffStatusLabel: 'ARCHIVED / SUPERSEDED',
              securityClassification: 'ARCHIVED HISTORICAL RECORD',
            }
          : doc
      )
    );
    showToast(`Document ${code} moved to historical WORM archive`);
  };

  const markAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;
  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        toggleLanguage,
        theme,
        toggleTheme,
        activeNav,
        setActiveNav,
        operatingUnit,
        setOperatingUnit,
        riskAssessments,
        updateRiskAssessment,
        addRiskAssessment,
        controlledDocuments,
        addControlledDocument,
        updateControlledDocument,
        duplicateControlledDocument,
        archiveControlledDocument,
        selectedDocCode,
        setSelectedDocCode,
        permits,
        alerts,
        unreadAlertsCount,
        markAlertsAsRead,
        toastMessage,
        showToast,
        isNewRecordModalOpen,
        setIsNewRecordModalOpen,
        isAuditLedgerOpen,
        setIsAuditLedgerOpen,
        isPtwBoardOpen,
        setIsPtwBoardOpen,
        isBilingualViewerOpen,
        setIsBilingualViewerOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
