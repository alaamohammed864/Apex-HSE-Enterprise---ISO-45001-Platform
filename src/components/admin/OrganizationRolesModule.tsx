import React, { useState } from 'react';
import { useAuth, User, UserRole } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { SecurityService } from '../../services/securityService';

interface EmergencyMusterPoint {
  id: string;
  nameEn: string;
  nameAr: string;
  zone: string;
  capacity: number;
  warden: string;
  wardenRadio: string;
  status: 'CLEAR' | 'ACTIVE_MUSTERING' | 'EVACUATING';
}

const INITIAL_MUSTER_POINTS: EmergencyMusterPoint[] = [
  {
    id: 'MP-01',
    nameEn: 'Assembly Point Alpha (Main Gate)',
    nameAr: 'نقطة التجمع ألفا (البوابة الرئيسية)',
    zone: 'Zone 1 Administrative & Logistics',
    capacity: 450,
    warden: 'Mohammed Al-Kuwari',
    wardenRadio: 'CH-01 (Safety Primary)',
    status: 'CLEAR',
  },
  {
    id: 'MP-02',
    nameEn: 'Assembly Point Bravo (Process Train 2)',
    nameAr: 'نقطة التجمع برافو (وحدة المعالجة 2)',
    zone: 'Zone 2 Cryogenic Liquefaction',
    capacity: 300,
    warden: 'Fahad Al-Marri',
    wardenRadio: 'CH-02 (Plant Emergency)',
    status: 'CLEAR',
  },
  {
    id: 'MP-03',
    nameEn: 'Assembly Point Charlie (Tank Farm)',
    nameAr: 'نقطة التجمع تشارلي (مستودع الخزانات)',
    zone: 'Zone 3 Hydrocarbon Storage',
    capacity: 200,
    warden: 'Omar Farooq',
    wardenRadio: 'CH-03 (Fire Operations)',
    status: 'CLEAR',
  },
  {
    id: 'MP-04',
    nameEn: 'Assembly Point Delta (Marine Jetty 4)',
    nameAr: 'نقطة التجمع دلتا (الرصيف البحري 4)',
    zone: 'Zone 4 Marine Offloading Berth',
    capacity: 150,
    warden: 'David Chen',
    wardenRadio: 'CH-04 (Port Safety)',
    status: 'CLEAR',
  },
];

export const OrganizationRolesModule: React.FC = () => {
  const { allUsers, currentUser, switchUser, addUser, updateUser } = useAuth();
  const { language, t, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'USERS' | 'RBAC' | 'PROJECTS' | 'EMERGENCY'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserNameEn, setNewUserNameEn] = useState('');
  const [newUserNameAr, setNewUserNameAr] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SAFETY_ENGINEER');
  const [newUserBadge, setNewUserBadge] = useState('');
  const [newUserUnit, setNewUserUnit] = useState('Ras Laffan EPC-4');
  const [formError, setFormError] = useState<string | null>(null);

  // Emergency drill simulation state
  const [musterPoints, setMusterPoints] = useState<EmergencyMusterPoint[]>(INITIAL_MUSTER_POINTS);
  const [drillActive, setDrillActive] = useState(false);

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nameAr.includes(searchTerm) ||
      u.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = SecurityService.sanitizeInput(newUserEmail);
    const cleanNameEn = SecurityService.sanitizeInput(newUserNameEn);
    const cleanNameAr = SecurityService.sanitizeInput(newUserNameAr);
    const cleanBadge = SecurityService.sanitizeInput(newUserBadge);

    if (!cleanNameEn || !cleanNameAr || !cleanBadge) {
      setFormError(t.fieldRequired);
      return;
    }

    if (!SecurityService.validateEmail(cleanEmail)) {
      setFormError(t.invalidEmail);
      return;
    }

    const roleTitles: Record<UserRole, { en: string; ar: string }> = {
      HSE_DIRECTOR: { en: 'Corporate HSE Director', ar: 'مدير عام السلامة والصحة المهنية' },
      LEAD_AUDITOR: { en: 'Lead ISO 45001 Auditor', ar: 'مدقق رئيسي ISO 45001' },
      SAFETY_ENGINEER: { en: 'Lead Safety & Risk Engineer', ar: 'مهندس أول سلامة وإدارة مخاطر' },
      SITE_SUPERVISOR: { en: 'Site Area Supervisor', ar: 'مشرف موقع ميداني' },
      INSPECTOR: { en: 'HSE Field Inspector', ar: 'مفتش سلامة ميداني' },
      CLIENT_REP: { en: 'Client Representative', ar: 'ممثل العميل المعتمد' },
    };

    const rolePerms: Record<UserRole, string[]> = {
      HSE_DIRECTOR: ['all', 'approve_documents', 'emergency_stop', 'sign_off_alarp', 'manage_users', 'export_audit'],
      LEAD_AUDITOR: ['view_all', 'audit_signoff', 'manage_documents', 'view_ledger'],
      SAFETY_ENGINEER: ['edit_risks', 'create_ptw', 'submit_documents', 'view_all'],
      SITE_SUPERVISOR: ['view_ptw', 'sign_field_check', 'report_incident'],
      INSPECTOR: ['run_inspections', 'create_capa', 'view_all'],
      CLIENT_REP: ['client_signoff', 'view_all', 'approve_documents'],
    };

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: cleanNameEn,
      nameAr: cleanNameAr,
      email: cleanEmail,
      role: newUserRole,
      roleTitleEn: roleTitles[newUserRole].en,
      roleTitleAr: roleTitles[newUserRole].ar,
      badgeNumber: cleanBadge,
      operatingUnit: newUserUnit,
      permissions: rolePerms[newUserRole],
      status: 'ACTIVE',
    };

    addUser(newUser);
    showToast(language === 'ar' ? `تم تسجيل المستخدم بنجاح: ${cleanNameAr}` : `User registered: ${cleanNameEn}`);
    setIsAddUserModalOpen(false);
    setNewUserNameEn('');
    setNewUserNameAr('');
    setNewUserEmail('');
    setNewUserBadge('');
  };

  const toggleEmergencyDrill = () => {
    if (!drillActive) {
      setDrillActive(true);
      setMusterPoints((prev) =>
        prev.map((mp) => ({ ...mp, status: 'ACTIVE_MUSTERING' }))
      );
      showToast(
        language === 'ar'
          ? 'تم تفعيل تمرين الإخلاء الميداني التجريبي - تم إرسال صفارات الإنذار'
          : 'Emergency Evacuation Drill Initiated across all muster stations'
      );
      SecurityService.logSecurityEvent(
        'Create',
        'Initiated site-wide emergency muster drill simulation under ISO 45001 §8.2',
        currentUser,
        'DRILL-2026-03',
        'AUDIT'
      );
    } else {
      setDrillActive(false);
      setMusterPoints((prev) =>
        prev.map((mp) => ({ ...mp, status: 'CLEAR' }))
      );
      showToast(
        language === 'ar'
          ? 'تم اكتمال تمرين الإخلاء بنجاح - عودة جميع الوحدات إلى الحالة الطبيعية'
          : 'Emergency Drill Completed. All 1,100 personnel accounted for within 4 min 12 sec.'
      );
      SecurityService.logSecurityEvent(
        'Publish',
        'Emergency evacuation drill completed and logged with zero deficiencies',
        currentUser,
        'DRILL-2026-03',
        'AUDIT'
      );
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto max-w-full overflow-x-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §5.3 &amp; §8.2
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              {language === 'ar' ? 'التحكم الإداري والصلاحيات' : 'Enterprise Access & Security Governance'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30] mt-1">
            {t.organizationTitle}
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            {t.organizationSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>{t.addUser}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#c6c6cd]/30 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'USERS', label: language === 'ar' ? 'دليل المستخدمين والحسابات' : 'Users & Accounts Directory', icon: 'badge' },
          { id: 'RBAC', label: language === 'ar' ? 'مصفوفة الصلاحيات (RBAC Matrix)' : 'RBAC Permissions Matrix', icon: 'shield_lock' },
          { id: 'PROJECTS', label: language === 'ar' ? 'مواقع العمل والأصول' : 'Projects & Operating Assets', icon: 'domain' },
          { id: 'EMERGENCY', label: language === 'ar' ? 'خطة الطوارئ ونقاط التجمع' : 'Emergency & Muster Response', icon: 'emergency' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#c6c6cd]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-[#eff4ff] text-xs rounded-lg pl-9 pr-3 py-2 border border-transparent focus:border-[#006c4a] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#45464d] whitespace-nowrap">{t.filtersLabel}</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#eff4ff] text-xs font-semibold rounded-lg px-3 py-2 border border-[#c6c6cd]/30 focus:outline-none"
              >
                <option value="ALL">{language === 'ar' ? 'كافة الأدوار' : 'All Roles'}</option>
                <option value="HSE_DIRECTOR">HSE Director</option>
                <option value="LEAD_AUDITOR">Lead Auditor</option>
                <option value="SAFETY_ENGINEER">Safety Engineer</option>
                <option value="SITE_SUPERVISOR">Site Supervisor</option>
                <option value="INSPECTOR">Field Inspector</option>
                <option value="CLIENT_REP">Client Representative</option>
              </select>
            </div>
          </div>

          {/* Users Table / Responsive Cards */}
          <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase border-b border-[#c6c6cd]/20">
                  <tr>
                    <th className="py-3 px-4">{t.badgeId}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'المستخدم' : 'Personnel'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="py-3 px-4">{t.activeOperatingUnit}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#45464d]">
                        {t.noRecordsFound}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <tr key={u.id} className={`hover:bg-[#eff4ff]/60 ${isCurrent ? 'bg-[#eff4ff]/40' : ''}`}>
                          <td className="py-3 px-4 font-mono font-bold text-[#006c4a]">
                            {u.badgeNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold flex items-center gap-2">
                              <span>{language === 'ar' ? u.nameAr : u.name}</span>
                              {isCurrent && (
                                <span className="font-mono text-[9px] bg-[#006c4a] text-white px-1.5 py-0.5 rounded font-bold">
                                  {language === 'ar' ? 'الحساب النشط' : 'ACTIVE SESSION'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#45464d] font-mono">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">
                              {language === 'ar' ? u.roleTitleAr : u.roleTitleEn}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {u.permissions.includes('all') ? 'Full Admin' : `${u.permissions.length} perms`}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#45464d]">
                            {u.operatingUnit}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                u.status === 'SUSPENDED'
                                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                  : 'bg-[#dce9ff] text-[#006c4a]'
                              }`}
                            >
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isCurrent ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    switchUser(u.id);
                                    showToast(
                                      language === 'ar'
                                        ? `تم التبديل بنجاح إلى: ${u.nameAr}`
                                        : `Switched session to ${u.name}`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#131b2e] hover:text-white text-[#0b1c30] text-[11px] font-semibold transition-colors flex items-center gap-1"
                                  title="Test system as this user"
                                >
                                  <span className="material-symbols-outlined text-[14px]">login</span>
                                  <span>{language === 'ar' ? 'دخول' : 'Switch'}</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-[#006c4a] font-bold">
                                  {language === 'ar' ? 'متصل' : 'Current'}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const nextStatus = u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                                  updateUser(u.id, { status: nextStatus });
                                  showToast(
                                    language === 'ar'
                                      ? `تم تغيير حالة المستخدم إلى ${nextStatus}`
                                      : `Updated status for ${u.name} to ${nextStatus}`
                                  );
                                }}
                                className="p-1 rounded text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff]"
                                title="Toggle Status"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {u.status === 'SUSPENDED' ? 'play_arrow' : 'pause'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'RBAC' && (
        <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">
                {language === 'ar' ? 'مصفوفة التحكم في الوصول حسب الدور (RBAC Matrix)' : 'Role-Based Access Control (RBAC) Authority Grid'}
              </h2>
              <p className="text-xs text-[#45464d]">
                {language === 'ar'
                  ? 'تحدد هذه المصفوفة الإجراءات المصرح بها لكل دور وظيفي وفق معايير الأمان والامتثال'
                  : 'Governs operational delegations, document sign-offs, stop-work authority, and regulatory exports.'}
              </p>
            </div>
            <div className="font-mono text-xs text-[#006c4a] font-bold bg-[#eff4ff] px-2.5 py-1 rounded">
              ISO 45001 §5.3 Compliant
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#c6c6cd]/30 rounded-lg">
              <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">{language === 'ar' ? 'الدور القيادي / الوظيفي' : 'Operational Role'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'اعتماد الوثائق' : 'Doc Approval'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'اعتماد ALARP' : 'Risk Sign-off'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'إصدار تصاريح PTW' : 'PTW Issue'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'اعتماد التدقيق' : 'Audit Sign-off'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'وقف العمل الطارئ' : 'Stop Work'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}</th>
                  <th className="py-3 px-2 text-center">{language === 'ar' ? 'تصدير السجل' : 'WORM Export'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/20">
                {[
                  { role: 'HSE_DIRECTOR', title: 'Corporate HSE Director', perms: ['all'] },
                  { role: 'LEAD_AUDITOR', title: 'Lead ISO 45001 Auditor', perms: ['manage_documents', 'audit_signoff', 'view_ledger'] },
                  { role: 'SAFETY_ENGINEER', title: 'Lead Safety & Risk Engineer', perms: ['edit_risks', 'create_ptw', 'submit_documents'] },
                  { role: 'SITE_SUPERVISOR', title: 'Site Area Supervisor', perms: ['view_ptw', 'sign_field_check', 'emergency_stop'] },
                  { role: 'INSPECTOR', title: 'HSE Field Inspector', perms: ['run_inspections', 'create_capa', 'view_all'] },
                  { role: 'CLIENT_REP', title: 'Client Representative', perms: ['client_signoff', 'approve_documents'] },
                ].map((row) => (
                  <tr key={row.role} className="hover:bg-[#eff4ff]/40">
                    <td className="py-3 px-4 font-bold text-[#0b1c30]">
                      <div>{row.title}</div>
                      <div className="font-mono text-[10px] text-[#45464d]">{row.role}</div>
                    </td>
                    {[
                      'approve_documents',
                      'sign_off_alarp',
                      'create_ptw',
                      'audit_signoff',
                      'emergency_stop',
                      'manage_users',
                      'export_audit',
                    ].map((permKey) => {
                      const hasPerm = row.perms.includes('all') || row.perms.includes(permKey);
                      return (
                        <td key={permKey} className="py-3 px-2 text-center">
                          {hasPerm ? (
                            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-slate-300 text-[18px]">
                              remove
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECT ASSETS & OPERATING UNITS */}
      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              code: 'EPC-4',
              name: 'Ras Laffan EPC-4 Industrial Expansion',
              nameAr: 'توسعة راس لفان الصناعية حزمة EPC-4',
              headcount: '1,420 workers',
              hoursWithoutLti: '2,840,000 hrs',
              manager: 'Dr. Tariq Al-Hashimi',
              status: 'OPERATIONAL',
              isoRating: 'Class A (Zero Non-Conformances)',
            },
            {
              code: 'REF-3',
              name: 'Mesaieed Refinery Unit 3 Upgrade',
              nameAr: 'ترقية مصفاة مسيعيد - الوحدة 3',
              headcount: '880 workers',
              hoursWithoutLti: '1,120,000 hrs',
              manager: 'Omar Farooq',
              status: 'OPERATIONAL',
              isoRating: 'Class A (Full Conformance)',
            },
            {
              code: 'PR-9',
              name: 'Al-Khor Pipe Rack Route 9 Corridor',
              nameAr: 'ممر خطوط الأنابيب بالخور - المسار 9',
              headcount: '640 workers',
              hoursWithoutLti: '940,000 hrs',
              manager: 'Mohammed Al-Kuwari',
              status: 'OPERATIONAL',
              isoRating: 'Class A (Audited March 2026)',
            },
          ].map((project) => (
            <div key={project.code} className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#006c4a]">
                  {project.code}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-mono text-[10px] font-bold">
                  {project.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#0b1c30] text-sm">
                  {language === 'ar' ? project.nameAr : project.name}
                </h3>
                <div className="text-[11px] text-[#45464d] mt-1">
                  Lead Director: <strong>{project.manager}</strong>
                </div>
              </div>

              <div className="p-3 bg-[#eff4ff] rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#45464d]">Active Workforce:</span>
                  <span className="font-bold text-[#0b1c30]">{project.headcount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#45464d]">Safe Man-Hours:</span>
                  <span className="font-bold text-[#006c4a]">{project.hoursWithoutLti}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#45464d]">ISO Standard:</span>
                  <span className="font-bold text-[#006c4a]">ISO 45001:2018</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#c6c6cd]/20 flex items-center justify-between text-xs">
                <span className="text-[#006c4a] font-bold text-[11px]">{project.isoRating}</span>
                <button
                  type="button"
                  onClick={() => showToast(`Project dossier exported for ${project.code}`)}
                  className="p-1 rounded text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff]"
                  title="Export Dossier"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: EMERGENCY RESPONSE & MUSTER POINTS */}
      {activeTab === 'EMERGENCY' && (
        <div className="space-y-6">
          {/* Emergency Command Banner */}
          <div className={`p-5 rounded-xl border transition-all ${
            drillActive
              ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-lg animate-pulse'
              : 'bg-white border-[#c6c6cd]/30 shadow-xs text-[#0b1c30]'
          } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[24px] ${drillActive ? 'text-white' : 'text-[#ba1a1a]'}`}>
                  emergency_home
                </span>
                <h3 className="font-bold text-base">
                  {language === 'ar' ? t.emergencyPlansTitle : 'Site Emergency Response & Incident Command System (ICS)'}
                </h3>
              </div>
              <p className={`text-xs mt-1 ${drillActive ? 'text-white/90' : 'text-[#45464d]'}`}>
                {drillActive
                  ? (language === 'ar' ? 'تمرين إخلاء ميداني جارٍ الآن - فرق الإطفاء والإنقاذ على أهبة الاستعداد' : 'SITE EVACUATION DRILL IN PROGRESS - All personnel reporting to designated muster zones')
                  : (language === 'ar' ? 'نظام الاستعداد لحالات الطوارئ، نقاط التجمع، وتدريبات الإخلاء المجدولة وفق ISO 45001 §8.2' : 'ISO 45001:2018 Clause 8.2 compliant preparedness, warden radio frequencies, and drill tracking.')}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleEmergencyDrill}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                drillActive
                  ? 'bg-white text-[#ba1a1a] hover:bg-slate-100'
                  : 'bg-[#ba1a1a] text-white hover:bg-[#931515]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {drillActive ? 'stop_circle' : 'notifications_active'}
              </span>
              <span>
                {drillActive
                  ? (language === 'ar' ? 'إنهاء تمرين الإخلاء وتسجيل التقرير' : 'Complete Drill & Log Report')
                  : (language === 'ar' ? 'تفعيل تمرين إخلاء تجريبي (Drill Simulation)' : 'Simulate Site Evacuation Drill')}
              </span>
            </button>
          </div>

          {/* Muster Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {musterPoints.map((mp) => (
              <div key={mp.id} className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
                    {mp.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    mp.status === 'ACTIVE_MUSTERING'
                      ? 'bg-[#ba1a1a] text-white animate-pulse'
                      : 'bg-[#82f5c1] text-[#00714e]'
                  }`}>
                    {mp.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#0b1c30]">
                    {language === 'ar' ? mp.nameAr : mp.nameEn}
                  </h4>
                  <div className="text-[11px] text-[#45464d] mt-0.5">{mp.zone}</div>
                </div>

                <div className="p-2.5 bg-[#eff4ff] rounded-lg text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#45464d]">Max Capacity:</span>
                    <strong className="text-[#0b1c30]">{mp.capacity} pax</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#45464d]">Warden:</span>
                    <strong className="text-[#006c4a]">{mp.warden}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#45464d]">Radio:</span>
                    <strong className="text-[#ba1a1a]">{mp.wardenRadio}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Key Contacts Directory */}
          <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a]">contact_phone</span>
              <span>{t.emergencyContacts}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { titleEn: 'Plant Medical Center', titleAr: 'المركز الطبي للمنشأة', num: '+974 4474 1111', ext: 'Ext 911' },
                { titleEn: 'Industrial Fire Brigade', titleAr: 'فرقة إطفاء الحريق الصناعي', num: '+974 4474 2222', ext: 'Ext 999' },
                { titleEn: 'H2S Gas Safety Response', titleAr: 'فريق طوارئ غاز كبريتيد الهيدروجين', num: '+974 4474 3333', ext: 'Ext 444' },
                { titleEn: 'Security Control Room', titleAr: 'غرفة التحكم الأمني المركزية', num: '+974 4474 4444', ext: 'Ext 200' },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20">
                  <div className="font-bold text-[#0b1c30]">
                    {language === 'ar' ? c.titleAr : c.titleEn}
                  </div>
                  <div className="font-mono text-[#006c4a] font-bold mt-1">{c.num}</div>
                  <div className="font-mono text-[10px] text-[#45464d]">{c.ext}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#c6c6cd]/40 overflow-hidden">
            <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0b1c30]">
                <span className="material-symbols-outlined text-[#006c4a]">person_add</span>
                <span>{language === 'ar' ? 'تسجيل مستخدم جديد في النظام' : 'Register New Enterprise User'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-[#45464d] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">
                    Name (English) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserNameEn}
                    onChange={(e) => setNewUserNameEn(e.target.value)}
                    placeholder="e.g. Dr. Ahmed Hassan"
                    className="w-full bg-[#eff4ff] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">
                    Name (Arabic) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserNameAr}
                    onChange={(e) => setNewUserNameAr(e.target.value)}
                    placeholder="مثال: د. أحمد حسن"
                    className="w-full bg-[#eff4ff] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  Email Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ahmed.hassan@ccc-jv.qa"
                  className="w-full bg-[#eff4ff] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">
                    Role (RBAC) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-[#eff4ff] rounded-lg p-2 border border-[#c6c6cd]/30 font-semibold focus:outline-none"
                  >
                    <option value="HSE_DIRECTOR">HSE Director (Admin)</option>
                    <option value="LEAD_AUDITOR">Lead Auditor</option>
                    <option value="SAFETY_ENGINEER">Safety &amp; Risk Engineer</option>
                    <option value="SITE_SUPERVISOR">Site Supervisor</option>
                    <option value="INSPECTOR">Field Inspector</option>
                    <option value="CLIENT_REP">Client Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">
                    Badge Number <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    placeholder="ENG-5590"
                    className="w-full bg-[#eff4ff] rounded-lg p-2 border border-[#c6c6cd]/30 font-mono focus:border-[#006c4a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  Operating Unit Location
                </label>
                <select
                  value={newUserUnit}
                  onChange={(e) => setNewUserUnit(e.target.value)}
                  className="w-full bg-[#eff4ff] rounded-lg p-2 border border-[#c6c6cd]/30 focus:outline-none"
                >
                  <option value="Ras Laffan EPC-4">Ras Laffan EPC-4</option>
                  <option value="Mesaieed Refinery Unit 3">Mesaieed Refinery Unit 3</option>
                  <option value="Al-Khor Pipe Rack Route 9">Al-Khor Pipe Rack Route 9</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#c6c6cd]/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-semibold hover:bg-[#dce9ff]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#006c4a] text-white font-bold hover:bg-[#00714e] shadow-sm"
                >
                  {language === 'ar' ? 'تأكيد التسجيل وإصدار الصلاحيات' : 'Authorize & Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
