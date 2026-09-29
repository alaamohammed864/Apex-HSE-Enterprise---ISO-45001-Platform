import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const BilingualViewerModal: React.FC = () => {
  const { isBilingualViewerOpen, setIsBilingualViewerOpen, selectedDocCode, controlledDocuments, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'SIDE_BY_SIDE' | 'EN_ONLY' | 'AR_ONLY'>('SIDE_BY_SIDE');

  if (!isBilingualViewerOpen) return null;

  const currentDoc = controlledDocuments.find((d) => d.code === selectedDocCode) || controlledDocuments[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
              translate
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Bilingual Document Viewer (English / العربية)
                </h3>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-bold">
                  {currentDoc.code}
                </span>
              </div>
              <span className="text-xs text-[#45464d]">
                ISO 45001:2018 §7.5 Controlled Document Dual-Language Distribution
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab */}
            <div className="flex rounded-lg bg-white p-0.5 border border-[#c6c6cd]/30 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('SIDE_BY_SIDE')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'SIDE_BY_SIDE' ? 'bg-[#000000] text-white' : 'text-[#45464d]'
                }`}
              >
                Dual Column
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('EN_ONLY')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'EN_ONLY' ? 'bg-[#000000] text-white' : 'text-[#45464d]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('AR_ONLY')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'AR_ONLY' ? 'bg-[#000000] text-white' : 'text-[#45464d]'
                }`}
              >
                العربية
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBilingualViewerOpen(false)}
              className="p-1 rounded hover:bg-[#dce9ff] text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-[#f8f9ff]">
          {/* Formal Title Block Header */}
          <div className="p-4 rounded-xl bg-white border border-[#c6c6cd]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#006c4a]">
                Apex HSE Enterprise Controlled Repository
              </span>
              <h2 className="text-lg font-bold text-[#0b1c30] mt-0.5">{currentDoc.title}</h2>
              <div className="text-sm font-semibold text-[#006c4a] font-['Cairo'] mt-0.5">
                {currentDoc.titleAr || 'خطة السلامة والصحة المهنية المعتمدة للمشروع'}
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-[#45464d] space-y-0.5">
              <div>Revision: <strong className="text-[#0b1c30]">{currentDoc.currentRevision}</strong></div>
              <div>Effective: <strong className="text-[#0b1c30]">{currentDoc.effectiveDate}</strong></div>
              <div>Next Review: <strong className="text-[#0b1c30]">{currentDoc.nextReviewDate}</strong></div>
              <div className="text-[#006c4a] font-bold">STRICTLY CONTROLLED COPY #042</div>
            </div>
          </div>

          {/* Dual Column Legal Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-[#c6c6cd]/30 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none font-bold text-6xl text-[#0b1c30] transform -rotate-12">
              ISO 45001 CONTROLLED
            </div>

            {/* English Column */}
            {(activeTab === 'SIDE_BY_SIDE' || activeTab === 'EN_ONLY') && (
              <div className="space-y-4">
                <div className="border-b border-[#c6c6cd]/20 pb-2 flex items-center justify-between">
                  <span className="font-bold text-[#0b1c30] text-sm">English Master Text</span>
                  <span className="font-mono text-[10px] text-[#45464d]">Version 3.0 Legally Binding</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-[#0b1c30]">
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#006c4a] mb-1">
                      1.0 Scope &amp; Commitment
                    </h4>
                    <p>
                      This Environmental, Health and Safety Plan applies to all personnel, contractors, and visiting authorities operating across the Ras Laffan Petrochemical EPC-4 Package. All operations must strictly conform to ISO 45001:2018 and Qatar Energy HSE guidelines.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#006c4a] mb-1">
                      2.0 Hazard Identification &amp; ALARP Principle
                    </h4>
                    <p>
                      No activity shall commence until all inherent hazards are recorded in the 5x5 Matrix and reduced to As Low As Reasonably Practicable (ALARP). Work must immediately stop if atmospheric sensors detect toxic gases above TLV thresholds.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#006c4a] mb-1">
                      3.0 Permit to Work (PTW) Governance
                    </h4>
                    <p>
                      High-risk operations including confined space entry, heavy tandem crane lifting (&gt;50t), and hot work require dual certification from both the Area HSE Supervisor and the Appointed Competency Authority prior to field execution.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Arabic Column */}
            {(activeTab === 'SIDE_BY_SIDE' || activeTab === 'AR_ONLY') && (
              <div className="space-y-4 text-right font-['Cairo']" dir="rtl">
                <div className="border-b border-[#c6c6cd]/20 pb-2 flex items-center justify-between">
                  <span className="font-bold text-[#0b1c30] text-sm">النص العربي المعتمد</span>
                  <span className="font-mono text-[10px] text-[#45464d]">مراجعة رسمية 3.0</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-[#0b1c30]">
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#006c4a] mb-1">
                      1.0 النطاق والالتزام المؤسسي
                    </h4>
                    <p>
                      تسري خطة البيئة والصحة والسلامة هذه على جميع العاملين والمقاولين والجهات الزائرة العاملة ضمن حزمة توسعة راس لفان للبتروكيماويات (EPC-4). يجب أن تتوافق جميع العمليات توافقًا صارمًا مع متطلبات مواصفة الأيزو 45001:2018 وإرشادات قطر للطاقة.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#006c4a] mb-1">
                      2.0 تحديد المخاطر ومبدأ ALARP
                    </h4>
                    <p>
                      يحظر بدء أي نشاط عمل ما لم تُسجَّل المخاطر الكامنة في مصفوفة المخاطر 5x5 وتُخفَّض إلى أدنى حد ممكن عمليًا (ALARP). يجب إيقاف العمل فورًا عند رصد أجهزة الاستشعار غازات سامة تتجاوز الحدود المسموح بها.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#006c4a] mb-1">
                      3.0 حوكمة تصاريح العمل (PTW)
                    </h4>
                    <p>
                      تتطلب العمليات ذات الخطورة العالية بما في ذلك دخول الأماكن المغلقة، وأعمال الرفع بالرافعات المزدوجة (&gt; 50 طن)، والأعمال الساخنة؛ مصادقة مزدوجة من مشرف السلامة بالمنطقة وجهة الاختصاص المعينة قبل مباشرة التنفيذ الميداني.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Digital Sign-off Signatures Block */}
          <div className="p-4 rounded-xl bg-white border border-[#c6c6cd]/30 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 text-xs">
              <span className="font-bold text-[#0b1c30] block">Prepared by:</span>
              <span className="text-[#45464d] block mt-1">Eng. Liam Vance (Process Safety)</span>
              <div className="text-[10px] text-[#006c4a] font-mono mt-2 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span> 2024-01-14 08:30 AST
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 text-xs">
              <span className="font-bold text-[#0b1c30] block">Reviewed &amp; Endorsed:</span>
              <span className="text-[#45464d] block mt-1">Dr. Tariq Al-Mansoor (HSE Director)</span>
              <div className="text-[10px] text-[#006c4a] font-mono mt-2 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span> 2024-01-15 10:15 AST
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 text-xs">
              <span className="font-bold text-[#0b1c30] block">Client Authority Sign-Off:</span>
              <span className="text-[#45464d] block mt-1">Qatar Energy EPC-4 Project Director</span>
              <div className="text-[10px] text-[#006c4a] font-mono mt-2 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span> 2024-01-15 14:00 AST
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#eff4ff] border-t border-[#c6c6cd]/20 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[#45464d]">
            Cryptographic SHA-256 Ledger: Validated
          </span>
          <button
            type="button"
            onClick={() => {
              setIsBilingualViewerOpen(false);
              showToast('Bilingual document export completed');
            }}
            className="px-4 py-1.5 rounded-lg bg-[#000000] text-white font-semibold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
