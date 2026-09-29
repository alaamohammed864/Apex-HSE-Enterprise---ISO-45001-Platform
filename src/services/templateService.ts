/**
 * Dynamic Template Management Service for HSE Enterprise Platform
 * Provides complete lifecycle for Document Templates:
 * Create, Read, Update, Duplicate, Archive, and Instantiating into Controlled Documents.
 * Persists to IndexedDB stores: 'document_templates', 'document_sections', 'document_fields', 'document_instances', 'document_revisions'.
 */

import { dbService } from './db';
import {
  DynamicDocumentTemplateConfig,
  FormSectionConfig,
  FormFieldConfig,
  DEFAULT_DYNAMIC_TEMPLATES,
} from '../types/formFieldConfig';
import { DocumentInstance, DocumentRevision } from '../types/database';

export class TemplateManagementService {
  private static memoryTemplates: Map<string, DynamicDocumentTemplateConfig> = new Map();
  private static isInitialized: boolean = false;

  /**
   * Initializes templates store from IndexedDB or seeds default templates
   */
  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const persistedTemplates = await dbService.getAll<any>('document_templates');
      if (persistedTemplates && persistedTemplates.length > 0) {
        persistedTemplates.forEach((rawTmpl) => {
          let parsedConfig: DynamicDocumentTemplateConfig;
          if (rawTmpl.schemaJson) {
            try {
              parsedConfig = JSON.parse(rawTmpl.schemaJson);
            } catch {
              parsedConfig = rawTmpl;
            }
          } else {
            parsedConfig = rawTmpl;
          }
          this.memoryTemplates.set(parsedConfig.id, parsedConfig);
        });

        // Also merge any new standard professional default templates that don't exist yet
        for (const key of Object.keys(DEFAULT_DYNAMIC_TEMPLATES)) {
          const tmpl = DEFAULT_DYNAMIC_TEMPLATES[key];
          if (!this.memoryTemplates.has(tmpl.id)) {
            this.memoryTemplates.set(tmpl.id, tmpl);
            await this.persistTemplate(tmpl);
          }
        }
      } else {
        // Seed standard default templates
        for (const key of Object.keys(DEFAULT_DYNAMIC_TEMPLATES)) {
          const tmpl = DEFAULT_DYNAMIC_TEMPLATES[key];
          this.memoryTemplates.set(tmpl.id, tmpl);
          await this.persistTemplate(tmpl);
        }
      }
    } catch (err) {
      console.warn('Failed to load templates from IndexedDB, using defaults:', err);
      for (const key of Object.keys(DEFAULT_DYNAMIC_TEMPLATES)) {
        const tmpl = DEFAULT_DYNAMIC_TEMPLATES[key];
        this.memoryTemplates.set(tmpl.id, tmpl);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Get all templates
   */
  public static async getAllTemplates(): Promise<DynamicDocumentTemplateConfig[]> {
    await this.init();
    return Array.from(this.memoryTemplates.values());
  }

  /**
   * Get single template by ID
   */
  public static async getTemplateById(id: string): Promise<DynamicDocumentTemplateConfig | null> {
    await this.init();
    return this.memoryTemplates.get(id) || null;
  }

  /**
   * Save (Create or Update) a template
   */
  public static async saveTemplate(template: DynamicDocumentTemplateConfig): Promise<void> {
    await this.init();
    template.updatedAt = new Date().toISOString();
    this.memoryTemplates.set(template.id, template);
    await this.persistTemplate(template);
  }

  /**
   * Duplicate a template
   */
  public static async duplicateTemplate(
    sourceId: string,
    authorName: string = 'Corporate Admin'
  ): Promise<DynamicDocumentTemplateConfig> {
    await this.init();
    const source = this.memoryTemplates.get(sourceId);
    if (!source) {
      throw new Error(`Template not found with ID ${sourceId}`);
    }

    const newId = `tmpl-${Date.now()}`;
    const newCode = `${source.code}-COPY`;

    // Deep clone sections and fields with new IDs
    const clonedSections: FormSectionConfig[] = source.sections.map((sec, secIdx) => {
      const newSecId = `sec-${Date.now()}-${secIdx}`;
      return {
        ...sec,
        id: newSecId,
        fields: sec.fields.map((fld, fldIdx) => ({
          ...fld,
          id: `fld-${Date.now()}-${secIdx}-${fldIdx}`,
          sectionId: newSecId,
        })),
      };
    });

    const duplicated: DynamicDocumentTemplateConfig = {
      ...source,
      id: newId,
      code: newCode,
      title: `${source.title} (Clone)`,
      titleAr: `${source.titleAr} (نسخة معدلة)`,
      version: '1.0-DRAFT',
      status: 'DRAFT',
      createdBy: authorName,
      updatedBy: authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: clonedSections,
    };

    this.memoryTemplates.set(duplicated.id, duplicated);
    await this.persistTemplate(duplicated);
    return duplicated;
  }

  /**
   * Archive a template
   */
  public static async archiveTemplate(id: string): Promise<void> {
    await this.init();
    const tmpl = this.memoryTemplates.get(id);
    if (tmpl) {
      tmpl.status = 'ARCHIVED';
      tmpl.updatedAt = new Date().toISOString();
      await this.persistTemplate(tmpl);
    }
  }

  /**
   * Persist template into IndexedDB tables
   */
  private static async persistTemplate(template: DynamicDocumentTemplateConfig): Promise<void> {
    try {
      // 1. Save document_templates
      const rawEntity = {
        id: template.id,
        code: template.code,
        title: template.title,
        titleAr: template.titleAr,
        category: template.category,
        isoClause: template.isoClause,
        description: template.description,
        descriptionAr: template.descriptionAr,
        version: template.version,
        status: template.status,
        isActive: template.status !== 'ARCHIVED',
        schemaJson: JSON.stringify(template),
        createdBy: template.createdBy,
        updatedBy: template.updatedBy,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };
      await dbService.put('document_templates', rawEntity);

      // 2. Save document_sections
      for (const sec of template.sections) {
        await dbService.put('document_sections', {
          id: sec.id,
          templateId: template.id,
          title: sec.title,
          titleAr: sec.titleAr,
          description: sec.description,
          descriptionAr: sec.descriptionAr,
          sequenceOrder: sec.order,
          isMandatory: sec.isMandatory ?? true,
        });

        // 3. Save document_fields
        for (const fld of sec.fields) {
          await dbService.put('document_fields', {
            id: fld.id,
            sectionId: sec.id,
            fieldKey: fld.fieldKey,
            label: fld.label,
            labelAr: fld.labelAr,
            description: fld.description,
            descriptionAr: fld.descriptionAr,
            fieldType: fld.fieldType,
            optionsJson: fld.options ? JSON.stringify(fld.options) : undefined,
            isRequired: fld.isRequired,
            defaultValue: fld.defaultValue,
            validationRule: fld.validation?.rule,
            validationJson: fld.validation ? JSON.stringify(fld.validation) : undefined,
            sequenceOrder: fld.order,
            visibility: fld.visibility,
            permissions: fld.permissions,
          });
        }
      }
    } catch (err) {
      console.warn('Error persisting template to IndexedDB:', err);
    }
  }

  /**
   * Generates a living Document Instance from a Template
   */
  public static async createDocumentFromTemplate(
    template: DynamicDocumentTemplateConfig,
    metadata: {
      code: string;
      title: string;
      titleAr: string;
      projectId: string;
      retentionYears: number;
      authorId: string;
      revisionNumber?: string;
    },
    fieldValues: Record<string, any>
  ): Promise<DocumentInstance> {
    const docId = `doc-${Date.now()}`;
    const revId = `rev-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const revNumber = metadata.revisionNumber || 'Rev 1.0';

    // 1. Create Revision with the full field payload
    const revision: DocumentRevision = {
      id: revId,
      documentId: docId,
      revisionNumber: revNumber,
      changeSummary: `Initial controlled release generated from dynamic template ${template.code}`,
      changeSummaryAr: `إصدار أولي منشأ من القالب الديناميكي ${template.code}`,
      contentDataJson: JSON.stringify({
        templateId: template.id,
        templateCode: template.code,
        templateVersion: template.version,
        values: fieldValues,
        templateSnapshot: template,
      }),
      sha256Checksum: `WORM_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      status: 'APPROVED',
      authorId: metadata.authorId,
      effectiveDate: nowIso.split('T')[0],
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: nowIso,
    };

    // 2. Create Document Instance
    const docInstance: DocumentInstance = {
      id: docId,
      code: metadata.code,
      templateId: template.id,
      projectId: metadata.projectId,
      title: metadata.title,
      titleAr: metadata.titleAr,
      category: template.category,
      isoClause: template.isoClause,
      currentRevisionId: revId,
      currentRevisionNumber: revNumber,
      status: 'APPROVED',
      retentionYears: metadata.retentionYears || 10,
      isWormLocked: false,
      createdBy: metadata.authorId,
      updatedBy: metadata.authorId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 3. Persist to IndexedDB
    await dbService.put('document_revisions', revision);
    await dbService.put('document_instances', docInstance);

    return docInstance;
  }

  /**
   * Load saved field values and template for a document by ID or Code
   */
  public static async loadDocumentContent(documentIdOrCode: string): Promise<{
    values: Record<string, any>;
    template: DynamicDocumentTemplateConfig | null;
    revision: DocumentRevision | null;
  }> {
    try {
      const allDocs = await dbService.getAll<DocumentInstance>('document_instances');
      const matchedDoc = allDocs.find((d) => d.id === documentIdOrCode || d.code === documentIdOrCode);
      const targetDocId = matchedDoc ? matchedDoc.id : documentIdOrCode;

      const allRevs = await dbService.getAll<DocumentRevision>('document_revisions');
      const docRevs = allRevs.filter((r) => r.documentId === targetDocId || r.documentId === documentIdOrCode);
      const latestRev = docRevs.length > 0 ? docRevs[docRevs.length - 1] : null;

      if (latestRev && latestRev.contentDataJson) {
        const parsed = JSON.parse(latestRev.contentDataJson);
        const template = parsed.templateSnapshot || (parsed.templateId ? await this.getTemplateById(parsed.templateId) : null);
        return {
          values: parsed.values || {},
          template,
          revision: latestRev,
        };
      }
    } catch (err) {
      console.warn('Could not load document content from revisions:', err);
    }

    return {
      values: {},
      template: null,
      revision: null,
    };
  }

  /**
   * Update an existing document's values non-destructively by ID or Code
   */
  public static async updateDocumentContent(
    documentIdOrCode: string,
    newValues: Record<string, any>,
    authorId: string,
    changeNote: string = 'Updated field parameters'
  ): Promise<void> {
    const allDocs = await dbService.getAll<DocumentInstance>('document_instances');
    let doc = allDocs.find((d) => d.id === documentIdOrCode || d.code === documentIdOrCode) || null;
    if (!doc) {
      doc = await dbService.getById<DocumentInstance>('document_instances', documentIdOrCode);
    }
    if (!doc) throw new Error(`Document ${documentIdOrCode} not found`);

    const existingContent = await this.loadDocumentContent(doc.id);
    const newRevId = `rev-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newRev: DocumentRevision = {
      id: newRevId,
      documentId: doc.id,
      revisionNumber: doc.currentRevisionNumber,
      changeSummary: changeNote,
      changeSummaryAr: 'تحديث بيانات الحقول والمعاملات',
      contentDataJson: JSON.stringify({
        templateId: doc.templateId,
        values: newValues,
        templateSnapshot: existingContent.template,
      }),
      sha256Checksum: `WORM_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      status: 'APPROVED',
      authorId: authorId,
      effectiveDate: nowIso.split('T')[0],
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: nowIso,
    };

    doc.currentRevisionId = newRevId;
    doc.updatedBy = authorId;
    doc.updatedAt = nowIso;

    await dbService.put('document_revisions', newRev);
    await dbService.put('document_instances', doc);
  }
}
