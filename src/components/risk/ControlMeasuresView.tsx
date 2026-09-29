import React, { useState } from 'react';
import { ControlMeasureItem, HierarchyControlLevel } from '../../types/risk';

interface ControlMeasuresViewProps {
  controlMeasures: ControlMeasureItem[];
  onCreateControl: (data: Omit<ControlMeasureItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateControl: (id: string, updates: Partial<ControlMeasureItem>) => Promise<void>;
  onArchiveControl: (id: string) => Promise<void>;
  language: 'en' | 'ar';
}

export const ControlMeasuresView: React.FC<ControlMeasuresViewProps> = ({
  controlMeasures,
  onCreateControl,
  onUpdateControl,
  onArchiveControl,
  language,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<ControlMeasureItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyControlLevel>('ENGINEERING');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [typicalEffectiveness, setTypicalEffectiveness] = useState<number>(80);

  const openCreateModal = () => {
    setEditingControl(null);
    const nextSeq = Math.floor(Math.random() * 900) + 100;
    setCode(`CTRL-ENG-${nextSeq}`);
    setHierarchyLevel('ENGINEERING');
    setTitle('');
    setTitleAr('');
    setDescription('');
    setVerificationMethod('Pre-shift inspection log signed by certified engineer.');
    setTypicalEffectiveness(85);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ControlMeasureItem) => {
    setEditingControl(c);
    setCode(c.code);
    setHierarchyLevel(c.hierarchyLevel);
    setTitle(c.title);
    setTitleAr(c.titleAr || '');
    setDescription(c.description);
    setVerificationMethod(c.verificationMethod);
    setTypicalEffectiveness(c.typicalEffectiveness);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingControl) {
      await onUpdateControl(editingControl.id, {
        code,
        hierarchyLevel,
        title,
        titleAr,
        description,
        verificationMethod,
        typicalEffectiveness,
      });
    } else {
      await onCreateControl({
        code,
        hierarchyLevel,
        title,
        titleAr,
        description,
        verificationMethod,
        typicalEffectiveness,
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(false);
  };

  const filteredControls = controlMeasures.filter((c) => {
    const matchesLevel = selectedLevel === 'ALL' || c.hierarchyLevel === selectedLevel;
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.titleAr && c.titleAr.includes(search)) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getHierarchyBadge = (lvl: HierarchyControlLevel) => {
    switch (lvl) {
      case 'ELIMINATION':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SUBSTITUTION':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'ENGINEERING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'ADMINISTRATIVE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PPE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Hierarchy of Controls Explainer Banner */}
      <div className="bg-[#141e2d] p-4 rounded-2xl border border-[#27384e]">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">layers</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {language === 'ar' ? 'تدرج هرم السيطرة والتحكم الهندسي (ISO 45001 §8.1.2)' : 'Hierarchy of Controls (ISO 45001 §8.1.2)'}
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            { lvl: '1. ELIMINATION', ar: '1. الإزالة المادية', desc: 'Physically remove the hazard (100% effective)', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
            { lvl: '2. SUBSTITUTION', ar: '2. الاستبدال', desc: 'Replace hazard with safer alternative (90-95%)', color: 'border-teal-500 bg-teal-500/10 text-teal-300' },
            { lvl: '3. ENGINEERING', ar: '3. العزل والتحكم الهندسي', desc: 'Isolate people from hazard (80-90%)', color: 'border-amber-500 bg-amber-500/10 text-amber-300' },
            { lvl: '4. ADMINISTRATIVE', ar: '4. التحكم الإداري و PTW', desc: 'Change the way people work (60-75%)', color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
            { lvl: '5. PPE', ar: '5. مهمات الوقاية الشخصية', desc: 'Protect worker with PPE equipment (40-60%)', color: 'border-purple-500 bg-purple-500/10 text-purple-300' },
          ].map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border ${item.color}`}>
              <div className="font-bold text-[11px] mb-0.5">{language === 'ar' ? item.ar : item.lvl}</div>
              <div className="text-[10px] opacity-80">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141e2d] p-4 rounded-2xl border border-[#27384e]">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
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
                  ? 'بحث في ضوابط التحكم بالكود أو العنوان...'
                  : 'Search Control Measures by code or title...'
              }
              className="w-full pl-9 pr-3 py-2 bg-[#0c1421] border border-[#2b3c53] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-[#0c1421] border border-[#2b3c53] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Hierarchy Levels (كافة المستويات)</option>
            <option value="ELIMINATION">1. Elimination (الإزالة)</option>
            <option value="SUBSTITUTION">2. Substitution (الاستبدال)</option>
            <option value="ENGINEERING">3. Engineering Controls (التحكم الهندسي)</option>
            <option value="ADMINISTRATIVE">4. Administrative Controls (التحكم الإداري)</option>
            <option value="PPE">5. PPE (مهمات الوقاية)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add_moderator</span>
          <span>{language === 'ar' ? '+ إضافة تدبير تحكم' : '+ Register Control Measure'}</span>
        </button>
      </div>

      {/* Control Measures Table */}
      <div className="bg-[#141e2d] rounded-2xl border border-[#27384e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#19263a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#27384e]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Hierarchy Level</th>
                <th className="py-3 px-4">Barrier Title & Description</th>
                <th className="py-3 px-4">Verification Method</th>
                <th className="py-3 px-4">Effectiveness</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233246]">
              {filteredControls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {language === 'ar' ? 'لا توجد تدابير تحكم مطابقة' : 'No control measures found.'}
                  </td>
                </tr>
              ) : (
                filteredControls.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{c.code}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getHierarchyBadge(c.hierarchyLevel)}`}>
                        {c.hierarchyLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-100">{c.title}</div>
                      {c.titleAr && <div className="text-[11px] text-slate-400 font-sans" dir="rtl">{c.titleAr}</div>}
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{c.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-300 max-w-xs">{c.verificationMethod}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${c.typicalEffectiveness}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-emerald-300 font-bold">
                          {c.typicalEffectiveness}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          title="Edit Control"
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        {c.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => onArchiveControl(c.id)}
                            title="Archive Control"
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

      {/* Create / Edit Control Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151f2e] border border-[#2b3a4f] rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b3a4f] mb-4">
              <h3 className="font-bold text-base text-amber-300">
                {editingControl
                  ? language === 'ar'
                    ? 'تعديل تدبير التحكم'
                    : 'Edit Control Measure'
                  : language === 'ar'
                  ? 'تسجيل تدبير تحكم جديد'
                  : 'Register New Control Measure'}
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
                  <label className="block text-slate-300 mb-1">Control Code: *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Hierarchy Level: *</label>
                  <select
                    value={hierarchyLevel}
                    onChange={(e) => setHierarchyLevel(e.target.value as HierarchyControlLevel)}
                    className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                  >
                    <option value="ELIMINATION">1. ELIMINATION</option>
                    <option value="SUBSTITUTION">2. SUBSTITUTION</option>
                    <option value="ENGINEERING">3. ENGINEERING</option>
                    <option value="ADMINISTRATIVE">4. ADMINISTRATIVE</option>
                    <option value="PPE">5. PPE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Control Title (English): *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hydraulic Slide-Rail Trench Shoring Box"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Control Title (Arabic):</label>
                <input
                  type="text"
                  dir="rtl"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: صناديق تدعيم هيدروليكية ذات سكة انزلاقية"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical specifications, load limits, equipment parameters..."
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Verification Method: *</label>
                <input
                  type="text"
                  required
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value)}
                  placeholder="e.g. Third-party structural certificate & daily pre-shift inspection"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Typical Effectiveness (%): {typicalEffectiveness}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={typicalEffectiveness}
                  onChange={(e) => setTypicalEffectiveness(parseInt(e.target.value) || 80)}
                  className="w-full"
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
                  Save Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
