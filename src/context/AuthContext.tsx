import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
  | 'HSE_DIRECTOR'
  | 'LEAD_AUDITOR'
  | 'SAFETY_ENGINEER'
  | 'SITE_SUPERVISOR'
  | 'INSPECTOR';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  roleTitleEn: string;
  roleTitleAr: string;
  badgeNumber: string;
  operatingUnit: string;
  avatarUrl?: string;
  permissions: string[];
}

export const USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Dr. Tariq Al-Hashimi',
    nameAr: 'د. طارق الهاشمي',
    email: 'tariq.hashimi@ccc-jv.qa',
    role: 'HSE_DIRECTOR',
    roleTitleEn: 'Corporate HSE Director',
    roleTitleAr: 'مدير عام السلامة والصحة المهنية',
    badgeNumber: 'HSE-DIR-01',
    operatingUnit: 'Ras Laffan EPC-4',
    permissions: ['all', 'approve_documents', 'emergency_stop', 'sign_off_alarp', 'manage_users', 'export_audit'],
  },
  {
    id: 'usr-002',
    name: 'Sarah Jenkins, CMIOSH',
    nameAr: 'سارة جينكينز',
    email: 'sarah.jenkins@ccc-jv.qa',
    role: 'LEAD_AUDITOR',
    roleTitleEn: 'Lead ISO 45001 Auditor',
    roleTitleAr: 'مدقق رئيسي ISO 45001',
    badgeNumber: 'AUD-8821',
    operatingUnit: 'Ras Laffan EPC-4',
    permissions: ['view_all', 'audit_signoff', 'manage_documents', 'view_ledger'],
  },
  {
    id: 'usr-003',
    name: 'Omar Farooq',
    nameAr: 'عمر فاروق',
    email: 'omar.farooq@ccc-jv.qa',
    role: 'SAFETY_ENGINEER',
    roleTitleEn: 'Lead Safety & Risk Engineer',
    roleTitleAr: 'مهندس أول سلامة وإدارة مخاطر',
    badgeNumber: 'ENG-4412',
    operatingUnit: 'Ras Laffan EPC-4',
    permissions: ['edit_risks', 'create_ptw', 'submit_documents', 'view_all'],
  },
  {
    id: 'usr-004',
    name: 'Mohammed Al-Kuwari',
    nameAr: 'محمد الكواري',
    email: 'm.kuwari@ccc-jv.qa',
    role: 'SITE_SUPERVISOR',
    roleTitleEn: 'Site Area Supervisor',
    roleTitleAr: 'مشرف موقع ميداني',
    badgeNumber: 'SUP-1092',
    operatingUnit: 'Ras Laffan EPC-4',
    permissions: ['view_ptw', 'sign_field_check', 'report_incident'],
  },
];

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  can: (permission: string) => boolean;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (open: boolean) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('apex_hse_current_user');
    if (saved) {
      const found = USERS.find((u) => u.id === saved);
      if (found) return found;
    }
    return USERS[0];
  });

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('apex_hse_current_user', currentUser.id);
  }, [currentUser]);

  const switchUser = (userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const can = (permission: string): boolean => {
    if (currentUser.permissions.includes('all')) return true;
    return currentUser.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchUser,
        can,
        isUserMenuOpen,
        setIsUserMenuOpen,
        allUsers: USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
