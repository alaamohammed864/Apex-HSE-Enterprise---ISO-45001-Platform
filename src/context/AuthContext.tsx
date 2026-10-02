import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecurityService } from '../services/securityService';

export type UserRole =
  | 'HSE_DIRECTOR'
  | 'LEAD_AUDITOR'
  | 'SAFETY_ENGINEER'
  | 'SITE_SUPERVISOR'
  | 'INSPECTOR'
  | 'CLIENT_REP';

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
  status?: 'ACTIVE' | 'SUSPENDED';
}

export const INITIAL_USERS: User[] = [
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
    status: 'ACTIVE',
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
    status: 'ACTIVE',
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
    status: 'ACTIVE',
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
    status: 'ACTIVE',
  },
  {
    id: 'usr-005',
    name: 'Fahad Al-Marri',
    nameAr: 'فهد المري',
    email: 'f.marri@ccc-jv.qa',
    role: 'INSPECTOR',
    roleTitleEn: 'HSE Field Inspector',
    roleTitleAr: 'مفتش سلامة ميداني',
    badgeNumber: 'INS-3321',
    operatingUnit: 'Ras Laffan EPC-4',
    permissions: ['run_inspections', 'create_capa', 'view_all'],
    status: 'ACTIVE',
  },
  {
    id: 'usr-006',
    name: 'Eng. David Chen',
    nameAr: 'م. ديفيد تشن',
    email: 'd.chen@qatarenergy.qa',
    role: 'CLIENT_REP',
    roleTitleEn: 'Client Representative (QatarEnergy)',
    roleTitleAr: 'ممثل العميل المعتمد (قطر للطاقة)',
    badgeNumber: 'CLT-0042',
    operatingUnit: 'Ras Laffan EPC-4',
    permissions: ['client_signoff', 'view_all', 'approve_documents'],
    status: 'ACTIVE',
  },
];

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  can: (permission: string) => boolean;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (open: boolean) => void;
  allUsers: User[];
  addUser: (user: User) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('apex_hse_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('apex_hse_current_user');
    if (saved) {
      const found = allUsers.find((u) => u.id === saved);
      if (found) return found;
    }
    return allUsers[0] || INITIAL_USERS[0];
  });

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('apex_hse_current_user', currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apex_hse_users_list', JSON.stringify(allUsers));
  }, [allUsers]);

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      SecurityService.logSecurityEvent(
        'Login',
        `User authenticated as ${user.name} (${user.roleTitleEn}) with badge ${user.badgeNumber}`,
        user,
        user.id,
        'AUTH'
      );
    }
  };

  const addUser = (newUser: User) => {
    setAllUsers((prev) => [...prev, newUser]);
    SecurityService.logSecurityEvent(
      'Create',
      `Registered new system user ${newUser.name} with role ${newUser.roleTitleEn}`,
      currentUser,
      newUser.id,
      'USER'
    );
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }
    SecurityService.logSecurityEvent(
      'Edit',
      `Updated profile/permissions for user ${userId}`,
      currentUser,
      userId,
      'USER'
    );
  };

  const deleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    SecurityService.logSecurityEvent(
      'Delete',
      `De-registered user account ${userId}`,
      currentUser,
      userId,
      'USER'
    );
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
        allUsers,
        addUser,
        updateUser,
        deleteUser,
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
