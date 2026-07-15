import React from "react";

interface TranscriptOverlayProps {
  cues: Array<{ kind: string; text: string }>;
  onClose: () => void;
}

export function TranscriptOverlay({ cues, onClose }: TranscriptOverlayProps) {
  if (cues.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none p-8">
      <div className="bg-slate-900/90 text-white p-6 rounded-2xl max-w-2xl w-full pointer-events-auto backdrop-blur-md shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-300">النص الصوتي (SCRIPT_ONLY)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            إغلاق
          </button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {cues.map((cue, i) => (
            <div key={i} className="flex gap-3 text-lg leading-relaxed">
              <span className="text-sky-400 text-sm font-mono mt-1 w-20 shrink-0">[{cue.kind}]</span>
              <span>{cue.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
