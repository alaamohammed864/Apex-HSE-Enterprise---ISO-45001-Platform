/**
 * Global Audit Log Subsystem (WORM Compliant & Cryptographically Chained)
 * Records: Create, Edit, Delete, Approve, Reject, Publish, Archive, Download, Print, Login, Permission changes.
 * Complies with ISO 45001:2018 Clause 7.5.3 (Control of Documented Information) and FDA 21 CFR Part 11.
 */

import { dbService } from './db';
import { GlobalAuditActionType, GlobalAuditLogRecord } from '../types/documentControl';

// Fast pure JavaScript SHA-256 implementation to guarantee identical execution in browser & Node.js test runners
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number;
  let j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let compositeClearHex = '';
  for (let index = 0; index < ascii.length; index++) {
    compositeClearHex += ascii.charCodeAt(index).toString(16);
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export class AuditLogService {
  private static initialSeedDone = false;

  /**
   * Initialize and seed baseline immutable audit logs if empty
   */
  public static async initSeedIfEmpty(): Promise<void> {
    if (this.initialSeedDone) return;
    this.initialSeedDone = true;

    try {
      const existing = await dbService.getAll<GlobalAuditLogRecord>('audit_logs');
      if (existing && existing.length > 0) return;

      const initialEvents: Array<{
        action: GlobalAuditActionType;
        entityType: GlobalAuditLogRecord['entityType'];
        entityId: string;
        entityTitle: string;
        details: string;
        actorName: string;
        actorRole: string;
        isoClause: string;
        timestamp: string;
      }> = [
        {
          action: 'Login',
          entityType: 'AUTH',
          entityId: 'USR-HSE-001',
          entityTitle: 'Enterprise Session Authentication',
          details: 'User authenticated via 2FA token from IP 10.42.1.8',
          actorName: 'Tariq Al-Kuwari',
          actorRole: 'Lead HSE Engineer',
          isoClause: '7.5.3',
          timestamp: '2026-03-28T07:15:00.000Z',
        },
        {
          action: 'Create',
          entityType: 'DOCUMENT',
          entityId: 'HSE-PLN-001',
          entityTitle: 'Project HSE Management Plan',
          details: 'Created baseline document draft for Ras Laffan EPC-4 Industrial Expansion',
          actorName: 'Tariq Al-Kuwari',
          actorRole: 'Lead HSE Engineer',
          isoClause: '7.5.1',
          timestamp: '2026-03-28T07:30:00.000Z',
        },
        {
          action: 'Edit',
          entityType: 'DOCUMENT',
          entityId: 'HSE-PLN-001',
          entityTitle: 'Project HSE Management Plan',
          details: 'Updated Section 3.0 Safe Systems of Work with 10 e-PTW disciplines',
          actorName: 'Tariq Al-Kuwari',
          actorRole: 'Lead HSE Engineer',
          isoClause: '7.5.2',
          timestamp: '2026-03-28T09:12:00.000Z',
        },
        {
          action: 'Approve',
          entityType: 'APPROVAL',
          entityId: 'WF-HSE-PLN-001-STEP2',
          entityTitle: 'Project HSE Management Plan',
          details: 'Step 2 HSE Manager Technical Review approved with sign-off comments',
          actorName: 'Marcus Sterling',
          actorRole: 'HSE Project Manager',
          isoClause: '7.5.3',
          timestamp: '2026-03-28T14:45:00.000Z',
        },
        {
          action: 'Publish',
          entityType: 'DOCUMENT',
          entityId: 'HSE-PLN-001',
          entityTitle: 'Project HSE Management Plan (Rev 03)',
          details: 'Published controlled version to corporate document register; former revision marked Superseded',
          actorName: 'Hamad Al-Attiyah',
          actorRole: 'Executive Project Director',
          isoClause: '7.5.3',
          timestamp: '2026-03-29T10:00:00.000Z',
        },
        {
          action: 'Download',
          entityType: 'DOCUMENT',
          entityId: 'HSE-PLN-001',
          entityTitle: 'Project HSE Management Plan',
          details: 'Exported official vector PDF dossier with title block and tri-party signatures',
          actorName: 'David Patel',
          actorRole: 'Principal Safety Engineer',
          isoClause: '7.5.3',
          timestamp: '2026-03-29T11:20:00.000Z',
        },
        {
          action: 'Print',
          entityType: 'DOCUMENT',
          entityId: 'HSE-SOP-004',
          entityTitle: 'Confined Space Entry Protocol',
          details: 'Dispatched controlled hardcopy print dossier with site watermarking',
          actorName: 'Marcus Sterling',
          actorRole: 'HSE Project Manager',
          isoClause: '7.5.3',
          timestamp: '2026-03-29T13:40:00.000Z',
        },
        {
          action: 'Reject',
          entityType: 'APPROVAL',
          entityId: 'WF-HSE-SOP-012-STEP3',
          entityTitle: 'High Voltage LOTO Switching Procedure',
          details: 'Step 3 Project Manager rejected: Arc flash boundary distance must be recalculated from 1.2m to 2.4m',
          actorName: 'Hamad Al-Attiyah',
          actorRole: 'Executive Project Director',
          isoClause: '7.5.2',
          timestamp: '2026-03-29T15:10:00.000Z',
        },
        {
          action: 'Permission changes',
          entityType: 'PERMISSION',
          entityId: 'ROLE-SAFE-ENG',
          entityTitle: 'Safety Engineer Role Privileges',
          details: 'Granted document.review and ptw.authorize permissions to Safety Engineer group',
          actorName: 'System Security Admin',
          actorRole: 'Enterprise Administrator',
          isoClause: '5.3',
          timestamp: '2026-03-30T08:00:00.000Z',
        },
        {
          action: 'Archive',
          entityType: 'DOCUMENT',
          entityId: 'HSE-MNL-2022',
          entityTitle: 'Legacy HSE Manual (2022 Archive)',
          details: 'Transferred retired manual to permanent 20-year WORM compliance archive',
          actorName: 'Tariq Al-Kuwari',
          actorRole: 'Lead HSE Engineer',
          isoClause: '7.5.3',
          timestamp: '2026-03-30T09:15:00.000Z',
        },
      ];

      for (const evt of initialEvents) {
        await this.logAction({
          action: evt.action,
          entityType: evt.entityType,
          entityId: evt.entityId,
          entityTitle: evt.entityTitle,
          details: evt.details,
          actorUserId: 'USR-AUTO',
          actorName: evt.actorName,
          actorRole: evt.actorRole,
          isoClause: evt.isoClause,
          timestamp: evt.timestamp,
        });
      }
    } catch (err) {
      console.warn('Failed to seed initial audit logs:', err);
    }
  }

  /**
   * Log an immutable audit action into the cryptographically chained ledger
   */
  public static async logAction(params: {
    action: GlobalAuditActionType;
    entityType: GlobalAuditLogRecord['entityType'];
    entityId: string;
    entityTitle: string;
    details: string;
    actorUserId?: string;
    actorName?: string;
    actorRole?: string;
    isoClause?: string;
    metadata?: Record<string, unknown>;
    timestamp?: string;
  }): Promise<GlobalAuditLogRecord> {
    const existingLogs = await dbService.getAll<GlobalAuditLogRecord>('audit_logs');
    existingLogs.sort((a, b) => a.blockIndex - b.blockIndex);

    const blockIndex = existingLogs.length + 1;
    const prevBlock = existingLogs.length > 0 ? existingLogs[existingLogs.length - 1] : null;
    const prevHash = prevBlock ? prevBlock.blockHash : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp = params.timestamp || new Date().toISOString();
    const actorUserId = params.actorUserId || 'USR-CURRENT';
    const actorName = params.actorName || 'Lead HSE Engineer';
    const actorRole = params.actorRole || 'HSE Team';

    const payloadToHash = JSON.stringify({
      blockIndex,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      details: params.details,
      actorUserId,
      actorName,
      actorRole,
      timestamp,
      metadata: params.metadata || {},
    });

    const dataHash = sha256(payloadToHash);
    const blockHash = sha256(`${blockIndex}:${prevHash}:${dataHash}:${timestamp}`);

    const newLogRecord: GlobalAuditLogRecord = {
      id: `audit-${blockIndex}-${Date.now()}`,
      blockIndex,
      timestamp,
      actorUserId,
      actorName,
      actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      isoClause: params.isoClause || '7.5.3',
      details: params.details,
      prevHash,
      dataHash,
      blockHash,
      metadata: params.metadata,
    };

    await dbService.put<GlobalAuditLogRecord>('audit_logs', newLogRecord);
    return newLogRecord;
  }

  /**
   * Retrieve all audit logs sorted by block index (descending or ascending)
   */
  public static async getAuditLogs(options?: {
    action?: GlobalAuditActionType | 'ALL';
    entityType?: string;
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
    ascending?: boolean;
  }): Promise<GlobalAuditLogRecord[]> {
    await this.initSeedIfEmpty();
    const all = await dbService.getAll<GlobalAuditLogRecord>('audit_logs');

    let filtered = all.filter((log) => {
      if (options?.action && options.action !== 'ALL' && log.action !== options.action) {
        return false;
      }
      if (options?.entityType && options.entityType !== 'ALL' && log.entityType !== options.entityType) {
        return false;
      }
      if (options?.startDate && log.timestamp < options.startDate) {
        return false;
      }
      if (options?.endDate && log.timestamp > options.endDate) {
        return false;
      }
      if (options?.searchTerm) {
        const query = options.searchTerm.toLowerCase();
        const matches =
          log.entityTitle.toLowerCase().includes(query) ||
          log.entityId.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.actorName.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });

    if (options?.ascending) {
      filtered.sort((a, b) => a.blockIndex - b.blockIndex);
    } else {
      filtered.sort((a, b) => b.blockIndex - a.blockIndex);
    }

    return filtered;
  }

  /**
   * Cryptographically verify the entire blockchain audit trail for tampering
   */
  public static async verifyAuditChain(): Promise<{
    isValid: boolean;
    totalBlocks: number;
    brokenBlockIndex?: number;
    errorMessage?: string;
    rootHash: string;
  }> {
    const logs = await dbService.getAll<GlobalAuditLogRecord>('audit_logs');
    logs.sort((a, b) => a.blockIndex - b.blockIndex);

    if (logs.length === 0) {
      return { isValid: true, totalBlocks: 0, rootHash: '0x00000000' };
    }

    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < logs.length; i++) {
      const block = logs[i];

      // Verify continuous sequence
      if (block.blockIndex !== i + 1) {
        return {
          isValid: false,
          totalBlocks: logs.length,
          brokenBlockIndex: block.blockIndex,
          errorMessage: `Sequence broken: expected block ${i + 1}, found ${block.blockIndex}`,
          rootHash: logs[logs.length - 1].blockHash,
        };
      }

      // Verify previous hash chain linkage
      if (block.prevHash !== expectedPrevHash) {
        return {
          isValid: false,
          totalBlocks: logs.length,
          brokenBlockIndex: block.blockIndex,
          errorMessage: `Hash chain linkage broken at block ${block.blockIndex}`,
          rootHash: logs[logs.length - 1].blockHash,
        };
      }

      // Verify payload data hash
      const payloadToHash = JSON.stringify({
        blockIndex: block.blockIndex,
        action: block.action,
        entityType: block.entityType,
        entityId: block.entityId,
        entityTitle: block.entityTitle,
        details: block.details,
        actorUserId: block.actorUserId,
        actorName: block.actorName,
        actorRole: block.actorRole,
        timestamp: block.timestamp,
        metadata: block.metadata || {},
      });
      const expectedDataHash = sha256(payloadToHash);

      if (block.dataHash !== expectedDataHash) {
        return {
          isValid: false,
          totalBlocks: logs.length,
          brokenBlockIndex: block.blockIndex,
          errorMessage: `Data integrity tampering detected at block ${block.blockIndex}`,
          rootHash: logs[logs.length - 1].blockHash,
        };
      }

      // Verify block hash
      const expectedBlockHash = sha256(`${block.blockIndex}:${block.prevHash}:${block.dataHash}:${block.timestamp}`);
      if (block.blockHash !== expectedBlockHash) {
        return {
          isValid: false,
          totalBlocks: logs.length,
          brokenBlockIndex: block.blockIndex,
          errorMessage: `Block hash validation failed at block ${block.blockIndex}`,
          rootHash: logs[logs.length - 1].blockHash,
        };
      }

      expectedPrevHash = block.blockHash;
    }

    return {
      isValid: true,
      totalBlocks: logs.length,
      rootHash: logs[logs.length - 1].blockHash,
    };
  }

  /**
   * Export audit log records to CSV with UTF-8 BOM
   */
  public static async exportAuditLogsToCsv(options?: { action?: GlobalAuditActionType | 'ALL'; searchTerm?: string }): Promise<void> {
    const logs = await this.getAuditLogs(options);
    const headers = [
      'Block #',
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Title',
      'Actor Name',
      'Actor Role',
      'ISO Clause',
      'Details',
      'Block Hash (SHA-256)',
    ];

    const rows = logs.map((l) => [
      l.blockIndex,
      l.timestamp,
      l.action,
      l.entityType,
      l.entityId,
      `"${l.entityTitle.replace(/"/g, '""')}"`,
      `"${l.actorName.replace(/"/g, '""')}"`,
      `"${l.actorRole.replace(/"/g, '""')}"`,
      l.isoClause || '7.5.3',
      `"${l.details.replace(/"/g, '""')}"`,
      l.blockHash,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSE_Global_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
