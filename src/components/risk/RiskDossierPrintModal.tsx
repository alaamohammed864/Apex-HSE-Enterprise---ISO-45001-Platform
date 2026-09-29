import React from 'react';
import { RiskAssessmentRecord, RiskMatrixConfig } from '../../types/risk';

interface RiskDossierPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: RiskAssessmentRecord;
  matrixConfig: RiskMatrixConfig;
  language: 'en' | 'ar';
}

export const RiskDossierPrintModal: React.FC<RiskDossierPrintModalProps> = ({
  isOpen,
  onClose,
  assessment,
  matrixConfig,
  language,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTier = (score: number) => {
    for (const t of matrixConfig.riskTiers) {
      if (score >= t.minScore && score <= t.maxScore) return t;
    }
    return matrixConfig.riskTiers[0];
  };

  const initialTier = getTier(assessment.initialRiskScore);
  const residualTier = getTier(assessment.residualRiskScore);
  const deltaReduction = Math.round(
    ((assessment.initialRiskScore - assessment.residualRiskScore) / assessment.initialRiskScore) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-black rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:p-0 print:m-0 print:max-w-none print:shadow-none print:rounded-none">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="print:hidden px-6 py-3 bg-[#192639] text-white flex items-center justify-between border-b border-[#2b3a4f]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">print</span>
            <span className="font-bold text-sm">
              {language === 'ar' ? 'معاينة الطباعة لملف تقييم المخاطر' : 'Print Preview — ISO 45001 ALARP Dossier'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>{language === 'ar' ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 font-serif text-[11pt] leading-normal print:overflow-visible print:p-6">
          {/* Header Block */}
          <div className="border-2 border-black p-4 mb-6">
            <div className="flex items-center justify-between border-b border-black pb-3 mb-3">
              <div>
                <div className="text-xl font-bold tracking-tight uppercase">APEX HSE ENTERPRISE SYSTEMS</div>
                <div className="text-xs text-gray-700">Health, Safety & Environmental Division — ISO 45001:2018 Certified</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm bg-gray-100 px-2.5 py-1 border border-black inline-block">
                  {assessment.id}
                </div>
                <div className="text-xs text-gray-600 mt-1">{assessment.rev || 'REV-01'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>Project:</strong> {assessment.linkedProjectName || assessment.linkedProjectId || 'Ras Laffan LNG EPC-4'}</div>
              <div><strong>Date:</strong> {assessment.targetDate || new Date().toISOString().split('T')[0]}</div>
              <div><strong>Discipline:</strong> {assessment.discipline || 'General Safety'}</div>
              <div><strong>Location/Zone:</strong> {assessment.zone || 'Site Battery Limit'}</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold uppercase underline">
              OPERATIONAL RISK ASSESSMENT & ALARP DEMONSTRATION DOSSIER
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">Compliant with ISO 45001:2018 Clause 6.1.2 & Hierarchy of Controls</p>
          </div>

          {/* 1. Activity & Task */}
          <div className="mb-4">
            <h3 className="font-bold text-sm bg-gray-100 p-1.5 border border-black uppercase">
              1. Activity & Task Specification
            </h3>
            <div className="p-3 border-x border-b border-black text-xs space-y-1">
              <div><strong>Activity:</strong> {assessment.activity}</div>
              <div><strong>Task Description:</strong> {assessment.task}</div>
            </div>
          </div>

          {/* 2. Hazard & Consequence */}
          <div className="mb-4">
            <h3 className="font-bold text-sm bg-gray-100 p-1.5 border border-black uppercase">
              2. Hazard Identification & Potential Consequence
            </h3>
            <div className="p-3 border-x border-b border-black text-xs space-y-2">
              <div><strong>Identified Hazard:</strong> {assessment.hazard}</div>
              <div><strong>Potential Consequence:</strong> {assessment.potentialConsequence}</div>
              <div><strong>Existing Baseline Controls:</strong> {assessment.existingControls}</div>
            </div>
          </div>

          {/* 3. Risk Evaluation Table (Initial vs Residual) */}
          <div className="mb-4">
            <h3 className="font-bold text-sm bg-gray-100 p-1.5 border border-black uppercase">
              3. Inherent vs. Residual Risk Evaluation (5x5 Matrix)
            </h3>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2">Assessment Stage</th>
                  <th className="border border-black p-2">Likelihood (L)</th>
                  <th className="border border-black p-2">Severity (S)</th>
                  <th className="border border-black p-2">Risk Score (L×S)</th>
                  <th className="border border-black p-2">Risk Category</th>
                  <th className="border border-black p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-bold text-left">Initial (Inherent Risk)</td>
                  <td className="border border-black p-2 font-mono">L{assessment.likelihood}</td>
                  <td className="border border-black p-2 font-mono">S{assessment.severity}</td>
                  <td className="border border-black p-2 font-mono font-bold text-red-600">{assessment.initialRiskScore}</td>
                  <td className="border border-black p-2 font-bold">{initialTier.name}</td>
                  <td className="border border-black p-2">UNCONTROLLED</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-left">Residual (Post-Mitigation)</td>
                  <td className="border border-black p-2 font-mono">L{assessment.residualLikelihood}</td>
                  <td className="border border-black p-2 font-mono">S{assessment.residualSeverity}</td>
                  <td className="border border-black p-2 font-mono font-bold text-green-700">{assessment.residualRiskScore}</td>
                  <td className="border border-black p-2 font-bold text-green-700">{residualTier.name}</td>
                  <td className="border border-black p-2 font-bold">ALARP ACHIEVED (-{deltaReduction}%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Applied Controls & Hierarchy */}
          <div className="mb-4">
            <h3 className="font-bold text-sm bg-gray-100 p-1.5 border border-black uppercase">
              4. Additional Controls & Hierarchy of Controls Applied
            </h3>
            <div className="p-3 border-x border-b border-black text-xs space-y-2">
              <div className="grid grid-cols-5 gap-2 font-mono text-[10px] text-center border-b border-gray-300 pb-2">
                <div>[ {assessment.hierarchyOfControls?.elimination ? 'X' : ' '} ] Elimination</div>
                <div>[ {assessment.hierarchyOfControls?.substitution ? 'X' : ' '} ] Substitution</div>
                <div>[ {assessment.hierarchyOfControls?.engineering ? 'X' : ' '} ] Engineering</div>
                <div>[ {assessment.hierarchyOfControls?.administrative ? 'X' : ' '} ] Administrative</div>
                <div>[ {assessment.hierarchyOfControls?.ppe ? 'X' : ' '} ] Critical PPE</div>
              </div>
              <div className="whitespace-pre-line"><strong>Control Measures:</strong> {assessment.additionalControls}</div>
              <div><strong>Action Owner:</strong> {assessment.responsiblePerson}</div>
              <div><strong>Target Completion Date:</strong> {assessment.targetDate}</div>
            </div>
          </div>

          {/* 5. ALARP Justification */}
          <div className="mb-4">
            <h3 className="font-bold text-sm bg-gray-100 p-1.5 border border-black uppercase">
              5. ALARP Compliance Justification Statement (ISO 45001 §6.1.2)
            </h3>
            <div className="p-3 border-x border-b border-black text-xs italic">
              "{assessment.alarpJustification}"
            </div>
          </div>

          {/* 6. Linked Cross-Module References */}
          <div className="mb-6">
            <h3 className="font-bold text-sm bg-gray-100 p-1.5 border border-black uppercase">
              6. Cross-Module System Traceability & References
            </h3>
            <div className="p-3 border-x border-b border-black text-xs grid grid-cols-2 gap-2">
              <div><strong>Controlled Doc:</strong> {assessment.linkedDocumentCode || 'HSE-PLN-001'}</div>
              <div><strong>Governing SOP:</strong> {assessment.linkedSopCode || 'TMPL-HSE-SOP'}</div>
              <div><strong>Permit to Work:</strong> {assessment.linkedPermitNumber || 'PTW-2026-881'}</div>
              <div><strong>Related Incident / CAPA:</strong> {assessment.linkedIncidentRef || 'N/A (Preventive)'}</div>
              <div><strong>Audit / NCR Ref:</strong> {assessment.linkedAuditRef || 'ISO 45001 Stage 2'}</div>
              <div><strong>Approval Status:</strong> {assessment.status}</div>
            </div>
          </div>

          {/* Signatures Block */}
          <div className="grid grid-cols-3 gap-4 border-t-2 border-black pt-4 text-xs">
            <div>
              <div className="font-bold">Prepared By:</div>
              <div className="mt-8 border-b border-black pb-1">{assessment.responsiblePerson || 'Safety Engineer'}</div>
              <div className="text-[10px] text-gray-500">Risk Assessment Originator</div>
            </div>
            <div>
              <div className="font-bold">Reviewed By:</div>
              <div className="mt-8 border-b border-black pb-1">{assessment.reviewerName || 'Lead ISO 45001 Auditor'}</div>
              <div className="text-[10px] text-gray-500">HSE Technical Specialist</div>
            </div>
            <div>
              <div className="font-bold">Approved & Endorsed:</div>
              <div className="mt-8 border-b border-black pb-1">Dr. Tariq Al-Hashimi</div>
              <div className="text-[10px] text-gray-500">Corporate HSE Director (Sign-off)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
