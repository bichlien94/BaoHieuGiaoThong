import { audio } from './audio.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Lớp hiển thị đọc trạng thái game, không quyết định đáp án hay điểm thưởng.
export const presentation = {
  mode: 'start', manager: null, ready: false, frame: 0, last: 0, elapsed: 0, shakeUntil: 0,

  init(game) {
    this.game = game;
    this.effects = document.createElement('canvas');
    this.effects.id = 'celebration-canvas';
    this.effects.setAttribute('aria-hidden', 'true');
    document.getElementById('game-container').append(this.effects);
    this.particles = [];
    this.resize = () => {
      const host = document.getElementById('screen-drive');
      const canvas = document.getElementById('drive-canvas');
      canvas.width = host.clientWidth || 960;
      canvas.height = host.clientHeight || 620;
      const container = document.getElementById('game-container');
      this.effects.width = container.clientWidth;
      this.effects.height = container.clientHeight;
      this.manager?.resize();
    };
    window.addEventListener('resize', this.resize);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(document.getElementById('game-container'));

    const showScreen = game.showScreen.bind(game);
    game.showScreen = id => {
      showScreen(id);
      if (id !== 'screen-drive') {
        document.getElementById('overlay-question').classList.add('hidden');
        document.getElementById('overlay-map').classList.add('hidden');
      }
      this.switchMode(id === 'screen-start' ? 'start' : id === 'screen-result' ? 'result' : 'drive');
    };
    const updateProgress = game.updateTrackProgress.bind(game);
    game.updateTrackProgress = percent => {
      updateProgress(percent);
      document.querySelector('.track-road').setAttribute('aria-valuenow', percent);
    };
    // Một vòng lặp hiển thị, giữ bước vật lý gốc ở 60 Hz.
    const openMap = game.openJunctionMap.bind(game);
    game.openJunctionMap = () => {
      openMap();
      this.switchMode('junction');
      document.querySelector('.junction-header p').textContent =
        `${game.playerName}, cho xe chạy thử rồi chọn con đường ngắn nhất nhé!`;
      document.getElementById('btn-map-continue').onclick = null;
    };
    const chooseRoute = game.handleRouteChoice.bind(game);
    game.handleRouteChoice = (route, button) => {
      chooseRoute(route, button);
      this.manager?.chooseRoute(route.id);
      const next = document.getElementById('btn-map-continue');
      const proceed = next.onclick;
      // Đợi xe chạy thử xong trước khi đóng bản đồ.
      next.disabled = true;
      clearTimeout(this.routeTimer);
      this.routeTimer = setTimeout(() => { next.disabled = false; }, reducedMotion.matches ? 0 : 1200);
      next.onclick = () => {
        if (next.disabled) return;
        this.switchMode('drive');
        proceed();
      };
      if (route.id === game.currentDest.shortestId) this.celebrate();
    };
    const answer = game.handleSignAnswer.bind(game);
    game.handleSignAnswer = (index, question, sign) => {
      answer(index, question, sign);
      if (index === question.ans) this.celebrate();
      else {
        this.shakeUntil = performance.now() + 420;
        const dialog = document.querySelector('.dialog-box');
        dialog.classList.remove('soft-shake');
        void dialog.offsetWidth;
        dialog.classList.add('soft-shake');
      }
    };

    const sound = document.getElementById('btn-sound-toggle');
    sound.setAttribute('aria-label', 'Tắt âm thanh');
    sound.setAttribute('aria-pressed', 'false');
    sound.addEventListener('click', () => {
      sound.setAttribute('aria-label', audio.muted ? 'Bật âm thanh' : 'Tắt âm thanh');
      sound.setAttribute('aria-pressed', String(audio.muted));
    });
    const present = document.getElementById('btn-presentation');
    const container = document.getElementById('game-container');
    const syncFullscreen = () => {
      const active = document.fullscreenElement === container;
      container.classList.toggle('presenting', active);
      present.setAttribute('aria-pressed', String(active));
      present.setAttribute('aria-label', active ? 'Thoát trình chiếu toàn màn hình' : 'Trình chiếu toàn màn hình');
      present.title = active ? 'Thoát trình chiếu (Esc hoặc F)' : 'Trình chiếu toàn màn hình (phím F)';
      this.resize();
    };
    present.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await container.requestFullscreen();
      } catch {
        // Trình duyệt chặn fullscreen: vẫn bật bố cục và màu dễ chiếu.
        container.classList.toggle('presenting');
        present.setAttribute('aria-pressed', String(container.classList.contains('presenting')));
        present.title = 'Dùng phím F11 của trình duyệt để mở toàn màn hình';
        this.resize();
      }
    });
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('keydown', event => {
      if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey && !event.altKey
        && !event.target.closest('input, textarea, [contenteditable]')) {
        event.preventDefault(); present.click();
      }
    });
    // AudioContext chỉ được tạo từ thao tác đầu tiên của người chơi.
    const unlock = () => { audio.init(); audio.ctx?.resume().catch(() => {}); };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    for (const selector of ['.car-card', '.dest-card']) {
      document.querySelectorAll(selector).forEach(button => {
        button.setAttribute('aria-pressed', String(button.classList.contains('active')));
        button.addEventListener('click', () => {
          document.querySelectorAll(selector).forEach(item =>
            item.setAttribute('aria-pressed', String(item === button)));
          this.manager?.bounce(button.dataset.car || button.dataset.dest);
        });
      });
    }
    document.getElementById('q-explain').setAttribute('aria-live', 'polite');
    document.getElementById('map-feedback').setAttribute('aria-live', 'polite');
    document.getElementById('btn-replay').addEventListener('click', () => game.goStart());
    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(this.frame);
      this.last = 0;
      if (!document.hidden) this.animate(performance.now());
    });
    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(this.frame);
      this.manager?.dispose();
      this.manager = null;
    });
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
    this.resize();
    this.animate(performance.now());
    import('./scene.js').then(({ SceneManager }) => {
      this.manager = new SceneManager(game, () => this.useFallback());
      document.documentElement.classList.add('has-webgl');
      this.manager.setMode(this.mode);
      this.resize();
    }).catch(() => this.useFallback()).finally(() => { this.ready = true; });
  },

  useFallback() {
    this.manager?.dispose();
    this.manager = null;
    document.documentElement.classList.remove('has-webgl');
    document.getElementById('render-mode').textContent = 'Chuyến phiêu lưu sẵn sàng';
    this.resize();
  },

  switchMode(mode) {
    this.mode = mode;
    this.elapsed = 0;
    this.last = 0;
    this.particles.length = 0;
    this.effects.getContext('2d').clearRect(0, 0, this.effects.width, this.effects.height);
    this.manager?.setMode(mode);
    this.resize();
  },

  animate(now) {
    if (document.hidden) return;
    const dt = this.last ? Math.min(now - this.last, 100) : 0;
    this.last = now;
    if (this.mode === 'drive') {
      this.elapsed += dt;
      while (this.elapsed >= 1000 / 60) {
        this.game.updatePhysics();
        this.elapsed -= 1000 / 60;
      }
      if (!this.manager) this.game.render3D(document.getElementById('drive-canvas'));
    }
    this.manager?.render(now, dt / 1000, reducedMotion.matches, now < this.shakeUntil);
    this.drawEffects(dt / 1000);
    this.frame = requestAnimationFrame(time => this.animate(time));
  },

  celebrate(victory = false) {
    if (reducedMotion.matches) return;
    const colors = ['#FFD93D', '#FF8A3D', '#6BCB77', '#7DD3FC', '#A78BFA'];
    const count = victory ? 90 : 24;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.effects.width * (victory ? Math.random() : .5),
        y: victory ? -Math.random() * 200 : this.effects.height * .4,
        vx: (Math.random() - .5) * 220, vy: victory ? 110 + Math.random() * 140 : -160 - Math.random() * 180,
        rot: Math.random() * 6, color: colors[i % colors.length], life: victory ? 7 : 2, star: i % 4 === 0
      });
    }
    this.particles = this.particles.slice(-120);
  },

  drawEffects(dt) {
    const ctx = this.effects.getContext('2d');
    ctx.clearRect(0, 0, this.effects.width, this.effects.height);
    this.particles = this.particles.filter(p => p.life > 0 && p.y < this.effects.height + 40);
    for (const p of this.particles) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.rot += dt * 2;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life);
      ctx.fillStyle = p.color;
      if (p.star) { ctx.font = '22px sans-serif'; ctx.fillText('★', -10, 8); }
      else ctx.fillRect(-4, -6, 8, 12);
      ctx.restore();
    }
  }
};
