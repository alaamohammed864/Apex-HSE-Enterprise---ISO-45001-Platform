import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CapaRecord,
  CapaStatus,
  CapaSource,
  CapaRiskLevel,
  IncidentEvidenceItem,
} from '../../types/safetyOps';
import { safetyOpsService } from '../../services/safetyOpsService';

export const CapaManagementModule: React.FC<{
  onNavigateToIncidents?: () => void;
  onNavigateToAudits?: () => void;
  onNavigateToInspections?: () => void;
}> = ({ onNavigateToIncidents, onNavigateToAudits, onNavigateToInspections }) => {
  const { showToast } = useApp();

  const [capas, setCapas] = useState<CapaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modal states
  const [selectedCapa, setSelectedCapa] = useState<CapaRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('Dr. Tariq Al-Mansoor (Lead Auditor)');
  const [isEffective, setIsEffective] = useState(true);

  // Load CAPAs
  const loadCapas = async () => {
    try {
      setLoading(true);
      const data = await safetyOpsService.getCapas();
      setCapas(data);
    } catch (err) {
      console.error('Failed to load CAPAs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapas();
  }, []);

  // Filtered CAPAs
  const filteredCapas = useMemo(() => {
    return capas.filter((c) => {
      const matchSearch =
        searchTerm === '' ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.finding.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.actionRequired.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.sourceReferenceId && c.sourceReferenceId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSource = sourceFilter === 'ALL' || c.source === sourceFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchRisk = riskFilter === 'ALL' || c.riskLevel === riskFilter;
      return matchSearch && matchSource && matchStatus && matchRisk;
    });
  }, [capas, searchTerm, sourceFilter, statusFilter, riskFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = capas.length;
    const open = capas.filter((c) => c.status === 'OPEN').length;
    const inProgress = capas.filter((c) => c.status === 'IN PROGRESS').length;
    const overdue = capas.filter((c) => c.status === 'OVERDUE').length;
    const pendingVerification = capas.filter((c) => c.status === 'PENDING VERIFICATION').length;
    const closed = capas.filter((c) => c.status === 'CLOSED').length;
    return { total, open, inProgress, overdue, pendingVerification, closed };
  }, [capas]);

  // Create new CAPA
  const handleOpenNew = () => {
    const now = new Date();
    const id = `CAPA-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: CapaRecord = {
      id,
      finding: '',
      source: 'HAZARD',
      riskLevel: 'MEDIUM',
      actionRequired: '',
      responsiblePerson: 'HSE Field Engineer',
      department: 'Safety Operations',
      targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      evidence: [],
      status: 'OPEN',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setSelectedCapa(newRecord);
    setIsEditorOpen(true);
  };

  const handleEdit = (capa: CapaRecord) => {
    setSelectedCapa(JSON.parse(JSON.stringify(capa)));
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCapa) return;
    try {
      await safetyOpsService.saveCapa(selectedCapa);
      showToast(`CAPA #${selectedCapa.id} saved.`);
      setIsEditorOpen(false);
      loadCapas();
    } catch (err) {
      showToast('Error saving CAPA record.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete CAPA record ${id}?`)) {
      await safetyOpsService.deleteCapa(id);
      showToast(`CAPA ${id} deleted.`);
      loadCapas();
    }
  };

  // Open verification dialog
  const handleOpenVerify = (capa: CapaRecord) => {
    setSelectedCapa(capa);
    setVerificationNotes(
      capa.verification?.notes ||
        'Physical site walk performed. Corrective action verified implemented, robust, and effectively mitigating the risk.'
    );
    setVerifiedBy(capa.verifiedBy || 'Dr. Tariq Al-Mansoor (Lead Auditor)');
    setIsEffective(true);
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedCapa) return;
    try {
      await safetyOpsService.verifyAndCloseCapa(
        selectedCapa.id,
        verifiedBy,
        verificationNotes,
        isEffective
      );
      showToast(
        isEffective
          ? `CAPA #${selectedCapa.id} verified effective and officially closed.`
          : `CAPA #${selectedCapa.id} returned to In Progress for further action.`
      );
      setIsVerifyModalOpen(false);
      loadCapas();
    } catch (err) {
      showToast('Error during CAPA verification.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'CAPA ID',
      'Source',
      'Source Ref ID',
      'Risk Level',
      'Finding',
      'Action Required',
      'Responsible Person',
      'Department',
      'Target Date',
      'Status',
      'Closure Date',
      'Verified By',
    ];
    const rows = filteredCapas.map((c) => [
      `"${c.id}"`,
      `"${c.source}"`,
      `"${c.sourceReferenceId || ''}"`,
      `"${c.riskLevel}"`,
      `"${(c.finding || '').replace(/"/g, '""')}"`,
      `"${(c.actionRequired || '').replace(/"/g, '""')}"`,
      `"${c.responsiblePerson}"`,
      `"${c.department}"`,
      `"${c.targetDate}"`,
      `"${c.status}"`,
      `"${c.closureDate || ''}"`,
      `"${c.verifiedBy || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HSE-CAPA-Register-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CAPA register exported to CSV successfully.');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §10.2 / §9.2
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Corrective &amp; Preventive Action (CAPA) Central Register
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            CAPA Action Tracking &amp; Verification Hub
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Unified register bridging Incident investigations, Internal/External Audits, and Field Inspection findings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg border border-[#c6c6cd] text-[#0b1c30] text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>+ Create CAPA Ticket</span>
          </button>
        </div>
      </div>

      {/* Auto Overdue Alert Banner if any overdue exists */}
      {stats.overdue > 0 && (
        <div className="p-4 bg-[#ffdad6] text-[#93000a] rounded-xl border border-[#ba1a1a]/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[24px]">warning</span>
            <div>
              <div className="font-bold text-xs uppercase font-mono tracking-wider">
                Automated Overdue Detection Alert
              </div>
              <div className="text-xs">
                {stats.overdue} action{stats.overdue > 1 ? 's have' : ' has'} exceeded the contractual target due date and require immediate escalation.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('OVERDUE')}
            className="px-3 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold hover:bg-[#93000a]"
          >
            View Overdue ({stats.overdue})
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#45464d] uppercase font-mono">Total CAPAs</div>
          <div className="text-2xl font-bold text-[#0b1c30] mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-[#767680] mt-0.5">All operational sources</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#004f80] uppercase font-mono">Open</div>
          <div className="text-2xl font-bold text-[#004f80] mt-0.5">{stats.open}</div>
          <div className="text-[10px] text-[#45464d] mt-0.5">Awaiting assignment/start</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#854d0e] uppercase font-mono">In Progress</div>
          <div className="text-2xl font-bold text-[#854d0e] mt-0.5">{stats.inProgress}</div>
          <div className="text-[10px] text-[#45464d] mt-0.5">Mitigation underway</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#ba1a1a] uppercase font-mono">Overdue</div>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-0.5">{stats.overdue}</div>
          <div className="text-[10px] text-[#ba1a1a] mt-0.5">Target date passed</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#c2410c] uppercase font-mono">Pending Verification</div>
          <div className="text-2xl font-bold text-[#c2410c] mt-0.5">{stats.pendingVerification}</div>
          <div className="text-[10px] text-[#45464d] mt-0.5">Submitted for signoff</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#15803d] uppercase font-mono">Closed &amp; Verified</div>
          <div className="text-2xl font-bold text-[#15803d] mt-0.5">{stats.closed}</div>
          <div className="text-[10px] text-[#15803d] mt-0.5">Confirmed effective</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="material-symbols-outlined text-[#45464d] text-[20px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search finding, action required, responsible person, CAPA ID, source..."
            className="w-full text-xs bg-transparent border-0 focus:ring-0 outline-hidden text-[#0b1c30] placeholder-[#767680]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#45464d] font-mono text-[11px]">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs bg-[#eff4ff] border border-[#c6c6cd]/40 rounded-lg px-2.5 py-1 text-[#0b1c30] font-medium"
            >
              <option value="ALL">All Sources</option>
              <option value="INCIDENT">Incident</option>
              <option value="AUDIT">Audit</option>
              <option value="INSPECTION">Inspection</option>
              <option value="HAZARD">Hazard / ALARP</option>
              <option value="SAFETY_OBSERVATION">Safety Observation</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#45464d] font-mono text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#eff4ff] border border-[#c6c6cd]/40 rounded-lg px-2.5 py-1 text-[#0b1c30] font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="PENDING VERIFICATION">PENDING VERIFICATION</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#45464d] font-mono text-[11px]">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-[#eff4ff] border border-[#c6c6cd]/40 rounded-lg px-2.5 py-1 text-[#0b1c30] font-medium"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* CAPA Table */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase border-b border-[#c6c6cd]/20">
              <tr>
                <th className="py-3 px-4">CAPA ID</th>
                <th className="py-3 px-4">Source &amp; Ref</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Finding &amp; Non-Conformance</th>
                <th className="py-3 px-4">Action Required</th>
                <th className="py-3 px-4">Responsible Person &amp; Dept</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500 font-mono">
                    Loading CAPA register...
                  </td>
                </tr>
              ) : filteredCapas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No CAPA records found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredCapas.map((c) => (
                  <tr key={c.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#006c4a]">
                      {c.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 inline-block">
                        {c.source}
                      </div>
                      {c.sourceReferenceId && (
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                          Ref: {c.sourceReferenceId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          c.riskLevel === 'CRITICAL'
                            ? 'bg-[#ba1a1a] text-white'
                            : c.riskLevel === 'HIGH'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : c.riskLevel === 'MEDIUM'
                            ? 'bg-[#ffeed4] text-[#854d0e]'
                            : 'bg-[#e2f1ff] text-[#004f80]'
                        }`}
                      >
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-medium text-gray-900 line-clamp-2" title={c.finding}>
                        {c.finding}
                      </p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-gray-700 line-clamp-2" title={c.actionRequired}>
                        {c.actionRequired}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{c.responsiblePerson}</div>
                      <div className="text-[11px] text-gray-500">{c.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className={c.status === 'OVERDUE' ? 'text-red-600 font-bold' : ''}>
                        {c.targetDate}
                      </div>
                      {c.closureDate && (
                        <div className="text-[10px] text-green-700">Closed: {c.closureDate}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold inline-flex items-center gap-1 ${
                          c.status === 'CLOSED'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : c.status === 'OVERDUE'
                            ? 'bg-[#ffdad6] text-[#ba1a1a] animate-pulse'
                            : c.status === 'PENDING VERIFICATION'
                            ? 'bg-[#fed7aa] text-[#c2410c]'
                            : c.status === 'IN PROGRESS'
                            ? 'bg-[#fef9c3] text-[#a16207]'
                            : 'bg-[#e2f1ff] text-[#004f80]'
                        }`}
                      >
                        {c.status === 'OVERDUE' && (
                          <span className="material-symbols-outlined text-[12px]">alarm</span>
                        )}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status !== 'CLOSED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenVerify(c)}
                            className="px-2 py-1 rounded bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#00714e] transition-colors flex items-center gap-1"
                            title="Verify Effectiveness & Close"
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            <span>Verify</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          className="px-2 py-1 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff]"
                          title="Edit CAPA details"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600"
                          title="Delete Record"
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

      {/* Create / Edit CAPA Modal */}
      {isEditorOpen && selectedCapa && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#c6c6cd]/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#006c4a]">{selectedCapa.id}</span>
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  {selectedCapa.id ? 'Edit Corrective Action (CAPA)' : 'New Corrective Action'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#0b1c30]">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Non-Conformance / Finding Description
                </label>
                <textarea
                  rows={2}
                  value={selectedCapa.finding}
                  onChange={(e) => setSelectedCapa({ ...selectedCapa, finding: e.target.value })}
                  placeholder="Detail the hazard condition, incident root cause, or audit nonconformity..."
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Source</label>
                  <select
                    value={selectedCapa.source}
                    onChange={(e) =>
                      setSelectedCapa({ ...selectedCapa, source: e.target.value as CapaSource })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="INCIDENT">INCIDENT</option>
                    <option value="AUDIT">AUDIT</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="HAZARD">HAZARD / ALARP</option>
                    <option value="SAFETY_OBSERVATION">SAFETY OBSERVATION</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Source Reference ID</label>
                  <input
                    type="text"
                    value={selectedCapa.sourceReferenceId || ''}
                    onChange={(e) =>
                      setSelectedCapa({ ...selectedCapa, sourceReferenceId: e.target.value })
                    }
                    placeholder="e.g. INC-2026-042 or AUD-001"
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Risk Level</label>
                  <select
                    value={selectedCapa.riskLevel}
                    onChange={(e) =>
                      setSelectedCapa({ ...selectedCapa, riskLevel: e.target.value as CapaRiskLevel })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Action Required (Hierarchy of Controls)
                </label>
                <textarea
                  rows={2}
                  value={selectedCapa.actionRequired}
                  onChange={(e) => setSelectedCapa({ ...selectedCapa, actionRequired: e.target.value })}
                  placeholder="Specific physical or procedural mitigation required..."
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={selectedCapa.responsiblePerson}
                    onChange={(e) =>
                      setSelectedCapa({ ...selectedCapa, responsiblePerson: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={selectedCapa.department}
                    onChange={(e) => setSelectedCapa({ ...selectedCapa, department: e.target.value })}
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={selectedCapa.targetDate}
                    onChange={(e) => setSelectedCapa({ ...selectedCapa, targetDate: e.target.value })}
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Status</label>
                  <select
                    value={selectedCapa.status}
                    onChange={(e) =>
                      setSelectedCapa({ ...selectedCapa, status: e.target.value as CapaStatus })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="OVERDUE">OVERDUE</option>
                    <option value="PENDING VERIFICATION">PENDING VERIFICATION</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Verified By (Auditor/Director)</label>
                  <input
                    type="text"
                    value={selectedCapa.verifiedBy || ''}
                    onChange={(e) => setSelectedCapa({ ...selectedCapa, verifiedBy: e.target.value })}
                    placeholder="Leave blank until verified"
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
              >
                Save CAPA Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification & Signoff Modal */}
      {isVerifyModalOpen && selectedCapa && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c6c6cd]/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#006c4a]">{selectedCapa.id}</span>
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  Formal CAPA Verification &amp; Closeout
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#0b1c30]">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="font-bold text-gray-700">Original Finding:</div>
                <div className="text-gray-600 mt-0.5">{selectedCapa.finding}</div>
                <div className="font-bold text-gray-700 mt-2">Required Action:</div>
                <div className="text-gray-600 mt-0.5">{selectedCapa.actionRequired}</div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Verified By (Auditor / HSE Director)
                </label>
                <input
                  type="text"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Verification Audit Notes &amp; Evidence
                </label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Detail the on-site verification, physical inspection results, and evidence inspected..."
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isEffective"
                  checked={isEffective}
                  onChange={(e) => setIsEffective(e.target.checked)}
                  className="w-4 h-4 text-[#006c4a] rounded"
                />
                <label htmlFor="isEffective" className="font-bold text-xs text-gray-800">
                  Action has been verified effective in preventing recurrence (Close ticket)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Confirm Verification &amp; Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
