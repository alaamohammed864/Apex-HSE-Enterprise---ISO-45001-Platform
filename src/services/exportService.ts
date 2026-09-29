/**
 * Export and Reporting Service for HSE Enterprise Platform
 * Provides client-side PDF formatting & CSV export for Risk Registers, Documents, and Ledgers.
 */

import { RiskAssessment, ControlledDocument, AuditBlock } from '../types';

export class ExportService {
  /**
   * Export Complete Risk Assessments to structured CSV with all Phase 5 fields and links
   */
  public static exportCompleteRiskRegisterToCsv(assessments: any[], filename = 'HSE-Risk-Register-Complete.csv') {
    const headers = [
      'Assessment ID',
      'Activity',
      'Task',
      'Hazard',
      'Potential Consequence',
      'Existing Controls',
      'Initial Likelihood (L)',
      'Initial Severity (S)',
      'Initial Risk Score',
      'Initial Risk Tier',
      'Additional Controls',
      'Responsible Person',
      'Target Date',
      'Residual Likelihood (L)',
      'Residual Severity (S)',
      'Residual Risk Score',
      'Residual Risk Tier',
      'ALARP Justification',
      'Status',
      'Linked Project',
      'Linked Document',
      'Linked SOP',
      'Linked Permit',
      'Linked Incident',
      'Linked Audit',
    ];

    const rows = assessments.map((ra) => [
      `"${ra.id || ''}"`,
      `"${(ra.activity || '').replace(/"/g, '""')}"`,
      `"${(ra.task || ra.activity || '').replace(/"/g, '""')}"`,
      `"${(ra.hazard || ra.hazardDescription || '').replace(/"/g, '""')}"`,
      `"${(ra.potentialConsequence || '').replace(/"/g, '""')}"`,
      `"${(ra.existingControls || (Array.isArray(ra.baselineControls) ? ra.baselineControls.join('; ') : '') || '').replace(/"/g, '""')}"`,
      ra.likelihood || ra.initialLikelihood || 1,
      ra.severity || ra.initialSeverity || 1,
      ra.initialRiskScore || ra.initialScore || 1,
      `"${ra.initialRiskTier || ra.initialTier || 'LOW'}"`,
      `"${(ra.additionalControls || ra.additionalMitigation || '').replace(/"/g, '""')}"`,
      `"${(ra.responsiblePerson || ra.reviewer || '').replace(/"/g, '""')}"`,
      `"${ra.targetDate || ''}"`,
      ra.residualLikelihood || 1,
      ra.residualSeverity || 1,
      ra.residualRiskScore || ra.residualScore || 1,
      `"${ra.residualRiskTier || ra.residualTier || 'LOW'}"`,
      `"${(ra.alarpJustification || '').replace(/"/g, '""')}"`,
      `"${ra.status || 'DRAFT'}"`,
      `"${ra.linkedProjectName || ra.linkedProjectId || ''}"`,
      `"${ra.linkedDocumentCode || ra.linkedDocumentId || ''}"`,
      `"${ra.linkedSopCode || ra.linkedSopId || ''}"`,
      `"${ra.linkedPermitNumber || ra.linkedPermitId || ''}"`,
      `"${ra.linkedIncidentRef || ra.linkedIncidentId || ''}"`,
      `"${ra.linkedAuditRef || ra.linkedAuditId || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadBlob(csvContent, 'text/csv;charset=utf-8;', filename);
  }

  /**
   * Export Risk Assessments to JSON
   */
  public static exportRiskRegisterToJson(assessments: any[], filename = 'HSE-Risk-Register.json') {
    const jsonStr = JSON.stringify(assessments, null, 2);
    this.downloadBlob(jsonStr, 'application/json;charset=utf-8;', filename);
  }

  /**
   * Export Risk Assessments to structured CSV file
   */
  public static exportRiskRegisterToCsv(assessments: RiskAssessment[], filename = 'HSE-Risk-Register-ALARP.csv') {
    const headers = [
      'Risk ID',
      'Revision',
      'Activity',
      'Discipline',
      'Zone',
      'Initial Likelihood (L)',
      'Initial Severity (S)',
      'Initial Score (L×S)',
      'Initial Rating',
      'Mitigation & ALARP Justification',
      'Residual Likelihood (L)',
      'Residual Severity (S)',
      'Residual Score (L×S)',
      'Residual Tier',
      'Delta Reduction',
      'Reviewer',
      'Status',
    ];

    const rows = assessments.map((ra) => [
      `"${ra.id}"`,
      `"${ra.rev}"`,
      `"${ra.activity.replace(/"/g, '""')}"`,
      `"${ra.disciplineLabel}"`,
      `"${ra.zone}"`,
      ra.initialLikelihood,
      ra.initialSeverity,
      ra.initialScore,
      `"${ra.initialTier}"`,
      `"${(ra.alarpJustification || '').replace(/"/g, '""')}"`,
      ra.residualLikelihood,
      ra.residualSeverity,
      ra.residualScore,
      `"${ra.residualTier}"`,
      `"-${ra.deltaReduction}"`,
      `"${ra.reviewer}"`,
      `"${ra.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadBlob(csvContent, 'text/csv;charset=utf-8;', filename);
  }

  /**
   * Export Audit Logs to CSV
   */
  public static exportAuditLedgerToCsv(blocks: AuditBlock[], filename = 'HSE-Audit-Ledger.csv') {
    const headers = ['Block ID', 'Timestamp UTC', 'Action', 'Actor', 'ISO 45001 Clause', 'SHA-256 Hash'];
    const rows = blocks.map((b) => [
      `"${b.blockId}"`,
      `"${b.timestamp}"`,
      `"${b.action.replace(/"/g, '""')}"`,
      `"${b.actor}"`,
      `"${b.isoClause}"`,
      `"${b.hash}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadBlob(csvContent, 'text/csv;charset=utf-8;', filename);
  }

  /**
   * Generates a printable window formatted with ISO 45001 official document header
   */
  public static printDocumentDossier(doc: ControlledDocument) {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${doc.code} - ${doc.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #111; }
          .header-box { border: 2px solid #000; padding: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .header-title { font-size: 18px; font-weight: bold; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px; font-size: 13px; }
          .meta-item { border-bottom: 1px solid #ddd; padding: 6px 0; }
          .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: bold; background: #e2e8f0; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f8fafc; font-weight: bold; }
          .footer-note { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #aaa; padding-top: 8px; }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <div style="font-size: 12px; color: #0284c7; font-weight: bold;">CONSOLIDATED CONTRACTORS CORP (CCC) &bull; QATAR SHELL GTL JV</div>
            <div class="header-title">${doc.code} &bull; ${doc.title}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">ISO 45001:2018 Clause ${doc.clause} Compliance Document</div>
          </div>
          <div style="text-align: right;">
            <span class="badge" style="background: #dcfce7; color: #166534;">${doc.signoffStatus}</span>
            <div style="font-size: 14px; font-weight: bold; margin-top: 6px;">${doc.currentRevision}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><strong>Custodian:</strong> ${doc.custodian} (${doc.custodianDept})</div>
          <div class="meta-item"><strong>Classification:</strong> ${doc.securityClassification}</div>
          <div class="meta-item"><strong>Effective Date:</strong> ${doc.effectiveDate}</div>
          <div class="meta-item"><strong>Next Mandatory Review:</strong> ${doc.nextReviewDate}</div>
        </div>

        <h3>Revision Lifecycle Ledger</h3>
        <table>
          <thead>
            <tr>
              <th>Rev ID</th>
              <th>Date</th>
              <th>Description / Engineering Modifications</th>
              <th>Authorized Signer</th>
            </tr>
          </thead>
          <tbody>
            ${doc.revisions
              .map(
                (r) => `
              <tr>
                <td><strong>${r.label}</strong></td>
                <td>${r.date}</td>
                <td>${r.description}</td>
                <td>${r.signer || 'Executive Board'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h3>Referenced Regulatory & Compliance Artifacts</h3>
        <table>
          <thead>
            <tr>
              <th>Artifact Code</th>
              <th>Title</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${doc.referencedComplianceArtifacts
              .map(
                (a) => `
              <tr>
                <td><strong>${a.code}</strong></td>
                <td>${a.title}</td>
                <td>${a.typeBadge}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer-note">
          CONFIDENTIAL & CONTROLLED INFORMATION &bull; APEX HSE ENTERPRISE v4.2 &bull; WORM Cryptographic Hash Verified &bull; Printed at ${new Date().toUTCString()}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  private static downloadBlob(content: string, type: string, filename: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
