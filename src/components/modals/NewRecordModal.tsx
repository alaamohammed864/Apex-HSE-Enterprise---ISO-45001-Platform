import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskAssessment, ControlledDocument } from '../../types';

export const NewRecordModal: React.FC = () => {
  const {
    isNewRecordModalOpen,
    setIsNewRecordModalOpen,
    addRiskAssessment,
    addControlledDocument,
    showToast,
  } = useApp();

  const [recordType, setRecordType] = useState<'RA' | 'PTW' | 'DOC' | 'INCIDENT'>('RA');

  // Form states for RA
  const [activity, setActivity] = useState('');
  const [discipline, setDiscipline] = useState<'HEAVY_LIFTING' | 'CIVIL' | 'PIPING' | 'RADIOGRAPHY' | 'ELECTRICAL' | 'SCAFFOLDING'>('HEAVY_LIFTING');
  const [zone, setZone] = useState('Zone 1 Process Area');
  const [hazard, setHazard] = useState('');
  const [likelihood, setLikelihood] = useState(4);
  const [severity, setSeverity] = useState(4);
  const [mitigation, setMitigation] = useState('');

  // Form states for Doc
  const [docCode, setDocCode] = useState('HSE-SOP-024');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState(7);

  if (!isNewRecordModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (recordType === 'RA') {
      const initScore = likelihood * severity;
      const newRa: RiskAssessment = {
        id: `RA-2026-0${Math.floor(Math.random() * 899 + 100)}`,
        rev: 'REV-01',
        activity: activity || 'New Hazardous Work Activity',
        hazardDescription: hazard || 'Uncontrolled kinetic/pressure release hazard.',
        discipline,
        disciplineLabel: discipline.replace('_', ' '),
        zone,
        initialLikelihood: likelihood,
        initialSeverity: severity,
        initialScore: initScore,
        initialTier: initScore >= 15 ? 'EXTREME' : initScore >= 8 ? 'HIGH' : 'LOW',
        baselineControls: ['Standard certified equipment', 'Safety exclusion perimeter'],
        controlsApplied: [
          { tierNumber: 3, tierName: 'Engineering', label: '3. Engineering', badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300' },
          { tierNumber: 4, tierName: 'Admin', label: '4. Admin (PTW)', badgeColor: 'bg-blue-100 text-blue-900 border border-blue-200' },
        ],
        additionalMitigation: mitigation || 'Double physical interlock and continuous monitoring.',
        alarpJustification: 'ALARP Just: Redundant barrier reduces occurrence frequency to broadly acceptable levels.',
        residualLikelihood: 1,
        residualSeverity: severity > 2 ? severity - 1 : 1,
        residualScore: 1 * (severity > 2 ? severity - 1 : 1),
        residualTier: 'Acceptable',
        deltaReduction: Math.round(((initScore - (severity > 2 ? severity - 1 : 1)) / initScore) * 100),
        reviewer: 'Dr. Tariq Al-Mansoor',
        reviewerRole: 'Lead HSE Director',
        status: 'CONTROLLED',
        signoffDate: '2026-03-27',
        appliedHierarchy: {
          elimination: false,
          substitution: false,
          engineering: true,
          administrative: true,
          ppe: true,
        },
      };

      addRiskAssessment(newRa);
    } else if (recordType === 'DOC') {
      const newDoc: ControlledDocument = {
        code: docCode || `HSE-DOC-${Math.floor(Math.random() * 900 + 100)}`,
        clause: 'CL-7.5.2',
        title: docTitle || 'New Controlled Technical Procedure',
        categoryNumber: docCategory,
        categoryName: `Cat ${docCategory < 10 ? '0' + docCategory : docCategory}: Procedures`,
        isBilingual: true,
        currentRevision: 'Rev 01 (Draft)',
        totalRevisionsCount: 1,
        custodian: 'Dr. Tariq Al-Mansoor',
        custodianDept: 'HSE Directorate',
        signoffStatus: 'DRAFT',
        signoffStatusLabel: 'Under Author Drafting',
        signoffDetail: 'Initial Baseline',
        effectiveDate: '2026-04-01',
        nextReviewDate: '2027-03-31',
        securityClassification: 'RESTRICTED - EPC-4 SITE',
        mandatoryFrequencyDays: 365,
        revisions: [
          {
            revId: 'Rev 01',
            label: 'Rev 01 (Draft)',
            date: '2026-03-27',
            description: 'Initial creation of controlled compliance artifact.',
            isCurrent: true,
          },
        ],
        referencedComplianceArtifacts: [],
      };

      addControlledDocument(newDoc);
    } else if (recordType === 'PTW') {
      showToast('New Permit to Work #PTW-2026-159 initialized and awaiting gas test authorization');
    } else {
      showToast('Incident Report #INC-2026-088 registered. 5-Why RCA team notified.');
    }

    setIsNewRecordModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40">
        <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
              add_circle
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">
                Record Entry &amp; ISO 45001 Ledger Dispatch
              </h3>
              <span className="text-xs text-[#45464d] font-mono">
                Initiate Controlled Operational Safety Record
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewRecordModalOpen(false)}
            className="p-1 rounded hover:bg-[#dce9ff] text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Record Type Selector */}
        <div className="p-4 bg-[#f8f9ff] border-b border-[#c6c6cd]/20 grid grid-cols-4 gap-2 text-xs">
          {[
            { id: 'RA', label: 'Risk Assessment', icon: 'grid_4x4' },
            { id: 'PTW', label: 'Permit to Work', icon: 'assignment_turned_in' },
            { id: 'DOC', label: 'Controlled Doc', icon: 'description' },
            { id: 'INCIDENT', label: 'Incident / 5-Why', icon: 'emergency' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setRecordType(type.id as any)}
              className={`p-2.5 rounded-lg flex flex-col items-center gap-1 font-semibold transition-all border ${
                recordType === type.id
                  ? 'bg-[#000000] text-white border-[#000000] shadow-xs'
                  : 'bg-white text-[#45464d] border-[#c6c6cd]/30 hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
              <span className="text-[11px] text-center leading-tight">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {recordType === 'RA' && (
            <>
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  Work Activity Title <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolding Erection at High Elevations (18m)"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Discipline</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as any)}
                    className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:outline-none"
                  >
                    <option value="HEAVY_LIFTING">Heavy Lifting &amp; Rigging</option>
                    <option value="CIVIL">Civil &amp; Earthwork</option>
                    <option value="PIPING">Piping &amp; Pressure</option>
                    <option value="RADIOGRAPHY">Radiography (NDT)</option>
                    <option value="ELECTRICAL">High Voltage Electrical</option>
                    <option value="SCAFFOLDING">Work at Height / Scaffolding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Zone Location</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Hazard Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe failure mechanisms, toxic exposures, or kinetic hazards..."
                  value={hazard}
                  onChange={(e) => setHazard(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#eff4ff] rounded-lg border border-[#c6c6cd]/20">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    Initial Likelihood (1-5): <strong className="font-mono">{likelihood}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={likelihood}
                    onChange={(e) => setLikelihood(parseInt(e.target.value, 10))}
                    className="w-full accent-[#006c4a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    Initial Severity (1-5): <strong className="font-mono">{severity}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                    className="w-full accent-[#ba1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Proposed Engineered Mitigation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Redundant umbilical cord, computerized torque limiter..."
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </>
          )}

          {recordType === 'DOC' && (
            <>
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">Document Identifier Code</label>
                <input
                  type="text"
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] font-mono text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolding Inspection & Tagging Standard Operating Procedure"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">ISO Category (1-23)</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(parseInt(e.target.value, 10))}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30"
                >
                  <option value={7}>07. Standard Operating Procedures (SOPs)</option>
                  <option value={9}>09. HSE Plan (Site Master Plan)</option>
                  <option value={10}>10. Risk Management &amp; ALARP</option>
                  <option value={14}>14. Permit to Work System</option>
                  <option value={15}>15. Emergency Response Plan</option>
                  <option value={18}>18. Inspection Checklists</option>
                </select>
              </div>
            </>
          )}

          {(recordType === 'PTW' || recordType === 'INCIDENT') && (
            <div className="p-4 bg-[#eff4ff] rounded-xl text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#006c4a]">
                verified_user
              </span>
              <h4 className="font-bold text-[#0b1c30]">
                {recordType === 'PTW'
                  ? 'High-Risk Permit Initiation Workflow'
                  : 'Incident & 5-Why Investigation Intake'}
              </h4>
              <p className="text-xs text-[#45464d]">
                This will trigger sequential verification: LOTO isolation check, gas sniffer calibration test, and designated area authority signature pad.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#c6c6cd]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewRecordModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#006c4a] hover:bg-[#00714e] text-white font-bold shadow-sm"
            >
              Commit &amp; Authorize Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
