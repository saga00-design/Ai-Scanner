
import React, { useState, useEffect } from 'react';
import { StockItem, ReminderSettings } from '../types';
import { Calendar, Clock, Database, Trash2, Bell, X, BellRing, Minus, Plus, PoundSterling, Coins } from 'lucide-react';

interface StockTakeProps {
  items: StockItem[];
  onClear: () => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<StockItem>) => void;
}

const StockTake: React.FC<StockTakeProps> = ({ items, onClear, onDeleteItem, onUpdateItem }) => {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalPercentage = items.reduce((acc, item) => acc + item.percentage, 0);
  const averageFill = items.length > 0 ? Math.round(totalPercentage / items.length) : 0;
  const totalValue = items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

  // --- Reminder State & Logic ---
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem('stockReminder');
      return saved ? JSON.parse(saved) : {
        enabled: false,
        frequency: 'daily',
        time: '09:00',
        lastTriggered: 0
      };
    } catch {
      return { enabled: false, frequency: 'daily', time: '09:00', lastTriggered: 0 };
    }
  });

  // Temp state for modal editing
  const [tempSettings, setTempSettings] = useState<ReminderSettings>(settings);

  useEffect(() => {
    localStorage.setItem('stockReminder', JSON.stringify(settings));

    if (!settings.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      const targetToday = new Date();
      targetToday.setHours(hours, minutes, 0, 0);

      // Check if it's time (within the last minute)
      const diff = now.getTime() - targetToday.getTime();
      const isTime = diff >= 0 && diff < 60000; 

      // Check if already triggered today
      const lastTrigger = new Date(settings.lastTriggered);
      const isSameDay = lastTrigger.getDate() === now.getDate() &&
                        lastTrigger.getMonth() === now.getMonth() &&
                        lastTrigger.getFullYear() === now.getFullYear();

      if (isTime && !isSameDay) {
        // Trigger Notification
        if (Notification.permission === 'granted') {
           new Notification("Inventory Check", {
             body: "It's time for your scheduled stock take.",
             icon: "/vite.svg"
           });
        }
        setSettings(prev => ({ ...prev, lastTriggered: Date.now() }));
      }
    };

    const interval = setInterval(checkReminder, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [settings]);

  const handleSaveSettings = async () => {
    if (tempSettings.enabled && Notification.permission !== 'granted') {
       await Notification.requestPermission();
    }
    setSettings(tempSettings);
    setShowReminderModal(false);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-24 animate-[fadeIn_0.5s_ease-out] relative">
      
      {/* Header Stats */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-4">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Database className="w-5 h-5 text-emerald-400" />
               Stock Take
             </h2>
             <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
               <Calendar className="w-3 h-3" /> {today}
             </p>
           </div>
           
           <div className="flex items-center gap-2">
             <button
               onClick={() => {
                 setTempSettings(settings);
                 setShowReminderModal(true);
               }}
               className={`p-2 rounded-lg transition-colors ${settings.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
             >
               {settings.enabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
             </button>
             <button 
               onClick={onClear}
               className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
             >
               Clear All
             </button>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Items</div>
              <div className="text-lg font-black text-white">{items.length}</div>
           </div>
           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Fill Avg</div>
              <div className={`text-lg font-black ${averageFill < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {averageFill}%
              </div>
           </div>
           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Value</div>
              <div className="text-lg font-black text-emerald-400 truncate">£{totalValue.toFixed(2)}</div>
           </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 px-6 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Database className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-medium mb-1">No Items Scanned</h3>
            <p className="text-slate-500 text-sm">Scan bottles or barcodes to add them to today's inventory list.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800 transition-colors">
               <div className="flex items-start gap-3 mb-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 relative">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700">
                        <div className="h-full bg-emerald-500" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white truncate pr-2">{item.productName}</h4>
                        <button 
                            onClick={() => onDeleteItem(item.id)}
                            className="text-slate-500 hover:text-red-400"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">{item.volume}</span>
                        <span className={item.percentage < 30 ? "text-red-400 font-mono" : "text-emerald-400 font-mono"}>
                            {item.percentage}%
                        </span>
                        {item.barcode && (
                             <span className="text-[10px] text-slate-600 font-mono">#{item.barcode}</span>
                        )}
                      </div>
                  </div>
               </div>

               {/* Controls Row */}
               <div className="flex items-center justify-between bg-slate-900/40 rounded-lg p-2 gap-2">
                  
                  {/* Unit Price Input */}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                     <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unit Price</label>
                     <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-xs">£</span>
                        <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={item.cost}
                            onChange={(e) => onUpdateItem(item.id, { cost: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent text-sm text-white font-mono focus:outline-none placeholder-slate-600"
                            placeholder="0.00"
                        />
                     </div>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-8 bg-slate-700 mx-1"></div>

                  {/* Quantity Stepper */}
                  <div className="flex flex-col items-end gap-0.5">
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pr-1">Qty</label>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onUpdateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors"
                          >
                             <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold text-white w-6 text-center tabular-nums">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
                            className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors border border-emerald-500/30"
                          >
                             <Plus className="w-3 h-3" />
                          </button>
                      </div>
                  </div>
               </div>
               
               {/* Line Total */}
               <div className="flex justify-end mt-1 pr-1">
                  <span className="text-[10px] text-slate-500">
                     Line Total: <span className="text-emerald-400 font-mono font-bold">£{(item.cost * item.quantity).toFixed(2)}</span>
                  </span>
               </div>

            </div>
          ))
        )}
      </div>

      {/* Reminder Settings Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReminderModal(false)}></div>
           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-[zoomIn_0.2s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <BellRing className="w-5 h-5 text-emerald-400" />
                   Stock Reminders
                 </h3>
                 <button onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-white">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-6">
                 {/* Enable Toggle */}
                 <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl">
                    <span className="text-sm font-medium text-slate-200">Enable Reminders</span>
                    <button 
                      onClick={() => setTempSettings({...tempSettings, enabled: !tempSettings.enabled})}
                      className={`w-12 h-6 rounded-full relative transition-colors ${tempSettings.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tempSettings.enabled ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>

                 {tempSettings.enabled && (
                   <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                       {/* Frequency */}
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Frequency</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['daily', 'weekly'].map((freq) => (
                               <button
                                 key={freq}
                                 onClick={() => setTempSettings({...tempSettings, frequency: freq as 'daily' | 'weekly'})}
                                 className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${tempSettings.frequency === freq ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'}`}
                               >
                                 {freq}
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* Time */}
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time</label>
                          <div className="relative">
                             <input 
                                type="time"
                                value={tempSettings.time}
                                onChange={(e) => setTempSettings({...tempSettings, time: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                             />
                             <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          </div>
                       </div>
                   </div>
                 )}

                 <button 
                   onClick={handleSaveSettings}
                   className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                 >
                   Save Settings
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StockTake;
