import React, { useRef, useState } from 'react';
import { Upload, Camera, CheckCircle2, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImage: string;
  onImageSelected: (base64OrUrl: string) => void;
  label?: string;
  sublabel?: string;
  presets?: string[];
  shape?: 'circle' | 'square';
}

export const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file (PNG, JPG, WEBP).'));
      return;
    }
    // Limit source file size to 10MB before resizing
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image file is too large. Please select a photo under 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Could not parse image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageSelected,
  label = 'Profile Picture',
  sublabel = 'Upload a photo from your phone or computer, or pick a preset',
  presets = [],
  shape = 'square',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError(null);
    try {
      const dataUrl = await processImageFile(file);
      onImageSelected(dataUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to process selected image.');
    } finally {
      setProcessing(false);
      // Reset input value so user can re-upload the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            {label} *
          </label>
          <p className="text-[11px] text-gray-500 mt-0.5">{sublabel}</p>
        </div>
        {presets.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] font-bold text-[#0B5D43] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{showPresets ? 'Hide Avatars' : 'Choose Preset Avatar'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Main Upload Box */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
        {/* Image Preview */}
        <div className="relative group shrink-0">
          <div
            className={`w-24 h-24 overflow-hidden border-2 border-[#0B5D43] shadow-md bg-white ${
              shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                <Camera className="w-8 h-8 text-gray-300" />
                <span className="text-[10px] font-bold mt-1">No Photo</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo"
            className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
          >
            <Camera className="w-5 h-5 text-white" />
            <span className="text-[10px] font-bold mt-0.5">Change</span>
          </button>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              disabled={processing}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>Upload from Device</span>
                </>
              )}
            </button>

            {currentImage && currentImage.startsWith('data:image') && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5D43]" />
                <span>Custom Photo Ready</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-400">
            Supports JPG, PNG, WEBP. Automatically optimized for fast loading across HomeCrew.
          </p>
        </div>
      </div>

      {/* Preset Avatars Drawer (Optional fallback) */}
      {showPresets && presets.length > 0 && (
        <div className="p-3 bg-white rounded-2xl border border-gray-200 space-y-2 animate-in fade-in">
          <div className="text-[11px] font-bold text-gray-500 uppercase">Or Pick From Gallery:</div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {presets.map((url, i) => (
              <button
                type="button"
                key={i}
                onClick={() => {
                  onImageSelected(url);
                  setError(null);
                }}
                className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all p-0.5 cursor-pointer ${
                  currentImage === url
                    ? 'border-[#0B5D43] scale-105 ring-2 ring-[#0B5D43]/20'
                    : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Preset ${i}`} className="w-12 h-12 rounded-lg object-cover" />
                {currentImage === url && (
                  <div className="absolute inset-0 bg-[#0B5D43]/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
