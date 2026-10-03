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
  Smartphone
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
      // User cancelled or permissions denied
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
      setCameraError('Unable to access camera. Please check permissions or upload an image file instead.');
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

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Food Vision Model</span>
            {isNative && (
              <span className="ml-1 pl-1 border-l border-emerald-500/30 text-emerald-300 font-normal flex items-center space-x-1">
                <Smartphone className="w-3 h-3" />
                <span>Android Native</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scan Your Meal & Estimate Calories
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Snap a photo or upload a picture. Our multimodal AI identifies ingredients, estimates portions, and breaks down macros in seconds.
          </p>
        </div>

        {/* Camera / Upload Interactive Canvas */}
        <div className="relative">
          {/* Active Live Web Camera Stream (Web only) */}
          {isCameraActive && !isNative ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] max-h-[460px] border border-emerald-500/40 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                </div>
                <div className="text-center">
                  <span className="bg-slate-950/70 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700/60 backdrop-blur-sm">
                    Center the dish in the frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>

              {/* Camera Controls Bar */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-4 z-20">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition"
                  title="Switch camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition"
                  title="Capture snapshot"
                >
                  <div className="w-full h-full rounded-full border-2 border-slate-950 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-slate-950" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-3 rounded-full bg-slate-900/80 hover:bg-red-950/80 text-slate-300 hover:text-red-400 border border-slate-700 backdrop-blur-md transition"
                  title="Close camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            /* Selected / Captured Image Preview */
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-[460px] aspect-[4/3] sm:aspect-[16/10] border border-slate-700 flex items-center justify-center group">
              <img
                src={selectedImage}
                alt="Selected meal preview"
                className="w-full h-full object-cover"
              />

              {/* Scanning overlay effect when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                    <Sparkles className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">AI Vision Analyzing Meal...</p>
                    <p className="text-slate-400 text-xs mt-1">Identifying ingredients & computing macros</p>
                  </div>
                  {/* Visual laser scanline animation */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                </div>
              )}

              {/* Reset preview button */}
              {!isAnalyzing && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setCustomHint('');
                    }}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition shadow-md"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Dropzone / Action Selector */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[280px] ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                {isNative ? <Smartphone className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                {isNative ? 'Snap with Android Camera' : 'Take a photo or upload an image'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
                {isNative
                  ? 'Open your Android camera to take a photo of your food or choose from your gallery.'
                  : 'Drag and drop your food picture here, capture live with camera, or select from your device.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isNative ? 'Launch Camera' : 'Open Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isNative ? 'Photo Gallery' : 'Browse File'}</span>
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
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Optional Custom Context / Dish Hint */}
        {selectedImage && !isAnalyzing && (
          <div className="mt-5 space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Identify / Confirm Dish (e.g. Dosa, Biryani, Roti)</span>
                </label>
                <span className="text-[11px] text-slate-500">Helps AI accuracy</span>
              </div>
              <input
                type="text"
                value={customHint}
                onChange={(e) => setCustomHint(e.target.value)}
                placeholder="Type dish name, e.g. 'Crispy Masala Dosa' or select below..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition"
              />

              {/* Quick Indian dish tags */}
              <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 font-medium">Quick select:</span>
                {[
                  'Crispy Masala Dosa',
                  'Steamed Idli Sambar',
                  'Rajma Chawal',
                  'Hyderabadi Chicken Biryani',
                  'Palak Paneer',
                  'Aloo Paratha',
                  'Paneer Butter Masala',
                  'Tandoori Chicken Tikka',
                  'Kanda Poha',
                  'Chole Bhature',
                  'Mumbai Pav Bhaji',
                  'Samosa'
                ].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCustomHint(name)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      customHint === name
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setCustomHint('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition"
              >
                Cancel / Choose Another
              </button>

              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Estimate Calories & Nutrients</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instant 1-Click Sample Meals Test Gallery */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Sample Dishes & Offline Library ({SAMPLE_FOODS.length} Pre-analyzed Dishes)
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Live AI analyzes ANY custom food photo</span>
            <button
              type="button"
              onClick={() => setShowAllSamples(!showAllSamples)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
            >
              {showAllSamples ? 'Show Fewer' : `View All (${SAMPLE_FOODS.length})`}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(showAllSamples ? SAMPLE_FOODS.filter(s => selectedCategory === 'All' || s.category === selectedCategory) : SAMPLE_FOODS.filter(s => selectedCategory === 'All' || s.category === selectedCategory).slice(0, 6)).map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col"
            >
              {/* Image Thumbnail */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative">
                <img
                  src={sample.image}
                  alt={sample.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  {sample.calories} kcal
                </div>
              </div>

              {/* Card Details */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">{sample.category}</span>
                  <h4 className="text-xs font-semibold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-emerald-300 transition-colors">
                    {sample.name}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{sample.macros.protein}g P</span>
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
