/**
 * Linkable Entities Service
 * Provides reference lists of Projects, Documents, SOPs, Permits, Incidents, and Audits
 * for cross-module linking with Risk Assessments.
 */

import { indexedDbService } from './db';
import { SEED_PROJECTS } from '../data/seedDatabase';
import { INITIAL_CONTROLLED_DOCUMENTS, INITIAL_PERMITS } from '../data/mockData';

export interface LinkableEntityItem {
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  type: 'PROJECT' | 'DOCUMENT' | 'SOP' | 'PERMIT' | 'INCIDENT' | 'AUDIT';
}

export class LinkableEntitiesService {
  public static async getAvailableProjects(): Promise<LinkableEntityItem[]> {
    try {
      const dbProjects = await indexedDbService.getAll<any>('projects');
      const list = dbProjects && dbProjects.length > 0 ? dbProjects : SEED_PROJECTS;
      return list.map((p) => ({
        id: p.id,
        code: p.code,
        title: p.name,
        subtitle: p.nameAr || p.clientName,
        type: 'PROJECT',
      }));
    } catch {
      return SEED_PROJECTS.map((p) => ({
        id: p.id,
        code: p.code,
        title: p.name,
        subtitle: p.nameAr,
        type: 'PROJECT',
      }));
    }
  }

  public static async getAvailableDocuments(): Promise<LinkableEntityItem[]> {
    try {
      const dbDocs = await indexedDbService.getAll<any>('document_instances');
      if (dbDocs && dbDocs.length > 0) {
        return dbDocs.map((d) => ({
          id: d.id,
          code: d.code,
          title: d.title,
          subtitle: d.category,
          type: 'DOCUMENT',
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_CONTROLLED_DOCUMENTS.map((d) => ({
      id: d.code,
      code: d.code,
      title: d.title,
      subtitle: d.categoryName,
      type: 'DOCUMENT',
    }));
  }

  public static async getAvailableSops(): Promise<LinkableEntityItem[]> {
    const allDocs = await this.getAvailableDocuments();
    const sops = allDocs.filter((d) => d.code.includes('SOP') || d.title.toLowerCase().includes('sop') || d.title.toLowerCase().includes('procedure'));
    if (sops.length > 0) return sops;

    return [
      {
        id: 'tmpl-sop-01',
        code: 'TMPL-HSE-SOP',
        title: 'Standard Operating Procedure (SOP) Master',
        subtitle: 'ISO 45001 §8.1.2 Operational Control',
        type: 'SOP',
      },
      {
        id: 'sop-lift-01',
        code: 'HSE-SOP-LIFT-01',
        title: 'SOP for Tandem & Critical Lifting Operations',
        subtitle: 'Rev 2.0 Rigging & Crane Access',
        type: 'SOP',
      },
      {
        id: 'sop-trench-02',
        code: 'HSE-SOP-EXCAV-02',
        title: 'SOP for Deep Shored Trenching & Pipelaying',
        subtitle: 'Rev 1.3 Subsurface Operations',
        type: 'SOP',
      },
      {
        id: 'sop-hot-03',
        code: 'HSE-SOP-HOT-03',
        title: 'SOP for Hydrocarbon Live Header Hot Work & Welding',
        subtitle: 'Rev 3.1 Flare Area Safety',
        type: 'SOP',
      },
    ];
  }

  public static async getAvailablePermits(): Promise<LinkableEntityItem[]> {
    return [
      {
        id: 'ptw-2026-881',
        code: 'PTW-LIFT-2026-881',
        title: 'Hot/Critical Lift Permit — 120T Cryogenic Vessel',
        subtitle: 'Zone 1 Marine Pier Berth #2',
        type: 'PERMIT',
      },
      {
        id: 'ptw-2026-882',
        code: 'PTW-EXCAV-2026-882',
        title: 'Deep Trenching & Utility Crossing Permit (> 5m)',
        subtitle: 'Block 4 Main Spine Corridor',
        type: 'PERMIT',
      },
      {
        id: 'ptw-2026-883',
        code: 'PTW-HOT-2026-883',
        title: 'Hot Work & Open Flame Flare Header Welding',
        subtitle: 'Mesaieed Unit 3 Battery Limit',
        type: 'PERMIT',
      },
      {
        id: 'ptw-2026-884',
        code: 'PTW-HEIGHT-2026-884',
        title: 'Critical Working at Height (> 30m Over Water)',
        subtitle: 'Flare Stack South Pier',
        type: 'PERMIT',
      },
      {
        id: 'ptw-2026-885',
        code: 'PTW-RAD-2026-885',
        title: 'Industrial Radiography (NDT Iridium-192 Night Permit)',
        subtitle: 'Subsea Tie-In Trench',
        type: 'PERMIT',
      },
      ...INITIAL_PERMITS.map((p) => ({
        id: p.id,
        code: p.id,
        title: `${p.type} Permit - ${p.location}`,
        subtitle: p.holder,
        type: 'PERMIT' as const,
      })),
    ];
  }

  public static async getAvailableIncidents(): Promise<LinkableEntityItem[]> {
    return [
      {
        id: 'inc-2026-088',
        code: 'INC-2026-088',
        title: 'Diesel Fuel Vapor Leak in Deep Pit #4',
        subtitle: 'Severity: High Potential Near-Miss',
        type: 'INCIDENT',
      },
      {
        id: 'inc-2025-014',
        code: 'INC-2025-014',
        title: 'Boom Hydraulic Hose Rupture during Pre-Lift Test',
        subtitle: 'Severity: Restricted Work Case',
        type: 'INCIDENT',
      },
      {
        id: 'inc-2025-089',
        code: 'INC-2025-089',
        title: 'Trench Soil Minor Slumping After Unseasonal Rains',
        subtitle: 'Severity: Property Damage Only',
        type: 'INCIDENT',
      },
    ];
  }

  public static async getAvailableAudits(): Promise<LinkableEntityItem[]> {
    return [
      {
        id: 'aud-ncr-2026-01',
        code: 'AUD-NCR-2026-01',
        title: 'ISO 45001 §8.1.2 Hierarchy of Controls Audit Finding',
        subtitle: 'Finding: Barrier degradation in Hot Work area',
        type: 'AUDIT',
      },
      {
        id: 'aud-ncr-2026-02',
        code: 'AUD-NCR-2026-02',
        title: 'Third-Party Rigging & Crane Load Chart Verification Audit',
        subtitle: 'Finding: Recalibration required for secondary crane indicator',
        type: 'AUDIT',
      },
      {
        id: 'aud-ncr-2026-03',
        code: 'AUD-NCR-2026-03',
        title: 'Subsurface Utility Ground Penetrating Radar Verification',
        subtitle: 'Finding: Outdated utility map discrepancy in Block 4',
        type: 'AUDIT',
      },
    ];
  }

  public static async getProjects(): Promise<LinkableEntityItem[]> {
    return this.getAvailableProjects();
  }

  public static async getDocuments(): Promise<LinkableEntityItem[]> {
    return this.getAvailableDocuments();
  }

  public static async getRiskAssessments(): Promise<LinkableEntityItem[]> {
    try {
      const dbAssessments = await indexedDbService.getAll<any>('risk_assessments');
      if (dbAssessments && dbAssessments.length > 0) {
        return dbAssessments.map((ra) => ({
          id: ra.id,
          code: ra.id,
          title: ra.activity || ra.hazard || 'Risk Assessment',
          subtitle: `Tier: ${ra.initialTier || ra.initialRiskTier || 'HIGH'} • Residual: ${ra.residualTier || ra.residualRiskTier || 'LOW'}`,
          type: 'DOCUMENT' as const,
        }));
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'RA-2026-001',
        code: 'RA-2026-001',
        title: 'Heavy Dual-Crane Tandem Lift',
        subtitle: 'Tier: HIGH • Residual: Acceptable',
        type: 'DOCUMENT',
      },
      {
        id: 'RA-2026-002',
        code: 'RA-2026-002',
        title: 'Confined Space Column Entry',
        subtitle: 'Tier: EXTREME • Residual: Tolerable',
        type: 'DOCUMENT',
      },
    ];
  }
}

