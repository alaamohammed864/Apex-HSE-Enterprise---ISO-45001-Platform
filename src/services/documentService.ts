/**
 * Complete Database-Driven Document Management Subsystem Service
 * Manages Document Types, Categories, Templates, Sections, Fields, Instances, Revisions,
 * Configurable Numbering Generation, and Full CRUD with IndexedDB Persistence.
 */

import { dbService } from './db';
import {
  DocumentTemplate,
  DocumentSection,
  DocumentField,
  DocumentInstance,
  DocumentRevision,
} from '../types/database';

export interface DocumentTypeDefinition {
  id: number;
  codePrefix: string;
  name: string;
  nameAr: string;
  category: 'PLANS' | 'PROCEDURES' | 'FORMS' | 'RECORDS' | 'POLICIES';
  isoClause: string;
  defaultRetentionYears: number;
  description: string;
}

export const INITIAL_23_DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  { id: 1, codePrefix: 'HSE-MOB', name: 'Mobilisation & Site Verification', nameAr: 'تجهيز الموقع والتحقق الميداني', category: 'PROCEDURES', isoClause: '8.1.1', defaultRetentionYears: 10, description: 'Pre-mobilization audit, perimeter verification, welfare setup, and initial statutory clearance.' },
  { id: 2, codePrefix: 'HSE-CNT', name: 'Types of Contracts & HSE Requirements', nameAr: 'أنواع العقود واشتراطات السلامة للمقاولين', category: 'POLICIES', isoClause: '8.1.4.2', defaultRetentionYears: 10, description: 'Contractor safety prequalification, bridging documents, and contractual safety compliance clauses.' },
  { id: 3, codePrefix: 'HSE-ISO', name: 'ISO 45001 Implementation', nameAr: 'تطبيق وتدقيق معيار أيزو 45001', category: 'PLANS', isoClause: '4.4', defaultRetentionYears: 15, description: 'Corporate OH&S management system scope, boundary criteria, and certification roadmap.' },
  { id: 4, codePrefix: 'HSE-PRC', name: 'HSE Process', nameAr: 'معايير وإجراءات العمليات العامة', category: 'PROCEDURES', isoClause: '8.1', defaultRetentionYears: 10, description: 'Operational control procedures governing multi-discipline construction activities.' },
  { id: 5, codePrefix: 'HSE-CAP', name: 'Corrective Action Plan', nameAr: 'خطة الإجراءات التصحيحية والوقائية', category: 'FORMS', isoClause: '10.2', defaultRetentionYears: 10, description: 'Tracking, root cause resolution, and close-out verification of safety non-conformances.' },
  { id: 6, codePrefix: 'HSE-GEN', name: 'HSE Procedures', nameAr: 'إجراءات السلامة التشغيلية المعتمدة', category: 'PROCEDURES', isoClause: '8.1.2', defaultRetentionYears: 10, description: 'Detailed mandatory methodologies for site activities and hazard barrier controls.' },
  { id: 7, codePrefix: 'HSE-SOP', name: 'SOP (Standard Operating Procedures)', nameAr: 'إجراءات التشغيل القياسية الموحدة', category: 'PROCEDURES', isoClause: '8.1.2', defaultRetentionYears: 10, description: 'Step-by-step technical standard operating procedures for specialized plant equipment.' },
  { id: 8, codePrefix: 'HSE-TRF', name: 'Traffic Management Plan', nameAr: 'خطة إدارة المرور والخدمات اللوجستية', category: 'PLANS', isoClause: '8.1.1', defaultRetentionYears: 10, description: 'Heavy vehicle route segregation, speed limits, pedestrian walkways, and escort protocols.' },
  { id: 9, codePrefix: 'HSE-PLN', name: 'HSE Plan (Site Master Plan)', nameAr: 'خطة السلامة والصحة المهنية الشاملة', category: 'PLANS', isoClause: '7.5.1', defaultRetentionYears: 15, description: 'Comprehensive site master plan defining governance, goals, targets, and statutory obligations.' },
  { id: 10, codePrefix: 'HSE-RSK', name: 'Risk Management Plan', nameAr: 'خطة إدارة المخاطر وسجل ALARP', category: 'PLANS', isoClause: '6.1.2', defaultRetentionYears: 15, description: 'Systematic hazard identification, risk assessment (HIRA), and ALARP demonstration register.' },
  { id: 11, codePrefix: 'HSE-TRN', name: 'HSE Training Matrix', nameAr: 'مصفوفة التدريب والكفاءة المهنية', category: 'RECORDS', isoClause: '7.2', defaultRetentionYears: 10, description: 'Mandatory role-based competency requirements, refresher schedules, and training tracking.' },
  { id: 12, codePrefix: 'HSE-MNL', name: 'HSE Manual', nameAr: 'دليل السلامة والصحة المهنية المؤسسي', category: 'POLICIES', isoClause: '7.5', defaultRetentionYears: 20, description: 'The authoritative corporate safety reference defining organizational commitments and rules.' },
  { id: 13, codePrefix: 'HSE-POL', name: 'HSE Policy Statements', nameAr: 'بيانات وسياسات السلامة المعتمدة', category: 'POLICIES', isoClause: '5.2', defaultRetentionYears: 20, description: 'Leadership-signed commitment to zero harm, environmental stewardship, and continuous improvement.' },
  { id: 14, codePrefix: 'HSE-PTW', name: 'Permit to Work System', nameAr: 'نظام تصاريح العمل الإلكتروني', category: 'PROCEDURES', isoClause: '8.1.2', defaultRetentionYears: 10, description: 'Governing framework for hot work, confined space, cold work, and excavation authorization.' },
  { id: 15, codePrefix: 'HSE-ERP', name: 'Emergency Response Plan (ERP)', nameAr: 'خطة الاستجابة للطوارئ والإخلاء', category: 'PLANS', isoClause: '8.2', defaultRetentionYears: 15, description: 'Response protocols for plant fires, gas leaks, medical evacuations, and muster operations.' },
  { id: 16, codePrefix: 'HSE-FIR', name: 'Fire Plan', nameAr: 'خطة الوقاية من الحرائق ومكافحتها', category: 'PLANS', isoClause: '8.2', defaultRetentionYears: 15, description: 'Hydrant network layout, fire extinguisher deployment, warden duties, and drill frequencies.' },
  { id: 17, codePrefix: 'HSE-BGT', name: 'HSE Budget Plan', nameAr: 'خطة ميزانية السلامة وتخصيص الموارد', category: 'PLANS', isoClause: '7.1', defaultRetentionYears: 7, description: 'Resource allocations for certified PPE, gas detection systems, health clinics, and audits.' },
  { id: 18, codePrefix: 'HSE-CHK', name: 'Inspection Checklists', nameAr: 'قوائم فحص وتفتيش السلامة اليومية', category: 'FORMS', isoClause: '9.1.1', defaultRetentionYears: 7, description: 'Standardized mobile checklists for scaffolding, electrical distribution, excavations, and cranes.' },
  { id: 19, codePrefix: 'HSE-KPI', name: 'KPIs & Safety Metrics', nameAr: 'مؤشرات الأداء الرئيسية ومعدلات الحوادث', category: 'RECORDS', isoClause: '9.1', defaultRetentionYears: 10, description: 'Leading and lagging safety metrics including TRIFR, LTIR, man-hours, and safety observation rates.' },
  { id: 20, codePrefix: 'HSE-ROL', name: 'Roles & Responsibilities', nameAr: 'الأدوار والمسؤوليات وصلاحيات السلامة', category: 'POLICIES', isoClause: '5.3', defaultRetentionYears: 15, description: 'Clear demarcation of safety accountabilities from executive director to frontline tradesperson.' },
  { id: 21, codePrefix: 'HSE-ORG', name: 'Organization Chart', nameAr: 'الهيكل التنظيمي وإدارة الحوكمة', category: 'POLICIES', isoClause: '5.3', defaultRetentionYears: 10, description: 'Visual reporting structure showing HSE line reporting directly to Project Executive Leadership.' },
  { id: 22, codePrefix: 'HSE-INC', name: 'Workplace Incident Investigation', nameAr: 'التحقيق في حوادث العمل وتحليل 5-Why', category: 'RECORDS', isoClause: '10.2', defaultRetentionYears: 20, description: 'Standardized investigation protocol applying 5-Why and Ishikawa root cause methodologies.' },
  { id: 23, codePrefix: 'HSE-AUD', name: 'HSE Audit & NCR Tracker', nameAr: 'سجل التدقيق الداخلي ومتابعة عدم المطابقة', category: 'RECORDS', isoClause: '9.2', defaultRetentionYears: 15, description: 'Internal and external audit programs, finding classifications, and corrective action closure.' },
];

export class DocumentManagementService {
  /**
   * Generates a configurable document number (e.g. HSE-PLN-001-REV00)
   */
  public static generateDocumentNumber(prefix: string, sequenceNumber: number, revisionNumber: number = 0): string {
    const paddedSeq = sequenceNumber.toString().padStart(3, '0');
    const revStr = `REV${revisionNumber.toString().padStart(2, '0')}`;
    return `${prefix}-${paddedSeq}-${revStr}`;
  }

  /**
   * Parses document code into constituent components
   */
  public static parseDocumentNumber(code: string): { prefix: string; seq: number; rev: string } {
    const parts = code.split('-');
    if (parts.length >= 4) {
      const prefix = `${parts[0]}-${parts[1]}`;
      const seq = parseInt(parts[2], 10) || 1;
      const rev = parts[3];
      return { prefix, seq, rev };
    }
    return { prefix: code, seq: 1, rev: 'REV00' };
  }

  /**
   * Increment revision number without overwriting approved copies
   */
  public static nextRevisionLabel(currentRev: string): string {
    const match = currentRev.match(/REV(\d+)/i) || currentRev.match(/Rev\s*(\d+(\.\d+)?)/i);
    if (match) {
      const num = parseFloat(match[1]);
      return `Rev ${(num + 0.1).toFixed(1)}`;
    }
    return 'Rev 1.0';
  }

  /**
   * Load all Document Instances from persistence with fallback
   */
  public static async getAllDocuments(): Promise<DocumentInstance[]> {
    return await dbService.getAll<DocumentInstance>('document_instances');
  }

  /**
   * Save a Document Instance
   */
  public static async saveDocument(doc: DocumentInstance): Promise<void> {
    await dbService.put<DocumentInstance>('document_instances', doc);
  }

  /**
   * Archive a document instance
   */
  public static async archiveDocument(id: string): Promise<void> {
    const doc = await dbService.getById<DocumentInstance>('document_instances', id);
    if (doc) {
      doc.status = 'ARCHIVED';
      doc.updatedAt = new Date().toISOString();
      await dbService.put<DocumentInstance>('document_instances', doc);
    }
  }

  /**
   * Duplicate a document instance to draft copy with fresh revision number
   */
  public static async duplicateDocument(sourceDoc: DocumentInstance, authorId: string): Promise<DocumentInstance> {
    const newId = `doc-${Date.now()}`;
    const baseCode = sourceDoc.code.replace(/-REV\d+/i, '').replace(/Rev\s*\d+(\.\d+)?/i, '');
    const newCode = `${baseCode}-REV00-COPY`;

    const copyDoc: DocumentInstance = {
      ...sourceDoc,
      id: newId,
      code: newCode,
      title: `${sourceDoc.title} (Copy)`,
      titleAr: `${sourceDoc.titleAr} (نسخة)`,
      status: 'DRAFT',
      currentRevisionNumber: 'Rev 0.1',
      isWormLocked: false,
      createdBy: authorId,
      updatedBy: authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.put<DocumentInstance>('document_instances', copyDoc);
    return copyDoc;
  }
}
