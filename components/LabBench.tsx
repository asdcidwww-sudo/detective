
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { GameStep as GameStepType } from '../types';
import { EVIDENCE_DNA_PROFILE } from '../constants';

interface LabBenchProps {
  step: GameStepType;
  onCompleteStep: () => void;
}

export const LabBench: React.FC<LabBenchProps> = ({ step, onCompleteStep }) => {
  const [progress, setProgress] = useState(0);
  const [labState, setLabState] = useState<'idle' | 'mixing' | 'running' | 'done'>('idle');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, r: number}>>([]);

  // Reset local state when step changes
  useEffect(() => {
    setProgress(0);
    setLabState('idle');
    
    if (step === GameStepType.EXTRACTION) {
      setParticles(Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 60 + Math.random() * 30,
        r: Math.random() * 360
      })));
    }
  }, [step]);

  const handleMix = () => {
    setLabState('mixing');
    let p = 0;
    const interval = setInterval(() => {
      p += 1; 
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setLabState('done');
      }
    }, 50);
  };

  const handleRunElectrophoresis = () => {
    setLabState('running');
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setLabState('done');
      }
    }, 60); // 6 seconds for the run
  };

  if (step === GameStepType.SCENE_INVESTIGATION) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-fade-in bg-slate-900/80 backdrop-blur rounded-xl border border-slate-700 mx-4">
        <h2 className="text-3xl font-bold text-amber-500 font-serif">現場搜查</h2>
        <p className="text-lg text-slate-300 max-w-2xl">
          金顯微鏡不見了！仔細觀察桌子，點擊任何看起來像是生物證據的東西。
        </p>
        
        <div className="relative w-80 h-80 bg-slate-800 rounded-full border-8 border-slate-700 flex items-center justify-center shadow-2xl overflow-hidden cursor-pointer group hover:border-amber-500/50 transition-colors" onClick={onCompleteStep}>
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
           <div className="absolute top-10 left-10 w-16 h-20 bg-slate-600/50 rounded rotate-12 blur-[1px]"></div>
           <div className="absolute bottom-12 right-20 w-24 h-4 bg-slate-500/50 rounded -rotate-45 blur-[1px]"></div>

           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300">
               <div className="w-2 h-24 bg-white shadow-sm mx-auto translate-y-8 rotate-12"></div>
               <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-600 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] relative z-10 -translate-y-2">
                  <div className="absolute top-2 left-3 w-4 h-3 bg-white/40 rounded-full rotate-[-20deg]"></div>
               </div>
           </div>
           
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity backdrop-blur-[2px]">
              <span className="text-white font-bold bg-amber-600 px-4 py-2 rounded-full shadow-lg border border-amber-400 animate-bounce">🖐️ 收集證據!</span>
           </div>
        </div>
      </div>
    );
  }

  if (step === GameStepType.EXTRACTION) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 bg-slate-900/90 backdrop-blur absolute inset-0 z-20">
        <h2 className="text-3xl font-bold text-amber-500 font-serif">實驗室：DNA 提取</h2>
        
        <div className="flex gap-8 items-center justify-center min-h-[300px]">
            <div className={`w-32 h-64 border-[6px] border-slate-300 rounded-b-[3rem] relative overflow-hidden bg-slate-800/30 backdrop-blur-sm shadow-2xl transition-transform duration-100 ${labState === 'mixing' ? 'animate-shake' : ''}`}>
                <div 
                  className="absolute bottom-0 w-full bg-green-500/80 transition-all duration-300 ease-out border-t border-green-300/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                  style={{ height: labState === 'done' ? '85%' : `${30 + (progress * 0.55)}%` }}
                >
                  {labState === 'mixing' && (
                    <div className="w-full h-full absolute inset-0 animate-pulse bg-green-400/30"></div>
                  )}
                </div>

                <div className="absolute inset-0 pointer-events-none">
                   {particles.map((p, i) => {
                     let cellOpacity = 1;
                     if (progress > 30) cellOpacity = 1 - ((progress - 30) / 40);
                     if (cellOpacity < 0) cellOpacity = 0;

                     let cellScale = 1;
                     if (progress > 30 && progress < 60) cellScale = 1 + ((progress - 30) / 30) * 0.5;

                     let dnaOpacity = 0;
                     if (progress > 60) dnaOpacity = ((progress - 60) / 40);
                     
                     const jitterX = labState === 'mixing' ? (Math.random() - 0.5) * 10 : 0;
                     const jitterY = labState === 'mixing' ? (Math.random() - 0.5) * 10 : 0;

                     return (
                       <React.Fragment key={p.id}>
                         <div 
                            className="absolute rounded-full border-2 border-pink-400 bg-pink-300/80 flex items-center justify-center transition-opacity duration-300 shadow-sm"
                            style={{
                              left: `${p.x + jitterX}%`,
                              top: `${p.y + jitterY}%`,
                              width: '16px',
                              height: '16px',
                              opacity: cellOpacity,
                              transform: `scale(${cellScale}) rotate(${p.r}deg)`,
                            }}
                         >
                            <div className="w-2 h-2 bg-pink-700 rounded-full opacity-60"></div>
                         </div>

                         <div 
                            className="absolute text-xl transition-all duration-500 animate-pulse"
                            style={{
                              left: `${p.x}%`,
                              top: `${p.y - (progress > 80 ? 20 : 0)}%`,
                              opacity: dnaOpacity,
                              transform: `rotate(${p.r}deg)`,
                              filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.8))'
                            }}
                         >
                            🧬
                         </div>
                       </React.Fragment>
                     );
                   })}
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-4 z-10">
          <p className="text-xl text-slate-200 font-bold drop-shadow-md">
            {labState === 'idle' ? "加入裂解液來打破細胞膜！" : labState === 'done' ? "提取完成！DNA 已釋放。" : "正在混合..."}
          </p>
          {labState === 'idle' && (
             <Button onClick={handleMix} className="text-lg px-8 py-4 !bg-green-600 hover:!bg-green-500 shadow-[0_0_20px_rgba(22,163,74,0.4)] border-2 border-green-400">
               🧪 加入試劑並混合
             </Button>
          )}
          {labState === 'done' && (
             <Button onClick={onCompleteStep} className="!text-lg animate-bounce-subtle">
               下一步, DNA電泳 &rarr;
             </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === GameStepType.PCR_GEL) {
    return (
       <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 bg-slate-900/90 backdrop-blur absolute inset-0 z-20">
        <h2 className="text-3xl font-bold text-amber-500 font-serif">凝膠電泳：DNA 賽跑</h2>
        
        <div className="relative w-full max-w-lg">
           {/* Electrophoresis Tank */}
           <div className="relative w-full aspect-[4/3] bg-blue-900/20 border-4 border-slate-600 rounded-xl overflow-hidden shadow-inner flex flex-col">
              
              {/* Negative Electrode (Top) */}
              <div className="h-4 bg-slate-800 flex items-center justify-between px-8">
                 <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white">-</div>
                 <div className="flex-1 h-0.5 bg-slate-700 mx-4"></div>
                 <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white">-</div>
              </div>

              {/* Gel Chamber */}
              <div className="flex-1 relative flex justify-center py-4">
                 {/* The Gel Block */}
                 <div className="w-2/3 h-full bg-blue-400/20 border border-blue-400/30 rounded-sm relative shadow-[inset_0_0_30px_rgba(59,130,246,0.1)] overflow-hidden">
                    
                    {/* Wells at the top */}
                    <div className="absolute top-2 left-0 right-0 flex justify-around px-4">
                       {[0, 1, 2].map(i => (
                         <div key={i} className="w-8 h-4 bg-slate-900/60 rounded-sm border border-slate-700/50"></div>
                       ))}
                    </div>

                    {/* Animated DNA Bands in the center lane (Evidence) */}
                    <div className="absolute inset-0 flex justify-center">
                       <div className="w-8 h-full relative">
                          {EVIDENCE_DNA_PROFILE.map((finalPos, idx) => {
                             const currentPos = (progress / 100) * finalPos;
                             return (
                               <div 
                                 key={idx} 
                                 className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full transition-all duration-75 ease-linear"
                                 style={{ top: `${currentPos}%`, opacity: progress > 5 ? 1 : 0 }}
                               />
                             );
                          })}
                       </div>
                    </div>

                    {/* Electrolysis Bubbles (Bottom) */}
                    {labState === 'running' && (
                       <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
                          {Array.from({length: 15}).map((_, i) => (
                             <div 
                                key={i}
                                className="absolute bottom-0 w-1 h-1 bg-white/40 rounded-full animate-[ping_1s_infinite]"
                                style={{ 
                                  left: `${Math.random() * 100}%`, 
                                  animationDelay: `${Math.random() * 2}s`,
                                  bottom: `${Math.random() * 20}px`
                                }}
                             ></div>
                          ))}
                       </div>
                    )}
                 </div>
              </div>

              {/* Positive Electrode (Bottom) */}
              <div className="h-4 bg-red-900/40 flex items-center justify-between px-8">
                 <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] font-bold text-white">+</div>
                 <div className="flex-1 h-0.5 bg-red-700/50 mx-4"></div>
                 <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] font-bold text-white">+</div>
              </div>

              {/* Voltmeter HUD */}
              <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded font-mono text-xs text-green-400 flex flex-col items-end border border-white/10">
                 <div>電壓: {labState === 'running' ? '120V' : '0V'}</div>
                 <div>計時: {Math.floor(progress / 10)}s</div>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-4">
           <p className="text-xl text-slate-200 font-bold">
             {labState === 'idle' ? "啟動電場，讓 DNA 跑起來！" : labState === 'done' ? "電泳完成！" : "正在跑膠 (DNA 遷移中)..."}
           </p>
           {labState === 'idle' && (
             <Button onClick={handleRunElectrophoresis} className="text-lg px-8 py-4 !bg-blue-600 hover:!bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] border-2 border-blue-400">
               ⚡ 開啟 120V 高壓電泳
             </Button>
           )}
           {labState === 'done' && (
             <Button onClick={onCompleteStep} className="!text-lg animate-bounce-subtle">
               查看結果 &rarr;
             </Button>
           )}
        </div>
       </div>
    );
  }

  return <div>實驗室工作已完成。</div>;
};
