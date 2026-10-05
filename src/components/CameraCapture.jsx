import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  Flame,
  ChevronDown,
  Layers
} from 'lucide-react';
import { SAMPLE_FOODS } from '../data/sampleFoods';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function CameraCapture({ onAnalyze, isAnalyzing }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'user' or 'environment'
  const [cameraError, setCameraError] = useState(null);
  const [customHint, setCustomHint] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllSamples, setShowAllSamples] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream cleanup
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Native Android Camera Capture via Capacitor
  const takeNativePhoto = async (sourceType = CameraSource.Camera) => {
    try {
      const photo = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: sourceType,
      });
      if (photo?.dataUrl) {
        setSelectedImage(photo.dataUrl);
      }
    } catch (err) {
      console.warn('Native camera capture dismissed or error:', err);
    }
  };

  // Start live webcam / mobile camera for Web
  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setCameraFacing(facing);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera directly in browser. Use Gallery / Upload button or test with samples.');
      setIsCameraActive(false);
    }
  };

  // Primary Camera Action (Native vs Web)
  const handleCameraClick = () => {
    if (isNative) {
      takeNativePhoto(CameraSource.Camera);
    } else {
      startCamera('environment');
    }
  };

  // Primary Gallery / Browse Action (Native vs Web)
  const handleBrowseClick = () => {
    if (isNative) {
      takeNativePhoto(CameraSource.Photos);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Toggle front / back camera in Web
  const toggleFacingMode = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  // Take snapshot from video stream in Web
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setSelectedImage(dataUrl);
    stopCamera();
  };

  // Handle uploaded file
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop (desktop files only, do not block mobile touch scrolling)
  const handleDragOver = (e) => {
    if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger analysis
  const handleStartAnalysis = () => {
    if (!selectedImage) return;
    const hintLower = customHint.trim().toLowerCase();
    const matchedPreset = hintLower
      ? SAMPLE_FOODS.find(
          (s) =>
            s.name.toLowerCase().includes(hintLower) ||
            s.keywords?.some((k) => hintLower.includes(k.toLowerCase()) || k.toLowerCase().includes(hintLower))
        )
      : null;

    onAnalyze({
      imageSrc: selectedImage,
      customHint: customHint.trim(),
      presetData: matchedPreset,
    });
  };

  // Load a sample preset directly
  const handleSelectSample = (sample) => {
    stopCamera();
    setSelectedImage(sample.image);
    setCustomHint(sample.name);
    onAnalyze({
      imageSrc: sample.image,
      customHint: sample.name,
      presetData: sample,
    });
  };

  const filteredSamples = SAMPLE_FOODS.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );
  const displayedSamples = showAllSamples ? filteredSamples : filteredSamples.slice(0, 8);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3.5 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>AI Food Vision Model</span>
            {isNative && (
              <span className="ml-1 pl-1 border-l border-emerald-500/30 text-emerald-300 font-normal flex items-center space-x-1">
                <Smartphone className="w-3 h-3" />
                <span>Android App</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scan Meal & Calculate Calories
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Point your camera at any Indian dish to get instant portion weight, macros, and calorie breakdown.
          </p>
        </div>

        {/* Camera / Upload Interactive Canvas */}
        <div className="relative w-full">
          {/* Active Live Web Camera Stream (Web only) */}
          {isCameraActive && !isNative ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[3/4] sm:aspect-[4/3] max-h-[440px] w-full max-w-md mx-auto border border-emerald-500/40 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-6 sm:inset-8 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                </div>
                <div className="text-center">
                  <span className="bg-slate-950/80 text-slate-200 text-[11px] sm:text-xs px-3 py-1 rounded-full border border-slate-700/60 backdrop-blur-md">
                    Center dish in frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                </div>
              </div>

              {/* Camera Controls Bar */}
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center space-x-6 z-20">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition flex items-center justify-center active:scale-95"
                  title="Switch camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white/90 bg-emerald-500 shadow-xl active:scale-90 flex items-center justify-center transition-all cursor-pointer"
                  title="Capture snapshot"
                >
                  <Camera className="w-6 h-6 text-slate-950" />
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-red-950/80 text-slate-300 hover:text-red-400 border border-slate-700 backdrop-blur-md transition flex items-center justify-center active:scale-95"
                  title="Close camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            /* Selected / Captured Image Preview */
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] max-h-[380px] w-full max-w-lg mx-auto border border-slate-700 flex items-center justify-center shadow-xl">
              <img
                src={selectedImage}
                alt="Selected meal preview"
                className="w-full h-full object-cover"
              />

              {/* Scanning overlay effect when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-3 z-30">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                    <Sparkles className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-white font-bold text-base sm:text-lg">Analyzing Food with AI...</p>
                    <p className="text-slate-400 text-xs mt-0.5">Identifying portion geometry & macros</p>
                  </div>
                  {/* Visual laser scanline animation */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                </div>
              )}

              {/* Reset preview button */}
              {!isAnalyzing && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setCustomHint('');
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md transition shadow-md active:scale-95"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Main Capture Action Card */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed transition-all p-5 sm:p-8 text-center flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                <Camera className="w-7 h-7" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                Take a Photo of Your Food
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Use your device camera or pick a picture from your photo gallery.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full max-w-xs sm:max-w-none">
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Live Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose from Gallery</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}
        </div>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Selected Image Actions & Context Hint */}
        {selectedImage && !isAnalyzing && (
          <div className="mt-4 space-y-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Optional: Specify Dish Name</span>
                </label>
                <span className="text-[10px] text-slate-500">Helps AI accuracy</span>
              </div>
              <input
                type="text"
                value={customHint}
                onChange={(e) => setCustomHint(e.target.value)}
                placeholder="e.g. 'Masala Dosa with Sambar'..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setCustomHint('');
                }}
                className="px-4 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition active:scale-95"
              >
                Retake
              </button>

              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Estimate Calories & Macros</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 100% Authentic Indian Dishes Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
              Authentic Indian Foods ({SAMPLE_FOODS.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAllSamples(!showAllSamples)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            {showAllSamples ? 'Show Fewer' : `View All (${SAMPLE_FOODS.length})`}
          </button>
        </div>

        {/* Category Filter Pills (Scrollable horizontally on mobile) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 text-xs cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Food Card Grid: 2 columns on phone, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
          {displayedSamples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group relative bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 shadow-md flex flex-col touch-pan-y select-none"
            >
              {/* Image Thumbnail with exact verified picture */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative pointer-events-none select-none">
                <img
                  src={sample.image}
                  alt={sample.name}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                />
                <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  {sample.calories} kcal
                </div>
              </div>

              {/* Card Details */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {sample.cuisine || sample.category}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-emerald-300 transition-colors">
                    {sample.name}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-bold">{sample.macros?.protein}g Protein</span>
                  <span>{sample.estimatedWeightGrams}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
