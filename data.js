export const SVG_ICONS = {
  // Biển Đèn tín hiệu giao thông
  traffic_light: `<svg viewBox="0 0 100 130" width="100%" height="100%">
    <!-- Cột biển -->
    <rect x="46" y="105" width="8" height="25" fill="#64748B"/>
    <!-- Thân hộp đèn -->
    <rect x="22" y="6" width="56" height="100" rx="14" fill="#1E293B" stroke="#475569" stroke-width="3"/>
    <!-- Mũ che 3 đèn -->
    <path d="M 28 28 Q 50 14 72 28" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <path d="M 28 58 Q 50 44 72 58" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <path d="M 28 88 Q 50 74 72 88" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <!-- 3 đèn tròn Đỏ - Vàng - Xanh -->
    <circle cx="50" cy="30" r="12" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
    <circle cx="46" cy="26" r="4" fill="#FF8080" opacity="0.6"/>
    <circle cx="50" cy="58" r="12" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
    <circle cx="46" cy="54" r="4" fill="#FDE68A" opacity="0.6"/>
    <circle cx="50" cy="86" r="12" fill="#22C55E" stroke="#15803D" stroke-width="2"/>
    <circle cx="46" cy="82" r="4" fill="#86EFAC" opacity="0.6"/>
  </svg>`,

  // Biển Người đi bộ qua đường (Biển vuông xanh, tam giác trắng ở giữa - I.423a)
  pedestrian: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <!-- Nền hình vuông màu xanh lam -->
    <rect x="4" y="4" width="92" height="92" rx="14" fill="#1D4ED8" stroke="#1E3A8A" stroke-width="3"/>
    <!-- Tam giác màu trắng ở giữa -->
    <polygon points="50,14 88,86 12,86" fill="#FFFFFF"/>
    <!-- Vạch kẻ đường đứt đoạn -->
    <line x1="26" y1="64" x2="74" y2="64" stroke="#0F172A" stroke-width="3" stroke-dasharray="6,4"/>
    <line x1="20" y1="78" x2="80" y2="78" stroke="#0F172A" stroke-width="3.5" stroke-dasharray="7,4"/>
    <!-- Người đi bộ màu đen -->
    <circle cx="46" cy="36" r="5.5" fill="#0F172A"/>
    <line x1="46" y1="42" x2="52" y2="60" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
    <line x1="46" y1="48" x2="36" y2="52" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <line x1="46" y1="48" x2="60" y2="44" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <line x1="52" y1="60" x2="40" y2="76" stroke="#0F172A" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="52" y1="60" x2="64" y2="74" stroke="#0F172A" stroke-width="4.5" stroke-linecap="round"/>
  </svg>`,

  // Biển Cấm đi ngược chiều (Biển tròn đỏ, vạch ngang trắng - P.102)
  no_entry: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <!-- Hình tròn đỏ viền trắng/đỏ -->
    <circle cx="50" cy="50" r="44" fill="#DC2626" stroke="#B91C1C" stroke-width="3"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6"/>
    <!-- Vạch trắng ngang ở giữa -->
    <rect x="18" y="42" width="64" height="16" rx="8" fill="#FFFFFF"/>
  </svg>`,

  // Biển Công trường thi công (Tam giác vàng viền đỏ, người xúc đất - W.227)
  construction: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <!-- Hình tam giác vàng viền đỏ -->
    <polygon points="50,6 94,88 6,88" fill="#F59E0B" stroke="#DC2626" stroke-width="7" stroke-linejoin="round"/>
    <!-- Đống đất màu đen -->
    <path d="M 62 80 L 80 80 Q 72 62 66 62 Z" fill="#0F172A"/>
    <!-- Người thợ cầm xẻng đào đất -->
    <circle cx="52" cy="40" r="5" fill="#0F172A"/>
    <path d="M 38 52 Q 46 42 56 46 L 50 64 L 42 66 Z" fill="#0F172A"/>
    <!-- Chân người -->
    <line x1="44" y1="66" x2="34" y2="78" stroke="#0F172A" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="50" y1="64" x2="52" y2="80" stroke="#0F172A" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Cán xẻng và xẻng xúc đất -->
    <line x1="38" y1="54" x2="68" y2="72" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 66 70 L 74 74 L 70 78 Z" fill="#0F172A"/>
  </svg>`,

  // Biển Trẻ em (Tam giác vàng viền đỏ, 2 bạn nhỏ dắt tay nhau - W.225)
  children: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <!-- Tam giác vàng viền đỏ -->
    <polygon points="50,6 94,88 6,88" fill="#F59E0B" stroke="#DC2626" stroke-width="7" stroke-linejoin="round"/>
    <!-- Bạn gái bên trái -->
    <circle cx="40" cy="38" r="5" fill="#0F172A"/>
    <path d="M 34 50 L 46 50 L 50 68 L 30 68 Z" fill="#0F172A"/>
    <line x1="36" y1="68" x2="32" y2="80" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="44" y1="68" x2="48" y2="80" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Bạn trai nhỏ hơn bên phải -->
    <circle cx="58" cy="44" r="4.5" fill="#0F172A"/>
    <path d="M 54 54 L 64 54 L 62 68 L 56 68 Z" fill="#0F172A"/>
    <line x1="56" y1="68" x2="52" y2="80" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
    <line x1="62" y1="68" x2="68" y2="78" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
    <!-- Hai bạn dắt tay nhau -->
    <path d="M 44 54 Q 50 58 54 56" fill="none" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
  </svg>`
};

/* ================================================================
   3. DỮ LIỆU CÂU HỎI & ĐẶC ĐIỂM BIỂN BÁO
   ================================================================ */
export const SIGNS_DATA = {
  traffic_light: {
    id: 'traffic_light',
    name: 'Đèn Tín Hiệu Giao Thông',
    hint: 'Nhìn vào chiếc hộp đèn đứng dài và 3 vòng tròn màu: Đỏ - Vàng - Xanh.',
    svg: SVG_ICONS.traffic_light,
    imageSrc: 'images/den_tin_hieu_giao_thong.jpg',
    qShape: {
      q: 'Đèn tín hiệu giao thông có dạng hình học gì?',
      opts: [
        '📦 Hình hộp chữ nhật đứng dài',
        '⭕ Hình tròn phẳng',
        '🔺 Hình tam giác',
        '🔷 Hình thoi'
      ],
      ans: 0,
      explain: 'Đúng rồi! Cột đèn có dạng hình hộp chữ nhật đứng, xếp 3 đèn tròn Đỏ, Vàng, Xanh bên trong.'
    },
    qMeaning: {
      q: 'Đèn tín hiệu giao thông có công dụng gì?',
      opts: [
        '🚦 Điều khiển xe cộ đi lại trật tự và an toàn',
        '💡 Chiếu sáng ban đêm thay đèn đường',
        '📸 Để chụp ảnh kỷ niệm',
        '🌧️ Báo hiệu trời sắp mưa'
      ],
      ans: 0,
      explain: 'Chính xác! Đèn tín hiệu giúp xe dừng và đi theo lượt: Đỏ dừng, Vàng chuẩn bị, Xanh được đi.'
    }
  },

  pedestrian: {
    id: 'pedestrian',
    name: 'Đường Người Đi Bộ Cắt Ngang',
    hint: 'Biển báo hình vuông xanh lam, bên trong có tam giác trắng vẽ người đi bộ qua đường.',
    svg: SVG_ICONS.pedestrian,
    imageSrc: 'images/bien_nguoi_di_bo.png',
    qShape: {
      q: 'Biển "Đường người đi bộ cắt ngang" có hình dạng và đặc điểm gì?',
      opts: [
        '🟦 Hình vuông xanh lam, có tam giác trắng vẽ người đi bộ',
        '🔺 Hình tam giác viền đỏ nền vàng',
        '🔴 Hình tròn màu đỏ có vạch ngang trắng',
        '⬛ Hình chữ nhật màu đen'
      ],
      ans: 0,
      explain: 'Chính xác! Biển chỉ dẫn này có hình vuông nền xanh lam, ở giữa là hình tam giác màu trắng vẽ người đang đi trên vạch kẻ đường!'
    },
    qMeaning: {
      q: 'Khi nhìn thấy biển báo này, người lái xe phải làm gì?',
      opts: [
        '🚶 Giảm tốc độ và nhường đường cho người đi bộ',
        '🏎️ Tăng ga chạy thật nhanh qua',
        '📢 Bấm còi to để người đi bộ tránh ra',
        '🔒 Dừng xe lại khóa cửa'
      ],
      ans: 0,
      explain: 'Rất giỏi! Lái xe phải giảm tốc độ, chú ý quan sát và nhường đường cho người đi bộ qua đường an toàn.'
    }
  },

  no_entry: {
    id: 'no_entry',
    name: 'Cấm Đi Ngược Chiều',
    hint: 'Biển báo tròn màu đỏ rực, ở giữa có một vạch trắng to nằm ngang.',
    svg: SVG_ICONS.no_entry,
    imageSrc: 'images/bien_cam_nguoc_chieu.jpg',
    qShape: {
      q: 'Biển "Cấm đi ngược chiều" có dạng hình gì?',
      opts: [
        '⛔ Hình tròn nền đỏ có vạch trắng ngang',
        '🔺 Hình tam giác màu vàng',
        '🔷 Hình thoi màu xanh',
        '🛑 Hình lục giác viền vàng'
      ],
      ans: 0,
      explain: 'Chính xác! Biển cấm có hình tròn nền đỏ tươi, vạch ngang màu trắng ở giữa.'
    },
    qMeaning: {
      q: 'Biển báo này có ý nghĩa gì đối với xe cộ?',
      opts: [
        '🚫 Cấm tất cả các loại xe đi vào theo chiều này',
        '🚀 Cho phép tất cả các xe đi tốc độ cao',
        '🅿️ Báo sắp có bãi đỗ xe ô tô',
        '🍜 Báo phía trước có quán ăn ngon'
      ],
      ans: 0,
      explain: 'Đúng rồi! Biển này nghiêm cấm xe đi vào theo hướng đặt biển để tránh tai nạn đối đầu nguy hiểm!'
    }
  },

  construction: {
    id: 'construction',
    name: 'Biển Báo Công Trường (Đang Thi Công)',
    hint: 'Biển tam giác màu vàng viền đỏ, bên trong có hình người đang cầm xẻng xúc đất.',
    svg: SVG_ICONS.construction,
    imageSrc: 'images/bien_cong_truong.png',
    qShape: {
      q: 'Biển báo "Công trường đang thi công" có hình dạng và màu sắc như thế nào?',
      opts: [
        '🔺 Hình tam giác màu vàng viền đỏ, vẽ người xúc đất',
        '🟩 Hình chữ nhật màu xanh lá cây',
        '🔴 Hình tròn màu đỏ có vạch trắng',
        '🔷 Hình thoi màu trắng viền đen'
      ],
      ans: 0,
      explain: 'Đúng rồi! Biển cảnh báo công trường thi công có hình tam giác viền đỏ, nền vàng với hình người cầm xẻng xúc đất.'
    },
    qMeaning: {
      q: 'Khi gặp biển báo công trường, người lái xe cần làm gì?',
      opts: [
        '⚠️ Đi chậm lại, chú ý quan sát công nhân và chướng ngại vật',
        '💨 Tăng tốc thật nhanh để vượt qua khói bụi',
        '↩️ Quay xe lại không bao giờ đi tiếp',
        '📢 Bấm còi liên tục inh ỏi'
      ],
      ans: 0,
      explain: 'Chính xác! Phía trước đang thi công nên phải đi chậm và cẩn thận để bảo đảm an toàn!'
    }
  },

  children: {
    id: 'children',
    name: 'Biển Báo Trẻ Em',
    hint: 'Biển tam giác viền đỏ nền vàng, bên trong vẽ bé gái dắt tay bé trai đi lại.',
    svg: SVG_ICONS.children,
    imageSrc: 'images/bien_tre_em.png',
    qShape: {
      q: 'Biển báo "Trẻ em" trong hình có hình dạng và đặc điểm gì?',
      opts: [
        '🔺 Hình tam giác màu vàng viền đỏ, vẽ hai bạn nhỏ dắt tay nhau',
        '🔴 Hình tròn màu đỏ có vạch trắng',
        '🟦 Hình vuông màu xanh lam',
        '📦 Hình hộp chữ nhật dài'
      ],
      ans: 0,
      explain: 'Rất giỏi! Biển cảnh báo trẻ em có hình tam giác viền đỏ, nền vàng với hình hai bạn nhỏ dắt tay nhau đi lại.'
    },
    qMeaning: {
      q: 'Biển báo này cảnh báo điều gì cho người tham gia giao thông?',
      opts: [
        '🚸 Gần trường học, khu vui chơi có trẻ em hay đi qua đường',
        '🧸 Khu vực bán đồ chơi cho trẻ em',
        '🏎️ Nơi chỉ cho phép trẻ em được lái xe',
        '🏖️ Trường học đang đóng cửa nghỉ hè'
      ],
      ans: 0,
      explain: 'Chính xác! Gần trường học có nhiều trẻ em nên lái xe phải đi thật chậm và cẩn thận!'
    }
  }
};

export const CAR_STYLES = {
  red_family:  { name: 'Xe Đỏ Gia Đình', color: '#EF4444', dark: '#B91C1C', icon: '🚗', badge: '🚗 Xe Đỏ Gia Đình' },
  yellow_taxi: { name: 'Taxi Vàng',      color: '#EAB308', dark: '#CA8A04', icon: '🚕', badge: '🚕 Taxi Vàng' },
  police_car:  { name: 'Cảnh Sát Nhí',   color: '#2563EB', dark: '#1D4ED8', icon: '🚓', badge: '🚓 Cảnh Sát Nhí' },
  school_bus:  { name: 'Xe Buýt Học Sinh',color: '#F97316', dark: '#C2410C', icon: '🚐', badge: '🚐 Xe Buýt' }
};

export const DESTINATIONS = {
  library: {
    id: 'library', name: 'Thư Viện', icon: '📚', buildingName: 'THƯ VIỆN',
    shopName: 'Tiệm kem 🍦',
    signs: ['traffic_light', 'pedestrian', 'no_entry', 'construction'],
    routes: [
      { id: 'A', name: 'Đường trên (qua Tiệm kem)', segs: [12, 28], total: 40, color: '#3B82F6' },
      { id: 'B', name: 'Đường giữa (thẳng tới cổng)', segs: [32], total: 32, color: '#FF8A3D' },
      { id: 'C', name: 'Đường dưới (qua Cầu & Sông)', segs: [18, 22], total: 40, color: '#A78BFA' }
    ],
    shortestId: 'B' // 32m
  },
  hospital: {
    id: 'hospital', name: 'Bệnh Viện', icon: '🏥', buildingName: 'BỆNH VIỆN',
    shopName: 'Hiệu thuốc 💊',
    signs: ['traffic_light', 'pedestrian', 'no_entry', 'construction'],
    routes: [
      { id: 'A', name: 'Đường trên (qua Hiệu thuốc)', segs: [15, 25], total: 40, color: '#3B82F6' },
      { id: 'B', name: 'Đường giữa (thẳng tới cổng)', segs: [35], total: 35, color: '#FF8A3D' },
      { id: 'C', name: 'Đường dưới (qua Cầu & Sông)', segs: [20, 30], total: 50, color: '#A78BFA' }
    ],
    shortestId: 'B' // 35m
  },
  school: {
    id: 'school', name: 'Trường Tiểu Học', icon: '🏫', buildingName: 'TRƯỜNG TIỂU HỌC',
    shopName: 'Tiệm bánh 🥐',
    signs: ['traffic_light', 'pedestrian', 'no_entry', 'children'],
    routes: [
      { id: 'A', name: 'Đường trên (vòng đồi)', segs: [30, 25], total: 55, color: '#3B82F6' },
      { id: 'B', name: 'Đường giữa (qua Tiệm bánh)', segs: [40], total: 40, color: '#FF8A3D' },
      { id: 'C', name: 'Đường dưới (qua Cầu & Sông)', segs: [15, 35], total: 50, color: '#A78BFA' }
    ],
    shortestId: 'B' // 40m
  },
  park: {
    id: 'park', name: 'Công Viên', icon: '🎡', buildingName: 'CÔNG VIÊN THIẾU NHI',
    shopName: 'Cửa hàng đồ chơi 🛍️',
    signs: ['traffic_light', 'pedestrian', 'no_entry', 'children'],
    routes: [
      { id: 'A', name: 'Đường trên (lượn quanh vườn)', segs: [10, 20], total: 30, color: '#3B82F6' },
      { id: 'B', name: 'Đường giữa (qua Cửa hàng)', segs: [20, 20], total: 40, color: '#FF8A3D' },
      { id: 'C', name: 'Đường dưới (qua Cầu hoa)', segs: [10, 30], total: 40, color: '#A78BFA' }
    ],
    shortestId: 'A' // 30m
  }
};

