import React, { useState } from 'react';
import { Loader2, Wine, AlertCircle, ScanLine, Database, CheckCircle2, Layers, Wand2 } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ScanResults from './components/ScanResults';
import StockTake from './components/StockTake';
import EnhanceView from './components/EnhanceView';
import { analyzeBottleImage } from './services/geminiService';
import { ImageState, ScanResult, ViewMode, StockItem } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('scanner');
  
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Stock Take State
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

  const handleMultipleImagesSelected = async (images: Array<{ file: File; previewUrl: string; base64: string }>) => {
    setIsLoading(true);
    setError(null);
    setLastAddedItem(null);
    setBulkProgress({ current: 0, total: images.length });
    
    let addedCount = 0;

    // Process sequentially to maintain order and update UI smoothly
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setBulkProgress({ current: i + 1, total: images.length });
        
        // Update the preview to show the user which image is currently being processed
        setImageState({ file: img.file, previewUrl: img.previewUrl, base64: img.base64 });

        try {
            const analysis = await analyzeBottleImage(img.base64);
            
            const priceMatches = analysis.averagePrice.match(/\d+(\.\d+)?/g)?.map(Number) || [];
            const estimatedCost = priceMatches.length > 0 
              ? priceMatches.reduce((a, b) => a + b, 0) / priceMatches.length 
              : 0;

            const newItem: StockItem = {
              id: Date.now().toString() + Math.random().toString(), // Ensure unique ID in loop
              productName: analysis.productName,
              volume: analysis.specs.volume,
              percentage: analysis.liquidAnalysis.percentage,
              timestamp: Date.now(),
              barcode: analysis.barcode,
              image: img.previewUrl,
              quantity: 1,
              cost: Math.round(estimatedCost * 100) / 100 
            };
            
            setStockItems(prev => [newItem, ...prev]);
            addedCount++;
        } catch (err) {
            console.error("Error analyzing image index " + i, err);
            // Optionally accumulate errors to show at the end
        }
    }

    setIsLoading(false);
    setBulkProgress(null);
    handleReset();
    
    if (addedCount > 0) {
        setLastAddedItem(`${addedCount} items processed`);
    } else {
        setError("Failed to analyze images. Please try fewer images or clearer photos.");
    }
  };

  const handleImageSelected = async (file: File, previewUrl: string, base64: string) => {
    setImageState({ file, previewUrl, base64 });
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastAddedItem(null);

    try {
      const analysis = await analyzeBottleImage(base64);
      
      if (viewMode === 'stock') {
        // Estimate cost from averagePrice string (e.g., "£30 - £40")
        const priceMatches = analysis.averagePrice.match(/\d+(\.\d+)?/g)?.map(Number) || [];
        const estimatedCost = priceMatches.length > 0 
          ? priceMatches.reduce((a, b) => a + b, 0) / priceMatches.length 
          : 0;

        // Add to stock list instead of showing result
        const newItem: StockItem = {
          id: Date.now().toString(),
          productName: analysis.productName,
          volume: analysis.specs.volume,
          percentage: analysis.liquidAnalysis.percentage,
          timestamp: Date.now(),
          barcode: analysis.barcode,
          image: previewUrl,
          quantity: 1,
          cost: Math.round(estimatedCost * 100) / 100 // Round to 2 decimals
        };
        setStockItems(prev => [newItem, ...prev]);
        setLastAddedItem(analysis.productName);
        // Reset image state after short delay to allow next scan
        setTimeout(() => {
           handleReset();
        }, 2000);
      } else {
        setResult(analysis);
      }

    } catch (err) {
      setError("Failed to analyze. Ensure the item or barcode is clearly visible.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStockItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleReset = () => {
    setImageState({ file: null, previewUrl: null, base64: null });
    setResult(null);
    setError(null);
    setLastAddedItem(null);
  };

  const getTitle = () => {
    switch(viewMode) {
      case 'stock': return 'Daily Inventory Mode';
      case 'enhance': return 'AI Photo Enhancement';
      default: return 'AI Product & Barcode Analysis';
    }
  };

  const getIcon = () => {
    switch(viewMode) {
      case 'stock': return <Database className="w-6 h-6 text-emerald-500" />;
      case 'enhance': return <Wand2 className="w-6 h-6 text-purple-500" />;
      default: return <Wine className="w-6 h-6 text-amber-500" />;
    }
  };

  const getIconBg = () => {
    switch(viewMode) {
      case 'stock': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'enhance': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center relative max-w-md mx-auto w-full shadow-2xl overflow-hidden">
      
      {/* Top Header */}
      <header className="w-full flex flex-col items-center pt-8 pb-6 px-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-xl border ${getIconBg()}`}>
             {getIcon()}
           </div>
           <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AI Scanner</h1>
              <p className="text-slate-400 text-xs">
                {getTitle()}
              </p>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col p-4 overflow-y-auto pb-28">
        
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-[shake_0.5s_ease-in-out]">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback for Stock Take */}
        {lastAddedItem && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-[slideDown_0.5s_ease-out_forwards]">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">Added: {lastAddedItem}</span>
           </div>
        )}

        {/* Content Router */}
        {viewMode === 'enhance' ? (
            <EnhanceView />
        ) : (
            <>
                {/* Uploader (Visible in Scanner Mode OR Stock Mode if not loading) */}
                {!imageState.previewUrl && !isLoading && (
                    viewMode === 'stock' ? (
                        <div className="flex flex-col gap-6">
                            {/* Mini Uploader for Stock */}
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 border-dashed">
                                <h3 className="text-center text-slate-400 text-sm mb-3 font-medium">Scan items to add to stock</h3>
                                <ImageUploader 
                                    onImageSelected={handleImageSelected} 
                                    onMultipleImagesSelected={handleMultipleImagesSelected}
                                    allowMultiple={true}
                                    maxFiles={10}
                                />
                            </div>
                            <StockTake 
                                items={stockItems} 
                                onUpdateItem={handleUpdateStockItem}
                                onClear={() => setStockItems([])} 
                                onDeleteItem={(id) => setStockItems(prev => prev.filter(i => i.id !== id))}
                            />
                        </div>
                    ) : (
                        /* Scanner Mode */
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-8 text-center">
                                <span className="text-amber-500 font-bold text-lg block mb-2">Scan Bottle or Barcode</span>
                                <p className="text-slate-400 text-sm px-6">Take a picture of any spirit bottle, food item, or barcode to analyze specs, price, and recipes.</p>
                            </div>
                            <ImageUploader onImageSelected={handleImageSelected} />
                        </div>
                    )
                )}

                {/* Loading State */}
                {isLoading && imageState.previewUrl && (
                    <div className="flex flex-col items-center justify-center flex-1 space-y-8 min-h-[400px]">
                        <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 group">
                            <img 
                                src={imageState.previewUrl} 
                                alt="Analyzing" 
                                className="w-full h-full object-cover opacity-50 transition-transform duration-500" 
                            />
                            
                            {/* Multiple items stack effect */}
                            {bulkProgress && bulkProgress.total > 1 && (
                                <div className="absolute -bottom-2 -right-2 w-full h-full bg-slate-800 border border-slate-600 rounded-2xl -z-10"></div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                            </div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                        
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-white">
                                {bulkProgress ? `Processing Batch` : (viewMode === 'stock' ? 'Logging Inventory...' : 'Analyzing Product...')}
                            </h3>
                            {bulkProgress ? (
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-emerald-400 font-bold text-lg">
                                        Item {bulkProgress.current} of {bulkProgress.total}
                                    </p>
                                    <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 transition-all duration-300 ease-out" 
                                            style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%`}}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                                    Reading barcode, identifying brand, and estimating levels.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Results State (Scanner Mode Only) */}
                {result && !isLoading && viewMode === 'scanner' && (
                    <ScanResults result={result} onReset={handleReset} />
                )}
            </>
        )}
      </main>

      {/* Bottom Navigation Tab Bar */}
      <div className="absolute bottom-6 left-6 right-6 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-1.5 flex z-40">
         <button 
            onClick={() => { setViewMode('scanner'); handleReset(); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all ${viewMode === 'scanner' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-700/50'}`}
         >
            <ScanLine className="w-4 h-4" />
            Scanner
         </button>
         <button 
            onClick={() => { setViewMode('stock'); handleReset(); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all ${viewMode === 'stock' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-700/50'}`}
         >
            <Database className="w-4 h-4" />
            Stock
         </button>
         <button 
            onClick={() => { setViewMode('enhance'); handleReset(); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all ${viewMode === 'enhance' ? 'bg-purple-500 text-slate-900 shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:bg-slate-700/50'}`}
         >
            <Wand2 className="w-4 h-4" />
            Enhance
         </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        @keyframes slideDown {
            from { top: 0; opacity: 0; }
            to { top: 6rem; opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;