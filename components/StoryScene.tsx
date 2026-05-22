
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { generateSceneBackground } from '../services/geminiService';
import { StoryStage, QuizOption } from '../types';

interface StorySceneProps {
  stage: StoryStage;
  onComplete: () => void;
  onMistake: (explanation: string) => void;
  onCorrect: (explanation: string) => void;
}

export const StoryScene: React.FC<StorySceneProps> = ({ stage, onComplete, onMistake, onCorrect }) => {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [loadingBg, setLoadingBg] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadBg = async () => {
      setBgUrl(null);
      setSelectedOption(null);
      setHasAnsweredCorrectly(false);
      
      const immediateCheck = await generateSceneBackground(stage.backgroundPrompt);
      
      if (!isMounted) return;

      if (immediateCheck) {
        setBgUrl(immediateCheck);
        setLoadingBg(false);
      } else {
        setLoadingBg(true);
        try {
          const url = await generateSceneBackground(stage.backgroundPrompt);
          if (isMounted) setBgUrl(url);
        } catch (err) {
          console.error("Failed to generate bg", err);
        } finally {
          if (isMounted) setLoadingBg(false);
        }
      }
    };
    
    loadBg();
    return () => { isMounted = false; };
  }, [stage]);

  const handleOptionClick = (option: QuizOption) => {
    setSelectedOption(option.id);
    
    if (option.isCorrect) {
      setHasAnsweredCorrectly(true);
      onCorrect(option.explanation);
    } else {
      onMistake(option.explanation);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-900">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {loadingBg ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-amber-500 font-serif">AI 畫師正在繪製場景...</p>
            </div>
          </div>
        ) : bgUrl ? (
          <div 
            className="w-full h-full bg-cover bg-center animate-fade-in transition-all duration-1000"
            style={{ backgroundImage: `url(${bgUrl})` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 md:p-12 pb-24 md:pb-12 max-w-4xl mx-auto w-full">
        
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-600 p-6 rounded-2xl shadow-2xl animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-500 font-serif mb-2 flex items-center gap-3">
             <span className="bg-amber-900/50 p-2 rounded-lg border border-amber-700/50">🕵️</span>
             {stage.title}
          </h2>
          <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-6 font-serif">
            {stage.narrative}
          </p>

          <div className="bg-black/30 p-4 rounded-xl border-l-4 border-blue-500 mb-6">
            <h3 className="text-blue-400 font-bold mb-1 uppercase text-xs tracking-wider">當前任務</h3>
            <p className="text-white font-medium">{stage.task}</p>
          </div>

          {stage.quiz ? (
            <div className="space-y-4 mt-6">
              <p className="text-lg font-bold text-amber-100 mb-4">
                 🤔 {stage.quiz.question}
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {stage.quiz.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const showStatus = isSelected; 
                  
                  let btnClass = "text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ";
                  
                  if (showStatus) {
                     if (option.isCorrect) {
                        btnClass += "bg-green-900/60 border-green-500 text-green-100";
                     } else {
                        btnClass += "bg-red-900/60 border-red-500 text-red-100";
                     }
                  } else {
                     btnClass += "bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-300 hover:border-amber-500/50";
                  }

                  const disabled = hasAnsweredCorrectly && !isSelected;

                  return (
                    <button
                      key={option.id}
                      onClick={() => !hasAnsweredCorrectly && handleOptionClick(option)}
                      disabled={disabled || (isSelected && option.isCorrect)}
                      className={`${btnClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.id}. {option.text}</span>
                        {showStatus && (
                          <span>{option.isCorrect ? '✅' : '❌'}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasAnsweredCorrectly && (
                 <div className="mt-6 flex justify-end animate-fade-in">
                    <Button onClick={onComplete} className="!text-lg !px-8 !py-3 !bg-green-600 hover:!bg-green-700 animate-bounce-subtle">
                      下一步 &rarr;
                    </Button>
                 </div>
              )}
            </div>
          ) : (
            <div className="mt-6 flex justify-end">
              <Button onClick={onComplete} className="!text-lg !px-8 !py-3 !bg-amber-600 hover:!bg-amber-700">
                開始調查 &rarr;
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
