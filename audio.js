export const audio = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      try { if (AC) this.ctx = new AC(); } catch { /* Máy không có âm thanh vẫn chơi được. */ }
    }
  },

  playTone(freq = 440, type = 'sine', duration = 0.12, gainVal = 0.1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },

  // Còi xe bim bim vui nhộn
  playHonk() {
    this.playTone(349, 'triangle', 0.14, 0.15);
    setTimeout(() => this.playTone(440, 'triangle', 0.22, 0.15), 150);
  },

  // Trả lời đúng: Ting ting tươi sáng
  playCorrect() {
    this.playTone(523.25, 'sine', 0.12, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.15), 110); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.28, 0.18), 220); // G5
  },

  // Trả lời sai: Nốt trầm ấm dịu dàng, không gắt
  playWrong() {
    this.playTone(330, 'sine', 0.15, 0.08); // E4
    setTimeout(() => this.playTone(293.66, 'sine', 0.25, 0.08), 130); // D4
  },

  // Xe tăng tốc nổ máy vroom
  playEngineBoost() {
    [220, 260, 330, 440].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.1, 0.05), i * 60);
    });
  },

  // Fanfare chiến thắng
  playVictory() {
    const melody = [
      { f: 523, d: 0.14 },
      { f: 659, d: 0.14 },
      { f: 784, d: 0.18 },
      { f: 1046, d: 0.45 }
    ];
    melody.forEach((note, i) => {
      setTimeout(() => this.playTone(note.f, 'triangle', note.d, 0.18), i * 140);
    });
  }
};

