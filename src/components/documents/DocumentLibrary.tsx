import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HSE_CATEGORIES } from '../../data/mockData';
import { ControlledDocument } from '../../types';
import { ExportService } from '../../services/exportService';
import { CreateEditDocumentModal } from '../modals/CreateEditDocumentModal';
import { DynamicDocumentEditorModal } from './DynamicDocumentEditorModal';

export const DocumentLibrary: React.FC = () => {
  const {
    t,
    controlledDocuments,
    selectedDocCode,
    setSelectedDocCode,
    setActiveNav,
    showToast,
    duplicateControlledDocument,
    archiveControlledDocument,
    setIsAuditLedgerOpen,
    setIsBilingualViewerOpen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('PUBLISHED');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<'ALL' | 'EN' | 'AR'>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'nextReview' | 'revision'>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Modal State for Create & Edit
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalMode, setDocModalMode] = useState<'create' | 'edit'>('create');
  const [docToEdit, setDocToEdit] = useState<ControlledDocument | null>(null);

  // Dynamic Living Document Editor Modal
  const [isDynamicEditorOpen, setIsDynamicEditorOpen] = useState(false);
  const [docForDynamicEdit, setDocForDynamicEdit] = useState<ControlledDocument | null>(null);

  // Filtered and sorted documents
  const filteredDocs = controlledDocuments
    .filter((doc) => {
      const matchesSearch =
        doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.custodian.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || doc.categoryNumber.toString() === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PUBLISHED' && doc.signoffStatus === 'APPROVED') ||
        (selectedStatus === 'REVIEW' &&
          (doc.signoffStatus === 'PENDING_CLIENT' || doc.signoffStatus === 'ACTIVE_SIGNATURES')) ||
        (selectedStatus === 'DRAFT' && doc.signoffStatus === 'DRAFT');

      const matchesLang =
        selectedLanguageFilter === 'ALL' ||
        (selectedLanguageFilter === 'AR' && doc.isBilingual) ||
        (selectedLanguageFilter === 'EN' && !doc.isBilingual);

      return matchesSearch && matchesCategory && matchesStatus && matchesLang;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'code') comp = a.code.localeCompare(b.code);
      else if (sortBy === 'nextReview') comp = a.nextReviewDate.localeCompare(b.nextReviewDate);
      else if (sortBy === 'revision') comp = a.currentRevision.localeCompare(b.currentRevision);
      return sortAsc ? comp : -comp;
    });

  const selectedDoc: ControlledDocument =
    controlledDocuments.find((d) => d.code === selectedDocCode) || controlledDocuments[0];

  const handleBatchExport = () => {
    showToast('Exporting official ISO 45001 dossier with WORM tamper-proof ledger...');
    if (selectedDoc) {
      ExportService.printDocumentDossier(selectedDoc);
    }
  };

  const handleGeneratePdf = () => {
    if (selectedDoc) {
      showToast(`Generating controlled bilingual dossier for ${selectedDoc.code}...`);
      ExportService.printDocumentDossier(selectedDoc);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Operational Breadcrumb & Clause Banner */}
      <div className="px-6 py-2 bg-[#eff4ff] flex items-center justify-between border-b border-[#c6c6cd]/30 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono uppercase tracking-wider text-[#006c4a] font-bold">
            Clause 7.5
          </span>
          <span className="text-[#c6c6cd] font-mono">/</span>
          <span className="text-[#45464d] font-bold uppercase tracking-wide">
            Documented Information &amp; Lifecycle Ledger
          </span>
          <span className="px-1.5 py-0.2 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[10px] font-bold">
            WORM VERIFIED
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#45464d] font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
            <span>Strict Retention: 10 Years Post-Commissioning</span>
          </div>
          <div className="h-3 w-[1px] bg-[#c6c6cd]"></div>
          <span>
            Hash Sync: <strong className="text-[#0b1c30]">SHA256::e3b0c442</strong>
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header & Action Zone */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#131b2e] text-[#7c839b] font-mono text-[11px] font-bold tracking-wider uppercase">
                Enterprise Registry
              </span>
              <span className="font-mono text-xs text-[#006c4a] font-bold">
                23 ISO Disciplines Unified
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] tracking-tight">
              {t.controlledDocLibraryTitle}
            </h1>
            <p className="text-xs lg:text-sm text-[#45464d]">{t.controlledDocSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveNav('dynamic-form-builder')}
              className="px-3.5 py-2 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0b1c30] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">build_circle</span>
              <span>{t.dynamicTemplateBuilder}</span>
            </button>

            <button
              type="button"
              onClick={handleBatchExport}
              className="px-3.5 py-2 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0b1c30] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>{t.batchExportPdfs}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDocToEdit(null);
                setDocModalMode('create');
                setIsDocModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#000000] hover:bg-[#213145] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">note_add</span>
              <span>{t.createNewDocument}</span>
            </button>
          </div>
        </div>

        {/* Lifecycle Status Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Published */}
          <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  {t.publishedActive}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-[#0b1c30] leading-none">148</span>
                  <span className="font-mono text-xs text-[#006c4a] font-bold">100% Valid</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#82f5c1]/30 flex items-center justify-center text-[#00714e]">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
            </div>
            <div className="mt-4 pt-1 flex items-center justify-between text-[#45464d] font-mono text-[11px]">
              <span>Full Legal &amp; Field Force</span>
              <span className="font-bold text-[#006c4a]">Zero Non-Conformance</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#006c4a]"></div>
          </div>

          {/* Pending Review */}
          <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  {t.pendingReview}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-[#0b1c30] leading-none">7</span>
                  <span className="font-mono text-xs text-[#c76c00] font-bold">In Sign-off Loop</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ffdcc3]/50 flex items-center justify-center text-[#6e3900]">
                <span className="material-symbols-outlined text-[24px]">draw</span>
              </div>
            </div>
            <div className="mt-4 pt-1 flex items-center justify-between text-[#45464d] font-mono text-[11px]">
              <span>
                Avg Wait: <strong className="text-[#0b1c30]">36 Hours</strong>
              </span>
              <span className="text-[#c76c00] font-bold">3 Client Signatures Req.</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffb77d]"></div>
          </div>

          {/* Required Revision */}
          <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  {t.requiredRevision}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-[#ba1a1a] leading-none">2</span>
                  <span className="font-mono text-xs text-[#ba1a1a] font-bold">Expiring &lt;30d</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
                <span className="material-symbols-outlined text-[24px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-4 pt-1 flex items-center justify-between text-[#45464d] font-mono text-[11px]">
              <span>Annual Cycle Due</span>
              <span className="font-bold text-[#ba1a1a]">HSE-SOP-015 / HSE-RA-004</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ba1a1a]"></div>
          </div>

          {/* Superseded */}
          <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  {t.supersededHistorical}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-[#0b1c30] leading-none">312</span>
                  <span className="font-mono text-xs text-[#45464d] font-bold">Read-Only</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#dce9ff] flex items-center justify-center text-[#45464d]">
                <span className="material-symbols-outlined text-[24px]">history</span>
              </div>
            </div>
            <div className="mt-4 pt-1 flex items-center justify-between text-[#45464d] font-mono text-[11px]">
              <span>Immutable Ledger</span>
              <span className="font-bold text-[#0b1c30]">Archived Cryptographically</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c6c6cd]"></div>
          </div>
        </div>

        {/* Master Filter Control Bar */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#c6c6cd]/30 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="xl:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchDocsPlaceholder}
                className="w-full bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#45464d] text-xs rounded-lg pl-9 pr-4 py-2 border border-transparent focus:border-[#006c4a] focus:bg-white focus:outline-none shadow-inner"
              />
            </div>

            {/* Category Dropdown (All 23 Categories) */}
            <div className="xl:col-span-3 relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg px-3 py-2 pr-8 border border-transparent focus:border-[#006c4a] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">{t.all23Categories}</option>
                {HSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d] pointer-events-none">
                unfold_more
              </span>
            </div>

            {/* Lifecycle Status Filter */}
            <div className="xl:col-span-2 relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg px-3 py-2 pr-8 border border-transparent focus:border-[#006c4a] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">Status: All Lifecycles</option>
                <option value="DRAFT">Draft (Working)</option>
                <option value="REVIEW">Under Multi-tier Review</option>
                <option value="PUBLISHED">Published &amp; Active</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d] pointer-events-none">
                filter_list
              </span>
            </div>

            {/* Language / Reset */}
            <div className="xl:col-span-3 flex items-center gap-2">
              <div className="flex items-center rounded-lg bg-[#eff4ff] p-0.5 border border-[#c6c6cd]/30">
                <button
                  type="button"
                  onClick={() => setSelectedLanguageFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    selectedLanguageFilter === 'ALL'
                      ? 'bg-[#000000] text-white shadow-xs'
                      : 'text-[#45464d] hover:text-[#0b1c30]'
                  }`}
                >
                  ALL
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguageFilter('EN')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    selectedLanguageFilter === 'EN'
                      ? 'bg-[#000000] text-white shadow-xs'
                      : 'text-[#45464d] hover:text-[#0b1c30]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguageFilter('AR')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    selectedLanguageFilter === 'AR'
                      ? 'bg-[#000000] text-white shadow-xs'
                      : 'text-[#45464d] hover:text-[#0b1c30]'
                  }`}
                >
                  AR
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedLanguageFilter('ALL');
                  showToast('Filters reset to default view');
                }}
                className="p-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#45464d] hover:text-[#0b1c30] transition-colors"
                title="Reset Filters"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              </button>
            </div>
          </div>

          {/* Quick Category Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-[#45464d] flex-shrink-0 mr-1">
              Frequent:
            </span>
            {[
              { id: '9', name: '09. HSE Plan (14)' },
              { id: '7', name: '07. SOPs (42)' },
              { id: '10', name: '10. Risk Mgmt (18)' },
              { id: '14', name: '14. PTW System (8)' },
              { id: '15', name: '15. Emergency Plan (6)' },
              { id: '18', name: '18. Checklists (34)' },
              { id: '22', name: '22. Incident CAPA (12)' },
              { id: '23', name: '23. HSE Audits (9)' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] whitespace-nowrap transition-colors ${
                  selectedCategory === pill.id
                    ? 'bg-[#000000] text-white font-bold'
                    : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30]'
                }`}
              >
                {pill.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace Split: Table & Detail Drawer */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
          {/* Primary Controlled Document Table (8 cols on 2xl) */}
          <div className="2xl:col-span-8 bg-white rounded-xl shadow-sm border border-[#c6c6cd]/30 overflow-hidden flex flex-col">
            <div className="p-4 flex items-center justify-between bg-[#eff4ff] border-b border-[#c6c6cd]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#000000]">
                  folder_supervised
                </span>
                <h2 className="text-base font-bold text-[#0b1c30]">
                  Registered Controlled Artifacts
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] font-mono text-[11px] font-bold">
                  {filteredDocs.length} Records in Scope
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#45464d]">
                <span>Sort:</span>
                <span
                  onClick={() => {
                    if (sortBy === 'code') setSortAsc(!sortAsc);
                    else {
                      setSortBy('code');
                      setSortAsc(true);
                    }
                  }}
                  className={`cursor-pointer hover:underline ${
                    sortBy === 'code' ? 'font-bold text-[#006c4a]' : ''
                  }`}
                >
                  Code {sortBy === 'code' ? (sortAsc ? '▲' : '▼') : ''}
                </span>
                <span>•</span>
                <span
                  onClick={() => {
                    if (sortBy === 'nextReview') setSortAsc(!sortAsc);
                    else {
                      setSortBy('nextReview');
                      setSortAsc(true);
                    }
                  }}
                  className={`cursor-pointer hover:underline ${
                    sortBy === 'nextReview' ? 'font-bold text-[#006c4a]' : ''
                  }`}
                >
                  Next Review {sortBy === 'nextReview' ? (sortAsc ? '▲' : '▼') : ''}
                </span>
                <span>•</span>
                <span
                  onClick={() => {
                    if (sortBy === 'revision') setSortAsc(!sortAsc);
                    else {
                      setSortBy('revision');
                      setSortAsc(true);
                    }
                  }}
                  className={`cursor-pointer hover:underline ${
                    sortBy === 'revision' ? 'font-bold text-[#006c4a]' : ''
                  }`}
                >
                  Revision {sortBy === 'revision' ? (sortAsc ? '▲' : '▼') : ''}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-bold">Doc Code</th>
                    <th className="py-2.5 px-4 font-bold">Title &amp; Category</th>
                    <th className="py-2.5 px-4 font-bold">Revision</th>
                    <th className="py-2.5 px-4 font-bold">Custodian / Author</th>
                    <th className="py-2.5 px-4 font-bold">Sign-off Status</th>
                    <th className="py-2.5 px-4 font-bold">Review Schedule</th>
                    <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
                  {filteredDocs.map((doc) => {
                    const isSelected = selectedDocCode === doc.code;
                    return (
                      <tr
                        key={doc.code}
                        onClick={() => setSelectedDocCode(doc.code)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#dce9ff]/50 hover:bg-[#dce9ff]/70 font-medium'
                            : 'hover:bg-[#eff4ff]'
                        }`}
                      >
                        <td className="py-3 px-4 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-bold text-[#0b1c30] tracking-tight">
                              {doc.code}
                            </span>
                            <span className="font-mono text-[10px] text-[#006c4a] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>{' '}
                              {doc.clause}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top max-w-[240px]">
                          <div className="space-y-1">
                            <div className="font-bold text-[#0b1c30] leading-snug">
                              {doc.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#45464d]">
                              <span className="px-1.5 py-0.2 rounded bg-[#e5eeff] font-mono">
                                {doc.categoryName}
                              </span>
                              {doc.isBilingual && (
                                <span className="text-[#006c4a] font-bold">Bilingual EN / AR</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="flex flex-col gap-0.5 items-start">
                            <span className="px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[11px] font-bold">
                              {doc.currentRevision}
                            </span>
                            <span className="text-[#45464d] font-mono text-[10px]">
                              {doc.totalRevisionsCount} Revisions
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="font-bold text-[#0b1c30] leading-tight">{doc.custodian}</div>
                          <div className="font-mono text-[10px] text-[#45464d]">
                            {doc.custodianDept}
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="space-y-0.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                doc.signoffStatus === 'APPROVED' || doc.signoffStatus === 'BOARD_SIGNED'
                                  ? 'bg-[#82f5c1] text-[#00714e]'
                                  : doc.signoffStatus === 'PENDING_CLIENT'
                                  ? 'bg-[#ffdcc3] text-[#6e3900]'
                                  : 'bg-[#e5eeff] text-[#0b1c30]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              {doc.signoffStatusLabel}
                            </span>
                            <div className="text-[10px] font-mono text-[#45464d]">
                              {doc.signoffDetail}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="space-y-0.5">
                            <div className="font-mono text-[11px] text-[#0b1c30]">
                              Eff: {doc.effectiveDate}
                            </div>
                            <div
                              className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-mono text-[10px] ${
                                doc.isExpiringSoon
                                  ? 'bg-[#ffdad6] text-[#ba1a1a] font-bold'
                                  : 'bg-[#eff4ff] text-[#45464d]'
                              }`}
                            >
                              {doc.isExpiringSoon && (
                                <span className="material-symbols-outlined text-[12px]">alarm</span>
                              )}
                              Due: {doc.nextReviewDate}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocForDynamicEdit(doc);
                                setIsDynamicEditorOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#dce9ff] text-[#006c4a] hover:text-[#0b1c30]"
                              title="Edit Living Document Fields (Dynamic Template)"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit_note</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocToEdit(doc);
                                setDocModalMode('edit');
                                setIsDocModalOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]"
                              title="Edit Metadata & Numbering"
                            >
                              <span className="material-symbols-outlined text-[18px]">tune</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateControlledDocument(doc.code);
                              }}
                              className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] hover:text-[#006c4a]"
                              title="Duplicate Document"
                            >
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveControlledDocument(doc.code);
                              }}
                              className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] hover:text-[#ba1a1a]"
                              title="Archive Document"
                            >
                              <span className="material-symbols-outlined text-[18px]">archive</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                ExportService.printDocumentDossier(doc);
                              }}
                              className="p-1.5 rounded hover:bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]"
                              title="View Document & Print Dossier"
                            >
                              <span className="material-symbols-outlined text-[18px]">print</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 bg-[#eff4ff] flex items-center justify-between font-mono text-[11px] text-[#45464d] border-t border-[#c6c6cd]/20">
              <div className="flex items-center gap-3">
                <span>
                  Showing <strong className="text-[#0b1c30]">1 - {filteredDocs.length}</strong> of 148
                  Controlled Documents
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="px-2 py-0.5 rounded bg-white text-[#45464d] font-semibold opacity-50"
                >
                  Prev
                </button>
                <button type="button" className="px-2.5 py-0.5 rounded bg-[#000000] text-white font-bold">
                  1
                </button>
                <button
                  type="button"
                  className="px-2.5 py-0.5 rounded bg-white hover:bg-[#dce9ff] text-[#0b1c30] font-semibold"
                >
                  2
                </button>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#dce9ff] text-[#0b1c30] font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Side/Drawer Preview (4 cols on 2xl) */}
          <div className="2xl:col-span-4 bg-white rounded-xl shadow-md border border-[#c6c6cd]/30 p-5 space-y-5">
            {/* Header with Formal Seal */}
            <div className="space-y-2 pb-3 bg-[#eff4ff] -mx-5 -mt-5 p-5 rounded-t-xl border-b border-[#c6c6cd]/20">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#006c4a]">
                    Controlled Document Dossier
                  </span>
                  <div className="font-mono text-xl font-bold text-[#0b1c30] mt-0.5">
                    {selectedDoc.code}
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-[#82f5c1] text-[#00714e] font-mono text-[10px] font-bold">
                  STRICTLY CONTROLLED
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0b1c30] leading-snug">{selectedDoc.title}</h3>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[11px] font-semibold">
                  {selectedDoc.categoryName}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-mono text-[11px] font-bold">
                  {selectedDoc.currentRevision}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#e5eeff] font-mono text-[11px] text-[#45464d]">
                  ISO 45001 : 2018
                </span>
              </div>
            </div>

            {/* Document Metadata Matrix */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20">
              <div>
                <span className="text-[#45464d] uppercase text-[10px] block font-bold">
                  Security Classification
                </span>
                <span className="text-[#0b1c30] font-bold">{selectedDoc.securityClassification}</span>
              </div>
              <div>
                <span className="text-[#45464d] uppercase text-[10px] block font-bold">
                  Language Standard
                </span>
                <span className="text-[#006c4a] font-bold">
                  {selectedDoc.isBilingual ? 'EN / AR Dual Column' : 'English Only'}
                </span>
              </div>
              <div>
                <span className="text-[#45464d] uppercase text-[10px] block font-bold">
                  Mandatory Frequency
                </span>
                <span className="text-[#0b1c30] font-bold">
                  Annual ({selectedDoc.mandatoryFrequencyDays} Days)
                </span>
              </div>
              <div>
                <span className="text-[#45464d] uppercase text-[10px] block font-bold">
                  Next Review Due
                </span>
                <span className="text-[#0b1c30] font-bold">{selectedDoc.nextReviewDate}</span>
              </div>
            </div>

            {/* Complete Revision History List (Vertical Step Node) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0b1c30]">
                  Immutable Revision Snapshots
                </span>
                <span className="font-mono text-[10px] text-[#006c4a] font-bold">
                  SHA-256 Ledger Locked
                </span>
              </div>

              <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dce9ff]">
                {selectedDoc.revisions.map((rev) => (
                  <div key={rev.revId} className="relative pl-3">
                    <div
                      className={`absolute -left-[18px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                        rev.isCurrent ? 'bg-[#006c4a]' : 'bg-[#c6c6cd]'
                      }`}
                    ></div>
                    <div className="p-2.5 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0b1c30]">
                          {rev.label}
                        </span>
                        <span className="font-mono text-[10px] text-[#45464d]">{rev.date}</span>
                      </div>
                      <p className="text-xs text-[#45464d] leading-relaxed">{rev.description}</p>
                      {rev.signer && (
                        <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                          <span className="text-[#006c4a] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                            Signed: {rev.signer}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsBilingualViewerOpen(true)}
                            className="text-[#45464d] hover:text-[#0b1c30] underline"
                          >
                            View Diff
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Linked Compliance Artifacts */}
            {selectedDoc.referencedComplianceArtifacts.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] block">
                  Referenced Compliance Artifacts
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedDoc.referencedComplianceArtifacts.map((art) => (
                    <div
                      key={art.code}
                      onClick={() => showToast(`Navigating to linked reference: ${art.code}`)}
                      className="flex items-center justify-between p-2 rounded bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] cursor-pointer transition-colors border border-[#c6c6cd]/20"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-[16px] text-[#000000]">
                          {art.icon}
                        </span>
                        <span className="font-bold">{art.code}</span>
                        <span className="text-[#45464d] truncate max-w-[170px]">{art.title}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#dce9ff] font-semibold">
                        {art.typeBadge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Execution Area */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleGeneratePdf}
                className="w-full py-2.5 px-4 rounded-lg bg-[#000000] hover:bg-[#213145] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                <span>Generate Bilingual Print Document (PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDocForDynamicEdit(selectedDoc);
                    setIsDynamicEditorOpen(true);
                  }}
                  className="py-2 px-3 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Edit Living Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuditLedgerOpen(true)}
                  className="py-2 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#c6c6cd]/30"
                >
                  <span className="material-symbols-outlined text-[16px]">history_edu</span>
                  <span>Audit Ledger</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controlled Document Lifecycle Sequence Banner */}
        <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/30 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#131b2e] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0b1c30]">
                ISO 45001 Clause 7.5 Strict Lifecycle Sequence
              </h4>
              <p className="text-xs text-[#45464d]">
                Every revision locks former copies immediately into historical non-editable WORM storage.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[#45464d] font-mono text-[11px]">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#c6c6cd]/30 font-bold text-[#0b1c30]">
              <span>1. Draft Initiated</span>
            </div>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#c6c6cd]/30 font-bold text-[#0b1c30]">
              <span>2. HSE Dept Review</span>
            </div>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#c6c6cd]/30 font-bold text-[#0b1c30]">
              <span>3. Project Director / Client Sign</span>
            </div>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#82f5c1] text-[#00714e] font-bold">
              <span className="material-symbols-outlined text-[14px]">check</span>
              <span>4. Published &amp; Watermarked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Document Modal */}
      <CreateEditDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        documentToEdit={docToEdit}
        mode={docModalMode}
      />

      {/* Living Dynamic Document Fields Editor Modal */}
      <DynamicDocumentEditorModal
        isOpen={isDynamicEditorOpen}
        onClose={() => setIsDynamicEditorOpen(false)}
        document={docForDynamicEdit}
        onDocumentUpdated={() => {
          showToast('Document parameters and fields updated in WORM ledger.');
        }}
      />
    </div>
  );
};
