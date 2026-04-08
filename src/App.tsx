import React, { useState, useEffect, useMemo } from "react";
import { Copy, Check, Palette, Code, RefreshCw, Layers, ExternalLink, Moon, Sun, Sparkles, Heart, Flower, Cloud, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import chroma from "chroma-js";
import { oklch, differenceEuclidean, converter } from "culori";
import { generatePalette, getTailwindConfig, getCssVariables, ColorPalette } from "./lib/color-utils";
import { cn } from "./lib/utils";

export default function App() {
  const [baseColor, setBaseColor] = useState("#ffb7c5"); // Sakura Pink
  const [copied, setCopied] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Generate palette whenever baseColor changes
  const paletteResult = useMemo(() => {
    try {
      if (chroma.valid(baseColor)) {
        return generatePalette(baseColor);
      }
    } catch (e) {
      console.error("Invalid color", e);
    }
    return null;
  }, [baseColor]);

  const palette = paletteResult?.palette || null;
  const closestStep = paletteResult?.baseStep || null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getRandomColor = () => {
    const randomHex = chroma.random().hex();
    setBaseColor(randomHex);
  };

  const getContrastColor = (hex: string) => {
    return chroma(hex).luminance() > 0.5 ? "#4a4a4a" : "#ffffff";
  };

  const getContrastRatio = (color: string, background: string) => {
    return chroma.contrast(color, background);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans selection:bg-pastel-pink selection:text-white",
      isDarkMode ? "bg-[#2d2a2e] text-[#e3e1e4]" : "bg-[#fff9fb] text-[#4a4a4a]"
    )}>
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <Cloud className="absolute top-10 left-10 w-24 h-24 text-pastel-blue animate-pulse" />
        <Heart className="absolute bottom-20 right-20 w-16 h-16 text-pastel-pink animate-bounce" />
        <Flower className="absolute top-1/2 left-1/4 w-12 h-12 text-pastel-green rotate-12" />
        <Star className="absolute top-1/4 right-1/3 w-8 h-8 text-pastel-yellow animate-spin" />
      </div>

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 border-b-4 backdrop-blur-md",
        isDarkMode ? "bg-[#2d2a2e]/80 border-[#3e3b3f]" : "bg-white/80 border-[#ffecf0]"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">            
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ff8fa3] to-[#7bdcb5]">
                Palette Pixie
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Color Generator🎨</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isDarkMode ? "bg-[#3e3b3f] text-pastel-yellow" : "bg-[#fff0f3] text-[#ff8fa3]"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-10">
            <section className="cute-card">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-pastel-pink fill-pastel-pink" />
                <h2 className="text-lg font-display font-bold">Pick a Base Color</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-[#fffcfd] border-2 border-[#ffecf0]">
                  <div className="relative">
                    <input
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-20 h-20 rounded-2xl cursor-pointer border-none bg-transparent"
                    />
                    <div className="absolute inset-0 rounded-2xl pointer-events-none border-4 border-white shadow-inner" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={baseColor.toUpperCase()}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl border-2 font-mono text-xl focus:outline-none focus:ring-4 transition-all",
                        isDarkMode 
                          ? "bg-[#3e3b3f] border-[#4e4b4f] focus:ring-pastel-pink/20" 
                          : "bg-white border-[#ffecf0] focus:ring-pastel-pink/30"
                      )}
                    />
                  </div>
                </div>
                
                <button
                  onClick={getRandomColor}
                  className="w-full cute-button bg-pastel-green text-[#4a4a4a] hover:bg-[#b8f5b8] flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" /> Surprise Me!
                </button>
              </div>
            </section>

            <section className="cute-card bg-[#f0fff0] border-[#e0f7e0]">
              <div className="flex items-center gap-2 mb-6">
                <Code className="w-5 h-5 text-[#7bdcb5]" />
                <h2 className="text-lg font-display font-bold">Magic Code</h2>
              </div>
              <div className="space-y-4">
                <ExportCard
                  title="Tailwind Config"
                  icon={<Sparkles className="w-4 h-4" />}
                  content={palette ? getTailwindConfig(palette) : ""}
                  onCopy={() => palette && handleCopy(getTailwindConfig(palette), "tailwind")}
                  isCopied={copied === "tailwind"}
                  isDarkMode={isDarkMode}
                />
                <ExportCard
                  title="CSS Variables"
                  icon={<Layers className="w-4 h-4" />}
                  content={palette ? getCssVariables(palette) : ""}
                  onCopy={() => palette && handleCopy(getCssVariables(palette), "css")}
                  isCopied={copied === "css"}
                  isDarkMode={isDarkMode}
                />
              </div>
            </section>
          </div>

          {/* Right Column: Palette & Preview */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Palette Grid */}
            <section className="cute-card">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Palette className="w-6 h-6 text-pastel-pink" />
                  <h2 className="text-xl font-display font-bold">Your Application Palette</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-pastel-blue/30 text-[10px] font-bold uppercase tracking-widest text-pastel-blue-dark">
                  OKLCH Model
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-3">
                {palette && (Object.entries(palette) as [string, string][]).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([step, hex]) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: parseInt(step) / 5000 }}
                    className="group relative"
                  >
                    <div
                      className={cn(
                        "aspect-[3/4] rounded-2xl shadow-sm flex flex-col items-center justify-end pb-3 gap-1 transition-all hover:scale-110 cursor-pointer relative border-2 border-white",
                        closestStep === step && "ring-4 ring-pastel-pink/50",
                      )}
                      style={{ 
                        backgroundColor: hex,
                      } as React.CSSProperties}
                      onClick={() => handleCopy(hex, `step-${step}`)}
                    >
                      {closestStep === step && (
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                          <Star className="w-4 h-4 text-pastel-yellow fill-pastel-yellow" />
                        </div>
                      )}
                      
                      <span 
                        className="text-[10px] font-bold uppercase tracking-tighter bg-white/30 backdrop-blur-sm px-2 rounded-full"
                        style={{ color: getContrastColor(hex) }}
                      >
                        {step}
                      </span>

                      <AnimatePresence mode="wait">
                        {copied === `step-${step}` ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="w-4 h-4" style={{ color: getContrastColor(hex) }} />
                          </motion.div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                            <span 
                              className="text-[8px] font-mono font-bold"
                              style={{ color: getContrastColor(hex) }}
                            >
                              {hex.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Live Preview */}
            <section className="space-y-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pastel-yellow" />
                <h2 className="text-xl font-display font-bold">Magic Preview</h2>
              </div>
              
              <div className={cn(
                "p-10 rounded-[3rem] border-8 shadow-2xl space-y-10 relative overflow-hidden",
                isDarkMode ? "bg-[#2d2a2e] border-[#3e3b3f]" : "bg-white border-[#fff0f3]"
              )}>
                {/* Background Sparkles */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Star className="w-32 h-32 text-pastel-yellow" />
                </div>

                {/* Hero Preview */}
                <div className="space-y-6 relative z-10">
                  <h3 className="text-4xl font-display font-bold leading-tight">
                    Make your world <span className="relative inline-block">
                      <span style={{ color: palette?.["500"] || baseColor }}>{baseColor.toUpperCase()}</span>
                      <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke={palette?.["300"] || baseColor} strokeWidth="4" />
                      </svg>
                    </span>
                  </h3>
                  <p className="max-w-xl text-lg opacity-70 leading-relaxed font-medium">
                    Create the softest, most magical palettes for your next big adventure! 
                    Perfect for cozy apps and dreamy designs. ✨
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <button
                      className="cute-button text-white shadow-xl hover:brightness-110"
                      style={{ backgroundColor: palette?.["500"] || baseColor }}
                    >
                      Magical Action
                    </button>
                    <button
                      className="cute-button border-4 bg-white hover:bg-[#fff9fb]"
                      style={{ borderColor: palette?.["500"] || baseColor, color: palette?.["500"] || baseColor }}
                    >
                      Soft Button
                    </button>
                  </div>
                </div>

                {/* Component Previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Card Preview */}
                  <div 
                    className="cute-card border-dashed"
                    style={{ 
                      backgroundColor: isDarkMode ? `${palette?.["950"] || "#000"}20` : `${palette?.["50"] || "#fff"}80`,
                      borderColor: palette?.["300"] || baseColor
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center shadow-md" style={{ backgroundColor: palette?.["500"] || baseColor }}>
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </div>
                    <h4 className="text-xl font-display font-bold mb-2">Sweet Feature</h4>
                    <p className="opacity-70 font-medium">
                      Everything is better with a little bit of magic! 🎀
                    </p>
                  </div>

                  {/* Alert Preview */}
                  <div 
                    className="p-6 rounded-[2rem] border-4 flex gap-4 items-center shadow-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? `${palette?.["900"] || "#000"}30` : `${palette?.["100"] || "#fff"}50`,
                      borderColor: palette?.["500"] || baseColor
                    }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: palette?.["500"] || baseColor }}>
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <h5 className="font-display font-bold" style={{ color: palette?.["800"] || baseColor }}>Yay! It Worked!</h5>
                      <p className="text-sm opacity-80 font-medium" style={{ color: palette?.["700"] || baseColor }}>
                        Your palette is ready to sparkle.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className={cn(
        "mt-24 py-16 border-t-4 text-center relative",
        isDarkMode ? "border-[#3e3b3f]" : "border-[#ffecf0]"
      )}>
        <div className="flex justify-center gap-4 mb-4">
          <Heart className="w-5 h-5 text-pastel-pink" />
          <Star className="w-5 h-5 text-pastel-green" />
          <Cloud className="w-5 h-5 text-pastel-blue" />
        </div>
        <p className="font-display font-bold text-lg opacity-60">Made with love by Pari Yadav✨</p>
        <p className="text-xs mt-2 opacity-40">© 2026 Palette Pixie(Inspired by UI Colors)</p>
      </footer>
    </div>
  );
}

interface ExportCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  onCopy: () => void;
  isCopied: boolean;
  isDarkMode: boolean;
}

function ExportCard({ title, icon, content, onCopy, isCopied, isDarkMode }: ExportCardProps) {
  return (
    <div className={cn(
      "rounded-3xl border-2 overflow-hidden transition-all",
      isDarkMode ? "bg-[#2d2a2e] border-[#3e3b3f]" : "bg-white border-[#ffecf0]"
    )}>
      <div className="px-4 py-3 border-b-2 flex items-center justify-between bg-[#fffcfd] dark:bg-[#3e3b3f]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
          {icon}
          {title}
        </div>
        <button
          onClick={onCopy}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isCopied 
              ? "bg-pastel-green text-[#4a4a4a]" 
              : "hover:bg-pastel-pink/20 text-pastel-pink"
          )}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4">
        <pre className="text-[10px] font-mono overflow-x-auto max-h-40 opacity-70 scrollbar-hide">
          {content}
        </pre>
      </div>
    </div>
  );
}
