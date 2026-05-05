/** Play a pleasant completion chime using the Web Audio API (no file needed). */
export function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    const note = (freq: number, start: number, dur: number, vol = 0.55) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };

    const t = ctx.currentTime;
    // Ascending chime: C5 → E5 → G5 → C6
    note(523.25,  t,        0.55, 0.45);
    note(659.25,  t + 0.18, 0.55, 0.50);
    note(783.99,  t + 0.36, 0.55, 0.52);
    note(1046.50, t + 0.54, 0.90, 0.60);

    // Auto-close context after chime finishes
    window.setTimeout(() => ctx.close(), 2200);
  } catch {
    /* silently ignore if AudioContext unavailable */
  }
}

/** Short single beep for pause / halfway point. */
export function playBeep(freq = 660, dur = 0.18) {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    window.setTimeout(() => ctx.close(), 500);
  } catch { /* noop */ }
}

/** Vibrate the device if supported (mobile). */
export function vibrateDevice(pattern: number | number[] = [180, 80, 180, 80, 400]) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch { /* noop */ }
}
