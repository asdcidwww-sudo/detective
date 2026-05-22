
import React, { useState } from 'react';
import { SUSPECTS, EVIDENCE_DNA_PROFILE } from '../constants';
import { Button } from './Button';

interface SuspectsBoardProps {
  onIdentify: (suspectId: number) => void;
}

export const SuspectsBoard: React.FC<SuspectsBoardProps> = ({ onIdentify }) => {
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);

  const renderGelLane = (bands: number[], label: string, isEvidence: boolean = false) => (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-16 h-64 bg-slate-900 rounded-lg relative overflow-hidden shadow-inner ${isEvidence ? 'border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'border border-slate-600'}`}>
        {bands.map((pos, idx) => (
          <div 
            key={idx} 
            className={`absolute w-10 h-1.5 left-3 rounded-sm ${isEvidence ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-blue-400 opacity-80'}`}
            style={{ top: `${pos}%` }}
          />
        ))}
      </div>
      <span className={`text-xs font-bold ${isEvidence ? 'text-green-500' : 'text-slate-400'}`}>{label}</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-slate-900/90 text-slate-100">
       <h2 className="text-3xl font-bold text-amber-500 font-serif mb-6 text-center">DNA 條帶分析</h2>
       <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">對比犯罪現場證據的條帶位置和嫌疑人的條帶。完全吻合的才是真兇。</p>
       
       <div className="flex flex-wrap justify-center gap-8 mb-8">
          {/* Evidence Lane */}
          <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-green-500/30">
             <h3 className="text-center font-bold text-green-400 mb-4">犯罪現場證據</h3>
             {renderGelLane(EVIDENCE_DNA_PROFILE, "證據", true)}
          </div>

          <div className="flex items-center text-slate-500 font-serif italic text-2xl">VS</div>

          {/* Suspect Lanes */}
          <div className="flex gap-4 bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700">
             {SUSPECTS.map(suspect => (
               <div key={suspect.id} onClick={() => setSelectedSuspect(suspect.id)} className={`cursor-pointer p-2 rounded-lg transition-colors ${selectedSuspect === suspect.id ? 'bg-blue-900/50 ring-2 ring-blue-500' : 'hover:bg-slate-700'}`}>
                 {renderGelLane(suspect.dnaProfile, `嫌疑人 ${suspect.id}`)}
               </div>
             ))}
          </div>
       </div>

       {/* Suspect Details */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-24">
         {SUSPECTS.map(suspect => (
           <div key={suspect.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedSuspect === suspect.id ? 'border-blue-500 bg-blue-900/20 shadow-lg scale-105 z-10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
             <h3 className="font-bold text-lg text-amber-100">{suspect.name}</h3>
             <p className="text-sm text-slate-400 mt-2">{suspect.description}</p>
             
             {selectedSuspect === suspect.id && (
               <div className="mt-4 animate-fade-in space-y-3">
                 <div className="bg-slate-900/60 p-3 rounded border border-slate-600/50">
                    <h4 className="text-amber-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                      <span className="text-lg">🕵️</span> 
                      作案動機檔案
                    </h4>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{suspect.motive}"</p>
                 </div>
                 <Button className="w-full !bg-amber-600 hover:!bg-amber-700 shadow-lg" onClick={() => onIdentify(suspect.id)}>
                   👉 指認為兇手
                 </Button>
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};
