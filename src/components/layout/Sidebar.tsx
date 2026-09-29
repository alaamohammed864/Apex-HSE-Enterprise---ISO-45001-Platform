import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPath, OperatingUnit } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, operatingUnit, setOperatingUnit, t, language } = useApp();
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  const navItems: {
    group: string;
    items: {
      path: NavigationPath;
      label: string;
      icon: string;
      badge?: string;
      badgeColor?: string;
      isDot?: boolean;
    }[];
  }[] = [
    {
      group: t.coreMission,
      items: [
        {
          path: 'command-dashboard',
          label: t.commandDashboard,
          icon: 'dashboard',
        },
      ],
    },
    {
      group: t.governanceDocs,
      items: [
        {
          path: 'controlled-document-library',
          label: t.documentLibrary,
          icon: 'folder_managed',
          badge: language === 'ar' ? '23 فئة' : '23 Cats',
        },
        {
          path: 'dynamic-form-builder',
          label: t.dynamicFormBuilder,
          icon: 'dynamic_form',
        },
        {
          path: 'formal-hse-plan-generator',
          label: t.hsePlanGenerator,
          icon: 'description',
        },
        {
          path: 'bilingual-document-viewer',
          label: t.bilingualViewer,
          icon: 'translate',
        },
      ],
    },
    {
      group: t.operationalSafety,
      items: [
        {
          path: 'risk-assessments-alarp',
          label: t.riskMatrixAlarp,
          icon: 'grid_4x4',
          badge: '5x5',
          badgeColor: 'bg-[#ffdad6] text-[#93000a]',
        },
        {
          path: 'incident-investigations',
          label: t.incidents5Why,
          icon: 'emergency',
          badge: '5-Why',
        },
        {
          path: 'corrective-actions-capa',
          label: t.correctiveActionsCapa,
          icon: 'task_alt',
          badge: 'ISO §10',
          badgeColor: 'bg-[#dcfce7] text-[#15803d]',
        },
        {
          path: 'permit-to-work',
          label: t.ptwLiveBoard,
          icon: 'assignment_turned_in',
          isDot: true,
        },
      ],
    },
    {
      group: t.complianceAssurance,
      items: [
        {
          path: 'inspections-checklists',
          label: t.inspectionsChecklists,
          icon: 'checklist_rtl',
        },
        {
          path: 'training-competency-matrix',
          label: t.competencyMatrix,
          icon: 'school',
        },
        {
          path: 'hse-audits-non-conformances',
          label: t.auditsNcrTracker,
          icon: 'fact_check',
        },
        {
          path: 'kpi-management',
          label: t.kpiManagement,
          icon: 'trending_up',
          badge: 'ISO §9',
          badgeColor: 'bg-[#dce9ff] text-[#0b1c30]',
        },
        {
          path: 'reporting-center',
          label: t.reportingCenter,
          icon: 'picture_as_pdf',
          badge: 'PDF',
          badgeColor: 'bg-[#dcfce7] text-[#15803d]',
        },
      ],
    },
    {
      group: t.enterpriseAdmin,
      items: [
        {
          path: 'organization-roles',
          label: t.organizationRoles,
          icon: 'corporate_fare',
        },
        {
          path: 'system-audit-trail',
          label: t.auditTrailLedger,
          icon: 'security',
        },
      ],
    },
  ];

  const operatingUnits: OperatingUnit[] = [
    'Ras Laffan EPC-4',
    'Mesaieed Refinery Unit 3',
    'Al-Khor Pipe Rack Route 9',
  ];

  return (
    <aside
      className={`fixed top-0 h-full w-72 bg-[#eff4ff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto border-r border-[#c6c6cd]/30 ${
        language === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'
      }`}
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-2 bg-[#ffffff] border-b border-[#c6c6cd]/20">
          <div className="w-8 h-8 rounded-lg bg-[#006c4a] flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[18px] tracking-tight text-[#0b1c30]">
                {t.appName}
              </span>
              <span className="font-mono text-[10px] uppercase px-1 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-semibold">
                {t.appVersion}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#006c4a] font-bold">
              {t.isoStandard}
            </span>
          </div>
        </div>

        {/* Operating Unit Switcher */}
        <div className="px-6 py-2 bg-[#e5eeff] relative">
          <span className="text-[11px] uppercase text-[#45464d] font-bold tracking-wider block">
            {t.activeOperatingUnit}
          </span>
          <div
            className="flex items-center justify-between mt-1 cursor-pointer select-none"
            onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#006c4a] flex-shrink-0 animate-pulse"></span>
              <span className="text-[13px] font-semibold truncate text-[#0b1c30]">
                {operatingUnit}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#45464d] hover:text-[#0b1c30]">
              unfold_more
            </span>
          </div>

          {/* Unit Dropdown */}
          {isUnitDropdownOpen && (
            <div className="absolute left-4 right-4 top-14 bg-white rounded-lg shadow-xl border border-[#c6c6cd]/40 py-1 z-50">
              {operatingUnits.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[#eff4ff] flex items-center justify-between ${
                    operatingUnit === unit ? 'text-[#006c4a] bg-[#eff4ff]' : 'text-[#0b1c30]'
                  }`}
                  onClick={() => {
                    setOperatingUnit(unit);
                    setIsUnitDropdownOpen(false);
                  }}
                >
                  <span className="truncate">{unit}</span>
                  {operatingUnit === unit && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-3">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-2 text-[10px] uppercase tracking-wider text-[#45464d] font-bold block">
                {group.group}
              </span>
              {group.items.map((item) => {
                const isActive = activeNav === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => setActiveNav(item.path)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[#131b2e] text-[#ffffff] font-semibold shadow-sm'
                        : 'text-[#45464d] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[18px] flex-shrink-0">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          item.badgeColor || 'bg-[#dce9ff] text-[#0b1c30]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.isDot && (
                      <span className="w-2 h-2 rounded-full bg-[#68dba9] animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer Lock & Validation Stamp */}
      <div className="p-4 bg-[#e5eeff] border-t border-[#c6c6cd]/20">
        <div className="flex items-center justify-between text-[#45464d]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">lock</span>
            <span className="font-mono text-[11px] font-bold">{t.isoValidated}</span>
          </div>
          <span className="font-mono text-[11px] bg-[#dce9ff] px-1 py-0.2 rounded font-semibold text-[#0b1c30]">
            {t.secLevel}
          </span>
        </div>
      </div>
    </aside>
  );
};
