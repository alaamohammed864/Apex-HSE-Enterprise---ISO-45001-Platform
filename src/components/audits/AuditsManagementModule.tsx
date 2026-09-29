import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AuditRecordModel,
  AuditFindingRecord,
  AuditFindingType,
  AuditFindingSeverity,
  AuditStatus,
  AuditChecklistItem,
} from '../../types/safetyOps';
import { safetyOpsService } from '../../services/safetyOpsService';

export const AuditsManagementModule: React.FC<{ onNavigateToCapa?: () => void }> = ({
  onNavigateToCapa,
}) => {
  const { showToast } = useApp();

  const [audits, setAudits] = useState<AuditRecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Audit for Modal
  const [selectedAudit, setSelectedAudit] = useState<AuditRecordModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PLAN' | 'CHECKLIST' | 'FINDINGS' | 'REPORT'>('PLAN');

  // Add finding form state
  const [newFindingType, setNewFindingType] = useState<AuditFindingType>('NONCONFORMITY');
  const [newFindingSeverity, setNewFindingSeverity] = useState<AuditFindingSeverity>('MINOR_NC');
  const [newFindingClause, setNewFindingClause] = useState('ISO 45001 §8.1.2');
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingEvidence, setNewFindingEvidence] = useState('');
  const [newFindingAction, setNewFindingAction] = useState('');
  const [newFindingPerson, setNewFindingPerson] = useState('Site Construction Manager');
  const [newFindingTargetDate, setNewFindingTargetDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  // Load audits
  const loadAudits = async () => {
    try {
      setLoading(true);
      const data = await safetyOpsService.getAudits();
      setAudits(data);
    } catch (err) {
      console.error('Failed to load audits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      const matchSearch =
        searchTerm === '' ||
        a.auditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.auditPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.auditScope.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.auditee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [audits, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = audits.length;
    const inProgress = audits.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'PLANNED').length;
    const closed = audits.filter((a) => a.status === 'CLOSED').length;
    const totalFindings = audits.reduce((sum, a) => sum + (a.findings?.length || 0), 0);
    const nonconformities = audits.reduce(
      (sum, a) => sum + (a.findings?.filter((f) => f.type === 'NONCONFORMITY').length || 0),
      0
    );
    return { total, inProgress, closed, totalFindings, nonconformities };
  }, [audits]);

  // Open New Audit Plan
  const handleOpenNew = () => {
    const now = new Date();
    const auditNumber = `AUD-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newAudit: AuditRecordModel = {
      id: auditNumber,
      auditNumber,
      auditPlan: 'Internal HSE & Regulatory Compliance Audit Q2-2026',
      auditScope: 'Comprehensive verification of ISO 45001 operational controls, permit compliance, and contractor management.',
      auditCriteria: 'ISO 45001:2018 Clauses 4-10, OSHA 1926, and Corporate Life Saving Rules',
      auditor: 'Dr. Tariq Al-Mansoor (Lead Auditor)',
      auditTeam: ['Eng. Farhan Al-Kuwari'],
      auditee: 'Operations & Maintenance Department Lead',
      department: 'Commissioning & Mechanical Completion',
      project: 'Ras Laffan EPC-4 Liquefaction Expansion',
      plannedDate: now.toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      checklist: [
        { id: 'C-01', clause: 'ISO 45001 §5.2', requirement: 'HSE Policy displayed and understood by workforce.', criteria: 'Field interview of 5 workers and visible multilingual signage.', result: 'CONFORMANT' },
        { id: 'C-02', clause: 'ISO 45001 §6.1.2', requirement: 'Hazard identification and ALARP assessment current.', criteria: 'Active risk registers reviewed against work permits.', result: 'CONFORMANT' },
        { id: 'C-03', clause: 'ISO 45001 §8.1.2', requirement: 'Eliminating hazards and applying hierarchy of controls.', criteria: 'Physical inspection of isolation valves and barriers.', result: 'NONCONFORMANT' },
        { id: 'C-04', clause: 'ISO 45001 §9.2', requirement: 'Internal audits conducted according to planned schedule.', criteria: 'Verification of audit program execution and records.', result: 'CONFORMANT' },
      ],
      findings: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setSelectedAudit(newAudit);
    setActiveTab('PLAN');
    setIsModalOpen(true);
  };

  const handleEdit = (audit: AuditRecordModel) => {
    setSelectedAudit(JSON.parse(JSON.stringify(audit)));
    setActiveTab('PLAN');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAudit) return;
    try {
      await safetyOpsService.saveAudit(selectedAudit);
      showToast(`Audit ${selectedAudit.auditNumber} saved.`);
      setIsModalOpen(false);
      loadAudits();
    } catch (err) {
      showToast('Error saving audit record.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete audit record ${id}?`)) {
      await safetyOpsService.deleteAudit(id);
      showToast(`Audit ${id} deleted.`);
      loadAudits();
    }
  };

  // Add new finding
  const handleAddFinding = async () => {
    if (!selectedAudit || !newFindingDesc) return;
    try {
      const finding = await safetyOpsService.addAuditFinding(selectedAudit.id, {
        type: newFindingType,
        severity: newFindingSeverity,
        clause: newFindingClause,
        findingDescription: newFindingDesc,
        evidence: newFindingEvidence,
        correctiveActionRequired: newFindingAction,
        responsiblePerson: newFindingPerson,
        targetDate: newFindingTargetDate,
        status: 'OPEN',
      });

      if (finding) {
        showToast(`Finding ${finding.id} added to audit.`);
        const updated = await safetyOpsService.getAuditById(selectedAudit.id);
        if (updated) setSelectedAudit(updated);
        setNewFindingDesc('');
        setNewFindingEvidence('');
        setNewFindingAction('');
        loadAudits();
      }
    } catch (err) {
      showToast('Error adding finding.');
    }
  };

  // Dispatch Finding to CAPA
  const handleDispatchCapaFromFinding = async (finding: AuditFindingRecord) => {
    if (!selectedAudit) return;
    try {
      const capa = await safetyOpsService.createCapaFromAuditFinding(selectedAudit.id, finding.id);
      showToast(`CAPA #${capa.id} dispatched from audit finding ${finding.clause}!`);
      const updated = await safetyOpsService.getAuditById(selectedAudit.id);
      if (updated) setSelectedAudit(updated);
      loadAudits();
    } catch (err: any) {
      showToast(err.message || 'Error dispatching CAPA');
    }
  };

  // Generate Final Report
  const handleGenerateFinalReport = async () => {
    if (!selectedAudit) return;
    try {
      const updated = await safetyOpsService.generateFinalReport(
        selectedAudit.id,
        'Dr. Tariq Al-Mansoor (Lead Auditor ISO 45001)'
      );
      if (updated) {
        setSelectedAudit(updated);
        showToast(`Formal Audit Final Report generated for ${selectedAudit.auditNumber}.`);
        loadAudits();
      }
    } catch (err) {
      showToast('Error generating final report.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §9.2 Internal Audit
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Audits, Nonconformities &amp; Observations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            HSE Audit Program &amp; Non-Conformance Tracker
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Manage Audit Plans, Scopes, Criteria, Clause Checklists, Findings (Major/Minor NCs, Observations), and connect directly to CAPA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToCapa && (
            <button
              type="button"
              onClick={onNavigateToCapa}
              className="px-3.5 py-2 rounded-lg border border-[#006c4a] text-[#006c4a] text-xs font-bold hover:bg-[#eaf5ef] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Open CAPA Register</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_moderator</span>
            <span>+ Plan New Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#45464d] uppercase font-mono">Total Audits</div>
          <div className="text-2xl font-bold text-[#0b1c30] mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-[#767680] mt-0.5">Internal &amp; 3rd party programs</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#004f80] uppercase font-mono">In Progress / Planned</div>
          <div className="text-2xl font-bold text-[#004f80] mt-0.5">{stats.inProgress}</div>
          <div className="text-[10px] text-[#004f80] mt-0.5">Active field auditing</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#15803d] uppercase font-mono">Completed &amp; Reported</div>
          <div className="text-2xl font-bold text-[#15803d] mt-0.5">{stats.closed}</div>
          <div className="text-[10px] text-[#15803d] mt-0.5">Final report issued</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#ba1a1a] uppercase font-mono">Total Non-Conformances</div>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-0.5">{stats.nonconformities}</div>
          <div className="text-[10px] text-[#ba1a1a] mt-0.5">Major &amp; Minor NCs raised</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#854d0e] uppercase font-mono">Total Findings</div>
          <div className="text-2xl font-bold text-[#854d0e] mt-0.5">{stats.totalFindings}</div>
          <div className="text-[10px] text-[#45464d] mt-0.5">Including observations</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="material-symbols-outlined text-[#45464d] text-[20px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit number, plan title, scope, auditor, auditee..."
            className="w-full text-xs bg-transparent border-0 focus:ring-0 outline-hidden text-[#0b1c30] placeholder-[#767680]"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-[#45464d] font-mono text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#eff4ff] border border-[#c6c6cd]/40 rounded-lg px-2.5 py-1 text-[#0b1c30] font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REPORT_ISSUED">Report Issued</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Audits Table */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase border-b border-[#c6c6cd]/20">
              <tr>
                <th className="py-3 px-4">Audit #</th>
                <th className="py-3 px-4">Audit Plan &amp; Criteria</th>
                <th className="py-3 px-4">Auditor &amp; Team</th>
                <th className="py-3 px-4">Auditee &amp; Dept</th>
                <th className="py-3 px-4">Planned Date</th>
                <th className="py-3 px-4">Findings</th>
                <th className="py-3 px-4">Status &amp; Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 font-mono">
                    Loading audit register...
                  </td>
                </tr>
              ) : filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No audits match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((a) => (
                  <tr key={a.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#006c4a]">{a.auditNumber}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-gray-900 truncate">{a.auditPlan}</div>
                      <div className="text-[11px] text-[#45464d] truncate">{a.auditCriteria}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{a.auditor}</div>
                      {a.auditTeam && a.auditTeam.length > 0 && (
                        <div className="text-[11px] text-gray-500">{a.auditTeam.join(', ')}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{a.auditee}</div>
                      <div className="text-[11px] text-gray-500">{a.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{a.plannedDate}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-gray-900">{a.findings?.length || 0}</span>
                      <span className="text-[10px] text-red-600 ml-1">
                        ({a.findings?.filter((f) => f.type === 'NONCONFORMITY').length || 0} NC)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            a.status === 'CLOSED'
                              ? 'bg-green-100 text-green-800'
                              : a.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {a.status}
                        </span>
                        {a.conformanceRating && (
                          <div className="text-[10px] font-mono font-semibold text-gray-600">
                            {a.conformanceRating.replace(/_/g, ' ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(a)}
                          className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff]"
                          title="Open Audit Workspace"
                        >
                          Workspace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600"
                          title="Delete Audit"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Audit Workspace Modal */}
      {isModalOpen && selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#c6c6cd]/30 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006c4a] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#006c4a]">
                      {selectedAudit.auditNumber}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white text-[#0b1c30] border border-[#c6c6cd]/30">
                      {selectedAudit.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0b1c30]">{selectedAudit.auditPlan}</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-[#c6c6cd]/30 px-6 bg-white gap-2 overflow-x-auto text-xs font-medium">
              {[
                { id: 'PLAN', label: '1. Plan & Scope', icon: 'assignment' },
                { id: 'CHECKLIST', label: '2. Audit Checklist', icon: 'checklist' },
                { id: 'FINDINGS', label: `3. Findings & CAPA (${selectedAudit.findings?.length || 0})`, icon: 'report_problem' },
                { id: 'REPORT', label: '4. Final Audit Report', icon: 'description' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#006c4a] text-[#006c4a] font-bold'
                      : 'border-transparent text-[#45464d] hover:text-[#0b1c30]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#0b1c30]">
              {/* TAB 1: PLAN & SCOPE */}
              {activeTab === 'PLAN' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Audit Plan Title</label>
                      <input
                        type="text"
                        value={selectedAudit.auditPlan}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, auditPlan: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Audit Criteria</label>
                      <input
                        type="text"
                        value={selectedAudit.auditCriteria}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, auditCriteria: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Audit Scope</label>
                    <textarea
                      rows={2}
                      value={selectedAudit.auditScope}
                      onChange={(e) =>
                        setSelectedAudit({ ...selectedAudit, auditScope: e.target.value })
                      }
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Lead Auditor</label>
                      <input
                        type="text"
                        value={selectedAudit.auditor}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, auditor: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Auditee Name / Role</label>
                      <input
                        type="text"
                        value={selectedAudit.auditee}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, auditee: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Planned Date</label>
                      <input
                        type="date"
                        value={selectedAudit.plannedDate}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, plannedDate: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Project</label>
                      <input
                        type="text"
                        value={selectedAudit.project}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, project: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Department</label>
                      <input
                        type="text"
                        value={selectedAudit.department}
                        onChange={(e) =>
                          setSelectedAudit({ ...selectedAudit, department: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT CHECKLIST */}
              {activeTab === 'CHECKLIST' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900">
                      Standard Clause Audit Checklist ({selectedAudit.checklist.length} items)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newChk: AuditChecklistItem = {
                          id: `CHK-${Date.now().toString().slice(-4)}`,
                          clause: 'ISO 45001 §8.1.4',
                          requirement: 'Contractor procurement and prequalification controls applied.',
                          criteria: 'Inspection of equipment tagging and certified training records.',
                          result: 'CONFORMANT',
                        };
                        setSelectedAudit({
                          ...selectedAudit,
                          checklist: [...selectedAudit.checklist, newChk],
                        });
                      }}
                      className="px-2.5 py-1 rounded bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#00714e]"
                    >
                      + Add Clause Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedAudit.checklist.map((chk, idx) => (
                      <div key={chk.id} className="p-3 bg-[#f8f9ff] rounded-xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#006c4a]">{chk.clause}</span>
                          <select
                            value={chk.result || 'CONFORMANT'}
                            onChange={(e) => {
                              const copy = [...selectedAudit.checklist];
                              copy[idx].result = e.target.value as any;
                              setSelectedAudit({ ...selectedAudit, checklist: copy });
                            }}
                            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 font-bold"
                          >
                            <option value="CONFORMANT">CONFORMANT</option>
                            <option value="NONCONFORMANT">NONCONFORMANT</option>
                            <option value="OBSERVATION">OBSERVATION</option>
                            <option value="NOT_APPLICABLE">N/A</option>
                          </select>
                        </div>
                        <div className="font-semibold text-gray-900">{chk.requirement}</div>
                        <div className="text-[11px] text-gray-500">Criteria: {chk.criteria}</div>
                        <input
                          type="text"
                          value={chk.notes || ''}
                          onChange={(e) => {
                            const copy = [...selectedAudit.checklist];
                            copy[idx].notes = e.target.value;
                            setSelectedAudit({ ...selectedAudit, checklist: copy });
                          }}
                          placeholder="Auditor observation notes..."
                          className="w-full bg-white border border-gray-200 rounded p-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: FINDINGS & CAPA */}
              {activeTab === 'FINDINGS' && (
                <div className="space-y-6">
                  {/* Existing Findings */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-gray-900">
                      Audit Findings, Non-Conformances &amp; CAPA Dispatch ({selectedAudit.findings?.length || 0})
                    </h3>

                    {(!selectedAudit.findings || selectedAudit.findings.length === 0) ? (
                      <div className="p-4 bg-gray-50 border border-dashed rounded-xl text-center text-gray-500">
                        No findings logged for this audit yet. Use the form below to record a Non-Conformance or Observation.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedAudit.findings.map((fnd) => (
                          <div
                            key={fnd.id}
                            className={`p-4 rounded-xl border space-y-2 ${
                              fnd.type === 'NONCONFORMITY'
                                ? 'bg-[#fff5f5] border-[#ba1a1a]/30'
                                : 'bg-[#fffbeb] border-yellow-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-gray-700">{fnd.id}</span>
                                <span
                                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                    fnd.severity === 'MAJOR_NC'
                                      ? 'bg-red-600 text-white'
                                      : fnd.severity === 'MINOR_NC'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {fnd.severity.replace(/_/g, ' ')}
                                </span>
                                <span className="font-mono text-xs font-bold text-[#006c4a]">
                                  {fnd.clause}
                                </span>
                              </div>

                              {/* 1-Click CAPA Dispatch Button */}
                              <button
                                type="button"
                                onClick={() => handleDispatchCapaFromFinding(fnd)}
                                disabled={fnd.status === 'CAPA_DISPATCHED'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                                  fnd.status === 'CAPA_DISPATCHED'
                                    ? 'bg-green-700 text-white cursor-default'
                                    : 'bg-[#006c4a] text-white hover:bg-[#00714e]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {fnd.status === 'CAPA_DISPATCHED' ? 'task_alt' : 'send'}
                                </span>
                                <span>
                                  {fnd.status === 'CAPA_DISPATCHED'
                                    ? `CAPA Created (${fnd.capaIdCreated || 'Linked'})`
                                    : 'Dispatch to CAPA'}
                                </span>
                              </button>
                            </div>

                            <div className="font-bold text-xs text-gray-900">{fnd.findingDescription}</div>
                            <div className="text-[11px] text-gray-600">
                              <span className="font-semibold">Evidence:</span> {fnd.evidence}
                            </div>
                            <div className="text-[11px] text-gray-700">
                              <span className="font-semibold">Corrective Action Required:</span> {fnd.correctiveActionRequired}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Assigned: {fnd.responsiblePerson} • Target: {fnd.targetDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Finding Form */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-300 space-y-3">
                    <h4 className="font-bold text-xs uppercase font-mono text-gray-800">
                      Record New Non-Conformance / Observation
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Type</label>
                        <select
                          value={newFindingType}
                          onChange={(e) => setNewFindingType(e.target.value as AuditFindingType)}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                        >
                          <option value="NONCONFORMITY">Nonconformity</option>
                          <option value="OBSERVATION">Observation</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Severity</label>
                        <select
                          value={newFindingSeverity}
                          onChange={(e) => setNewFindingSeverity(e.target.value as AuditFindingSeverity)}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-semibold"
                        >
                          <option value="MAJOR_NC">Major Nonconformity</option>
                          <option value="MINOR_NC">Minor Nonconformity</option>
                          <option value="OBSERVATION">Observation</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Clause Ref</label>
                        <input
                          type="text"
                          value={newFindingClause}
                          onChange={(e) => setNewFindingClause(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-gray-600 block mb-1">Finding Description</label>
                      <input
                        type="text"
                        value={newFindingDesc}
                        onChange={(e) => setNewFindingDesc(e.target.value)}
                        placeholder="State the non-compliance observed against standard..."
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-gray-600 block mb-1">Evidence Inspected</label>
                      <input
                        type="text"
                        value={newFindingEvidence}
                        onChange={(e) => setNewFindingEvidence(e.target.value)}
                        placeholder="Records, documents, or photos proving the finding..."
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Corrective Action Required</label>
                        <input
                          type="text"
                          value={newFindingAction}
                          onChange={(e) => setNewFindingAction(e.target.value)}
                          placeholder="Action to correct defect..."
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Target Date</label>
                        <input
                          type="date"
                          value={newFindingTargetDate}
                          onChange={(e) => setNewFindingTargetDate(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleAddFinding}
                        className="px-4 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
                      >
                        + Add Finding to Audit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FINAL AUDIT REPORT */}
              {activeTab === 'REPORT' && (
                <div className="space-y-4">
                  <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c6c6cd]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#0b1c30]">
                        Formal ISO 45001 Management System Final Audit Report
                      </h3>
                      <p className="text-xs text-[#45464d] mt-0.5">
                        Compile formal audit conclusion, conformance rating, non-conformance statistics, and executive auditor sign-off.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateFinalReport}
                      className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Generate &amp; Approve Final Report</span>
                    </button>
                  </div>

                  {/* Report Preview Dossier */}
                  <div className="p-6 bg-white border-2 border-gray-300 rounded-xl space-y-4 font-sans">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-gray-500 uppercase">
                          Executive Audit Summary
                        </div>
                        <h2 className="text-base font-bold text-gray-900">{selectedAudit.auditPlan}</h2>
                      </div>
                      <span className="px-3 py-1 rounded bg-[#006c4a] text-white font-mono text-xs font-bold">
                        {selectedAudit.conformanceRating || 'SATISFACTORY'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-gray-50 p-3 rounded-lg font-mono">
                      <div>
                        <span className="text-gray-500">Lead Auditor:</span>
                        <div className="font-bold text-gray-900">{selectedAudit.auditor}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Auditee:</span>
                        <div className="font-bold text-gray-900">{selectedAudit.auditee}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Findings:</span>
                        <div className="font-bold text-gray-900">{selectedAudit.findings?.length || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Nonconformities:</span>
                        <div className="font-bold text-red-600">
                          {selectedAudit.findings?.filter((f) => f.type === 'NONCONFORMITY').length || 0}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-gray-800 mb-1">Audit Summary Conclusion:</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {selectedAudit.summaryConclusion ||
                          'The audited management system demonstrates robust conformance to ISO 45001:2018 requirements. Corrective action plans have been raised and dispatched to the CAPA register for identified nonconformities.'}
                      </p>
                    </div>

                    {selectedAudit.finalReportApprovedBy && (
                      <div className="pt-3 border-t flex items-center justify-between text-xs font-mono">
                        <span className="text-green-700 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Signed &amp; Approved by: {selectedAudit.finalReportApprovedBy}</span>
                        </span>
                        <span className="text-gray-400">Status: CLOSED</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#c6c6cd]/30 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                Audit Record ID: {selectedAudit.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
                >
                  Save Audit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
