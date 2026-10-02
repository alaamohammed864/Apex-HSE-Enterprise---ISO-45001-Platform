import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GlobalAuditLogRecord, GlobalAuditActionType } from '../../types/documentControl';
import { AuditLogService } from '../../services/auditLogService';

const ALL_AUDIT_ACTIONS: GlobalAuditActionType[] = [
  'Create',
  'Edit',
  'Delete',
  'Approve',
  'Reject',
  'Publish',
  'Archive',
  'Download',
  'Print',
  'Login',
  'Permission changes',
];

export const GlobalAuditLogModule: React.FC = () => {
  const { showToast } = useApp();

  const [logs, setLogs] = useState<GlobalAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<GlobalAuditActionType | 'ALL'>('ALL');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [chainStatus, setChainStatus] = useState<{
    isValid: boolean;
    totalBlocks: number;
    rootHash: string;
    errorMessage?: string;
  } | null>(null);

  // Inspector modal state
  const [inspectedBlock, setInspectedBlock] = useState<GlobalAuditLogRecord | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await AuditLogService.getAuditLogs({
        action: selectedAction,
        entityType: selectedEntityType,
        searchTerm: searchTerm.trim() || undefined,
      });
      setLogs(res);

      const verification = await AuditLogService.verifyAuditChain();
      setChainStatus(verification);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedAction, selectedEntityType]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadLogs();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleVerifyChain = async () => {
    try {
      setVerifyingChain(true);
      const res = await AuditLogService.verifyAuditChain();
      setChainStatus(res);
      if (res.isValid) {
        showToast(`Cryptographic chain verified: All ${res.totalBlocks} blocks intact (0 tampering events).`);
      } else {
        showToast(`Integrity warning: ${res.errorMessage}`);
      }
    } catch (err) {
      showToast('Error validating cryptographic chain.');
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      showToast('Exporting complete WORM audit ledger to CSV...');
      await AuditLogService.exportAuditLogsToCsv({
        action: selectedAction,
        searchTerm: searchTerm.trim() || undefined,
      });
      showToast('Audit log CSV downloaded.');
    } catch (err) {
      showToast('Failed to export audit logs.');
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSE_Global_Audit_Ledger_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Audit log JSON downloaded.');
  };

  // Action badge styles
  const getActionBadgeClass = (action: GlobalAuditActionType) => {
    switch (action) {
      case 'Create':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Edit':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Delete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Approve':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
      case 'Reject':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'Publish':
        return 'bg-[#dcfce7] text-[#006c4a] border-emerald-300 font-bold';
      case 'Archive':
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      case 'Download':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Print':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Login':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Permission changes':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 Clause 7.5.3
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Immutable WORM Ledger &amp; Cryptographic Proof
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Global Audit Trail &amp; System Event Ledger
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Tamper-evident blockchain records logging every Create, Edit, Delete, Approve, Reject, Publish, Archive, Download, Print, Login, and Permission change.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={verifyingChain}
            onClick={handleVerifyChain}
            className="px-3.5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005238] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{verifyingChain ? 'Verifying...' : 'Verify Cryptographic Hashes'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-[#0b1c30] text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-green-700">table_view</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-[#0b1c30] text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-700">data_object</span>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Chain Integrity Card */}
      {chainStatus && (
        <div
          className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs ${
            chainStatus.isValid
              ? 'bg-[#82f5c1]/20 border-[#006c4a]/30'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                chainStatus.isValid ? 'bg-[#006c4a]' : 'bg-red-600'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {chainStatus.isValid ? 'security' : 'gpp_bad'}
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                <span>
                  Ledger State:{' '}
                  {chainStatus.isValid ? '100% Intact & Validated' : 'TAMPERING DETECTED'}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-[#006c4a] border border-green-200 font-bold">
                  {chainStatus.totalBlocks} Blocks Chained
                </span>
              </div>
              <div className="font-mono text-[11px] text-gray-600 mt-0.5">
                Root Block Hash (SHA-256):{' '}
                <span className="font-bold text-gray-800">{chainStatus.rootHash}</span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-gray-500">
            <div>21 CFR Part 11 &amp; ISO 45001 §7.5.3</div>
            <div className="text-[#006c4a] font-bold">Non-Repudiation Guaranteed</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, title, details, actor..."
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            />
          </div>

          {/* Action Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            >
              <option value="ALL">Action: All Actions (11 Recorded)</option>
              {ALL_AUDIT_ACTIONS.map((act) => (
                <option key={act} value={act}>
                  Action: {act}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            >
              <option value="ALL">Entity: All Systems</option>
              <option value="DOCUMENT">Document Control</option>
              <option value="REVISION">Document Revision</option>
              <option value="APPROVAL">Approval Sign-off</option>
              <option value="RISK">Risk Management (HIRA)</option>
              <option value="PTW">Permit to Work (PTW)</option>
              <option value="INCIDENT">Incident &amp; 5-Why</option>
              <option value="INSPECTION">Inspection Checklists</option>
              <option value="AUDIT">ISO Audits &amp; NCRs</option>
              <option value="AUTH">Authentication / Login</option>
              <option value="PERMISSION">Role &amp; Permissions</option>
            </select>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t">
          <span className="text-[10px] uppercase font-mono text-gray-400 font-bold mr-1">
            Quick Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedAction('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              selectedAction === 'ALL'
                ? 'bg-[#006c4a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Actions
          </button>
          {ALL_AUDIT_ACTIONS.map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setSelectedAction(act)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                selectedAction === act
                  ? 'bg-[#006c4a] text-white border-[#006c4a]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-gray-50 border-b flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0b1c30]">Audit Trail Records</span>
            <span className="font-mono text-[10px] text-gray-500">
              ({logs.length} events logged in immutable sequence)
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#006c4a] font-bold">
            SHA-256 Merkle Chained
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[10px] font-mono text-gray-600 uppercase border-b">
              <tr>
                <th className="p-3">Block #</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity Title / Code</th>
                <th className="p-3">Actor / Role</th>
                <th className="p-3">Operational Details</th>
                <th className="p-3">SHA-256 Proof</th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Loading cryptographic ledger blocks...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No audit records match the selected action or search criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-bold text-gray-700">#{log.blockIndex}</td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getActionBadgeClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#0b1c30]">
                      <div className="truncate max-w-[180px]">{log.entityTitle}</div>
                      <div className="text-[9px] text-gray-400 font-mono">{log.entityId}</div>
                    </td>
                    <td className="p-3 text-gray-700">
                      <div className="font-semibold text-[#0b1c30]">{log.actorName}</div>
                      <div className="text-[9px] text-gray-500">{log.actorRole}</div>
                    </td>
                    <td className="p-3 text-gray-600 font-['IBM_Plex_Sans'] text-xs max-w-xs">
                      <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-gray-400">
                      <span className="font-bold text-gray-700">
                        {log.blockHash.substring(0, 10)}...
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectedBlock(log)}
                        className="px-2.5 py-1 rounded bg-gray-100 hover:bg-[#dce9ff] text-[#0b1c30] text-[10px] font-bold transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Block Drawer / Modal */}
      {inspectedBlock && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 lg:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-[#eff4ff] border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#006c4a]">
                  qr_code_scanner
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#0b1c30]">
                    Audit Block #{inspectedBlock.blockIndex} Cryptographic Proof
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono">
                    WORM Immutable Snapshot • Non-Repudiable
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedBlock(null)}
                className="p-1 rounded hover:bg-gray-200 text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border">
                <div>
                  <span className="text-gray-400 block text-[10px]">Action Type:</span>
                  <span className="font-bold text-[#0b1c30]">{inspectedBlock.action}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Timestamp (UTC):</span>
                  <span className="font-bold text-[#0b1c30]">{inspectedBlock.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Actor:</span>
                  <span className="font-bold text-[#0b1c30]">
                    {inspectedBlock.actorName} ({inspectedBlock.actorRole})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Target Entity:</span>
                  <span className="font-bold text-[#0b1c30]">
                    {inspectedBlock.entityType} • {inspectedBlock.entityId}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-bold block mb-1">Operational Event Narrative:</span>
                <p className="p-3 bg-white border rounded-lg text-gray-800 font-['IBM_Plex_Sans'] text-xs leading-relaxed">
                  {inspectedBlock.details}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-gray-500 font-bold block">Cryptographic Hashes (SHA-256):</span>
                <div className="p-2.5 bg-gray-900 text-green-400 rounded-lg text-[10px] space-y-1.5 break-all">
                  <div>
                    <span className="text-gray-400">Previous Block Hash: </span>
                    {inspectedBlock.prevHash}
                  </div>
                  <div>
                    <span className="text-gray-400">Payload Data Hash: </span>
                    {inspectedBlock.dataHash}
                  </div>
                  <div className="text-emerald-300 font-bold">
                    <span className="text-gray-400">Chained Block Hash: </span>
                    {inspectedBlock.blockHash}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedBlock(null)}
                className="px-4 py-1.5 rounded-lg bg-gray-800 text-white font-bold hover:bg-black transition-all text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
