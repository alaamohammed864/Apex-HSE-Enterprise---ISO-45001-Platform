import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { currentUser, setIsUserMenuOpen } = useAuth();
  const {
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    operatingUnit,
    t,
    alerts,
    unreadAlertsCount,
    markAlertsAsRead,
    setIsNewRecordModalOpen,
    setIsAuditLedgerOpen,
    toggleMobileSidebar,
    showToast,
  } = useApp();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      showToast(language === 'ar' ? `جاري البحث عن: ${searchTerm}` : `Searching records for: "${searchTerm}"`);
    }
  };

  return (
    <header
      className={`fixed top-0 h-16 bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-3 sm:px-6 flex items-center justify-between border-b border-[#c6c6cd]/30 transition-all ${
        language === 'ar' ? 'left-0 right-0 lg:right-72 lg:left-0' : 'left-0 right-0 lg:left-72 lg:right-0'
      }`}
    >
      {/* Left Area: Mobile Menu + Asset & Global Search */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#0b1c30] hover:bg-[#eff4ff] border border-[#c6c6cd]/30 flex items-center justify-center transition-colors"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Project Asset Chip */}
        <div className="hidden sm:flex items-center gap-2 bg-[#eff4ff] px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#c6c6cd]/30 hover:bg-[#e5eeff] transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[18px] text-[#45464d]">domain</span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#45464d] leading-none font-bold">
              Project Asset
            </span>
            <span className="text-[12px] sm:text-[13px] font-bold text-[#0b1c30] leading-tight max-w-[120px] sm:max-w-[210px] truncate">
              {operatingUnit}
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#45464d]">arrow_drop_down</span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 sm:w-64 lg:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#45464d] text-xs rounded-lg pl-9 pr-14 py-2 border border-transparent focus:border-[#006c4a] focus:bg-white focus:outline-none transition-all shadow-inner"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="font-mono text-[10px] bg-[#e5eeff] px-1 py-0.5 rounded text-[#45464d] border border-[#c6c6cd]/40">
              Ctrl
            </kbd>
            <kbd className="font-mono text-[10px] bg-[#e5eeff] px-1 py-0.5 rounded text-[#45464d] border border-[#c6c6cd]/40">
              K
            </kbd>
          </div>
        </form>
      </div>

      {/* Right Area: Action Controls */}
      <div className="flex items-center gap-3">
        {/* Bilingual Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#45464d] hover:text-[#0b1c30] text-xs font-bold border border-[#c6c6cd]/30 transition-colors shadow-xs"
          title="Toggle English / Arabic"
        >
          <span className="material-symbols-outlined text-[18px] text-[#006c4a]">language</span>
          <span>{t.languageToggle}</span>
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#45464d] hover:text-[#0b1c30] text-xs font-bold border border-[#c6c6cd]/30 transition-colors shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="hidden sm:inline">{theme === 'dark' ? 'Day' : 'Night'}</span>
        </button>

        {/* New Record Button */}
        <button
          type="button"
          onClick={() => setIsNewRecordModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#000000] hover:bg-[#213145] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>{t.newRecord}</span>
        </button>

        <div className="h-6 w-[1px] bg-[#c6c6cd]/40"></div>

        {/* Audit Log Quickview */}
        <button
          type="button"
          onClick={() => setIsAuditLedgerOpen(true)}
          className="p-1.5 rounded-lg text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors relative"
          title="Operational Audit Log Quickview"
        >
          <span className="material-symbols-outlined text-[20px]">history_edu</span>
        </button>

        {/* Notifications & Alerts */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsAlertsOpen(!isAlertsOpen);
              markAlertsAsRead();
            }}
            className="p-1.5 rounded-lg text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors relative"
            title="Active HSE Alerts"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#ba1a1a] text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Alerts Popover */}
          {isAlertsOpen && (
            <div
              className={`absolute top-12 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#c6c6cd]/40 p-4 z-50 animate-in fade-in slide-in-from-top-2 ${
                language === 'ar' ? 'left-0' : 'right-0'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#c6c6cd]/30 mb-3">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">crisis_alert</span>
                  <span>Active HSE Critical Alerts ({alerts.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAlertsOpen(false)}
                  className="text-xs text-[#45464d] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-[#eff4ff] border-l-4 border-[#ba1a1a] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-[#0b1c30]">
                      <span>{alert.title}</span>
                      <span className="font-mono text-[10px] text-[#45464d]">{alert.timestamp}</span>
                    </div>
                    <p className="text-[#45464d] text-[11px] leading-relaxed">{alert.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-[#c6c6cd]/20 flex items-center justify-between text-[11px]">
                <span className="text-[#006c4a] font-bold">ALARP Sentinel: Guarding 24/7</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAlertsOpen(false);
                    showToast('All alerts acknowledged');
                  }}
                  className="text-[#0b1c30] hover:underline font-semibold"
                >
                  Dismiss All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Pill with Switcher */}
        <div
          onClick={() => setIsUserMenuOpen(true)}
          className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-85 transition-opacity"
          title="Click to Switch User / Role (RBAC)"
        >
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-[#0b1c30] leading-tight">
              {language === 'ar' ? currentUser.nameAr : currentUser.name}
            </span>
            <span className="font-mono text-[10px] text-[#006c4a] font-semibold leading-none">
              {language === 'ar' ? currentUser.roleTitleAr : currentUser.roleTitleEn}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center font-bold text-xs shadow-inner">
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          </div>
        </div>
      </div>
    </header>
  );
};
