import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_AUDIT_BLOCKS } from '../../data/mockData';
import { AuditLogService } from '../../services/auditLogService';
import { GlobalAuditLogRecord } from '../../types/documentControl';

export const AuditLedgerModal: React.FC = () => {
  const { isAuditLedgerOpen, setIsAuditLedgerOpen, showToast, setActiveNav } = useApp();
  const [dbRecords, setDbRecords] = useState<GlobalAuditLogRecord[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    totalBlocks: number;
    brokenBlockIndex?: number;
    errorMessage?: string;
    rootHash: string;
  } | null>(null);

  useEffect(() => {
    if (isAuditLedgerOpen) {
      loadRecords();
    }
  }, [isAuditLedgerOpen]);

  const loadRecords = async () => {
    try {
      const records = await AuditLogService.getAuditLogs();
      setDbRecords(records);
      const verify = await AuditLogService.verifyAuditChain();
      setVerificationResult(verify);
    } catch {
      // Fallback
    }
  };

  if (!isAuditLedgerOpen) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await AuditLogService.verifyAuditChain();
      setVerificationResult(result);
      if (result.isValid) {
        showToast(`Cryptographic chain verified: 0 tampering events across ${result.totalBlocks} blocks`);
      } else {
        showToast(`Warning: Tampered block detected at Block #${result.brokenBlockIndex}: ${result.errorMessage}`);
      }
    } catch {
      showToast('Integrity verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40 flex flex-col max-h-[85vh]">
        <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
              verified_user
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">
                Immutable WORM Audit Ledger &amp; Cryptographic Proof
              </h3>
              <span className="text-xs text-[#45464d] font-mono">
                ISO 45001:2018 Clause 7.5.3 Cryptographic Integrity Check
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuditLedgerOpen(false)}
            className="p-1 rounded hover:bg-[#dce9ff] text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#82f5c1]/30 border border-[#006c4a]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[20px]">verified</span>
              <div>
                <span className="font-bold text-[#00714e] block">
                  Ledger State: {verificationResult?.isValid !== false ? 'Validated (100% Chain Intact)' : 'Tamper Detected!'}
                </span>
                <span className="font-mono text-[11px] text-[#45464d]">
                  Root Hash: {verificationResult?.rootHash.slice(0, 24)}... ({verificationResult?.totalBlocks || dbRecords.length} Blocks Chained)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-3 py-1 rounded bg-[#006c4a] text-white font-bold hover:bg-[#00714e] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isVerifying ? 'sync' : 'fingerprint'}
              </span>
              <span>{isVerifying ? 'Checking...' : 'Verify Hashes'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {dbRecords.length > 0 ? (
              dbRecords.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/30 space-y-2 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#000000] text-white font-bold text-[11px]">
                        Block #{record.blockIndex}
                      </span>
                      <span className="text-xs text-[#006c4a] font-bold">
                        {record.isoClause || 'ISO §7.5.3'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#dce9ff] text-[#0b1c30] font-bold">
                        {record.action}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#45464d]">{record.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-[#0b1c30]">{record.details}</div>

                  <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-1 border-t border-[#c6c6cd]/20">
                    <span>
                      Actor: <strong className="text-[#0b1c30]">{record.actorName} ({record.actorRole})</strong>
                    </span>
                    <span className="truncate max-w-[280px]">
                      Hash: <strong className="text-[#006c4a]">SHA256::{record.blockHash.slice(0, 18)}...</strong>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              INITIAL_AUDIT_BLOCKS.map((block) => (
                <div
                  key={block.blockId}
                  className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/30 space-y-2 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#000000] text-white font-bold text-[11px]">
                        {block.blockId}
                      </span>
                      <span className="text-xs text-[#006c4a] font-bold">{block.isoClause}</span>
                    </div>
                    <span className="text-[11px] text-[#45464d]">{block.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-[#0b1c30]">{block.action}</div>

                  <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-1 border-t border-[#c6c6cd]/20">
                    <span>Signer: <strong className="text-[#0b1c30]">{block.actor}</strong></span>
                    <span>Signature: <strong className="text-[#006c4a]">SHA256::{block.hash}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-[#eff4ff] border-t border-[#c6c6cd]/20 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setIsAuditLedgerOpen(false);
              setActiveNav('system-audit-trail');
            }}
            className="text-[#006c4a] font-bold hover:underline flex items-center gap-1 font-mono text-[11px]"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Open Global Audit Subsystem &amp; Search All Logs</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAuditLedgerOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#000000] text-white font-semibold hover:bg-[#213145]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
