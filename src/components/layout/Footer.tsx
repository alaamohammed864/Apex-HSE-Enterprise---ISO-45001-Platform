import React from 'react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { t, language } = useApp();

  return (
    <footer
      className={`w-full bg-[#ffffff] px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-[#c6c6cd]/30 text-[11px] font-mono transition-all z-30 ${
        language === 'ar' ? 'lg:pr-72 pr-4 pl-4' : 'lg:pl-72 pl-4 pr-4'
      }`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
          <span className="text-[#0b1c30] font-semibold">{t.footerIsoBadge}</span>
        </div>

        <span className="text-[#c6c6cd] text-xs">|</span>

        <div className="flex items-center gap-1 text-[#45464d]">
          <span className="material-symbols-outlined text-[14px] text-[#006c4a]">cloud_done</span>
          <span>{t.footerDbSync}</span>
        </div>

        <span className="text-[#c6c6cd] text-xs">|</span>

        <div className="flex items-center gap-1 text-[#45464d]">
          <span className="material-symbols-outlined text-[14px] text-[#006c4a]">verified_user</span>
          <span>{t.footerWorm}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[#45464d] flex-wrap">
        <span>{t.footerLocation}</span>
        <span className="text-[#c6c6cd] text-xs">|</span>
        <span>{t.footerCopyright}</span>
        <span className="text-[#c6c6cd] text-xs">|</span>
        <span className="inline-flex items-center gap-1 text-[#006c4a]">
          <span className="text-[#45464d]">{t.developedBy || 'Developed by'}</span>
          <strong className="text-[#0b1c30] font-semibold tracking-wide">AENG ALAA MOHAMMED</strong>
        </span>
      </div>
    </footer>
  );
};
