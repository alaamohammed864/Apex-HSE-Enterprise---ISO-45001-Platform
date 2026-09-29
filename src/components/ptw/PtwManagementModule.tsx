import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PermitToWorkModel,
  PermitDisciplineType,
  PermitStatus,
  GasTestReading,
  IsolationPoint,
} from '../../types/phase7';
import { phase7Service } from '../../services/phase7Service';
import { LinkableEntitiesService, LinkableEntityItem } from '../../services/linkableEntitiesService';

const ALL_PERMIT_TYPES: PermitDisciplineType[] = [
  'HOT_WORK',
  'COLD_WORK',
  'CONFINED_SPACE',
  'WORKING_AT_HEIGHT',
  'EXCAVATION',
  'LIFTING',
  'ELECTRICAL_ISOLATION',
  'LINE_BREAKING',
  'RADIOGRAPHY',
  'EQUIPMENT_VEHICLE_ENTRY',
];

export const PtwManagementModule: React.FC = () => {
  const { showToast } = useApp();

  const [permits, setPermits] = useState<PermitToWorkModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Permit for Modal
  const [selectedPermit, setSelectedPermit] = useState<PermitToWorkModel | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CONTROLS' | 'ISOLATIONS' | 'GAS_TEST' | 'APPROVALS' | 'CLOSEOUT'>('DETAILS');

  // Relational options from linkable entities
  const [projectOptions, setProjectOptions] = useState<LinkableEntityItem[]>([]);
  const [riskAssessmentOptions, setRiskAssessmentOptions] = useState<LinkableEntityItem[]>([]);
  const [documentOptions, setDocumentOptions] = useState<LinkableEntityItem[]>([]);

  // Load Data
  const loadPermits = async () => {
    try {
      setLoading(true);
      const data = await phase7Service.getPermits();
      setPermits(data);
    } catch (err) {
      console.error('Failed to load permits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermits();
    LinkableEntitiesService.getProjects().then(setProjectOptions);
    LinkableEntitiesService.getRiskAssessments().then(setRiskAssessmentOptions);
    LinkableEntitiesService.getDocuments().then(setDocumentOptions);
  }, []);

  // Filtered Permits
  const filteredPermits = useMemo(() => {
    return permits.filter((p) => {
      const matchSearch =
        searchTerm === '' ||
        p.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiver.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'ALL' || p.permitType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [permits, searchTerm, typeFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = permits.length;
    const active = permits.filter((p) => p.status === 'ACTIVE').length;
    const issued = permits.filter((p) => p.status === 'ISSUED').length;
    const suspended = permits.filter((p) => p.status === 'SUSPENDED').length;
    const expired = permits.filter((p) => p.status === 'EXPIRED').length;
    const closed = permits.filter((p) => p.status === 'CLOSED').length;
    return { total, active, issued, suspended, expired, closed };
  }, [permits]);

  // Create new permit
  const handleOpenNew = () => {
    const now = new Date();
    const permitNumber = `PTW-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const startStr = now.toISOString().slice(0, 16);
    const expDate = new Date(now.getTime() + 10 * 3600000);
    const expStr = expDate.toISOString().slice(0, 16);

    const newPermit: PermitToWorkModel = {
      id: permitNumber,
      permitNumber,
      permitType: 'HOT_WORK',
      workDescription: '',
      location: 'Process Train Unit 3 - Skid B',
      contractor: 'CCC Consortium',
      workPartyCount: 4,
      workPartyLead: 'Technician Lead',
      workPartyMembers: ['Technician Lead', 'Assistant Welder', 'Fitter'],
      issuer: 'Eng. Salem Al-Hajri',
      receiver: 'Technician Lead',
      projectId: projectOptions[0]?.id || 'PRJ-RL-01',
      projectName: projectOptions[0]?.title || 'Ras Laffan EPC-4',
      linkedRiskAssessmentId: riskAssessmentOptions[0]?.id || 'RA-2026-001',
      linkedRiskAssessmentTitle: riskAssessmentOptions[0]?.title || 'Heavy Dual Lift',
      linkedDocumentIds: [],
      linkedDocumentCodes: [],
      controlsSummary: 'Fire blanket, barrier boundary, sparks shields, and valid fire extinguisher.',
      mandatoryPpe: ['Hard Hat', 'Safety Boots', 'Safety Glasses', 'Leather Gloves'],
      requiresFireWatch: true,
      requiresStandbyPerson: false,
      requiresIsolation: false,
      isolations: [],
      requiresGasTesting: true,
      gasTesterName: 'Subramanian Raman (AGT-401)',
      gasTestingDateTime: now.toISOString(),
      gasTestPassed: true,
      gasReadings: [
        { gasName: 'Oxygen (O2)', unit: '%', measuredValue: 20.9, safeLimitDescription: '19.5% - 23.5%', isAcceptable: true },
        { gasName: 'Flammable LEL', unit: '%', measuredValue: 0.0, safeLimitDescription: '< 10%', isAcceptable: true },
        { gasName: 'Hydrogen Sulfide (H2S)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 5 ppm', isAcceptable: true },
        { gasName: 'Carbon Monoxide (CO)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 25 ppm', isAcceptable: true },
      ],
      emergencyArrangements: 'Dedicated radio Channel 4 to site emergency response team.',
      assemblyPoint: 'Muster Point #3',
      nearestFireStationOrStandby: 'RLIC Fire Station #2',
      startDateTime: startStr,
      expiryDateTime: expStr,
      status: 'DRAFT',
      approvals: {
        issuingAuthoritySigned: false,
        issuingAuthorityName: 'Eng. Salem Al-Hajri',
        performingAuthoritySigned: false,
        performingAuthorityName: 'Technician Lead',
        safetyOfficerSigned: false,
        safetyOfficerName: 'Dr. Tariq Al-Mansoor',
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setSelectedPermit(newPermit);
    setActiveTab('DETAILS');
    setIsEditorOpen(true);
  };

  const handleEdit = (p: PermitToWorkModel) => {
    setSelectedPermit(JSON.parse(JSON.stringify(p)));
    setActiveTab('DETAILS');
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!selectedPermit) return;
    try {
      await phase7Service.savePermit(selectedPermit);
      showToast(`Permit ${selectedPermit.permitNumber} saved successfully.`);
      setIsEditorOpen(false);
      loadPermits();
    } catch (err) {
      showToast('Error saving permit.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Delete permit ${id}?`)) {
      await phase7Service.deletePermit(id);
      showToast(`Permit ${id} deleted.`);
      loadPermits();
    }
  };

  // Status transitions
  const handleActivate = async () => {
    if (!selectedPermit) return;
    const updated = await phase7Service.activatePermit(
      selectedPermit.id,
      'Dr. Tariq Al-Mansoor (Safety Authority)'
    );
    if (updated) {
      setSelectedPermit(updated);
      showToast(`Permit ${selectedPermit.permitNumber} is now ACTIVE!`);
      loadPermits();
    }
  };

  const handleSuspend = async () => {
    if (!selectedPermit) return;
    const reason = prompt('Enter reason for permit suspension:', 'Adverse high wind conditions >25 knots.');
    if (!reason) return;
    const updated = await phase7Service.suspendPermit(selectedPermit.id, reason);
    if (updated) {
      setSelectedPermit(updated);
      showToast(`Permit ${selectedPermit.permitNumber} suspended.`);
      loadPermits();
    }
  };

  const handleClose = async () => {
    if (!selectedPermit) return;
    const updated = await phase7Service.closePermit(
      selectedPermit.id,
      'Eng. Salem Al-Hajri (Issuing Authority)',
      'Job completed satisfactorily, worksite cleaned and housekeeping verified, isolations normalized.'
    );
    if (updated) {
      setSelectedPermit(updated);
      showToast(`Permit ${selectedPermit.permitNumber} officially closed.`);
      loadPermits();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §8.1.2 Operational Control
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Electronic Permit to Work (e-PTW) Live Board
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            High-Hazard Work Permits &amp; Gas Testing Board
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Hot work, Confined space, Working at height, Excavation, Lifting, Electrical isolation, and LOTO interlocks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_moderator</span>
          <span>+ Create High-Hazard Permit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#45464d] uppercase font-mono">Total Permits</div>
          <div className="text-2xl font-bold text-[#0b1c30] mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">All 10 hazard types</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#15803d] uppercase font-mono">Active (Live)</div>
          <div className="text-2xl font-bold text-[#15803d] mt-0.5">{stats.active}</div>
          <div className="text-[10px] text-[#15803d] mt-0.5">Currently running on site</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#004f80] uppercase font-mono">Issued / Ready</div>
          <div className="text-2xl font-bold text-[#004f80] mt-0.5">{stats.issued}</div>
          <div className="text-[10px] text-[#004f80] mt-0.5">Signed, awaiting start</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#a16207] uppercase font-mono">Suspended</div>
          <div className="text-2xl font-bold text-[#a16207] mt-0.5">{stats.suspended}</div>
          <div className="text-[10px] text-[#a16207] mt-0.5">Hold for weather/gas</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#ba1a1a] uppercase font-mono">Expired</div>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-0.5">{stats.expired}</div>
          <div className="text-[10px] text-[#ba1a1a] mt-0.5">Re-testing required</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-gray-500 uppercase font-mono">Closed &amp; De-isolated</div>
          <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.closed}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Restored safe</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search permit number, work description, location, contractor..."
            className="w-full text-xs bg-transparent border-0 focus:ring-0 outline-hidden text-[#0b1c30]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500 font-mono text-[11px]">Discipline:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#eff4ff] border border-gray-300 rounded px-2 py-1 font-medium max-w-[180px] truncate"
            >
              <option value="ALL">All Types (10)</option>
              {ALL_PERMIT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-500 font-mono text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#eff4ff] border border-gray-300 rounded px-2 py-1 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ISSUED">ISSUED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permits Table */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-gray-600 font-mono text-[11px] uppercase border-b">
              <tr>
                <th className="py-3 px-4">Permit #</th>
                <th className="py-3 px-4">Type &amp; Discipline</th>
                <th className="py-3 px-4">Work Description &amp; Location</th>
                <th className="py-3 px-4">Contractor &amp; Party</th>
                <th className="py-3 px-4">Gas Test</th>
                <th className="py-3 px-4">Valid Timeframe</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 font-mono">
                    Loading permits...
                  </td>
                </tr>
              ) : filteredPermits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No permits found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPermits.map((p) => (
                  <tr key={p.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#ba1a1a]">
                      {p.permitNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          p.permitType === 'HOT_WORK'
                            ? 'bg-red-100 text-red-800'
                            : p.permitType === 'CONFINED_SPACE'
                            ? 'bg-purple-100 text-purple-800'
                            : p.permitType === 'ELECTRICAL_ISOLATION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.permitType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-gray-900 truncate" title={p.workDescription}>
                        {p.workDescription}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{p.location}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{p.contractor}</div>
                      <div className="text-[11px] text-gray-400">
                        Party: {p.workPartyCount} workers ({p.workPartyLead})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {p.requiresGasTesting ? (
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            p.gasTestPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.gasTestPassed ? 'PASS (O2 20.9%)' : 'RE-TEST'}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-mono text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>{p.startDateTime.replace('T', ' ')}</div>
                      <div className="text-gray-400 text-[10px]">
                        to {p.expiryDateTime.replace('T', ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold inline-flex items-center gap-1 ${
                          p.status === 'ACTIVE'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : p.status === 'ISSUED'
                            ? 'bg-blue-100 text-blue-800'
                            : p.status === 'SUSPENDED'
                            ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                            : p.status === 'EXPIRED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.status === 'ACTIVE' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff]"
                          title="Open Permit Dossier"
                        >
                          Dossier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded text-red-400 hover:text-red-600"
                          title="Delete"
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

      {/* Comprehensive Permit to Work Modal */}
      {isEditorOpen && selectedPermit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#c6c6cd]/30 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">assignment_turned_in</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#ba1a1a]">
                      {selectedPermit.permitNumber}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white text-[#0b1c30] border border-[#c6c6cd]/30">
                      {selectedPermit.permitType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                        selectedPermit.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : selectedPermit.status === 'CLOSED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedPermit.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0b1c30]">
                    {selectedPermit.workDescription || 'High-Hazard Work Permit'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedPermit.status === 'ISSUED' && (
                  <button
                    type="button"
                    onClick={handleActivate}
                    className="px-3.5 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Authorize &amp; Activate</span>
                  </button>
                )}
                {selectedPermit.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={handleSuspend}
                    className="px-3 py-1.5 rounded-lg bg-yellow-600 text-white text-xs font-bold hover:bg-yellow-700 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">pause</span>
                    <span>Suspend</span>
                  </button>
                )}
                {(selectedPermit.status === 'ACTIVE' || selectedPermit.status === 'SUSPENDED') && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Closeout &amp; De-isolate</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-[#c6c6cd]/30 px-6 bg-white gap-2 overflow-x-auto text-xs font-medium">
              {[
                { id: 'DETAILS', label: '1. Work Details & Links', icon: 'description' },
                { id: 'CONTROLS', label: '2. Controls & PPE', icon: 'shield' },
                { id: 'ISOLATIONS', label: '3. LOTO Isolations', icon: 'lock' },
                { id: 'GAS_TEST', label: '4. Gas Testing', icon: 'air' },
                { id: 'APPROVALS', label: '5. Approvals & Signatures', icon: 'draw' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#ba1a1a] text-[#ba1a1a] font-bold'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#0b1c30]">
              {/* TAB 1: WORK DETAILS & CROSS-MODULE LINKS */}
              {activeTab === 'DETAILS' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Permit Number</label>
                      <input
                        type="text"
                        value={selectedPermit.permitNumber}
                        onChange={(e) =>
                          setSelectedPermit({ ...selectedPermit, permitNumber: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Permit Discipline</label>
                      <select
                        value={selectedPermit.permitType}
                        onChange={(e) =>
                          setSelectedPermit({
                            ...selectedPermit,
                            permitType: e.target.value as PermitDisciplineType,
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-semibold"
                      >
                        {ALL_PERMIT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Permit Status</label>
                      <select
                        value={selectedPermit.status}
                        onChange={(e) =>
                          setSelectedPermit({
                            ...selectedPermit,
                            status: e.target.value as PermitStatus,
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-bold"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ISSUED">ISSUED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Work Description (Scope, tools, and technical sequence)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedPermit.workDescription}
                      onChange={(e) =>
                        setSelectedPermit({ ...selectedPermit, workDescription: e.target.value })
                      }
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Location / Equipment Tag</label>
                      <input
                        type="text"
                        value={selectedPermit.location}
                        onChange={(e) =>
                          setSelectedPermit({ ...selectedPermit, location: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Contractor</label>
                      <input
                        type="text"
                        value={selectedPermit.contractor}
                        onChange={(e) =>
                          setSelectedPermit({ ...selectedPermit, contractor: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Cross-Module Connections */}
                  <div className="p-3 bg-[#f8f9ff] rounded-xl border border-gray-300 space-y-3">
                    <h4 className="font-bold text-xs uppercase font-mono text-[#006c4a]">
                      Cross-Module Relational Linkages
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-gray-600 block mb-1">Linked Project</label>
                        <select
                          value={selectedPermit.projectId}
                          onChange={(e) => {
                            const prj = projectOptions.find((p) => p.id === e.target.value);
                            setSelectedPermit({
                              ...selectedPermit,
                              projectId: e.target.value,
                              projectName: prj?.title || '',
                            });
                          }}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                        >
                          {projectOptions.map((prj) => (
                            <option key={prj.id} value={prj.id}>
                              {prj.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-gray-600 block mb-1">
                          Linked Risk Assessment (Phase 5)
                        </label>
                        <select
                          value={selectedPermit.linkedRiskAssessmentId || ''}
                          onChange={(e) => {
                            const ra = riskAssessmentOptions.find((r) => r.id === e.target.value);
                            setSelectedPermit({
                              ...selectedPermit,
                              linkedRiskAssessmentId: e.target.value,
                              linkedRiskAssessmentTitle: ra?.title || '',
                            });
                          }}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs truncate"
                        >
                          <option value="">None Linked</option>
                          {riskAssessmentOptions.map((ra) => (
                            <option key={ra.id} value={ra.id}>
                              {ra.code || ra.id} - {ra.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-gray-600 block mb-1">
                          Reference SOP / Doc (Phase 2/4)
                        </label>
                        <select
                          value={selectedPermit.linkedDocumentIds?.[0] || ''}
                          onChange={(e) => {
                            const doc = documentOptions.find((d) => d.id === e.target.value);
                            setSelectedPermit({
                              ...selectedPermit,
                              linkedDocumentIds: e.target.value ? [e.target.value] : [],
                              linkedDocumentCodes: doc?.code ? [doc.code] : [],
                            });
                          }}
                          className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs truncate"
                        >
                          <option value="">None Linked</option>
                          {documentOptions.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.code} - {doc.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Valid Start Time</label>
                      <input
                        type="datetime-local"
                        value={selectedPermit.startDateTime}
                        onChange={(e) =>
                          setSelectedPermit({ ...selectedPermit, startDateTime: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Valid Expiry Time</label>
                      <input
                        type="datetime-local"
                        value={selectedPermit.expiryDateTime}
                        onChange={(e) =>
                          setSelectedPermit({ ...selectedPermit, expiryDateTime: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTROLS & PPE */}
              {activeTab === 'CONTROLS' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Required Risk Controls &amp; Mitigations
                    </label>
                    <textarea
                      rows={3}
                      value={selectedPermit.controlsSummary}
                      onChange={(e) =>
                        setSelectedPermit({ ...selectedPermit, controlsSummary: e.target.value })
                      }
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      'Hard Hat',
                      'Safety Boots',
                      'Safety Glasses',
                      'High-Vis Vest',
                      'Full Body Harness',
                      'Face Shield',
                      'Chemical Gloves',
                      'Hearing Protection',
                    ].map((ppe) => {
                      const checked = selectedPermit.mandatoryPpe.includes(ppe);
                      return (
                        <label
                          key={ppe}
                          className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                            checked ? 'bg-[#eaf5ef] border-[#006c4a]' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const list = e.target.checked
                                ? [...selectedPermit.mandatoryPpe, ppe]
                                : selectedPermit.mandatoryPpe.filter((item) => item !== ppe);
                              setSelectedPermit({ ...selectedPermit, mandatoryPpe: list });
                            }}
                            className="w-4 h-4 text-[#006c4a] rounded"
                          />
                          <span className="font-medium text-xs text-gray-800">{ppe}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <label className="p-3 bg-[#f8f9ff] rounded-xl border flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermit.requiresFireWatch}
                        onChange={(e) =>
                          setSelectedPermit({
                            ...selectedPermit,
                            requiresFireWatch: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <div>
                        <div className="font-bold text-gray-800">Requires Dedicated Fire Watch</div>
                        <div className="text-[11px] text-gray-500">
                          Continuous surveillance during and 60 minutes after hot work
                        </div>
                      </div>
                    </label>

                    <label className="p-3 bg-[#f8f9ff] rounded-xl border flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermit.requiresStandbyPerson}
                        onChange={(e) =>
                          setSelectedPermit({
                            ...selectedPermit,
                            requiresStandbyPerson: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <div>
                        <div className="font-bold text-gray-800">Requires Standby Person / Hole Watch</div>
                        <div className="text-[11px] text-gray-500">
                          Stationed at entry with entrant roster log
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Emergency Arrangements &amp; Muster Station
                    </label>
                    <input
                      type="text"
                      value={selectedPermit.emergencyArrangements}
                      onChange={(e) =>
                        setSelectedPermit({
                          ...selectedPermit,
                          emergencyArrangements: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: LOTO ISOLATIONS */}
              {activeTab === 'ISOLATIONS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">
                        Lockout / Tagout (LOTO) &amp; Mechanical Isolations
                      </h3>
                      <p className="text-xs text-gray-500">
                        Zero energy state verification prior to mechanical, electrical, or pipe penetration work.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newIso: IsolationPoint = {
                          id: `ISO-${Date.now().toString().slice(-4)}`,
                          tagNumber: 'V-NEW',
                          equipmentDescription: 'Manual Isolation Valve',
                          isolationType: 'VALVE_LOCKOUT',
                          lockNumber: `LOCK-${Math.floor(100 + Math.random() * 900)}`,
                          appliedBy: selectedPermit.receiver,
                          verifiedBy: selectedPermit.issuer,
                        };
                        setSelectedPermit({
                          ...selectedPermit,
                          requiresIsolation: true,
                          isolations: [...selectedPermit.isolations, newIso],
                        });
                      }}
                      className="px-3 py-1.5 rounded bg-[#ba1a1a] text-white text-xs font-semibold hover:bg-[#93000a]"
                    >
                      + Add Isolation Point
                    </button>
                  </div>

                  {selectedPermit.isolations.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-dashed rounded-xl text-center text-gray-500">
                      No positive isolations registered for this permit. Click &quot;+ Add Isolation Point&quot; if energy isolation is required.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPermit.isolations.map((iso, idx) => (
                        <div
                          key={iso.id}
                          className="p-3 bg-white rounded-xl border border-gray-300 grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                        >
                          <div>
                            <label className="text-[10px] text-gray-400 font-mono">Tag Number</label>
                            <input
                              type="text"
                              value={iso.tagNumber}
                              onChange={(e) => {
                                const copy = [...selectedPermit.isolations];
                                copy[idx].tagNumber = e.target.value;
                                setSelectedPermit({ ...selectedPermit, isolations: copy });
                              }}
                              className="w-full bg-[#f8f9ff] border border-gray-200 rounded p-1 font-mono font-bold"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] text-gray-400 font-mono">Equipment Description</label>
                            <input
                              type="text"
                              value={iso.equipmentDescription}
                              onChange={(e) => {
                                const copy = [...selectedPermit.isolations];
                                copy[idx].equipmentDescription = e.target.value;
                                setSelectedPermit({ ...selectedPermit, isolations: copy });
                              }}
                              className="w-full bg-[#f8f9ff] border border-gray-200 rounded p-1"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 font-mono">Lock Number</label>
                            <input
                              type="text"
                              value={iso.lockNumber}
                              onChange={(e) => {
                                const copy = [...selectedPermit.isolations];
                                copy[idx].lockNumber = e.target.value;
                                setSelectedPermit({ ...selectedPermit, isolations: copy });
                              }}
                              className="w-full bg-[#f8f9ff] border border-gray-200 rounded p-1 font-mono text-red-600 font-bold"
                            />
                          </div>

                          <div className="flex justify-end pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const copy = selectedPermit.isolations.filter((_, i) => i !== idx);
                                setSelectedPermit({ ...selectedPermit, isolations: copy });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ATMOSPHERIC GAS TESTING */}
              {activeTab === 'GAS_TEST' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#eff4ff] rounded-xl border border-gray-300 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#0b1c30]">
                        Mandatory Multi-Gas Testing (O2, LEL, H2S, CO)
                      </h3>
                      <p className="text-xs text-gray-500">
                        Required for Hot Work and Confined Space Entry. All readings must fall within acceptable limits.
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                        selectedPermit.gasTestPassed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedPermit.gasTestPassed ? 'ATMOSPHERE SAFE (PASS)' : 'UNSAFE ATMOSPHERE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Authorized Gas Tester (AGT) Name &amp; ID
                      </label>
                      <input
                        type="text"
                        value={selectedPermit.gasTesterName || ''}
                        onChange={(e) =>
                          setSelectedPermit({ ...selectedPermit, gasTesterName: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Gas Test Timestamp</label>
                      <input
                        type="datetime-local"
                        value={selectedPermit.gasTestingDateTime?.slice(0, 16) || ''}
                        onChange={(e) =>
                          setSelectedPermit({
                            ...selectedPermit,
                            gasTestingDateTime: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {selectedPermit.gasReadings.map((reading, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-gray-300 space-y-2 text-center"
                      >
                        <div className="font-bold text-xs text-gray-800">{reading.gasName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          Limit: {reading.safeLimitDescription}
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={reading.measuredValue}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const copy = [...selectedPermit.gasReadings];
                            copy[idx].measuredValue = val;
                            // Check limits
                            let ok = true;
                            if (reading.gasName === 'Oxygen (O2)' && (val < 19.5 || val > 23.5)) ok = false;
                            if (reading.gasName === 'Flammable LEL' && val >= 10) ok = false;
                            if (reading.gasName === 'Hydrogen Sulfide (H2S)' && val >= 5) ok = false;
                            if (reading.gasName === 'Carbon Monoxide (CO)' && val >= 25) ok = false;
                            copy[idx].isAcceptable = ok;

                            const allPassed = copy.every((r) => r.isAcceptable);
                            setSelectedPermit({
                              ...selectedPermit,
                              gasReadings: copy,
                              gasTestPassed: allPassed,
                            });
                          }}
                          className={`w-full text-center border rounded p-1.5 font-mono text-base font-bold ${
                            reading.isAcceptable
                              ? 'bg-green-50 text-green-800 border-green-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        />
                        <div
                          className={`text-[10px] font-mono font-bold ${
                            reading.isAcceptable ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {reading.isAcceptable ? 'ACCEPTABLE' : 'HAZARDOUS'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: APPROVALS & DIGITAL SIGNATURES */}
              {activeTab === 'APPROVALS' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#eff4ff] rounded-xl border border-gray-300">
                    <h3 className="font-bold text-sm text-[#0b1c30]">
                      Multi-Tier Electronic Approvals &amp; Life Saving Signatures
                    </h3>
                    <p className="text-xs text-gray-500">
                      Work may strictly not commence until both Issuing and Performing Authorities have signed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Issuer */}
                    <div className="p-4 bg-white rounded-xl border border-gray-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-gray-400 uppercase">
                          Tier 1: Issuing Authority
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            selectedPermit.approvals.issuingAuthoritySigned
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        ></span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">
                        {selectedPermit.approvals.issuingAuthorityName}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPermit({
                            ...selectedPermit,
                            approvals: {
                              ...selectedPermit.approvals,
                              issuingAuthoritySigned: !selectedPermit.approvals.issuingAuthoritySigned,
                              issuingSignedAt: new Date().toISOString(),
                            },
                          });
                        }}
                        className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                          selectedPermit.approvals.issuingAuthoritySigned
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-900 text-white'
                        }`}
                      >
                        {selectedPermit.approvals.issuingAuthoritySigned
                          ? '✓ Digitally Signed'
                          : 'Sign as Issuer'}
                      </button>
                    </div>

                    {/* Receiver */}
                    <div className="p-4 bg-white rounded-xl border border-gray-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-gray-400 uppercase">
                          Tier 2: Performing Authority
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            selectedPermit.approvals.performingAuthoritySigned
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        ></span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">
                        {selectedPermit.approvals.performingAuthorityName}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPermit({
                            ...selectedPermit,
                            approvals: {
                              ...selectedPermit.approvals,
                              performingAuthoritySigned: !selectedPermit.approvals.performingAuthoritySigned,
                              performingSignedAt: new Date().toISOString(),
                            },
                          });
                        }}
                        className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                          selectedPermit.approvals.performingAuthoritySigned
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-900 text-white'
                        }`}
                      >
                        {selectedPermit.approvals.performingAuthoritySigned
                          ? '✓ Digitally Signed'
                          : 'Sign as Receiver'}
                      </button>
                    </div>

                    {/* Safety Officer */}
                    <div className="p-4 bg-white rounded-xl border border-gray-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-gray-400 uppercase">
                          Tier 3: Safety Authorization
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            selectedPermit.approvals.safetyOfficerSigned
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        ></span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">
                        {selectedPermit.approvals.safetyOfficerName}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPermit({
                            ...selectedPermit,
                            approvals: {
                              ...selectedPermit.approvals,
                              safetyOfficerSigned: !selectedPermit.approvals.safetyOfficerSigned,
                              safetySignedAt: new Date().toISOString(),
                            },
                          });
                        }}
                        className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                          selectedPermit.approvals.safetyOfficerSigned
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-900 text-white'
                        }`}
                      >
                        {selectedPermit.approvals.safetyOfficerSigned
                          ? '✓ Digitally Authorized'
                          : 'Authorize as HSE Lead'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#c6c6cd]/30 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                Permit Record: {selectedPermit.id}
              </span>
              <div className="flex items-center gap-2">
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
                  Save Permit Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
