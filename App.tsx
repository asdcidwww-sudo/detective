
import React, { useState, useEffect } from 'react';
import { StoryScene } from './components/StoryScene';
import { SuspectsBoard } from './components/SuspectsBoard';
import { ChatAssistant } from './components/ChatAssistant';
import { ImageGenerator } from './components/ImageGenerator';
import { LabBench } from './components/LabBench';
import { Button } from './components/Button';
import { GameStep } from './types';
import { STORY_STAGES } from './constants';
import { prewarmAllBackgrounds } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<GameStep>(GameStep.INTRO);
  const [isLabMode, setIsLabMode] = useState(false);
  const [culpritFound, setCulpritFound] = useState<boolean | null>(null);
  const [showImageGen, setShowImageGen] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  useEffect(() => {
    prewarmAllBackgrounds();
  }, []);

  const advanceGameStep = () => {
    switch (currentStep) {
      case GameStep.INTRO: setCurrentStep(GameStep.SCENE_INVESTIGATION); break;
      case GameStep.SCENE_INVESTIGATION: setCurrentStep(GameStep.EXTRACTION); break;
      case GameStep.EXTRACTION: setCurrentStep(GameStep.PCR_GEL); break;
      case GameStep.PCR_GEL: setCurrentStep(GameStep.ANALYSIS); break;
      default: break;
    }
  };

  const handleStoryComplete = () => {
    setAiHint(null);
    if ([GameStep.SCENE_INVESTIGATION, GameStep.EXTRACTION, GameStep.PCR_GEL].includes(currentStep)) {
      setIsLabMode(true);
    } else {
      advanceGameStep();
    }
  };

  const handleLabComplete = () => {
    setIsLabMode(false);
    advanceGameStep();
  };

  const handleIdentify = (id: number) => {
    const isCorrect = id === 2;
    setCulpritFound(isCorrect);
    setCurrentStep(GameStep.CONCLUSION);
  };

  const resetGame = () => {
    setCurrentStep(GameStep.INTRO);
    setIsLabMode(false);
    setCulpritFound(null);
    setShowImageGen(false);
    setAiHint(null);
  };

  const handleMistake = (explanation: string) => {
    setAiHint(`🤔 ${explanation}`);
  };

  const handleCorrect = (explanation: string) => {
    setAiHint(`✅ ${explanation}`);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      <main className="flex-1 flex flex-col relative h-full overflow-hidden transition-all duration-300 md:mr-0">
        <header className="bg-slate-900 border-b border-slate-700 p-4 shadow-md flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
             <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">🧬</span>
             <h1 className="text-xl font-bold font-serif text-amber-500 hidden sm:block tracking-wide">
               DNA 偵探 <span className="text-slate-500 text-sm font-sans font-normal ml-2">金顯微鏡之謎</span>
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {currentStep !== GameStep.INTRO && (
               <Button 
                 variant="secondary" 
                 onClick={() => setShowImageGen(!showImageGen)}
                 className="!py-1 !px-3 text-sm !bg-slate-800 !text-slate-300 !border-slate-600 hover:!bg-slate-700"
               >
                 {showImageGen ? "返回案件" : "🎨 嫌疑人拼圖"}
               </Button>
            )}
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-black">
          {showImageGen ? (
            <ImageGenerator onBack={() => setShowImageGen(false)} />
          ) : (
            <>
              {(currentStep === GameStep.INTRO || 
                currentStep === GameStep.SCENE_INVESTIGATION || 
                currentStep === GameStep.EXTRACTION || 
                currentStep === GameStep.PCR_GEL) && (
                <div className={`w-full h-full transition-opacity duration-500 ${isLabMode ? 'opacity-20 pointer-events-none filter blur-sm' : 'opacity-100'}`}>
                   <StoryScene 
                    stage={STORY_STAGES[currentStep]} 
                    onComplete={handleStoryComplete}
                    onMistake={handleMistake}
                    onCorrect={handleCorrect}
                  />
                </div>
              )}

              {isLabMode && (
                <div className="absolute inset-0 z-30 animate-fade-in">
                  <LabBench step={currentStep} onCompleteStep={handleLabComplete} />
                </div>
              )}

              {currentStep === GameStep.ANALYSIS && (
                <SuspectsBoard onIdentify={handleIdentify} />
              )}

              {currentStep === GameStep.CONCLUSION && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in bg-slate-900">
                  <div className={`p-8 rounded-2xl shadow-2xl max-w-xl border-4 ${culpritFound ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'}`}>
                    <div className="text-6xl mb-4 animate-bounce">{culpritFound ? '🎉' : '🕵️‍♂️'}</div>
                    <h2 className="text-3xl font-bold mb-4 font-serif text-white">
                      {culpritFound ? "結案！" : "指認錯誤"}
                    </h2>
                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                      {culpritFound 
                        ? "幹得漂亮，小偵探！DNA 條帶完全吻合。比克老師只是想借用顯微鏡觀察她的棒棒糖晶體結構，但她應該先申請的！你通過科學找到了真相。"
                        : "不對哦。DNA 條帶沒有完全對上。仔細看看每一個橫槓的位置。真正的科學容不得半點馬虎。"
                      }
                    </p>
                    <div className="flex gap-4 justify-center">
                      {!culpritFound && (
                        <Button onClick={() => setCurrentStep(GameStep.ANALYSIS)} className="!bg-amber-600">再試一次</Button>
                      )}
                      <Button variant="secondary" onClick={resetGame} className="!bg-slate-700 !text-white !border-slate-500">新案件</Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <aside className="hidden md:block w-96 relative z-30 border-l border-slate-800">
         <ChatAssistant 
            hint={aiHint} 
            context={STORY_STAGES[currentStep]?.title || currentStep} 
         />
      </aside>

    </div>
  );
};

export default App;
