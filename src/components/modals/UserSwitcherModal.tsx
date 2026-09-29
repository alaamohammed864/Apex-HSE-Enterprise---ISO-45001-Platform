import React from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const UserSwitcherModal: React.FC = () => {
  const { currentUser, switchUser, isUserMenuOpen, setIsUserMenuOpen, allUsers } = useAuth();
  const { language, showToast } = useApp();

  if (!isUserMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#c6c6cd]/50 overflow-hidden"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="bg-[#131b2e] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#4ade80]">admin_panel_settings</span>
            <div>
              <h3 className="font-bold text-sm">
                {language === 'ar' ? 'تبديل المستخدم وصلاحيات النظام (RBAC)' : 'User & RBAC Role Switcher'}
              </h3>
              <p className="text-[11px] text-white/70">
                {language === 'ar' ? 'اختر حساباً لاختبار صلاحيات التدقيق والاعتماد' : 'Switch active account to verify approval workflows'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(false)}
            className="text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-96 overflow-y-auto">
          {allUsers.map((u) => {
            const isSelected = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                onClick={() => {
                  switchUser(u.id);
                  setIsUserMenuOpen(false);
                  showToast(
                    language === 'ar'
                      ? `تم التبديل إلى: ${u.nameAr} (${u.roleTitleAr})`
                      : `Switched active user to: ${u.name} (${u.roleTitleEn})`
                  );
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#006c4a] bg-[#eff4ff] ring-1 ring-[#006c4a]'
                    : 'border-[#c6c6cd]/30 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-[#006c4a] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">
                      {language === 'ar' ? u.nameAr : u.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {language === 'ar' ? u.roleTitleAr : u.roleTitleEn}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Badge: {u.badgeNumber} &bull; {u.email}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <span className="material-symbols-outlined text-[#006c4a] text-[20px]">
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-slate-300 text-[18px]">
                    swap_horiz
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[#f8fafc] px-5 py-3 border-t border-[#c6c6cd]/30 flex items-center justify-between text-[11px] text-slate-600">
          <span>
            {language === 'ar' ? 'صلاحيات الحساب الحالي:' : 'Current Role Permissions:'}
          </span>
          <span className="font-mono font-bold text-[#006c4a]">
            {currentUser.permissions.includes('all') ? 'Full Admin Access' : `${currentUser.permissions.length} Authorized Operations`}
          </span>
        </div>
      </div>
    </div>
  );
};
