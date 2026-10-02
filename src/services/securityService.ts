/**
 * Security Service & Protection Engine
 * Enforces input sanitization, file upload validation (size, MIME, extension),
 * RBAC authorization, and cryptographic audit log triggers.
 * Complies with ISO 45001:2018 Clause 7.5.3 and OWASP Top 10 recommendations.
 */

import { User } from '../context/AuthContext';
import { AuditLogService } from './auditLogService';
import { GlobalAuditActionType, GlobalAuditLogRecord } from '../types/documentControl';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
  sizeBytes?: number;
  mimeType?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/csv',
  'application/json',
]);

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'docx',
  'xlsx',
  'csv',
  'json',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SecurityService = {
  /**
   * Sanitizes text inputs to prevent XSS and script injections
   */
  sanitizeInput(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript\s*:/gi, '')
      .trim();
  },

  /**
   * Validates standard email structure
   */
  validateEmail(email: string): boolean {
    if (!email) return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  },

  /**
   * Sanitizes filename against directory traversal and dangerous characters
   */
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/\.\./g, '')
      .replace(/[/\\]/g, '_')
      .replace(/[<>:"|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);
  },

  /**
   * Validates an uploaded file for MIME type, extension, and file size limits
   */
  validateFileUpload(file: File, maxSizeBytes: number = MAX_FILE_SIZE_BYTES): FileValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file provided.' };
    }

    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      return {
        isValid: false,
        error: `File size exceeds the allowable limit of ${maxMb}MB (${(file.size / (1024 * 1024)).toFixed(2)}MB uploaded).`,
      };
    }

    // Check extension
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        isValid: false,
        error: `File extension '.${ext}' is restricted. Only certified compliance formats are permitted (${Array.from(ALLOWED_EXTENSIONS).join(', ')}).`,
      };
    }

    // Check MIME type if present
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        isValid: false,
        error: `MIME type '${file.type}' is unauthorized.`,
      };
    }

    const sanitizedFileName = this.sanitizeFileName(file.name);

    return {
      isValid: true,
      sanitizedFileName,
      sizeBytes: file.size,
      mimeType: file.type,
    };
  },

  /**
   * Enforces fine-grained role-based access control (RBAC)
   */
  hasPermission(user: User, requiredPermission: string): boolean {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(requiredPermission);
  },

  /**
   * Records a security or auth event in the WORM audit log
   */
  async logSecurityEvent(
    action: GlobalAuditActionType,
    details: string,
    user: User,
    entityId: string = 'SEC-AUTH-EVENT',
    entityType: GlobalAuditLogRecord['entityType'] = 'AUTH'
  ): Promise<void> {
    try {
      await AuditLogService.logAction({
        action,
        entityType,
        entityId,
        entityTitle: 'Enterprise Security & Access Audit',
        details,
        actorUserId: user.id,
        actorName: user.name,
        actorRole: user.roleTitleEn,
        isoClause: '7.5.3',
      });
    } catch (err) {
      console.warn('Could not record security event in audit ledger:', err);
    }
  },
};
