import { audio } from './audio.js';
import { SIGNS_DATA, CAR_STYLES, DESTINATIONS } from './data.js';
import { fallback } from './fallback.js';
import { presentation } from './ui.js';

const game = {
  playerName: 'Bạn nhỏ',
  selectedCarId: 'red_family',
  selectedDestId: 'library',

  currentDest: null,
  currentCar: null,
  score: 0,
  signIndex: 0, // 0..3
  correctSigns: 0,
  chosenRoute: null,
  isJunctionPassed: false,

  // Tham số xe chạy
  carSpeed: 0,
  baseTargetSpeed: 1.45,
  targetSpeed: 1.45,
  roadDistance: 0,
  isDriving: false,
  signZ: 1000,
  approachingSign: null,
  animId: null,

  // Hiệu ứng tăng tốc khi trả lời đúng
  isBoosted: false,
  boostTimer: 0,

  init() {
    this.bindDomEvents();
  },

  bindDomEvents() {
    // 1. Tên bé
    const nameInput = document.getElementById('child-name-input');
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.playerName = val.length > 0 ? val : 'Bạn nhỏ';
    });

    // 2. Chọn xe
    document.querySelectorAll('.car-card').forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playHonk();
        document.querySelectorAll('.car-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCarId = btn.getAttribute('data-car');
      });
    });

    // 3. Chọn điểm đến
    document.querySelectorAll('.dest-card').forEach(card => {
      card.addEventListener('click', () => {
        audio.playTone(480, 'sine', 0.1);
        document.querySelectorAll('.dest-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedDestId = card.getAttribute('data-dest');
      });
    });

    // 4. Bật/tắt âm thanh
    const soundBtn = document.getElementById('btn-sound-toggle');
    soundBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      soundBtn.textContent = audio.muted ? '🔇' : '🔊';
      if (!audio.muted) audio.playTone(523, 'sine', 0.1);
    });

    // 5. Nút Bắt đầu hành trình
    document.getElementById('btn-start-game').addEventListener('click', () => {
      audio.playHonk();
      this.startTrip();
    });
  },

  startTrip() {
    const nameInput = document.getElementById('child-name-input');
    const val = nameInput.value.trim();
    this.playerName = val.length > 0 ? val : 'Bạn nhỏ';

    this.currentCar = CAR_STYLES[this.selectedCarId];
    this.currentDest = DESTINATIONS[this.selectedDestId];

    this.score = 0;
    this.signIndex = 0;
    this.correctSigns = 0;
    this.chosenRoute = null;
    this.isJunctionPassed = false;
    this.carSpeed = 0;
    this.targetSpeed = this.baseTargetSpeed;
    this.roadDistance = 0;
    this.isBoosted = false;

    // Cập nhật thông tin HUD
    document.getElementById('hud-car-badge').textContent = `${this.currentCar.icon} ${this.playerName}`;
    document.getElementById('hud-dest-name').textContent = `📍 Đích: ${this.currentDest.name}`;
    document.getElementById('hud-score-val').textContent = this.score;
    document.getElementById('track-dest-flag').textContent = this.currentDest.icon;
    document.getElementById('track-car-indicator').textContent = this.currentCar.icon;

    // Reset các mốc checkpoint đường đua
    for (let i = 1; i <= 4; i++) {
      const cp = document.getElementById(`cp-${i}`);
      cp.className = 'track-checkpoint';
      cp.textContent = i;
    }
    this.updateTrackProgress(0);

    this.showScreen('screen-drive');
    this.initCanvas3D();
    this.scheduleNextSign();
  },

  updateTrackProgress(percent) {
    const carInd = document.getElementById('track-car-indicator');
    carInd.style.left = `${Math.min(94, Math.max(5, percent))}%`;
  },

  passCheckpoint(index) {
    const cp = document.getElementById(`cp-${index}`);
    if (cp) {
      cp.className = 'track-checkpoint passed';
      cp.textContent = '⭐';
    }
  },

  scheduleNextSign() {
    // Cập nhật vị trí xe trên thanh đường đua
    const progressMap = [10, 30, 60, 85, 96];
    this.updateTrackProgress(progressMap[this.signIndex] || 10);

    if (this.signIndex < 2) {
      // 2 biển báo đầu tiên trước ngã rẽ
      this.approachingSign = this.currentDest.signs[this.signIndex];
      this.signZ = 980;
      this.isDriving = true;
      this.targetSpeed = this.baseTargetSpeed;
      this.updateStatus(`🚗 Bé ${this.playerName} đang lái xe trên đường... Quan sát biển báo nhé!`);
    } else if (this.signIndex === 2 && !this.isJunctionPassed) {
      // Đến ngã rẽ -> Hiện bản đồ tính đường ngắn nhất
      this.isDriving = false;
      this.carSpeed = 0;
      this.updateStatus(`🛑 Đã đến ngã rẽ! Bé ${this.playerName} hãy xem bản đồ chọn đường ngắn nhất.`);
      setTimeout(() => this.openJunctionMap(), 600);
    } else if (this.signIndex < 4) {
      // 2 biển báo tiếp theo sau khi rẽ
      this.approachingSign = this.currentDest.signs[this.signIndex];
      this.signZ = 980;
      this.isDriving = true;
      this.targetSpeed = this.baseTargetSpeed;
      this.updateStatus(`🚗 Đang tiến vào đoạn đường đã chọn, chú ý biển báo tiếp theo!`);
    } else {
      // Về đích
      this.isDriving = true;
      this.approachingSign = 'FINISH';
      this.signZ = 980;
      this.updateTrackProgress(96);
      this.updateStatus(`🏁 Hoan hô! Sắp đến cổng ${this.currentDest.name} rồi!`);
    }
  },

  updateStatus(txt) {
    document.getElementById('drive-toast').textContent = txt;
  },

  bumpScore(added) {
    this.score += added;
    const badge = document.getElementById('hud-score-badge');
    const val = document.getElementById('hud-score-val');
    val.textContent = this.score;
    badge.classList.remove('bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump');
  },

  // ================= 3D CANVAS RENDERER =================
  initCanvas3D() {
    presentation.resize();
  },

  updatePhysics() {
    if (this.isDriving) {
      // Xử lý hiệu ứng tăng tốc Speed Boost khi vừa trả lời đúng
      if (this.isBoosted) {
        this.boostTimer--;
        this.targetSpeed = 3.2; // vút nhanh
        if (this.boostTimer <= 0) {
          this.isBoosted = false;
          this.targetSpeed = this.baseTargetSpeed;
        }
      }

      this.carSpeed += (this.targetSpeed - this.carSpeed) * 0.05;
      this.roadDistance += this.carSpeed;

      if (this.approachingSign) {
        this.signZ -= this.carSpeed * 3.4;

        if (this.signZ <= 90) {
          this.isDriving = false;
          this.carSpeed = 0;

          if (this.approachingSign === 'FINISH') {
            audio.playVictory();
            setTimeout(() => this.showVictory(), 700);
          } else {
            audio.playTone(360, 'sine', 0.15);
            setTimeout(() => this.openSignQuestion(this.approachingSign), 400);
          }
        }
      }
    } else {
      this.carSpeed += (0 - this.carSpeed) * 0.08;
    }
  },

  // ================= 4. CÂU HỎI BIỂN BÁO =================
  openSignQuestion(signId) {
    const sign = SIGNS_DATA[signId];
    this.currentQPhase = 'SHAPE';

    document.getElementById('q-badge').textContent = `BIỂN BÁO SỐ ${this.signIndex + 1}/4`;
    const signImage = document.getElementById('q-sign-img');
    signImage.replaceChildren();
    signImage.innerHTML = sign.svg;
    signImage.setAttribute('role', 'img');
    signImage.setAttribute('aria-label', sign.name);
    document.getElementById('q-sign-title').textContent = sign.name;
    document.getElementById('q-sign-hint').textContent = sign.hint;

    this.renderQuestionPhase(sign);
    document.getElementById('overlay-question').classList.remove('hidden');
  },

  renderQuestionPhase(sign) {
    const qData = this.currentQPhase === 'SHAPE' ? sign.qShape : sign.qMeaning;
    document.getElementById('q-question-text').textContent =
      (this.currentQPhase === 'SHAPE' ? '① Nhận diện hình dáng: ' : '② Ý nghĩa & công dụng: ') + qData.q;

    const optsEl = document.getElementById('q-options');
    optsEl.innerHTML = '';

    const fb = document.getElementById('q-explain');
    fb.className = 'feedback-bubble';
    fb.textContent = '';

    const nextBtn = document.getElementById('btn-q-continue');
    nextBtn.className = 'btn-dialog-next';

    qData.opts.forEach((optText, i) => {
      const btn = document.createElement('button');
      btn.className = 'opt-choice-btn';
      btn.textContent = optText;
      btn.addEventListener('click', () => this.handleSignAnswer(i, qData, sign));
      optsEl.appendChild(btn);
    });
  },

  handleSignAnswer(chosenIdx, qData, sign) {
    const optsEl = document.getElementById('q-options');
    const fb = document.getElementById('q-explain');
    const nextBtn = document.getElementById('btn-q-continue');

    optsEl.querySelectorAll('.opt-choice-btn').forEach(b => b.disabled = true);
    const isCorrect = chosenIdx === qData.ans;

    optsEl.querySelectorAll('.opt-choice-btn').forEach((b, idx) => {
      if (idx === qData.ans) b.classList.add('correct');
      else if (idx === chosenIdx && !isCorrect) b.classList.add('wrong');
    });

    const compliments = [
      `Bé ${this.playerName} giỏi quá!`,
      `Tuyệt vời bé ${this.playerName} ơi!`,
      `Bé ${this.playerName} thật thông minh!`,
      `Xuất sắc lắm bé ${this.playerName}!`
    ];
    const cheer = compliments[Math.floor(Math.random() * compliments.length)];

    if (isCorrect) {
      audio.playCorrect();
      this.bumpScore(10);
      fb.className = 'feedback-bubble ok';
      fb.textContent = `🎉 ${cheer} ${qData.explain}`;
    } else {
      audio.playWrong();
      this.bumpScore(3);
      fb.className = 'feedback-bubble ko';
      fb.textContent = `💡 Thử lại nhé, bé ${this.playerName} làm được mà! Gợi ý: ${qData.explain}`;
    }
    nextBtn.classList.add('show');

    if (this.currentQPhase === 'SHAPE') {
      nextBtn.textContent = 'Tiếp tục: Tìm hiểu công dụng biển báo ➔';
      nextBtn.onclick = () => {
        this.currentQPhase = 'MEANING';
        this.renderQuestionPhase(sign);
      };
    } else {
      this.correctSigns++;
      this.passCheckpoint(this.signIndex + 1);

      nextBtn.textContent = 'Nổ máy chạy vút tiếp 🚗💨';
      nextBtn.onclick = () => {
        audio.playEngineBoost();
        document.getElementById('overlay-question').classList.add('hidden');
        // Kích hoạt vút tốc độ
        this.isBoosted = true;
        this.boostTimer = 70; // ~1.2 giây
        this.signIndex++;
        this.scheduleNextSign();
      };
    }
  },

  // ================= 5. SƠ ĐỒ BẢN ĐỒ NGÃ RẼ TRỰC QUAN BẰNG SVG =================
  openJunctionMap() {
    const dest = this.currentDest;
    this.renderJunctionSvg(dest);

    const choicesEl = document.getElementById('map-choices');
    choicesEl.innerHTML = '';
    const fb = document.getElementById('map-feedback');
    fb.className = 'junction-feedback';
    fb.textContent = `Bé ${this.playerName} hãy tính tổng các đoạn đường để chọn con đường ngắn nhất!`;

    const contBtn = document.getElementById('btn-map-continue');
    contBtn.classList.remove('show');

    dest.routes.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'route-choice-card';
      const segText = r.segs.length > 1 ? r.segs.join(' m + ') + ' m' : `${r.total} m thẳng`;
      btn.innerHTML = `
        <span class="r-title" style="color: ${r.color}">● ${r.name}</span>
        <span class="r-math">${segText}</span>
        <span class="r-dist">Tổng: ${r.total} m</span>
      `;
      btn.addEventListener('click', () => this.handleRouteChoice(r, btn));
      choicesEl.appendChild(btn);
    });

    document.getElementById('overlay-map').classList.remove('hidden');
  },

  handleRouteChoice(route, btnEl) {
    const dest = this.currentDest;
    const isShortest = route.id === dest.shortestId;
    const fb = document.getElementById('map-feedback');
    const contBtn = document.getElementById('btn-map-continue');

    document.querySelectorAll('.route-choice-card').forEach(b => b.classList.remove('correct', 'wrong'));

    // Chạy thử xe trên đường đã chọn bằng SVG path
    this.animateCarOnPath(route.id);

    if (isShortest) {
      audio.playCorrect();
      btnEl.classList.add('correct');
      this.bumpScore(20);
      this.chosenRoute = route;
      fb.className = 'junction-feedback ok';
      fb.textContent = `🎉 CHÍNH XÁC! Tuyến ${route.name} dài ${route.total}m là con đường ngắn nhất!`;
      contBtn.classList.add('show');
    } else {
      audio.playWrong();
      btnEl.classList.add('wrong');
      fb.className = 'junction-feedback ko';
      fb.textContent = `💡 Tuyến này dài ${route.total}m. Bé ${this.playerName} hãy kiểm tra xem tuyến nào có số mét ít hơn nhé!`;
      this.chosenRoute = route;
      contBtn.classList.add('show');
    }

    contBtn.onclick = () => {
      audio.playHonk();
      this.isJunctionPassed = true;
      document.getElementById('overlay-map').classList.add('hidden');
      this.scheduleNextSign();
    };
  },

  // ================= 6. MÀN HÌNH BẰNG KHEN TỔNG KẾT TUYỆT ĐẸP =================
  showVictory() {
    this.showScreen('screen-result');

    const dest = this.currentDest;
    const isShortest = this.chosenRoute && this.chosenRoute.id === dest.shortestId;

    if (isShortest) {
      this.bumpScore(30);
    }

    // Tên bé trên bằng khen
    document.getElementById('res-student-name').textContent = this.playerName;

    // Ngày tháng hôm nay
    const now = new Date();
    document.getElementById('res-footer-date').textContent =
      `Cấp ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

    // 3 chỉ số
    document.getElementById('res-score').textContent = `${this.score} đ`;
    document.getElementById('res-correct').textContent = `${this.correctSigns}/4`;
    document.getElementById('res-dist').textContent = `${this.chosenRoute ? this.chosenRoute.total : 32} m`;

    // Đánh giá sao (1..3 sao)
    const starsBox = document.getElementById('res-stars-box');
    let starCount = 1;
    if (this.correctSigns >= 4 && isShortest) starCount = 3;
    else if (this.correctSigns >= 2 || isShortest) starCount = 2;

    starsBox.innerHTML = '';
    for (let i = 0; i < starCount; i++) {
      const s = document.createElement('span');
      s.className = 'star-reward';
      s.textContent = '⭐';
      starsBox.appendChild(s);
    }

    // Lời khen tặng danh dự
    const nameText = document.createElement('span');
    nameText.textContent = this.playerName;
    const safeName = nameText.innerHTML;
    document.getElementById('res-diploma-text').innerHTML =
      `🎖️ <b>Lời khen tặng dành cho Bé ${safeName}:</b><br>` +
      `• Điểm đến đã chinh phục: <b>${dest.name} ${dest.icon}</b><br>` +
      `• Chiếc xe đồng hành: <b>${this.currentCar.name} ${this.currentCar.icon}</b><br>` +
      `• Tuyến đường bé chọn: <b>${this.chosenRoute ? this.chosenRoute.name : 'Đường đi'} (${this.chosenRoute ? this.chosenRoute.total : 0}m)</b> ` +
      (isShortest ? '<span style="color:#15803D;">➔ Chuẩn đường ngắn nhất! (+30đ thưởng) 🏆</span>' : '<span style="color:#C2410C;">➔ Chưa phải đường ngắn nhất, lần sau tính toán kỹ hơn nhé!</span>') +
      `<br>• Bé đã nhận biết thành công <b>4 biển báo giao thông</b> trên hành trình!`;

    // Pháo hoa giấy bay
    this.startConfetti();
  },

  startConfetti() {
    presentation.celebrate(true);
  },

  goStart() {
    this.showScreen('screen-start');
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
  }
};


Object.assign(game, fallback);
game.init();
presentation.init(game);
