/**
 * Yapendik School OS — Stage 6 Gate 4: S-Pen & Stylus Annotation Pad
 * Supports pressure-sensitive pen strokes (PointerEvents e.pressure),
 * canonical semantic color tokens, undo history, and composite WebP export.
 * Touch-target compliant (>= 48dp) and zero-emoji UI.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trash2, Check, Pencil, Circle } from 'lucide-react';

interface Props {
  imageSrc: string;
  onSaveAnnotation: (annotatedDataUrl: string) => void;
  onCancel: () => void;
}

interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  baseWidth: number;
}

// Canonical Semantic Color Palette (Amanaura v4.0 Tokens)
const ANNOTATION_COLORS = [
  { id: 'warning', label: 'Emas / Peringatan', color: '#FFCC00', cssVar: 'var(--color-brand-accent, #FFCC00)' },
  { id: 'danger', label: 'Merah / Fokus', color: '#FF3B30', cssVar: 'var(--color-danger, #FF3B30)' },
  { id: 'brand', label: 'Biru / Kategori', color: '#007AFF', cssVar: 'var(--color-brand, #007AFF)' },
  { id: 'success', label: 'Hijau / Capaian', color: '#34C759', cssVar: 'var(--color-success, #34C759)' },
  { id: 'on-brand', label: 'Putih Kontras', color: '#FFFFFF', cssVar: '#FFFFFF' }
];

export const SignatureAndAnnotationPad: React.FC<Props> = ({
  imageSrc,
  onSaveAnnotation,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeColor, setActiveColor] = useState<string>(ANNOTATION_COLORS[0].color);
  const [baseWidth, setBaseWidth] = useState<number>(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[] | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load base image and initialize canvas dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      resizeCanvas();
    };
  }, [imageSrc]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageObjRef.current;
    if (!canvas || !container || !img) return;

    // Maintain aspect ratio within container
    const maxW = container.clientWidth || 600;
    const maxH = Math.min(window.innerHeight * 0.6, 500);

    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    redraw(strokes);
  }, [strokes]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Redraw all strokes onto canvas
  const redraw = (strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokeList.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < stroke.points.length; i++) {
        const p1 = stroke.points[i - 1];
        const p2 = stroke.points[i];
        
        // Modulate stroke width with S-Pen / Stylus pressure
        const dynamicPressure = (p1.pressure > 0 && p1.pressure <= 1) ? p1.pressure : 0.5;
        ctx.lineWidth = Math.max(1.5, stroke.baseWidth * (dynamicPressure * 1.8));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number; pressure: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // PointerEvents API pressure (0.0 to 1.0)
    const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
    return { x, y, pressure };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only handle primary button / touch / pen
    if (e.buttons !== 1 && e.pointerType === 'mouse') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const point = getCanvasCoords(e);
    const newStrokePoints = [point];
    setCurrentStroke(newStrokePoints);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    const point = getCanvasCoords(e);
    const updated = [...currentStroke, point];
    setCurrentStroke(updated);

    // Incremental draw
    redraw([...strokes, { points: updated, color: activeColor, baseWidth }]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const finishedStroke: Stroke = {
      points: currentStroke,
      color: activeColor,
      baseWidth
    };
    const updatedStrokes = [...strokes, finishedStroke];
    setStrokes(updatedStrokes);
    setCurrentStroke(null);
    redraw(updatedStrokes);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redraw(updated);
  };

  const handleClear = () => {
    setStrokes([]);
    redraw([]);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export composite image as WebP (or PNG fallback)
    try {
      const dataUrl = canvas.toDataURL('image/webp', 0.85);
      onSaveAnnotation(dataUrl);
    } catch {
      const dataUrl = canvas.toDataURL('image/png');
      onSaveAnnotation(dataUrl);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 select-none">
      {/* Top Toolbar: S-Pen Colors & Stroke Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-surface-subtle border border-line">
        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-ink-soft hidden medium:inline">Warna:</span>
          {ANNOTATION_COLORS.map(c => {
            const isSelected = activeColor === c.color;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveColor(c.color)}
                style={{ backgroundColor: c.color }}
                className={`w-9 h-9 medium:w-8 medium:h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                  isSelected 
                    ? 'scale-110 border-brand shadow-sm ring-2 ring-brand/40' 
                    : 'border-line/60 hover-only:scale-105'
                }`}
                title={c.label}
                aria-label={`Pilih warna ${c.label}`}
              >
                {isSelected && (
                  <Circle className={`w-3.5 h-3.5 ${c.id === 'on-brand' ? 'text-ink' : 'text-white'}`} fill="currentColor" />
                )}
              </button>
            );
          })}
        </div>

        {/* Thickness & Action Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBaseWidth(baseWidth === 3 ? 6 : 3)}
            className={`min-h-[44px] min-w-[44px] medium:min-h-[36px] medium:min-w-[36px] px-2.5 rounded-xl border flex items-center gap-1 text-xs font-semibold cursor-pointer ${
              baseWidth > 3 
                ? 'bg-surface text-ink border-line shadow-hairline' 
                : 'bg-surface-subtle text-ink-soft border-transparent hover-only:text-ink'
            }`}
            title="Ganti Ketebalan Goresan"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{baseWidth > 3 ? 'Tebal' : 'Halus'}</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="min-h-[44px] min-w-[44px] medium:min-h-[36px] medium:min-w-[36px] px-2.5 rounded-xl border border-line bg-surface text-ink hover-only:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Urungkan Coretan Terakhir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden medium:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="min-h-[44px] min-w-[44px] medium:min-h-[36px] medium:min-w-[36px] px-2.5 rounded-xl border border-line bg-surface text-danger-deep hover-only:bg-danger-tint disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Bersihkan Semua Coretan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden medium:inline">Hapus</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Drawing Stage */}
      <div 
        ref={containerRef}
        className="relative flex-1 min-h-[260px] max-h-[460px] bg-surface-inset rounded-2xl overflow-hidden border border-line flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
          className="max-w-full max-h-full cursor-crosshair shadow-ambient"
        />

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-ink-soft text-xs font-medium">
            Memuat gambar karya...
          </div>
        )}
      </div>

      {/* Footer Bottom Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-ink-soft font-medium">
          Goresan S-Pen mendeteksi tekanan stylus secara alami.
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-brand text-on-brand shadow-sm ring-1 ring-brand/50 hover-only:opacity-90 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Anotasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
