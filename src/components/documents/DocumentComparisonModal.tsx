import React, { useState, useEffect } from 'react';
import { ControlledDocumentRevision, DocumentComparisonResult } from '../../types/documentControl';
import { DocumentControlService } from '../../services/documentControlService';

interface DocumentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentCode: string;
  defaultRevA?: string;
  defaultRevB?: string;
}

export const DocumentComparisonModal: React.FC<DocumentComparisonModalProps> = ({
  isOpen,
  onClose,
  documentCode,
  defaultRevA,
  defaultRevB,
}) => {
  const [revisions, setRevisions] = useState<ControlledDocumentRevision[]>([]);
  const [revANumber, setRevANumber] = useState<string>('');
  const [revBNumber, setRevBNumber] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DocumentComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'UNIFIED'>('SIDE_BY_SIDE');

  useEffect(() => {
    if (!isOpen || !documentCode) return;

    DocumentControlService.getRevisionsForDocument(documentCode).then((revs) => {
      setRevisions(revs);
      if (revs.length >= 2) {
        const revA = defaultRevA || revs[1].revisionNumber;
        const revB = defaultRevB || revs[0].revisionNumber;
        setRevANumber(revA);
        setRevBNumber(revB);
        loadDiff(documentCode, revA, revB);
      } else if (revs.length === 1) {
        setRevANumber(revs[0].revisionNumber);
        setRevBNumber(revs[0].revisionNumber);
        loadDiff(documentCode, revs[0].revisionNumber, revs[0].revisionNumber);
      }
    });
  }, [isOpen, documentCode, defaultRevA, defaultRevB]);

  const loadDiff = async (code: string, a: string, b: string) => {
    if (!a || !b) return;
    try {
      setLoading(true);
      const res = await DocumentControlService.compareRevisions(code, a, b);
      setDiffResult(res);
    } catch (err) {
      console.error('Failed to load comparison diff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareClick = () => {
    loadDiff(documentCode, revANumber, revBNumber);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 lg:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#eff4ff] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#006c4a]">difference</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Document Revision Comparison (Diff Engine)
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-[#006c4a] border border-green-200 font-bold">
                  {documentCode}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                ISO 45001:2018 Clause 7.5.2 • Immutable Version Delta Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-lg p-0.5 border text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('SIDE_BY_SIDE')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  viewMode === 'SIDE_BY_SIDE'
                    ? 'bg-[#006c4a] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('UNIFIED')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  viewMode === 'UNIFIED'
                    ? 'bg-[#006c4a] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unified Delta
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Revision Selector Bar */}
        <div className="p-3 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-gray-600">Base (Old):</span>
              <select
                value={revANumber}
                onChange={(e) => setRevANumber(e.target.value)}
                className="px-2.5 py-1 rounded border bg-white font-mono font-bold text-[#0b1c30] text-xs focus:ring-1 focus:ring-[#006c4a]"
              >
                {revisions.map((r) => (
                  <option key={r.id} value={r.revisionNumber}>
                    {r.revisionNumber} ({r.status}) - {r.effectiveDate}
                  </option>
                ))}
              </select>
            </div>

            <span className="material-symbols-outlined text-gray-400 text-[18px]">arrow_forward</span>

            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-gray-600">Compared (New):</span>
              <select
                value={revBNumber}
                onChange={(e) => setRevBNumber(e.target.value)}
                className="px-2.5 py-1 rounded border bg-white font-mono font-bold text-[#0b1c30] text-xs focus:ring-1 focus:ring-[#006c4a]"
              >
                {revisions.map((r) => (
                  <option key={r.id} value={r.revisionNumber}>
                    {r.revisionNumber} ({r.status}) - {r.effectiveDate}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCompareClick}
              className="px-3 py-1 rounded bg-[#006c4a] text-white font-bold hover:bg-[#005238] transition-all flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>Re-compare</span>
            </button>
          </div>

          {diffResult && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold border border-green-200">
                +{diffResult.addedCount} Added
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                ~{diffResult.modifiedCount} Modified
              </span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200">
                -{diffResult.removedCount} Removed
              </span>
            </div>
          )}
        </div>

        {/* Diff Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="p-8 text-center text-gray-500 font-mono text-xs">
              Calculating revision diff and checksum verification...
            </div>
          )}

          {!loading && diffResult && (
            <>
              {/* Metadata Comparison Section */}
              <div className="border rounded-xl p-3 bg-white shadow-xs space-y-2">
                <h4 className="font-bold text-xs text-[#0b1c30] flex items-center gap-1.5 border-b pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">tune</span>
                  <span>Document Governance Metadata Comparison</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[10px] font-mono text-gray-500 uppercase">
                      <tr>
                        <th className="p-2 border-b">Attribute</th>
                        <th className="p-2 border-b w-5/12 bg-red-50/50 text-red-800">
                          {diffResult.revA} (Base)
                        </th>
                        <th className="p-2 border-b w-5/12 bg-green-50/50 text-green-800">
                          {diffResult.revB} (Compared)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-mono">
                      {diffResult.metadataDiffs.map((d) => (
                        <tr
                          key={d.fieldKey}
                          className={d.changeType === 'MODIFIED' ? 'bg-amber-50/40' : ''}
                        >
                          <td className="p-2 font-semibold text-gray-700">
                            {d.label}
                            {d.changeType === 'MODIFIED' && (
                              <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                                Modified
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-gray-600 bg-red-50/20">{String(d.oldValue)}</td>
                          <td className="p-2 font-bold text-[#0b1c30] bg-green-50/20">
                            {String(d.newValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Structured Content & Field Comparison */}
              <div className="border rounded-xl p-3 bg-white shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-[#0b1c30] flex items-center justify-between border-b pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-700">
                      dataset
                    </span>
                    <span>Document Content &amp; Living Parameters Comparison</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {diffResult.contentDiffs.length} Fields Evaluated
                  </span>
                </h4>

                {diffResult.contentDiffs.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-xs">
                    No custom fields found in snapshot.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diffResult.contentDiffs.map((field) => {
                      const isMod = field.changeType === 'MODIFIED';
                      const isAdd = field.changeType === 'ADDED';
                      const isRem = field.changeType === 'REMOVED';

                      return (
                        <div
                          key={field.fieldKey}
                          className={`p-3 rounded-lg border text-xs ${
                            isMod
                              ? 'bg-amber-50/50 border-amber-200'
                              : isAdd
                              ? 'bg-green-50/50 border-green-200'
                              : isRem
                              ? 'bg-red-50/50 border-red-200'
                              : 'bg-gray-50/40 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-[#0b1c30]">{field.label}</span>
                            <span
                              className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                                isMod
                                  ? 'bg-amber-200 text-amber-900'
                                  : isAdd
                                  ? 'bg-green-200 text-green-900'
                                  : isRem
                                  ? 'bg-red-200 text-red-900'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {field.changeType}
                            </span>
                          </div>

                          {viewMode === 'SIDE_BY_SIDE' ? (
                            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                              <div className="p-2 rounded bg-white border border-red-200/60">
                                <span className="text-[9px] uppercase block text-red-700 font-bold mb-0.5">
                                  {diffResult.revA} (Previous):
                                </span>
                                <div className="text-gray-700 break-words whitespace-pre-wrap">
                                  {typeof field.oldValue === 'object'
                                    ? JSON.stringify(field.oldValue, null, 2)
                                    : String(field.oldValue)}
                                </div>
                              </div>
                              <div className="p-2 rounded bg-white border border-green-200/60">
                                <span className="text-[9px] uppercase block text-green-700 font-bold mb-0.5">
                                  {diffResult.revB} (Current):
                                </span>
                                <div className="text-[#0b1c30] font-bold break-words whitespace-pre-wrap">
                                  {typeof field.newValue === 'object'
                                    ? JSON.stringify(field.newValue, null, 2)
                                    : String(field.newValue)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="font-mono text-[11px] space-y-1">
                              <div className="text-red-700 bg-red-100/60 p-1.5 rounded flex items-start gap-1">
                                <span className="font-bold select-none">-</span>
                                <span className="break-words">
                                  {typeof field.oldValue === 'object'
                                    ? JSON.stringify(field.oldValue)
                                    : String(field.oldValue)}
                                </span>
                              </div>
                              <div className="text-green-800 bg-green-100/60 p-1.5 rounded flex items-start gap-1 font-bold">
                                <span className="font-bold select-none">+</span>
                                <span className="break-words">
                                  {typeof field.newValue === 'object'
                                    ? JSON.stringify(field.newValue)
                                    : String(field.newValue)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-xs">
          <div className="text-gray-500 font-mono text-[10px]">
            WORM Integrity: Historical snapshots are read-only and sealed cryptographically.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 text-white font-bold hover:bg-black transition-all"
          >
            Close Diff Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
