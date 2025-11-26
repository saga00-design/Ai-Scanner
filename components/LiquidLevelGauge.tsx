import React, { useEffect, useState } from 'react';

interface LiquidLevelGaugeProps {
  percentage: number;
  description: string;
}

const LiquidLevelGauge: React.FC<LiquidLevelGaugeProps> = ({ percentage, description }) => {
  const [displayedLevel, setDisplayedLevel] = useState(0);

  // Clamp percentage between 0 and 100
  const targetLevel = Math.min(Math.max(percentage, 0), 100);

  // Animate the number counting up
  useEffect(() => {
    let start = 0;
    const duration = 1500; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentVal = Math.round(start + (targetLevel - start) * ease);
      setDisplayedLevel(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetLevel]);


  // Determine color based on level
  let colorClasses = "from-emerald-500 to-emerald-400 shadow-emerald-900/20";
  let textColor = "text-emerald-400";
  let borderColor = "border-emerald-500/30";
  
  if (targetLevel < 20) {
      colorClasses = "from-red-600 to-red-500 shadow-red-900/20";
      textColor = "text-red-400";
      borderColor = "border-red-500/30";
  }
  else if (targetLevel < 50) {
      colorClasses = "from-amber-500 to-amber-400 shadow-amber-900/20";
      textColor = "text-amber-400";
      borderColor = "border-amber-500/30";
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-5 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-xl w-full overflow-hidden relative">
        {/* Background ambient glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b ${colorClasses.split(' ')[0].replace('from-', 'from-')}/5 to-transparent blur-xl -z-10`}></div>

        <div className="flex items-center justify-between w-full mb-2 z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Liquid Analysis</h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border ${borderColor} ${textColor} shadow-sm`}>
              {targetLevel < 20 ? 'LOW LEVEL' : targetLevel < 50 ? 'MEDIUM LEVEL' : 'HIGH LEVEL'}
            </span>
        </div>

      <div className="flex items-center gap-8 w-full z-10">
        {/* Bottle Visual */}
        <div className="relative w-20 h-48 shrink-0 drop-shadow-2xl">
             {/* Glass reflection overlay */}
             <div className="absolute inset-0 z-20 pointer-events-none rounded-b-2xl rounded-t-lg border border-white/10 ring-1 ring-white/5 overflow-hidden bg-gradient-to-tr from-white/5 via-transparent to-white/5"></div>

            <div className="relative w-full h-full bg-slate-950/60 rounded-b-2xl rounded-t-lg border border-slate-700 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">

                {/* Bottle Neck */}
                <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-10 h-8 bg-slate-900 border-x border-slate-700 z-10 shadow-lg">
                    {/* Cap */}
                     <div className="absolute -top-1 left-[-2px] right-[-2px] h-3 bg-slate-800 rounded-sm border border-slate-600"></div>
                </div>

                {/* Liquid Container */}
                <div className="absolute inset-0 w-full h-full z-0">
                     {/* The Liquid */}
                    <div
                        className={`absolute bottom-0 w-full transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) bg-gradient-to-t ${colorClasses} opacity-90`}
                        style={{ height: `${targetLevel}%` }}
                    >
                        {/* Surface/Meniscus */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30 w-full skew-y-1 origin-left scale-110 blur-[1px]"></div>
                        
                        {/* Bubbles (CSS decoration) */}
                        <div className="absolute bottom-4 left-2 w-1 h-1 bg-white/40 rounded-full animate-[float_3s_ease-in-out_infinite]"></div>
                        <div className="absolute bottom-8 right-4 w-1.5 h-1.5 bg-white/30 rounded-full animate-[float_4s_ease-in-out_infinite_0.5s]"></div>
                        <div className="absolute bottom-12 left-6 w-1 h-1 bg-white/20 rounded-full animate-[float_5s_ease-in-out_infinite_1s]"></div>
                    </div>
                </div>

                {/* Measurement markings */}
                <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col justify-between py-6 pr-1.5 z-20 opacity-40 pointer-events-none">
                     {[100, 75, 50, 25].map((mark) => (
                         <div key={mark} className="flex items-center justify-end gap-1 group">
                             <span className="text-[8px] font-mono text-white/70 hidden group-hover:block">{mark}</span>
                             <div className="w-2 h-px bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                         </div>
                     ))}
                </div>
            </div>
        </div>

        {/* Stats & Description */}
        <div className="flex flex-col justify-center flex-1 min-w-0 py-2">
          <div className="flex items-baseline gap-1">
             <span className={`text-6xl font-black tracking-tighter tabular-nums ${textColor} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {displayedLevel}
             </span>
             <span className="text-xl font-medium text-slate-500 mb-2">%</span>
          </div>

          <div className="h-px w-full bg-slate-800/80 my-4">
            <div className={`h-full transition-all duration-[1500ms] ease-out bg-current opacity-50 ${textColor}`} style={{ width: `${targetLevel}%` }}></div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-medium text-balance">
            {description}
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LiquidLevelGauge;