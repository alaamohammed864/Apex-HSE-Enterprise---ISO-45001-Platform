import React, { useState } from 'react';
import { HazardItem, HazardCategory } from '../../types/risk';

interface HazardRegisterViewProps {
  hazards: HazardItem[];
  onCreateHazard: (data: Omit<HazardItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateHazard: (id: string, updates: Partial<HazardItem>) => Promise<void>;
  onDuplicateHazard: (id: string) => Promise<void>;
  onArchiveHazard: (id: string) => Promise<void>;
  language: 'en' | 'ar';
}

export const HazardRegisterView: React.FC<HazardRegisterViewProps> = ({
  hazards,
  onCreateHazard,
  onUpdateHazard,
  onDuplicateHazard,
  onArchiveHazard,
  language,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHazard, setEditingHazard] = useState<HazardItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<HazardCategory>('PHYSICAL');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [consequencesStr, setConsequencesStr] = useState('');
  const [standardRef, setStandardRef] = useState('');

  const openCreateModal = () => {
    setEditingHazard(null);
    const nextSeq = Math.floor(Math.random() * 900) + 100;
    setCode(`HAZ-PHYS-${nextSeq}`);
    setCategory('PHYSICAL');
    setTitle('');
    setTitleAr('');
    setDescription('');
    setConsequencesStr('');
    setStandardRef('OSHA 1926 / ISO 45001 §6.1.2');
    setIsModalOpen(true);
  };

  const openEditModal = (h: HazardItem) => {
    setEditingHazard(h);
    setCode(h.code);
    setCategory(h.category);
    setTitle(h.title);
    setTitleAr(h.titleAr || '');
    setDescription(h.description);
    setConsequencesStr(h.potentialConsequences ? h.potentialConsequences.join('\n') : '');
    setStandardRef(h.standardReference || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const consequences = consequencesStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingHazard) {
      await onUpdateHazard(editingHazard.id, {
        code,
        category,
        title,
        titleAr,
        description,
        potentialConsequences: consequences,
        standardReference: standardRef,
      });
    } else {
      await onCreateHazard({
        code,
        category,
        title,
        titleAr,
        description,
        potentialConsequences: consequences,
        standardReference: standardRef,
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(false);
  };

  const filteredHazards = hazards.filter((h) => {
    const matchesCategory = selectedCategory === 'ALL' || h.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || h.status === selectedStatus;
    const matchesSearch =
      !search ||
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.code.toLowerCase().includes(search.toLowerCase()) ||
      (h.titleAr && h.titleAr.includes(search)) ||
      h.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryBadge = (cat: HazardCategory) => {
    switch (cat) {
      case 'PHYSICAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'CHEMICAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'BIOLOGICAL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MECHANICAL':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'ELECTRICAL':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'ENVIRONMENTAL':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'ERGONOMIC':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'PSYCHOSOCIAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Search, Category Filter, and Add Hazard */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141e2d] p-4 rounded-2xl border border-[#27384e]">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'بحث في سجل المخاطر بالكود أو الاسم أو الوصف...'
                  : 'Search Hazard Register by code, title, category...'
              }
              className="w-full pl-9 pr-3 py-2 bg-[#0c1421] border border-[#2b3c53] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0c1421] border border-[#2b3c53] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Categories (جميع الفئات)</option>
            <option value="PHYSICAL">Physical (فيزيائي / حركي)</option>
            <option value="CHEMICAL">Chemical (كيميائي)</option>
            <option value="ELECTRICAL">Electrical (كهربائي)</option>
            <option value="MECHANICAL">Mechanical (ميكانيكي / رفع)</option>
            <option value="ENVIRONMENTAL">Environmental (بيئي / حراري)</option>
            <option value="BIOLOGICAL">Biological (بيولوجي)</option>
            <option value="ERGONOMIC">Ergonomic (أرغونومي)</option>
            <option value="PSYCHOSOCIAL">Psychosocial (نفسي اجتماعي)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0c1421] border border-[#2b3c53] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Status (جميع الحالات)</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span>{language === 'ar' ? '+ تسجيل خطر جديد' : '+ Register New Hazard'}</span>
        </button>
      </div>

      {/* Hazards Table */}
      <div className="bg-[#141e2d] rounded-2xl border border-[#27384e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#19263a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#27384e]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Hazard Title & Description</th>
                <th className="py-3 px-4">Potential Consequences</th>
                <th className="py-3 px-4">Standard Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233246]">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {language === 'ar' ? 'لا توجد مخاطر مطابقة لخيارات البحث' : 'No hazards found matching current filters.'}
                  </td>
                </tr>
              ) : (
                filteredHazards.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{h.code}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(h.category)}`}>
                        {h.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-100">{h.title}</div>
                      {h.titleAr && <div className="text-[11px] text-slate-400 font-sans" dir="rtl">{h.titleAr}</div>}
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{h.description}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {h.potentialConsequences &&
                          h.potentialConsequences.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] border border-rose-500/20">
                              {c}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300">{h.standardReference || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(h)}
                          title="Edit Hazard"
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateHazard(h.id)}
                          title="Duplicate Hazard"
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-white/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                        {h.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => onArchiveHazard(h.id)}
                            title="Archive Hazard"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">archive</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Hazard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151f2e] border border-[#2b3a4f] rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b3a4f] mb-4">
              <h3 className="font-bold text-base text-amber-300">
                {editingHazard
                  ? language === 'ar'
                    ? 'تعديل بيانات الخطر'
                    : 'Edit Hazard Record'
                  : language === 'ar'
                  ? 'تسجيل خطر جديد في السجل'
                  : 'Register New Hazard'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Hazard Code: *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Category: *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HazardCategory)}
                    className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                  >
                    <option value="PHYSICAL">PHYSICAL</option>
                    <option value="CHEMICAL">CHEMICAL</option>
                    <option value="MECHANICAL">MECHANICAL</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="ENVIRONMENTAL">ENVIRONMENTAL</option>
                    <option value="BIOLOGICAL">BIOLOGICAL</option>
                    <option value="ERGONOMIC">ERGONOMIC</option>
                    <option value="PSYCHOSOCIAL">PSYCHOSOCIAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Hazard Title (English): *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Working at Height / Fall Hazard"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Hazard Title (Arabic):</label>
                <input
                  type="text"
                  dir="rtl"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: العمل على ارتفاعات / خطر السقوط"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational details and conditions under which this hazard arises..."
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Potential Consequences (one per line):</label>
                <textarea
                  rows={2}
                  value={consequencesStr}
                  onChange={(e) => setConsequencesStr(e.target.value)}
                  placeholder="Fatal trauma&#10;Permanent disability&#10;Severe crush injury"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Standard Reference:</label>
                <input
                  type="text"
                  value={standardRef}
                  onChange={(e) => setStandardRef(e.target.value)}
                  placeholder="e.g. OSHA 1926.501 / ISO 45001 §8.1.2"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-[#2b3a4f] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-[#344862] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  Save Hazard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
