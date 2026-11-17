const varFont = "Baloo 2, sans-serif";
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
import { SIGNS_DATA } from './data.js';
const SIGN_PHOTOS = Object.fromEntries(Object.entries(SIGNS_DATA).map(([id, sign]) => {
  const image = new Image();
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sign.svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  return [id, image];
}));

// Giữ nguyên cảnh 2D để máy không có WebGL vẫn chơi được.
export const fallback = {
  render3D(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const horizonY = H * 0.44;

    // 1. Bầu trời xanh tươi sáng
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#38BDF8');
    skyGrad.addColorStop(0.7, '#7DD3FC');
    skyGrad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY);

    // Mặt trời vàng rực rỡ
    ctx.save();
    ctx.fillStyle = '#FFD93D';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(W * 0.82, horizonY * 0.38, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mây trôi mềm mại
    this.drawCloud(ctx, W * 0.18, horizonY * 0.32, 34);
    this.drawCloud(ctx, W * 0.48, horizonY * 0.22, 28);
    this.drawCloud(ctx, W * 0.76, horizonY * 0.28, 30);

    // Dãy phố hoạt hình xa xa (City skyline with cute houses)
    this.drawCitySkyline(ctx, W, horizonY);

    // 2. Mặt đất cỏ xanh tươi hai bên
    const grassGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    grassGrad.addColorStop(0, '#6BCB77');
    grassGrad.addColorStop(1, '#2E7D32');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, horizonY, W, H - horizonY);

    // 3. Đường nhựa phối cảnh 3D
    const roadTopW = W * 0.10;
    const roadBotW = W * 0.66;
    const roadCenterX = W * 0.5;

    // Lề đường sọc trắng đỏ (Curbs)
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(roadCenterX - roadTopW * 0.62, horizonY);
    ctx.lineTo(roadCenterX + roadTopW * 0.62, horizonY);
    ctx.lineTo(roadCenterX + roadBotW * 0.53, H);
    ctx.lineTo(roadCenterX - roadBotW * 0.53, H);
    ctx.closePath();
    ctx.fill();

    // Mặt đường nhựa xám
    const roadGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    roadGrad.addColorStop(0, '#475569');
    roadGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = roadGrad;
    ctx.beginPath();
    ctx.moveTo(roadCenterX - roadTopW * 0.5, horizonY);
    ctx.lineTo(roadCenterX + roadTopW * 0.5, horizonY);
    ctx.lineTo(roadCenterX + roadBotW * 0.5, H);
    ctx.lineTo(roadCenterX - roadBotW * 0.5, H);
    ctx.closePath();
    ctx.fill();

    // Vạch kẻ đường vàng đứt đoạn
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 6;
    ctx.setLineDash([26, 22]);
    ctx.lineDashOffset = -this.roadDistance * 18;
    ctx.beginPath();
    ctx.moveTo(roadCenterX, horizonY);
    ctx.lineTo(roadCenterX, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Hàng cây & cột đèn hai bên đường cuộn lùi mượt mà
    this.drawRoadsideScenery(ctx, W, H, horizonY, roadCenterX, roadTopW, roadBotW);

    // 5. Hiệu ứng vệt tốc độ gió khi Boosted
    if (this.isBoosted && !reducedMotion.matches) {
      this.drawSpeedWind(ctx, W, H, horizonY);
    }

    // 6. Biển báo hoặc Cổng đích tiến lại gần
    if (this.approachingSign) {
      if (this.approachingSign === 'FINISH') {
        this.drawFinishGate(ctx, roadCenterX, horizonY, H, this.signZ);
      } else {
        this.drawApproachingSign3D(ctx, roadCenterX, horizonY, H, roadTopW, roadBotW, this.signZ, this.approachingSign);
      }
    }

    // 7. Xe người chơi đã chọn nhìn từ phía sau (Rear view)
    this.drawChosenCar(ctx, roadCenterX, H - 28);
  },

  drawCloud(ctx, x, y, r) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.6, y - r * 0.22, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x - r * 0.6, y, r * 0.65, 0, Math.PI * 2);
    ctx.arc(x + r * 1.1, y + r * 0.1, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  },

  drawCitySkyline(ctx, W, horizonY) {
    // Đồi xanh
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(W * 0.25, horizonY - 26, W * 0.5, horizonY);
    ctx.quadraticCurveTo(W * 0.75, horizonY - 34, W, horizonY);
    ctx.lineTo(W, horizonY);
    ctx.lineTo(0, horizonY);
    ctx.fill();

    // Dãy nhà phố hoạt hình xinh xắn
    const houseColors = ['#FCA5A5', '#FDE047', '#93C5FD', '#F9A8D4', '#C4B5FD'];
    const roofs = ['#EF4444', '#F97316', '#3B82F6', '#EC4899', '#8B5CF6'];
    for (let i = 0; i < 9; i++) {
      const hx = i * (W / 9) + 10;
      const hw = W / 11;
      const hh = 16 + (i % 3) * 8;
      const hy = horizonY - hh;

      ctx.fillStyle = houseColors[i % houseColors.length];
      ctx.fillRect(hx, hy, hw, hh);

      // Mái nhà
      ctx.fillStyle = roofs[i % roofs.length];
      ctx.beginPath();
      ctx.moveTo(hx - 3, hy);
      ctx.lineTo(hx + hw / 2, hy - 10);
      ctx.lineTo(hx + hw + 3, hy);
      ctx.closePath();
      ctx.fill();

      // Cửa sổ nhỏ
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(hx + hw * 0.25, hy + 4, hw * 0.2, 5);
      ctx.fillRect(hx + hw * 0.6, hy + 4, hw * 0.2, 5);
    }
  },

  drawRoadsideScenery(ctx, W, H, horizonY, rcX, topW, botW) {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const zNorm = ((i * 0.2 + (this.roadDistance * 0.035) % 0.2) % 1);
      if (zNorm < 0.06 || zNorm > 0.95) continue;

      const scale = Math.pow(zNorm, 2.2);
      const y = horizonY + (H - horizonY) * zNorm;
      const currentRoadW = topW + (botW - topW) * zNorm;

      const treeSize = 16 + scale * 85;
      const leftX = rcX - currentRoadW * 0.58 - treeSize * 0.5;
      const rightX = rcX + currentRoadW * 0.58 + treeSize * 0.5;

      this.drawCartoonTree(ctx, leftX, y, treeSize);
      this.drawCartoonTree(ctx, rightX, y, treeSize);
    }
  },

  drawCartoonTree(ctx, x, y, s) {
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - s * 0.1, y - s * 0.4, s * 0.2, s * 0.4);
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(x, y - s * 0.6, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6BCB77';
    ctx.beginPath();
    ctx.arc(x - s * 0.1, y - s * 0.7, s * 0.26, 0, Math.PI * 2);
    ctx.arc(x + s * 0.12, y - s * 0.55, s * 0.24, 0, Math.PI * 2);
    ctx.fill();
  },

  drawSpeedWind(ctx, W, H, horizonY) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const rx = (W * 0.2) + Math.random() * (W * 0.6);
      const ry = horizonY + Math.random() * (H - horizonY - 40);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 25 - Math.random() * 40, ry + 15);
      ctx.stroke();
    }
  },

  drawApproachingSign3D(ctx, rcX, horY, H, topW, botW, z, signId) {
    const progress = Math.max(0, Math.min(1, 1 - (z - 90) / 890));
    const persp = Math.pow(progress, 1.8);

    const y = horY + (H - horY) * persp;
    const currentRoadW = topW + (botW - topW) * persp;
    const x = rcX + currentRoadW * 0.54 + 20 * persp;
    const size = 22 + persp * 130;

    ctx.save();
    // Cột biển báo
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(x - size * 0.05, y - size * 0.5, size * 0.1, size * 0.5);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - size * 0.15, y - size * 0.06, size * 0.3, size * 0.06);

    ctx.translate(x, y - size * 0.85);

    // Hiển thị ảnh thật trên biển báo trong cảnh lái xe.
    const signPhoto = SIGN_PHOTOS[signId];
    if (signPhoto && signPhoto.complete && signPhoto.naturalWidth > 0) {
      const imageSize = size * 0.82;
      const imageRatio = signPhoto.naturalWidth / signPhoto.naturalHeight;
      const drawWidth = imageRatio >= 1 ? imageSize : imageSize * imageRatio;
      const drawHeight = imageRatio >= 1 ? imageSize / imageRatio : imageSize;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-imageSize * 0.44, -imageSize * 0.44, imageSize * 0.88, imageSize * 0.88);
      ctx.drawImage(signPhoto, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
      return;
    }

    // Hình vẽ dự phòng trong lúc ảnh đang tải.
    if (signId === 'traffic_light') {
      ctx.fillStyle = '#1E293B';
      this.roundRect(ctx, -size * 0.25, -size * 0.45, size * 0.5, size * 0.85, size * 0.08);
      ctx.fill();
      const r = size * 0.09;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath(); ctx.arc(0, -size * 0.25, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath(); ctx.arc(0, -size * 0.03, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22C55E';
      ctx.beginPath(); ctx.arc(0, size * 0.19, r, 0, Math.PI * 2); ctx.fill();
    } else if (signId === 'pedestrian') {
      // Biển vuông xanh lam, tam giác trắng, người đi bộ
      ctx.fillStyle = '#1D4ED8';
      this.roundRect(ctx, -size * 0.38, -size * 0.38, size * 0.76, size * 0.76, size * 0.08);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.32);
      ctx.lineTo(size * 0.3, size * 0.28);
      ctx.lineTo(-size * 0.3, size * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.arc(0, -size * 0.08, size * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-size * 0.03, -size * 0.02, size * 0.06, size * 0.18);
    } else if (signId === 'no_entry') {
      // Biển tròn đỏ vạch trắng
      ctx.fillStyle = '#DC2626';
      ctx.beginPath(); ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      this.roundRect(ctx, -size * 0.26, -size * 0.07, size * 0.52, size * 0.14, size * 0.04);
      ctx.fill();
    } else if (signId === 'construction' || signId === 'children') {
      // Tam giác vàng viền đỏ
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = Math.max(3, size * 0.07);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.42);
      ctx.lineTo(size * 0.4, size * 0.3);
      ctx.lineTo(-size * 0.4, size * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      if (signId === 'construction') {
        ctx.beginPath(); ctx.arc(0, -size * 0.08, size * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(-size * 0.04, 0, size * 0.08, size * 0.16);
      } else {
        ctx.beginPath(); ctx.arc(-size * 0.1, -size * 0.06, size * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.1, -size * 0.03, size * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(-size * 0.13, 0, size * 0.07, size * 0.17);
        ctx.fillRect(size * 0.06, 0.03, size * 0.07, size * 0.15);
      }
    }
    ctx.restore();
  },

  drawFinishGate(ctx, rcX, horY, H, z) {
    const progress = Math.max(0, Math.min(1, 1 - (z - 90) / 890));
    const persp = Math.pow(progress, 1.8);
    const y = horY + (H - horY) * persp;
    const gateW = 60 + persp * 250;
    const gateH = 40 + persp * 160;

    ctx.save();
    ctx.translate(rcX, y);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-gateW * 0.5, -gateH, gateW * 0.12, gateH);
    ctx.fillRect(gateW * 0.38, -gateH, gateW * 0.12, gateH);

    ctx.fillStyle = '#F59E0B';
    this.roundRect(ctx, -gateW * 0.54, -gateH - gateH * 0.32, gateW * 1.08, gateH * 0.34, 12);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ' + Math.max(11, Math.floor(13 + persp * 15)) + 'px ' + varFont;
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentDest.icon} ${this.currentDest.buildingName}`, 0, -gateH - gateH * 0.1);
    ctx.restore();
  },

  // VẼ XE NGƯỜI CHƠI CHỌN NHÌN TỪ PHÍA SAU
  drawChosenCar(ctx, cx, cy) {
    ctx.save();
    const car = this.currentCar;
    const carId = this.selectedCarId;
    const carW = carId === 'school_bus' ? 148 : 142;
    const carH = carId === 'school_bus' ? 104 : 92;

    const bounceY = this.isDriving && !reducedMotion.matches ? Math.sin(this.roadDistance * 1.6) * 2.4 : 0;
    const x = cx;
    const y = cy + bounceY;

    // Bóng xe
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, carW * 0.55, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2 Bánh xe
    ctx.fillStyle = '#0F172A';
    this.roundRect(ctx, x - carW * 0.52, y - 26, 22, 34, 6); ctx.fill();
    this.roundRect(ctx, x + carW * 0.52 - 22, y - 26, 22, 34, 6); ctx.fill();

    // Thân dưới xe
    const bodyGrad = ctx.createLinearGradient(0, y - carH, 0, y);
    bodyGrad.addColorStop(0, car.color);
    bodyGrad.addColorStop(1, car.dark);
    ctx.fillStyle = bodyGrad;
    this.roundRect(ctx, x - carW * 0.45, y - 48, carW * 0.9, 44, 14); ctx.fill();

    // Cản sau & biển số xe
    ctx.fillStyle = '#334155';
    this.roundRect(ctx, x - carW * 0.42, y - 18, carW * 0.84, 12, 6); ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, x - 32, y - 16, 64, 14, 4); ctx.fill();
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 9px ' + varFont;
    ctx.textAlign = 'center';
    ctx.fillText(this.playerName.substring(0, 10).toUpperCase(), x, y - 6);

    // Đèn hậu đỏ
    ctx.fillStyle = '#FF3333';
    this.roundRect(ctx, x - carW * 0.42, y - 42, 22, 14, 5); ctx.fill();
    this.roundRect(ctx, x + carW * 0.42 - 22, y - 42, 22, 14, 5); ctx.fill();

    // Mui xe / Cabin
    ctx.fillStyle = car.color;
    this.roundRect(ctx, x - carW * 0.35, y - carH, carW * 0.7, 44, 16); ctx.fill();

    // Kính sau
    const glassGrad = ctx.createLinearGradient(0, y - carH + 6, 0, y - 46);
    glassGrad.addColorStop(0, '#BAE6FD');
    glassGrad.addColorStop(1, '#38BDF8');
    ctx.fillStyle = glassGrad;
    this.roundRect(ctx, x - carW * 0.3, y - carH + 8, carW * 0.6, 32, 10); ctx.fill();

    // Phụ kiện riêng cho từng xe
    if (carId === 'yellow_taxi') {
      ctx.fillStyle = '#FFFFFF';
      this.roundRect(ctx, x - 22, y - carH - 12, 44, 14, 4); ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 9px ' + varFont;
      ctx.fillText('TAXI', x, y - carH - 2);
    } else if (carId === 'police_car') {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath(); ctx.arc(x - 12, y - carH - 6, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath(); ctx.arc(x + 12, y - carH - 6, 7, 0, Math.PI * 2); ctx.fill();
    } else if (carId === 'school_bus') {
      ctx.fillStyle = '#FFFFFF';
      this.roundRect(ctx, x - 30, y - carH - 10, 60, 12, 3); ctx.fill();
      ctx.fillStyle = '#EA580C';
      ctx.font = 'bold 8px ' + varFont;
      ctx.fillText('XE BUÝT', x, y - carH - 1);
    }

    // Nhân vật trong xe vẫy tay
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧒👨‍👩‍👧', x, y - carH + 32);

    // Khói xả khi xe chạy
    if (this.isDriving) {
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      const puffX = x - carW * 0.38;
      const puffY = y - 4;
      ctx.beginPath();
      ctx.arc(puffX - 8, puffY, 4, 0, Math.PI * 2);
      ctx.arc(puffX - 16, puffY - 4, 6, 0, Math.PI * 2);
      ctx.arc(puffX - 25, puffY - 8, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  },


  renderJunctionSvg(dest) {
    const svg = document.getElementById('junction-svg-map');
    const routes = dest.routes;

    svg.innerHTML = `
      <!-- Sông nước bên dưới -->
      <path d="M 240 250 Q 320 180 400 250 Z" fill="#60A5FA" opacity="0.8"/>

      <!-- 3 Tuyến đường cong rực rỡ -->
      <!-- Tuyến A: Trên -->
      <path id="svg-path-A" d="M 100 130 Q 380 40 660 120" fill="none" stroke="${routes[0].color}" stroke-width="24" stroke-linecap="round"/>
      <path d="M 100 130 Q 380 40 660 120" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="10,10"/>

      <!-- Tuyến B: Giữa -->
      <path id="svg-path-B" d="M 100 130 Q 380 130 660 120" fill="none" stroke="${routes[1].color}" stroke-width="24" stroke-linecap="round"/>
      <path d="M 100 130 Q 380 130 660 120" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="10,10"/>

      <!-- Tuyến C: Dưới -->
      <path id="svg-path-C" d="M 100 130 Q 380 220 660 120" fill="none" stroke="${routes[2].color}" stroke-width="24" stroke-linecap="round"/>
      <path d="M 100 130 Q 380 220 660 120" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="10,10"/>

      <!-- Cầu nhỏ ở đường dưới -->
      <rect x="290" y="196" width="36" height="14" rx="4" fill="#D97706" stroke="#92400E" stroke-width="2"/>

      <!-- Cửa hàng / Tiệm kem -->
      <g transform="translate(340, 80)">
        <rect x="0" y="0" width="80" height="24" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <text x="40" y="16" font-family="'Baloo 2', sans-serif" font-size="11" font-weight="800" fill="#1E3A8A" text-anchor="middle">${dest.shopName}</text>
      </g>

      <!-- Nhãn khoảng cách tuyến A -->
      <g transform="translate(260, 44)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="#FFFFFF" stroke="${routes[0].color}" stroke-width="2"/>
        <text x="26" y="14" font-family="'Baloo 2', sans-serif" font-size="11" font-weight="800" fill="${routes[0].color}" text-anchor="middle">${routes[0].segs[0]} m</text>
      </g>
      <g transform="translate(480, 56)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="#FFFFFF" stroke="${routes[0].color}" stroke-width="2"/>
        <text x="26" y="14" font-family="'Baloo 2', sans-serif" font-size="11" font-weight="800" fill="${routes[0].color}" text-anchor="middle">${routes[0].segs[1] || routes[0].segs[0]} m</text>
      </g>

      <!-- Nhãn khoảng cách tuyến B -->
      <g transform="translate(370, 136)">
        <rect x="0" y="0" width="56" height="20" rx="10" fill="#FFFFFF" stroke="${routes[1].color}" stroke-width="2"/>
        <text x="28" y="14" font-family="'Baloo 2', sans-serif" font-size="11" font-weight="800" fill="${routes[1].color}" text-anchor="middle">${routes[1].total} m</text>
      </g>

      <!-- Nhãn khoảng cách tuyến C -->
      <g transform="translate(230, 160)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="#FFFFFF" stroke="${routes[2].color}" stroke-width="2"/>
        <text x="26" y="14" font-family="'Baloo 2', sans-serif" font-size="11" font-weight="800" fill="${routes[2].color}" text-anchor="middle">${routes[2].segs[0]} m</text>
      </g>
      <g transform="translate(500, 184)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="#FFFFFF" stroke="${routes[2].color}" stroke-width="2"/>
        <text x="26" y="14" font-family="'Baloo 2', sans-serif" font-size="11" font-weight="800" fill="${routes[2].color}" text-anchor="middle">${routes[2].segs[1]} m</text>
      </g>

      <!-- Điểm xuất phát (Nhà An) -->
      <g transform="translate(40, 95)">
        <rect x="0" y="0" width="76" height="66" rx="14" fill="#FFFFFF" stroke="#15803D" stroke-width="3"/>
        <text x="38" y="24" font-family="'Baloo 2', sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">Xuất phát 🏠</text>
        <text x="38" y="52" font-size="22" text-anchor="middle">${this.currentCar.icon}</text>
      </g>

      <!-- Điểm đến (Tòa nhà lớn bên phải) -->
      <g transform="translate(640, 85)">
        <rect x="0" y="0" width="86" height="74" rx="16" fill="#FFFFFF" stroke="#DC2626" stroke-width="3"/>
        <text x="43" y="24" font-family="'Baloo 2', sans-serif" font-size="12" font-weight="900" fill="#DC2626" text-anchor="middle">${dest.name}</text>
        <text x="43" y="58" font-size="28" text-anchor="middle">${dest.icon}</text>
      </g>

      <!-- Xe chạy thử trên đường đã chọn -->
      <circle id="test-drive-car" cx="100" cy="130" r="10" fill="#EF4444" stroke="#FFF" stroke-width="3" style="display:none;"/>
    `;
  },

  animateCarOnPath(routeId) {
    const path = document.getElementById(`svg-path-${routeId}`);
    const carDot = document.getElementById('test-drive-car');
    if (!path || !carDot) return;

    carDot.style.display = 'block';
    const pathLen = path.getTotalLength();
    let startT = null;
    const duration = 1200; // 1.2s

    const step = (now) => {
      if (!startT) startT = now;
      const progress = Math.min(1, (now - startT) / duration);
      const pt = path.getPointAtLength(progress * pathLen);
      carDot.setAttribute('cx', pt.x);
      carDot.setAttribute('cy', pt.y);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  },

};
