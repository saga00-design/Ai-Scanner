import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, Layers, AlertCircle, Aperture } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File, previewUrl: string, base64: string) => void;
  onMultipleImagesSelected?: (images: Array<{ file: File; previewUrl: string; base64: string }>) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  onlyCamera?: boolean;
  withUploadOption?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  onMultipleImagesSelected, 
  allowMultiple = false,
  maxFiles = 10,
  onlyCamera = false,
  withUploadOption = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if multiple files were selected and the handler exists
    if (allowMultiple && onMultipleImagesSelected && files.length > 1) {
      if (files.length > maxFiles) {
        setError(`Limit reached: Please select up to ${maxFiles} photos at a time.`);
        // Clear the input so the same file can be selected again if needed, or to reset
        event.target.value = ''; 
        return;
      }
      processMultipleFiles(Array.from(files));
    } else {
      // Single file fallback
      processFile(files[0]);
    }
  };

  const processMultipleFiles = async (files: File[]) => {
    const promises = files.map(file => new Promise<{ file: File; previewUrl: string; base64: string }>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        resolve({
          file,
          previewUrl: base64String,
          base64: base64Content
        });
      };
      reader.readAsDataURL(file);
    }));

    const results = await Promise.all(promises);
    onMultipleImagesSelected && onMultipleImagesSelected(results);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix for API
      const base64Content = base64String.split(',')[1];
      onImageSelected(file, base64String, base64Content);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      const input = fileInputRef.current;
      input.removeAttribute("multiple"); 
      input.setAttribute("capture", "environment");
      input.click();
      
      setTimeout(() => {
          input.removeAttribute("capture");
          if (allowMultiple && !onlyCamera) input.setAttribute("multiple", "true");
      }, 500);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      const input = fileInputRef.current;
      input.removeAttribute("capture");
      input.click();
    }
  };

  if (onlyCamera) {
    return (
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={triggerCamera}
          className="group relative w-full aspect-square max-h-80 mx-auto bg-slate-900 border-2 border-slate-800 rounded-full flex flex-col items-center justify-center overflow-hidden shadow-2xl active:scale-95 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-50"></div>
          
          {/* Lens Effect */}
          <div className="relative z-10 w-32 h-32 rounded-full border-4 border-slate-700 bg-slate-950 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,1)] group-hover:border-purple-500/50 transition-colors">
             <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-900/20 to-slate-800 flex items-center justify-center">
                   <Aperture className="w-8 h-8 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
             </div>
             {/* Glint */}
             <div className="absolute top-6 left-6 w-4 h-2 bg-white/10 rounded-full rotate-45 blur-[1px]"></div>
          </div>

          <div className="relative z-10 mt-8 text-center">
             <span className="block text-lg font-bold text-white tracking-tight">Open AI Camera</span>
             <span className="text-xs text-slate-500">Auto-Detect & Enhance</span>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </button>
        
        {error && (
          <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 text-red-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        {withUploadOption && (
             <div className="mt-8 flex justify-center">
                <button 
                    onClick={triggerUpload}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-full transition-all border border-transparent hover:border-slate-700"
                >
                    <Upload className="w-4 h-4" />
                    Upload from Gallery
                </button>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 bg-slate-800 hover:bg-slate-700 border-2 border-dashed ${error ? 'border-red-500/50 bg-red-500/5' : 'border-slate-600'} rounded-xl transition-all group`}
        >
          <div className={`p-3 rounded-full mb-3 relative group-hover:scale-110 transition-transform ${error ? 'bg-red-500/10' : 'bg-amber-500/10 group-hover:bg-amber-500/20'}`}>
             {allowMultiple ? (
                <>
                   <Layers className={`w-6 h-6 absolute -top-1 -right-1 scale-75 opacity-70 ${error ? 'text-red-500' : 'text-amber-500'}`} />
                   <Upload className={`w-6 h-6 relative z-10 ${error ? 'text-red-500' : 'text-amber-500'}`} />
                </>
             ) : (
                <Upload className="w-6 h-6 text-amber-500" />
             )}
          </div>
          <span className={`text-sm font-medium ${error ? 'text-red-400' : 'text-slate-300'}`}>
            {allowMultiple ? 'Upload Bulk' : 'Upload Photo'}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple={allowMultiple}
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </button>

        <button
          onClick={triggerCamera}
          className="flex flex-col items-center justify-center p-6 bg-amber-600 hover:bg-amber-700 border-2 border-transparent rounded-xl transition-all shadow-lg shadow-amber-900/20 group"
        >
           <div className="p-3 bg-white/20 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6 text-white" />
           </div>
          <span className="text-sm font-bold text-white">Take Photo</span>
        </button>
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 text-red-400 text-xs font-medium animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
        </div>
      )}

      <p className="mt-4 text-xs text-center text-slate-500 flex items-center justify-center gap-2">
        <ImageIcon className="w-3 h-3" />
        {allowMultiple 
            ? `Upload up to ${maxFiles} images for bulk analysis` 
            : 'Snap a clear photo of the front label'}
      </p>
    </div>
  );
};

export default ImageUploader;