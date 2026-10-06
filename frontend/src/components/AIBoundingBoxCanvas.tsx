import React, { useState, useRef, useEffect } from 'react';
import { Detection } from '../types';
import { ShieldAlert, Sparkles, Move, Maximize2 } from 'lucide-react';

interface Props {
  imageUrl: string;
  detections: Detection[];
  onSelectDetection?: (det: Detection) => void;
  onUpdateDetections?: (updated: Detection[]) => void;
  showScanningAnimation?: boolean;
  isEditable?: boolean;
}

export const AIBoundingBoxCanvas: React.FC<Props> = ({
  imageUrl,
  detections,
  onSelectDetection,
  onUpdateDetections,
  showScanningAnimation = true,
  isEditable = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localDetections, setLocalDetections] = useState<Detection[]>(detections);
  const [activeDet, setActiveDet] = useState<Detection | null>(null);

  // Dragging & Resizing States
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    isResizing: boolean;
    detId: number | null;
    corner?: 'tl' | 'tr' | 'bl' | 'br';
    startX: number;
    startY: number;
    initialBbox: { x: number; y: number; w: number; h: number };
  } | null>(null);

  useEffect(() => {
    setLocalDetections(detections);
  }, [detections]);

  const getSeverityColor = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL': return { border: 'border-red-500', bg: 'bg-red-500/20', text: 'text-red-400', badge: 'bg-red-500' };
      case 'HIGH': return { border: 'border-amber-500', bg: 'bg-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500' };
      case 'MEDIUM': return { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500' };
      default: return { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500' };
    }
  };

  // Start Moving Bounding Box
  const handleMouseDownBox = (e: React.MouseEvent, det: Detection) => {
    if (!isEditable) return;
    e.stopPropagation();
    setActiveDet(det);
    if (onSelectDetection) onSelectDetection(det);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setDragState({
      isDragging: true,
      isResizing: false,
      detId: det.id,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      initialBbox: { x: det.bbox_x, y: det.bbox_y, w: det.bbox_w, h: det.bbox_h }
    });
  };

  // Start Resizing Corner
  const handleMouseDownCorner = (e: React.MouseEvent, det: Detection, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    if (!isEditable) return;
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setDragState({
      isDragging: false,
      isResizing: true,
      detId: det.id,
      corner,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      initialBbox: { x: det.bbox_x, y: det.bbox_y, w: det.bbox_w, h: det.bbox_h }
    });
  };

  // Handle Drag / Resize Movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = (currentX - dragState.startX) / rect.width;
    const deltaY = (currentY - dragState.startY) / rect.height;

    setLocalDetections(prev => {
      const updated = prev.map(det => {
        if (det.id !== dragState.detId) return det;

        let { x, y, w, h } = dragState.initialBbox;

        if (dragState.isDragging) {
          // Move Box
          x = Math.max(0, Math.min(1 - w, x + deltaX));
          y = Math.max(0, Math.min(1 - h, y + deltaY));
        } else if (dragState.isResizing) {
          // Resize Box
          if (dragState.corner === 'br') {
            w = Math.max(0.1, Math.min(1 - x, w + deltaX));
            h = Math.max(0.1, Math.min(1 - y, h + deltaY));
          } else if (dragState.corner === 'bl') {
            const newX = Math.max(0, Math.min(x + w - 0.1, x + deltaX));
            w = w + (x - newX);
            x = newX;
            h = Math.max(0.1, Math.min(1 - y, h + deltaY));
          } else if (dragState.corner === 'tr') {
            w = Math.max(0.1, Math.min(1 - x, w + deltaX));
            const newY = Math.max(0, Math.min(y + h - 0.1, y + deltaY));
            h = h + (y - newY);
            y = newY;
          } else if (dragState.corner === 'tl') {
            const newX = Math.max(0, Math.min(x + w - 0.1, x + deltaX));
            w = w + (x - newX);
            x = newX;
            const newY = Math.max(0, Math.min(y + h - 0.1, y + deltaY));
            h = h + (y - newY);
            y = newY;
          }
        }

        const estArea = parseFloat((w * h * 24.0).toFixed(1));

        return {
          ...det,
          bbox_x: parseFloat(x.toFixed(3)),
          bbox_y: parseFloat(y.toFixed(3)),
          bbox_w: parseFloat(w.toFixed(3)),
          bbox_h: parseFloat(h.toFixed(3)),
          estimated_area_m2: estArea
        };
      });

      if (onUpdateDetections) onUpdateDetections(updated);
      return updated;
    });
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl group select-none"
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt="Infrastructure AI Inspection"
        className="w-full h-auto object-cover max-h-[460px] pointer-events-none"
        crossOrigin="anonymous"
      />

      {/* Cyber AI Scanning Line Effect */}
      {showScanningAnimation && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline" />
        </div>
      )}

      {/* Top Banner AI Tag */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-semibold text-cyan-300 z-10 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>CIVICVISION AI VISION ENGINE</span>
        <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
          {localDetections.length} DETECTED
        </span>
        {isEditable && (
          <span className="text-[10px] text-amber-300 font-medium hidden sm:inline border-l border-cyan-500/30 pl-2">
            ✨ Move or resize boxes to adjust detection zone
          </span>
        )}
      </div>

      {/* Overlay Bounding Boxes */}
      {localDetections.map((det, idx) => {
        const style = getSeverityColor(det.severity);
        const leftPct = `${det.bbox_x * 100}%`;
        const topPct = `${det.bbox_y * 100}%`;
        const widthPct = `${det.bbox_w * 100}%`;
        const heightPct = `${det.bbox_h * 100}%`;
        const isBeingDragged = dragState?.detId === det.id;

        return (
          <div
            key={det.id || idx}
            onMouseDown={(e) => handleMouseDownBox(e, det)}
            style={{
              left: leftPct,
              top: topPct,
              width: widthPct,
              height: heightPct
            }}
            className={`absolute border-2 ${style.border} ${style.bg} rounded-xl cursor-move transition-shadow ${
              isBeingDragged ? 'z-30 ring-2 ring-cyan-400 scale-[1.01] shadow-2xl' : 'hover:z-20 hover:border-cyan-400'
            }`}
          >
            {/* Box Header Label */}
            <div className={`absolute -top-7 left-0 ${style.badge} text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20`}>
              <Move className="w-3 h-3 text-slate-950" />
              <span>{det.issue_type.replace('_', ' ')}</span>
              <span className="bg-slate-950/30 text-white px-1.5 rounded text-[10px]">
                {det.confidence}%
              </span>
            </div>

            {/* Resizable Corner Handles */}
            {isEditable && (
              <>
                <div
                  onMouseDown={(e) => handleMouseDownCorner(e, det, 'tl')}
                  className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                />
                <div
                  onMouseDown={(e) => handleMouseDownCorner(e, det, 'tr')}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                />
                <div
                  onMouseDown={(e) => handleMouseDownCorner(e, det, 'bl')}
                  className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                />
                <div
                  onMouseDown={(e) => handleMouseDownCorner(e, det, 'br')}
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                />
              </>
            )}

            {/* Damage Area Badge inside box */}
            <div className="absolute bottom-1.5 right-1.5 bg-slate-950/85 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700/80 shadow-md">
              {det.estimated_area_m2} m²
            </div>
          </div>
        );
      })}

      {/* Selected Detection Detail Drawer */}
      {activeDet && (
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-xl p-4 rounded-2xl border border-cyan-500/40 text-xs text-slate-200 z-30 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase tracking-tight text-xs">
                {activeDet.issue_type.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getSeverityColor(activeDet.severity).badge} text-slate-950`}>
                {activeDet.severity}
              </span>
            </div>
            <button
              onClick={() => setActiveDet(null)}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-0.5 rounded-lg bg-slate-800"
            >
              Close
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5 font-normal">
            {activeDet.ai_explanation}
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
            <span>AI Confidence: <strong className="text-cyan-400">{activeDet.confidence}%</strong></span>
            <span>Est. Defect Area: <strong className="text-cyan-400">{activeDet.estimated_area_m2} m²</strong></span>
            <span>Box Coords: <strong className="text-slate-300">[{activeDet.bbox_x}, {activeDet.bbox_y}, {activeDet.bbox_w}, {activeDet.bbox_h}]</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
