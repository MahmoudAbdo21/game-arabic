export function playAudio(url: string | undefined, fallbackText?: string) {
  if (url) {
    console.log(`[AUDIO ORCHESTRATOR] Playing SCRIPT_ONLY track: ${url}`);
  }
  
  if (fallbackText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fallbackText);
    u.lang = 'ar-EG';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }
}
