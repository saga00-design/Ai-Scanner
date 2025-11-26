
import React from 'react';
import { ScanResult } from '../types';
import { 
  ScanBarcode, Wine, Droplets, MapPin, Sparkles, 
  BookOpen, PoundSterling, Wind, Flame, Activity, Martini, 
  ExternalLink, Search, Utensils, TrendingUp, TrendingDown, Tag
} from 'lucide-react';
import LiquidLevelGauge from './LiquidLevelGauge';

interface ScanResultsProps {
  result: ScanResult;
  onReset: () => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({ result, onReset }) => {
  
  const handlePriceSearch = () => {
    const query = encodeURIComponent(`${result.productName} price near me`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  // Check if likely non-alcoholic/food to toggle icons/labels
  const isSpirit = !['sauce', 'snack', 'food', 'soft drink', 'mixer'].some(k => result.specs.type.toLowerCase().includes(k));

  // Parse price string to determine level (General Benchmark)
  const getPriceAnalysis = (priceStr: string) => {
    const numbers = priceStr.match(/\d+/g)?.map(Number) || [];
    if (numbers.length === 0) return null;
    
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    
    if (avg < 30) return { label: 'Great Value', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: TrendingDown };
    if (avg < 80) return { label: 'Standard', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: Tag };
    return { label: 'Premium', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: TrendingUp };
  };

  const priceMetric = getPriceAnalysis(result.averagePrice);

  return (
    <div className="w-full max-w-md mx-auto pb-24 space-y-6">
      
      {/* Header Card */}
      <div className="opacity-0 animate-[slideDown_0.6s_ease-out_forwards]">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-700"></div>
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-400 border border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.1)] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {result.specs.type}
                    </span>
                    {result.barcode ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800/50">
                            <ScanBarcode className="w-3.5 h-3.5 opacity-70" />
                            <span className="tracking-wider">{result.barcode}</span>
                        </div>
                    ) : (
                         <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono px-2 py-1">
                            <span className="tracking-wider">NO BARCODE</span>
                        </div>
                    )}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 leading-none tracking-tight drop-shadow-lg">
                  {result.productName}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {result.specs.origin}
                </div>

                {/* Story Snippet */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                   <div className="flex items-start gap-2 text-slate-300 text-sm leading-relaxed italic">
                      <BookOpen className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                      <p>{result.description}</p>
                   </div>
                </div>
            </div>
          </div>
      </div>

      {/* Liquid Gauge (Show generic if not alcohol, or full gauge) */}
      <div className="opacity-0 animate-[slideUp_0.6s_ease-out_0.1s_forwards]">
        <LiquidLevelGauge 
            percentage={result.liquidAnalysis.percentage} 
            description={result.liquidAnalysis.description} 
        />
      </div>

      {/* Price & Specs Grid */}
      <div className="grid grid-cols-2 gap-3 opacity-0 animate-[zoomIn_0.5s_ease-out_0.2s_forwards]">
         {/* ABV Card */}
         <div className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">ABV</span>
            <span className="text-xl font-bold text-white">{result.specs.abv}</span>
         </div>
         {/* Volume Card */}
         <div className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Volume</span>
             <span className="text-xl font-bold text-white">{result.specs.volume}</span>
         </div>
         
         {/* Price Card */}
         <div className="col-span-2 bg-gradient-to-r from-slate-800/60 to-slate-800/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between group relative overflow-hidden">
             <div className="flex flex-col relative z-10">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <PoundSterling className="w-3 h-3" /> Est. Retail Price
                </span>
                <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${priceMetric ? priceMetric.color : 'text-white'}`}>
                      {result.averagePrice}
                    </span>
                    {priceMetric && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priceMetric.border} ${priceMetric.bg} ${priceMetric.color} flex items-center gap-1 shadow-sm`}>
                           <priceMetric.icon className="w-3 h-3" />
                           {priceMetric.label}
                        </span>
                    )}
                </div>
             </div>
             <button 
                onClick={handlePriceSearch}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 transition-all flex items-center gap-2"
             >
                <Search className="w-3.5 h-3.5" />
                Compare
             </button>
         </div>
      </div>

      {/* Tasting Notes / Features */}
      <div className="opacity-0 animate-[slideUp_0.6s_ease-out_0.3s_forwards]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
            {isSpirit ? 'Tasting Notes' : 'Product Features'}
          </h3>
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
             <div className="p-4 flex gap-4 items-start">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 mt-1">
                   <Wind className="w-4 h-4" />
                </div>
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">
                     {isSpirit ? 'Nose' : 'Scent / Look'}
                   </h4>
                   <p className="text-sm text-slate-300 leading-relaxed">{result.tastingNotes.nose}</p>
                </div>
             </div>
             <div className="p-4 flex gap-4 items-start">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 mt-1">
                   <Flame className="w-4 h-4" />
                </div>
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">
                     {isSpirit ? 'Palate' : 'Profile'}
                   </h4>
                   <p className="text-sm text-slate-300 leading-relaxed">{result.tastingNotes.palate}</p>
                </div>
             </div>
             <div className="p-4 flex gap-4 items-start">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 mt-1">
                   <Activity className="w-4 h-4" />
                </div>
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">
                     {isSpirit ? 'Finish' : 'Quality'}
                   </h4>
                   <p className="text-sm text-slate-300 leading-relaxed">{result.tastingNotes.finish}</p>
                </div>
             </div>
          </div>
      </div>

      {/* Cocktails / Usage */}
      <div className="opacity-0 animate-[slideUp_0.6s_ease-out_0.4s_forwards]">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1 flex items-center gap-2">
            {isSpirit ? <Martini className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
            {isSpirit ? 'Cocktail Lab' : 'Usage & Recipes'}
         </h3>
         <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
            {result.cocktails.map((cocktail, idx) => (
               <div key={idx} className="snap-center shrink-0 w-64 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex flex-col relative overflow-hidden group">
                   {/* Generated Image */}
                   <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                      <div className="absolute inset-0 animate-pulse bg-slate-800"></div>
                      <img
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(cocktail.visualPrompt)}?width=512&height=256&nologo=true`}
                        alt={cocktail.name}
                        className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-20"></div>
                   </div>

                   <div className="p-5 flex-1 flex flex-col">
                        <h4 className="font-bold text-amber-400 mb-2 text-lg">{cocktail.name}</h4>
                        <ul className="space-y-1 mb-3 flex-1">
                            {cocktail.ingredients.map((ing, i) => (
                                <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-amber-500/50 rounded-full"></span>
                                    {ing}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-3 border-t border-slate-700/50">
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">"{cocktail.instructions}"</p>
                        </div>
                   </div>
               </div>
            ))}
         </div>
      </div>

      {/* Footer Action */}
      <div className="opacity-0 animate-[slideUp_0.6s_ease-out_0.6s_forwards]">
          <button 
            onClick={onReset}
            className="group w-full py-4 bg-slate-100 text-slate-900 hover:bg-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ScanBarcode className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-slate-600" />
            Scan Another Item
          </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ScanResults;
