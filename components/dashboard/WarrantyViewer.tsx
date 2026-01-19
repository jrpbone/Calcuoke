import React from 'react';
import { Category, KaraokeProject } from '../../data/types';

interface WarrantyViewerProps {
  project: KaraokeProject;
  docRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
  formatLongDate: (dateStr: string) => string;
}

const WarrantyViewer: React.FC<WarrantyViewerProps> = ({
  project,
  docRef,
  onClose,
  onPrint,
  onDownload,
  formatLongDate
}) => (
  <div className="fixed inset-0 z-[700] flex items-center justify-center p-8">
    <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={onClose}></div>
    <div className="relative w-full max-w-4xl h-full flex flex-col gap-4">
      <div className="flex justify-between items-center bg-[#1a1b2e] p-5 rounded-[24px] border border-white/10 shadow-2xl shrink-0">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em]">Official Registry</span>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">{project.buyerName}'s Certificate</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={onPrint} className="px-6 py-3 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg">
            <span className="material-symbols-outlined text-[18px]">print</span> Print
          </button>
          <button onClick={onDownload} className="px-8 py-3 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20">
            <span className="material-symbols-outlined text-[18px]">download</span> Save PDF
          </button>
          <button onClick={onClose} className="size-11 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all border border-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-200/50 p-8 rounded-[32px] flex justify-center shadow-inner custom-scrollbar">
        <div ref={docRef} className="bg-white w-full max-w-[816px] p-10 flex flex-col text-black shadow-2xl font-sans relative" style={{ color: '#000000', height: '10in', overflow: 'hidden' }}>
          <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

          <div className="text-center mb-6 pt-2">
            <h1 className="text-3xl font-black uppercase tracking-[-0.04em] leading-none m-0 p-0" style={{ color: '#000' }}>WARRANTY CERTIFICATE</h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-[1.5px] bg-black/20 w-10"></div>
              <p className="text-[9px] font-black tracking-[0.4em] uppercase" style={{ color: '#000' }}>AUTHORIZED SYSTEM RECORD &bull; OFFICIAL REGISTRY</p>
              <div className="h-[1.5px] bg-black/20 w-10"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="flex flex-col gap-0.5 border-l-[4px] border-black pl-4">
              <h3 className="text-[8.5px] font-black uppercase opacity-60 tracking-widest mb-1.5">CLIENT IDENTITY</h3>
              <div className="text-2xl font-black leading-tight tracking-tighter" style={{ color: '#000' }}>{project.buyerName}</div>
              <div className="text-[10px] font-bold leading-relaxed opacity-85 truncate max-w-[340px]" style={{ color: '#000' }}>{project.buyerAddress}</div>
            </div>
            <div className="text-right flex flex-col justify-between items-end">
              <div className="flex flex-col items-end">
                <h3 className="text-[8.5px] font-black uppercase opacity-60 tracking-widest mb-1">RECORD IDENTIFIER</h3>
                <div className="text-lg font-black font-mono tracking-tighter" style={{ color: '#000' }}>#{project.invoiceNumber}</div>
              </div>
              <div className="text-[10px] font-black uppercase bg-black text-white px-3 py-1.5 rounded tracking-[0.1em]">
                ISSUED: {formatLongDate(project.createdDate)}
              </div>
            </div>
          </div>

          <div className="border-[2px] border-black p-5 rounded-2xl mb-6 bg-gray-50/60">
            <h4 className="text-[12px] font-black uppercase mb-3 flex items-center gap-2 tracking-[0.1em]">
              <span className="w-1.5 h-3.5 bg-black"></span>
              General Coverage & Liability Policy
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                <strong>7-DAY REPLACEMENT WINDOW:</strong> Electronic system components, specifically the <strong>Karaoke Player, Digital Amplifier, and LED TV</strong>, are eligible for a strict one-time factory defect exchange within seven (7) days of issuance. Units must be returned in pristine physical condition with original packaging.
              </p>
              <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                <strong>3-MONTH LIMITED SERVICE:</strong> Following the initial replacement period, eligible units are covered by a <strong>Service Warranty</strong> for three (3) months. This covers internal circuit failure and firmware issues. Service labor is included, however, specialized part replacements after 7 days may incur costs.
              </p>
              <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                <strong>EXCLUSIONS & VOIDS:</strong> The <strong>Videoke Chassis</strong> (housing/cabinet) and peripheral accessories (cables, remotes) are sold <strong>AS-IS</strong> with no warranty. Coverage is immediately VOIDED by evidence of: physical impact, moisture exposure, power surge damage, or unauthorized seal tampering.
              </p>
              <p className="text-[9.5px] leading-snug font-bold" style={{ color: '#000' }}>
                <strong>OPERATIONAL GUIDELINES:</strong> Damage resulting from improper ventilation, excessive heat, or neglect during transport is not covered. Claims must be filed by the original client named above and presented with this official certificate.
              </p>
            </div>
          </div>

          <div className="flex-grow overflow-hidden">
            <div className="flex items-center gap-2 mb-2 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: '#000' }}>Serialized Asset Ledger</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-y-[2px] border-black">
                  <th className="text-left py-2 px-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#000' }}>Hardware Description</th>
                  <th className="text-center py-2 px-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#000' }}>Serial / Identifier</th>
                  <th className="text-right py-2 px-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#000' }}>Warranty Term</th>
                </tr>
              </thead>
              <tbody>
                {[...(project.originalComponents || project.components)].sort((a, b) => {
                  const getP = (cat: Category) => {
                    if ([Category.PLAYER, Category.AMPLIFIER, Category.TV].includes(cat)) return 1;
                    if (cat === Category.MIC) return 2;
                    if (cat === Category.CHASSIS) return 3;
                    return 4;
                  };
                  return getP(a.category) - getP(b.category);
                }).map((item, idx) => {
                  const hasTechWarranty = [Category.PLAYER, Category.AMPLIFIER, Category.TV].includes(item.category);
                  const isChassis = item.category === Category.CHASSIS;
                  let termLabel = hasTechWarranty ? "90 Days Service" : "7 Days Exchange";
                  if (isChassis) termLabel = "No Warranty";

                  return (
                    <tr key={idx} className="border-b border-black/10">
                      <td className="py-2.5 px-1">
                        <div className="font-black text-[12px] leading-none uppercase tracking-tight" style={{ color: '#000' }}>{item.name}</div>
                        <div className="text-[9px] font-bold opacity-60 uppercase mt-1" style={{ color: '#000' }}>{item.category} &bull; {item.brand}</div>
                      </td>
                      <td className="py-2.5 px-1 text-center font-mono text-[10px] font-black uppercase tracking-widest" style={{ color: '#000' }}>{item.sku}</td>
                      <td className="py-2.5 px-1 text-right font-black text-[10px] uppercase opacity-80" style={{ color: '#000' }}>{termLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-auto pt-10">
            <div className="flex justify-between items-end mb-6 px-4">
              <div className="w-72 text-center">
                <div className="border-b-[2px] border-black pb-1.5 mb-2 h-8">
                  {/* Signatory line empty as requested */}
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70" style={{ color: '#000' }}>AUTHORIZED SYSTEM SIGNATORY</p>
              </div>

              <div className="w-72 text-center">
                <div className="border-b-[2px] border-black pb-1.5 mb-2 h-8 flex items-center justify-center">
                  <span className="text-[22px] font-black uppercase tracking-tighter opacity-100" style={{ color: '#000' }}>{project.buyerName}</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70" style={{ color: '#000' }}>CLIENT SIGNATURE</p>
              </div>
            </div>

            <div className="border-t-[1px] border-black/15 pt-4 text-center">
              <div className="flex justify-center items-center gap-8 opacity-35 grayscale">
                <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>NON-TRANSFERABLE</span>
                <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>&bull;</span>
                <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>VOID IF TAMPERED</span>
                <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>&bull;</span>
                <span className="text-[8.5px] font-black uppercase tracking-[0.5em]" style={{ color: '#000' }}>RECORD v5.0 GENUINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default WarrantyViewer;
