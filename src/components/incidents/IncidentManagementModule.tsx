import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  IncidentReportRecord,
  IncidentType,
  IncidentStatus,
  IncidentWitness,
  IncidentEvidenceItem,
  FiveWhyItem,
  ContributingFactors,
  CapaRecord,
} from '../../types/safetyOps';
import { safetyOpsService } from '../../services/safetyOpsService';

export const IncidentManagementModule: React.FC<{ onNavigateToCapa?: () => void }> = ({ onNavigateToCapa }) => {
  const { showToast, language } = useApp();

  const [incidents, setIncidents] = useState<IncidentReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected incident for modal
  const [selectedIncident, setSelectedIncident] = useState<IncidentReportRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | '5WHY' | 'WITNESSES' | 'EVIDENCE' | 'CAPA' | 'CLOSURE'>('DETAILS');

  // Load incidents
  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await safetyOpsService.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Filtered list
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        searchTerm === '' ||
        inc.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.activity.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'ALL' || inc.incidentType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [incidents, searchTerm, typeFilter, statusFilter]);

  // KPIs
  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === 'REPORTED' || i.status === 'UNDER_INVESTIGATION').length;
    const capaPending = incidents.filter((i) => i.status === 'CAPA_PENDING').length;
    const closed = incidents.filter((i) => i.status === 'CLOSED').length;
    const highSeverity = incidents.filter(
      (i) => i.incidentType === 'LOST_TIME_INJURY' || i.incidentType === 'ENVIRONMENTAL_SPILL' || i.incidentType === 'HIGH_POTENTIAL'
    ).length;
    return { total, open, capaPending, closed, highSeverity };
  }, [incidents]);

  // Open Editor for new or existing
  const handleOpenNew = () => {
    const now = new Date();
    const incidentNumber = `INC-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: IncidentReportRecord = {
      id: incidentNumber,
      incidentNumber,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      location: 'Process Unit 3 - Secondary Containment Area',
      project: 'Ras Laffan EPC-4 Liquefaction Expansion',
      department: 'Mechanical & Piping',
      person: 'Worker / Technician Involved',
      contractor: 'CCC Consortium',
      activity: 'Routine maintenance and inspection',
      incidentType: 'NEAR_MISS',
      description: '',
      immediateActions: 'Work immediately suspended and area made safe.',
      rootCause: '',
      fiveWhyAnalysis: [
        { level: 1, question: 'What directly caused the event?', answer: '' },
        { level: 2, question: 'Why did the immediate condition occur?', answer: '' },
        { level: 3, question: 'Why was this not prevented or detected earlier?', answer: '' },
        { level: 4, question: 'Why did the procedure or barrier fail?', answer: '' },
        { level: 5, question: 'What is the systemic root cause (Management System Defect)?', answer: '', isSystemicRootCause: true },
      ],
      contributingFactors: {
        humanFactors: [],
        equipmentFactors: [],
        environmentalFactors: [],
        proceduralFactors: [],
        organizationalFactors: [],
      },
      witnesses: [],
      evidence: [],
      photos: [],
      correctiveActions: '',
      preventiveActions: '',
      responsiblePerson: 'Eng. Safety Lead',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'REPORTED',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setSelectedIncident(newRecord);
    setActiveTab('DETAILS');
    setIsEditorOpen(true);
  };

  const handleEdit = (inc: IncidentReportRecord) => {
    setSelectedIncident(JSON.parse(JSON.stringify(inc)));
    setActiveTab('DETAILS');
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!selectedIncident) return;
    try {
      await safetyOpsService.saveIncident(selectedIncident);
      showToast(`Incident ${selectedIncident.incidentNumber} saved successfully.`);
      setIsEditorOpen(false);
      loadIncidents();
    } catch (err) {
      showToast('Error saving incident.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete incident record ${id}?`)) {
      await safetyOpsService.deleteIncident(id);
      showToast(`Incident ${id} deleted.`);
      loadIncidents();
    }
  };

  // Dispatch to CAPA
  const handleDispatchCapa = async () => {
    if (!selectedIncident) return;
    try {
      const capa = await safetyOpsService.createCapaFromIncident(selectedIncident.id);
      showToast(`CAPA #${capa.id} dispatched from incident ${selectedIncident.incidentNumber}!`);
      await loadIncidents();
      const updated = await safetyOpsService.getIncidentById(selectedIncident.id);
      if (updated) setSelectedIncident(updated);
    } catch (err: any) {
      showToast(err.message || 'Error dispatching CAPA');
    }
  };

  // Close Incident
  const handleCloseIncident = async () => {
    if (!selectedIncident) return;
    try {
      const updated = await safetyOpsService.closeIncident(
        selectedIncident.id,
        'Dr. Tariq Al-Mansoor (HSE Director)',
        selectedIncident.closure?.closureComments || 'Root cause eliminated and corrective actions verified on site.'
      );
      if (updated) {
        setSelectedIncident(updated);
        showToast(`Incident ${selectedIncident.incidentNumber} officially closed.`);
        loadIncidents();
      }
    } catch (err) {
      showToast('Error closing incident.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a]">
              ISO 45001:2018 §10.2
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Incident Investigation &amp; 5-Why Analysis
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Workplace Incident &amp; Investigation Management
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Full lifecycle investigation, witness testimonies, evidence dossier, 5-Why root cause tree, and CAPA dispatch.
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
              <span>Open CAPA Central ({stats.capaPending} Pending)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            <span>+ Log New Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#45464d] uppercase font-mono">Total Incidents</div>
          <div className="text-2xl font-bold text-[#0b1c30] mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-[#767680] mt-0.5">Logged across site sectors</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#ba1a1a] uppercase font-mono">Active Investigation</div>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-0.5">{stats.open}</div>
          <div className="text-[10px] text-[#ba1a1a] mt-0.5">Under root cause inquiry</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#e66100] uppercase font-mono">CAPA Dispatched</div>
          <div className="text-2xl font-bold text-[#e66100] mt-0.5">{stats.capaPending}</div>
          <div className="text-[10px] text-[#45464d] mt-0.5">Linked corrective actions</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#006c4a] uppercase font-mono">Verified Closed</div>
          <div className="text-2xl font-bold text-[#006c4a] mt-0.5">{stats.closed}</div>
          <div className="text-[10px] text-[#006c4a] mt-0.5">Actions verified effective</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#ba1a1a] uppercase font-mono">High Severity / LTI</div>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-0.5">{stats.highSeverity}</div>
          <div className="text-[10px] text-[#ba1a1a] mt-0.5">Reportable events</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="material-symbols-outlined text-[#45464d] text-[20px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident number, location, activity, description..."
            className="w-full text-xs bg-transparent border-0 focus:ring-0 outline-hidden text-[#0b1c30] placeholder-[#767680]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#45464d] font-mono text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-[#eff4ff] border border-[#c6c6cd]/40 rounded-lg px-2.5 py-1 text-[#0b1c30] font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="NEAR_MISS">Near Miss</option>
              <option value="FIRST_AID">First Aid</option>
              <option value="MEDICAL_TREATMENT">Medical Treatment</option>
              <option value="LOST_TIME_INJURY">Lost Time Injury (LTI)</option>
              <option value="ENVIRONMENTAL_SPILL">Environmental Spill</option>
              <option value="PROPERTY_DAMAGE">Property Damage</option>
              <option value="HIGH_POTENTIAL">High Potential</option>
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
              <option value="REPORTED">Reported</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="CAPA_PENDING">CAPA Pending</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase border-b border-[#c6c6cd]/20">
              <tr>
                <th className="py-3 px-4">Incident #</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Location &amp; Activity</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Person &amp; Contractor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">CAPA Linked</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 font-mono">
                    Loading incident register...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No incidents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#ba1a1a]">
                      {inc.incidentNumber}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div>{inc.date}</div>
                      <div className="text-[10px] text-[#767680]">{inc.time}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-gray-900 truncate">{inc.location}</div>
                      <div className="text-[11px] text-[#45464d] truncate">{inc.activity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          inc.incidentType === 'LOST_TIME_INJURY' || inc.incidentType === 'ENVIRONMENTAL_SPILL'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : inc.incidentType === 'NEAR_MISS'
                            ? 'bg-[#e2f1ff] text-[#004f80]'
                            : 'bg-[#ffeed4] text-[#854d0e]'
                        }`}
                      >
                        {inc.incidentType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{inc.person}</div>
                      <div className="text-[11px] text-[#767680]">{inc.contractor}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          inc.status === 'CLOSED'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : inc.status === 'CAPA_PENDING'
                            ? 'bg-[#ffedd5] text-[#c2410c]'
                            : inc.status === 'UNDER_INVESTIGATION'
                            ? 'bg-[#fef9c3] text-[#a16207]'
                            : 'bg-[#f1f5f9] text-[#475569]'
                        }`}
                      >
                        {inc.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {inc.spawnedCapaIds && inc.spawnedCapaIds.length > 0 ? (
                        <span className="text-[#006c4a] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">link</span>
                          {inc.spawnedCapaIds.join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(inc)}
                          className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff] transition-colors flex items-center gap-1"
                          title="Open Investigation Dossier"
                        >
                          <span className="material-symbols-outlined text-[14px]">search</span>
                          <span>Investigate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inc.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors"
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

      {/* Comprehensive Incident Investigation Modal */}
      {isEditorOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#c6c6cd]/30 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">emergency</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#ba1a1a]">
                      {selectedIncident.incidentNumber}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white text-[#0b1c30] border border-[#c6c6cd]/30">
                      {selectedIncident.incidentType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                        selectedIncident.status === 'CLOSED'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0b1c30]">
                    {selectedIncident.activity || 'Incident Investigation Dossier'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-[#c6c6cd]/30 px-6 bg-white gap-2 overflow-x-auto text-xs font-medium">
              {[
                { id: 'DETAILS', label: '1. Incident Report', icon: 'description' },
                { id: '5WHY', label: '2. 5-Why Root Cause', icon: 'psychology' },
                { id: 'WITNESSES', label: '3. Witnesses & Evidence', icon: 'groups' },
                { id: 'CAPA', label: '4. CAPA & Actions', icon: 'verified' },
                { id: 'CLOSURE', label: '5. Closure Sign-Off', icon: 'task_alt' },
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
              {/* TAB 1: DETAILS */}
              {activeTab === 'DETAILS' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Incident Number</label>
                      <input
                        type="text"
                        value={selectedIncident.incidentNumber}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, incidentNumber: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Date</label>
                      <input
                        type="date"
                        value={selectedIncident.date}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, date: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Time</label>
                      <input
                        type="time"
                        value={selectedIncident.time}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, time: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Project</label>
                      <input
                        type="text"
                        value={selectedIncident.project}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, project: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Exact Location</label>
                      <input
                        type="text"
                        value={selectedIncident.location}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, location: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Department</label>
                      <input
                        type="text"
                        value={selectedIncident.department}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, department: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Person Involved / Injured</label>
                      <input
                        type="text"
                        value={selectedIncident.person}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, person: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Contractor Company</label>
                      <input
                        type="text"
                        value={selectedIncident.contractor}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, contractor: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Activity Being Undertaken</label>
                      <input
                        type="text"
                        value={selectedIncident.activity}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, activity: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Incident Type</label>
                      <select
                        value={selectedIncident.incidentType}
                        onChange={(e) =>
                          setSelectedIncident({
                            ...selectedIncident,
                            incidentType: e.target.value as IncidentType,
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-medium"
                      >
                        <option value="NEAR_MISS">Near Miss</option>
                        <option value="FIRST_AID">First Aid</option>
                        <option value="MEDICAL_TREATMENT">Medical Treatment</option>
                        <option value="LOST_TIME_INJURY">Lost Time Injury (LTI)</option>
                        <option value="RESTRICTED_WORK">Restricted Work</option>
                        <option value="ENVIRONMENTAL_SPILL">Environmental Spill</option>
                        <option value="PROPERTY_DAMAGE">Property Damage</option>
                        <option value="HIGH_POTENTIAL">High Potential</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Incident Description (Detailed factual sequence of events)
                    </label>
                    <textarea
                      rows={3}
                      value={selectedIncident.description}
                      onChange={(e) =>
                        setSelectedIncident({ ...selectedIncident, description: e.target.value })
                      }
                      placeholder="Describe what occurred, equipment involved, environmental conditions, and direct observations..."
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Immediate Actions Taken (To contain the hazard and prevent recurrence)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedIncident.immediateActions}
                      onChange={(e) =>
                        setSelectedIncident({ ...selectedIncident, immediateActions: e.target.value })
                      }
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: 5-WHY ROOT CAUSE */}
              {activeTab === '5WHY' && (
                <div className="space-y-4">
                  <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c6c6cd]/30 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#0b1c30]">
                        5-Why Root Cause Analysis Methodology (ISO 45001 §10.2)
                      </h3>
                      <p className="text-xs text-[#45464d] mt-0.5">
                        Ask progressive &quot;Why&quot; questions to drill down from physical symptoms to the systemic organizational and management system root cause.
                      </p>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#006c4a] text-white font-bold">
                      Root Cause Level 5
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedIncident.fiveWhyAnalysis.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          item.isSystemicRootCause
                            ? 'bg-[#fff5f5] border-[#ba1a1a]/40 shadow-xs'
                            : 'bg-white border-[#c6c6cd]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#ba1a1a]">
                            Level {item.level}: Why #{item.level}
                          </span>
                          {item.isSystemicRootCause && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#ba1a1a] text-white font-bold">
                              ★ Systemic Root Cause
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                          <div className="md:col-span-1">
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) => {
                                const copy = [...selectedIncident.fiveWhyAnalysis];
                                copy[idx].question = e.target.value;
                                setSelectedIncident({ ...selectedIncident, fiveWhyAnalysis: copy });
                              }}
                              className="w-full bg-[#f8f9ff] border border-gray-200 rounded p-1.5 text-xs font-medium text-gray-700"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={item.answer}
                              onChange={(e) => {
                                const copy = [...selectedIncident.fiveWhyAnalysis];
                                copy[idx].answer = e.target.value;
                                if (copy[idx].isSystemicRootCause) {
                                  selectedIncident.rootCause = e.target.value;
                                }
                                setSelectedIncident({
                                  ...selectedIncident,
                                  fiveWhyAnalysis: copy,
                                  rootCause: copy[copy.length - 1].answer,
                                });
                              }}
                              placeholder="Answer explaining cause at this level..."
                              className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Root Cause Summary Box */}
                  <div className="p-4 bg-[#f8f9ff] rounded-xl border border-gray-300">
                    <label className="font-bold text-xs text-gray-800 block mb-1">
                      Final Root Cause Conclusion
                    </label>
                    <textarea
                      rows={2}
                      value={selectedIncident.rootCause}
                      onChange={(e) =>
                        setSelectedIncident({ ...selectedIncident, rootCause: e.target.value })
                      }
                      placeholder="Summarize the definitive management system root cause..."
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Contributing Factors */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <h4 className="font-bold text-xs text-gray-700 uppercase font-mono">
                      Contributing Factors (Multi-Causal Investigation)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-medium text-gray-600 block mb-1">Human Factors</label>
                        <input
                          type="text"
                          value={selectedIncident.contributingFactors.humanFactors.join(', ')}
                          onChange={(e) =>
                            setSelectedIncident({
                              ...selectedIncident,
                              contributingFactors: {
                                ...selectedIncident.contributingFactors,
                                humanFactors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            })
                          }
                          placeholder="Fatigue, rush, lack of communication..."
                          className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 block mb-1">Equipment / Physical</label>
                        <input
                          type="text"
                          value={selectedIncident.contributingFactors.equipmentFactors.join(', ')}
                          onChange={(e) =>
                            setSelectedIncident({
                              ...selectedIncident,
                              contributingFactors: {
                                ...selectedIncident.contributingFactors,
                                equipmentFactors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            })
                          }
                          placeholder="No lockout hasp, frayed cord, mechanical wear..."
                          className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 block mb-1">Procedural / Documentation</label>
                        <input
                          type="text"
                          value={selectedIncident.contributingFactors.proceduralFactors.join(', ')}
                          onChange={(e) =>
                            setSelectedIncident({
                              ...selectedIncident,
                              contributingFactors: {
                                ...selectedIncident.contributingFactors,
                                proceduralFactors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            })
                          }
                          placeholder="Outdated SOP, ambiguous step in checklist..."
                          className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 block mb-1">Organizational / Supervision</label>
                        <input
                          type="text"
                          value={selectedIncident.contributingFactors.organizationalFactors.join(', ')}
                          onChange={(e) =>
                            setSelectedIncident({
                              ...selectedIncident,
                              contributingFactors: {
                                ...selectedIncident.contributingFactors,
                                organizationalFactors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            })
                          }
                          placeholder="Inadequate supervision ratio, contractor onboarding gap..."
                          className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WITNESSES & EVIDENCE */}
              {activeTab === 'WITNESSES' && (
                <div className="space-y-6">
                  {/* Witnesses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#006c4a]">groups</span>
                        <span>Witness Interviews &amp; Statements ({selectedIncident.witnesses.length})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newWit: IncidentWitness = {
                            id: `WIT-${Date.now().toString().slice(-4)}`,
                            name: '',
                            role: 'Field Worker',
                            contractorOrDept: 'Subcontractor',
                            statement: '',
                            interviewDate: new Date().toISOString().split('T')[0],
                            interviewedBy: 'HSE Lead Investigator',
                          };
                          setSelectedIncident({
                            ...selectedIncident,
                            witnesses: [...selectedIncident.witnesses, newWit],
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#00714e]"
                      >
                        + Add Witness
                      </button>
                    </div>

                    {selectedIncident.witnesses.length === 0 ? (
                      <div className="p-4 bg-gray-50 border border-dashed rounded-xl text-center text-gray-500 text-xs">
                        No witnesses recorded yet. Click &quot;+ Add Witness&quot; to log formal interview statement.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedIncident.witnesses.map((w, idx) => (
                          <div key={w.id} className="p-3 bg-[#f8f9ff] rounded-xl border border-gray-300 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] text-gray-500 font-mono">Witness Name</label>
                                <input
                                  type="text"
                                  value={w.name}
                                  onChange={(e) => {
                                    const copy = [...selectedIncident.witnesses];
                                    copy[idx].name = e.target.value;
                                    setSelectedIncident({ ...selectedIncident, witnesses: copy });
                                  }}
                                  placeholder="Full Name"
                                  className="w-full bg-white border border-gray-300 rounded p-1 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-mono">Role / Trade</label>
                                <input
                                  type="text"
                                  value={w.role}
                                  onChange={(e) => {
                                    const copy = [...selectedIncident.witnesses];
                                    copy[idx].role = e.target.value;
                                    setSelectedIncident({ ...selectedIncident, witnesses: copy });
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded p-1 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-mono">Contractor / Dept</label>
                                <input
                                  type="text"
                                  value={w.contractorOrDept}
                                  onChange={(e) => {
                                    const copy = [...selectedIncident.witnesses];
                                    copy[idx].contractorOrDept = e.target.value;
                                    setSelectedIncident({ ...selectedIncident, witnesses: copy });
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded p-1 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-mono">Interview Date</label>
                                <input
                                  type="date"
                                  value={w.interviewDate}
                                  onChange={(e) => {
                                    const copy = [...selectedIncident.witnesses];
                                    copy[idx].interviewDate = e.target.value;
                                    setSelectedIncident({ ...selectedIncident, witnesses: copy });
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded p-1 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 font-mono">Statement</label>
                              <textarea
                                rows={2}
                                value={w.statement}
                                onChange={(e) => {
                                  const copy = [...selectedIncident.witnesses];
                                  copy[idx].statement = e.target.value;
                                  setSelectedIncident({ ...selectedIncident, witnesses: copy });
                                }}
                                placeholder="Witness's verbatim narrative of the incident..."
                                className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Evidence & Photos */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#006c4a]">photo_camera</span>
                        <span>Evidence &amp; Photographs Dossier ({selectedIncident.evidence.length})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newEvd: IncidentEvidenceItem = {
                            id: `EVD-${Date.now().toString().slice(-4)}`,
                            title: 'Field Photo Capture',
                            type: 'PHOTO',
                            urlOrBase64: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
                            description: 'Scene photograph taken immediately after isolation.',
                            uploadedAt: new Date().toISOString(),
                            capturedBy: 'Site HSE Officer',
                          };
                          setSelectedIncident({
                            ...selectedIncident,
                            evidence: [...selectedIncident.evidence, newEvd],
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#00714e]"
                      >
                        + Attach Evidence / Photo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedIncident.evidence.map((ev, idx) => (
                        <div key={ev.id} className="p-3 bg-white rounded-xl border border-gray-300 flex gap-3 items-start">
                          {ev.type === 'PHOTO' && ev.urlOrBase64 ? (
                            <img
                              src={ev.urlOrBase64}
                              alt={ev.title}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                              <span className="material-symbols-outlined">description</span>
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={ev.title}
                              onChange={(e) => {
                                const copy = [...selectedIncident.evidence];
                                copy[idx].title = e.target.value;
                                setSelectedIncident({ ...selectedIncident, evidence: copy });
                              }}
                              className="font-bold text-xs text-gray-900 w-full border-0 p-0 focus:ring-0"
                            />
                            <textarea
                              rows={2}
                              value={ev.description}
                              onChange={(e) => {
                                const copy = [...selectedIncident.evidence];
                                copy[idx].description = e.target.value;
                                setSelectedIncident({ ...selectedIncident, evidence: copy });
                              }}
                              className="w-full text-[11px] text-gray-600 bg-[#f8f9ff] border border-gray-200 rounded p-1"
                            />
                            <div className="text-[10px] text-gray-400 font-mono">
                              By: {ev.capturedBy} • {ev.uploadedAt.split('T')[0]}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CAPA & ACTIONS */}
              {activeTab === 'CAPA' && (
                <div className="space-y-4">
                  <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c6c6cd]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#0b1c30]">
                        Corrective &amp; Preventive Actions (CAPA Bridge)
                      </h3>
                      <p className="text-xs text-[#45464d] mt-0.5">
                        Dispatch findings directly into the ISO 45001 CAPA tracking register with target dates and responsible persons.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDispatchCapa}
                      className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Dispatch Action to CAPA Register</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Immediate Corrective Action (Eliminate Current Hazard)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedIncident.correctiveActions}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, correctiveActions: e.target.value })
                        }
                        placeholder="Action to correct the immediate non-compliance..."
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Systemic Preventive Action (Prevent Future Recurrence)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedIncident.preventiveActions}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, preventiveActions: e.target.value })
                        }
                        placeholder="Procedures, trainings, or engineered changes across all sites..."
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Responsible Person</label>
                      <input
                        type="text"
                        value={selectedIncident.responsiblePerson}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, responsiblePerson: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Target Due Date</label>
                      <input
                        type="date"
                        value={selectedIncident.dueDate}
                        onChange={(e) =>
                          setSelectedIncident({ ...selectedIncident, dueDate: e.target.value })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Investigation Status</label>
                      <select
                        value={selectedIncident.status}
                        onChange={(e) =>
                          setSelectedIncident({
                            ...selectedIncident,
                            status: e.target.value as IncidentStatus,
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-medium"
                      >
                        <option value="REPORTED">REPORTED</option>
                        <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                        <option value="CAPA_PENDING">CAPA PENDING</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  {selectedIncident.spawnedCapaIds && selectedIncident.spawnedCapaIds.length > 0 && (
                    <div className="p-3 bg-[#e8f8f0] rounded-xl border border-[#006c4a]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006c4a]">check_circle</span>
                        <span className="font-bold text-xs text-[#006c4a]">
                          Connected CAPA Tickets: {selectedIncident.spawnedCapaIds.join(', ')}
                        </span>
                      </div>
                      {onNavigateToCapa && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditorOpen(false);
                            onNavigateToCapa();
                          }}
                          className="text-xs text-[#006c4a] underline font-bold"
                        >
                          View in CAPA Tracker →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CLOSURE */}
              {activeTab === 'CLOSURE' && (
                <div className="space-y-4">
                  <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c6c6cd]/30">
                    <h3 className="font-bold text-sm text-[#0b1c30]">
                      Formal Incident Closure &amp; Sign-Off (ISO 45001 §10.2)
                    </h3>
                    <p className="text-xs text-[#45464d] mt-0.5">
                      Incidents may only be closed when corrective actions are verified complete and effective by an authorized HSE Director or Lead Auditor.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Closed By</label>
                      <input
                        type="text"
                        value={selectedIncident.closure?.closedBy || 'Dr. Tariq Al-Mansoor (Lead HSE Director)'}
                        onChange={(e) =>
                          setSelectedIncident({
                            ...selectedIncident,
                            closure: {
                              ...selectedIncident.closure,
                              closedDate: selectedIncident.closure?.closedDate || new Date().toISOString().split('T')[0],
                              closureComments: selectedIncident.closure?.closureComments || '',
                              closedBy: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Closure Date</label>
                      <input
                        type="date"
                        value={selectedIncident.closure?.closedDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) =>
                          setSelectedIncident({
                            ...selectedIncident,
                            closure: {
                              ...selectedIncident.closure,
                              closedBy: selectedIncident.closure?.closedBy || 'Dr. Tariq Al-Mansoor',
                              closureComments: selectedIncident.closure?.closureComments || '',
                              closedDate: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Closure Verification Comments
                    </label>
                    <textarea
                      rows={3}
                      value={selectedIncident.closure?.closureComments || ''}
                      onChange={(e) =>
                        setSelectedIncident({
                          ...selectedIncident,
                          closure: {
                            ...selectedIncident.closure,
                            closedBy: selectedIncident.closure?.closedBy || 'Dr. Tariq Al-Mansoor',
                            closedDate: selectedIncident.closure?.closedDate || new Date().toISOString().split('T')[0],
                            closureComments: e.target.value,
                          },
                        })
                      }
                      placeholder="Confirm that corrective action was implemented on site and has verified effectiveness..."
                      className="w-full bg-[#f8f9ff] border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseIncident}
                      className="px-4 py-2.5 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Officially Close &amp; Sign Off Incident</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#c6c6cd]/30 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                Last modified: {selectedIncident.updatedAt.split('T')[0]}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
                >
                  Save Incident Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
