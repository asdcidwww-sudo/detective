
import React, { useState } from 'react';
import { generateSuspectSketch } from '../services/geminiService';
import { ImageSize } from '../types';
import { Button } from './Button';

interface ImageGeneratorProps {
  onBack: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('一個穿著白大褂、拿著棒棒糖的可疑科學老師的素描，維多利亞風格');
  const [size, setSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const url = await generateSuspectSketch(prompt, size);
      setGeneratedImage(url);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("發生了未知錯誤");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-500 font-serif">警方素描師</h2>
        <Button onClick={onBack} variant="ghost" className="!px-2 !text-slate-400 hover:!text-white hover:!bg-slate-800">關閉</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Controls */}
        <div className="flex-1 space-y-4">
           <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
             <label className="block text-sm font-bold text-slate-400 mb-2">嫌疑人描述</label>
             <textarea 
               value={prompt} 
               onChange={(e) => setPrompt(e.target.value)}
               className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-white"
               placeholder="描述嫌疑人的樣子..."
             />
             
             <div className="mt-4">
               <label className="block text-sm font-bold text-slate-400 mb-2">畫質</label>
               <div className="flex gap-2">
                 {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                   <button
                     key={s}
                     onClick={() => setSize(s)}
                     className={`px-4 py-2 rounded-lg border ${
                       size === s 
                       ? 'bg-amber-900/50 border-amber-500 text-amber-500 font-bold' 
                       : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'
                     }`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="mt-6">
               <Button onClick={handleGenerate} isLoading={loading} className="w-full !bg-amber-600 hover:!bg-amber-700">
                  生成素描
               </Button>
             </div>
             
             {error && (
               <div className="mt-4 p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50">
                 錯誤: {error}
               </div>
             )}
             
             <p className="mt-4 text-xs text-slate-500">
               注意：高清 (2K/4K) 生成需要驗證 API 密鑰。
             </p>
           </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700 min-h-[400px]">
           {loading ? (
             <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
                <span>素描繪製中...</span>
             </div>
           ) : generatedImage ? (
             <img src={generatedImage} alt="Generated Suspect" className="max-w-full max-h-[500px] rounded-lg shadow-2xl object-contain border-4 border-white/10" />
           ) : (
             <div className="text-slate-600 text-center p-8">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-2 opacity-50">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
               </svg>
               <p>輸入描述並生成嫌疑人畫像</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
