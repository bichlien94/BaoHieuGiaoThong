# Bé Lái Xe Khám Phá

Game học biển báo bằng tiếng Việt, HTML/CSS/JavaScript thuần, chạy trực tiếp trên GitHub Pages. Không cần npm hay bước build.

## Chạy tại máy

Mở terminal trong thư mục dự án:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Mở `http://127.0.0.1:8765/`. Cần phục vụ qua HTTP vì game dùng ES modules; mở trực tiếp bằng `file://` sẽ không nạp module.

## Thuyết trình bằng laptop và máy chiếu

- Mở game trên màn hình được chiếu. Bấm nút **⛶** ở góc phải hoặc phím **F** để vào chế độ trình chiếu. Bấm **Esc** hoặc **F** để thoát. Khi đang nhập tên, phím F vẫn nhập chữ bình thường.
- Chế độ trình chiếu tăng cỡ chữ câu hỏi, làm nền hộp thoại đặc hơn và tăng độ tương phản. Màn chuẩn bị được bố trí vừa khung laptop 1280×720 và 1366×768.
- Nếu trình duyệt chặn Fullscreen API, nút vẫn bật màu và bố cục trình chiếu; dùng F11 của trình duyệt để mở toàn màn hình.
- Nút âm thanh luôn có ở góc phải. Âm thanh chỉ khởi tạo sau thao tác đầu tiên.
- Thư viện Three.js và Baloo 2 cần kết nối mạng ở lần tải đầu. Nếu không nạp được Three.js hoặc máy không hỗ trợ WebGL, game tự chuyển về cảnh 2D.

## Cấu trúc

| Tệp | Trách nhiệm |
| --- | --- |
| `index.html` | Các màn chơi và HUD HTML, importmap ghim Three.js 0.160.0 |
| `styles.css` | Giao diện, responsive, trình chiếu, giảm chuyển động, bản in A4 |
| `game.js` | Trạng thái, thứ tự biển, câu trả lời, điểm và kết quả |
| `data.js` | Dữ liệu câu hỏi, SVG biển báo, xe và quãng đường gốc |
| `scene.js` | Mô hình low-poly, cảnh lái xe, khung xem trước, thành phố, ngã rẽ |
| `ui.js` | Đồng bộ giao diện với trạng thái, vòng lặp, hiệu ứng và toàn màn hình |
| `audio.js` | Các âm thanh tạo bằng Web Audio API |
| `fallback.js` | Cảnh lái xe 2D và sơ đồ SVG dự phòng |

Chỉ có một WebGL renderer cho toàn game. Các xe ở màn đầu được vẽ lần lượt rồi chép sang canvas 2D, tối đa 24 lần/giây và bỏ qua khung ngoài vùng nhìn thấy. Cảnh lái xe tái sử dụng 8 đoạn đường; cây, nhà, cửa sổ và lề đường dùng InstancedMesh. Geometry/material/texture và shadow map được giải phóng khi đổi cảnh. Tab ẩn tạm dừng vòng lặp. Các bước vật lý gốc chạy ở nhịp 60 Hz để tốc độ không phụ thuộc tần số màn hình.

## Giữ nguyên luật chơi

Dữ liệu và cách tính điểm được đối chiếu với phiên bản `2f34bcf`: mỗi câu đúng +10, sai +3; chọn đường ngắn nhất +20, về đích đúng tuyến +30; ngã rẽ sau biển thứ hai. Mỗi điểm đến vẫn có bốn biển, mỗi biển hai câu hỏi.

Các hành vi có sẵn được giữ nguyên theo phạm vi chỉ đổi hiển thị: `correctSigns` đếm biển đã hoàn thành kể cả khi trả lời sai; công thức sao phụ thuộc biến này và tuyến đường; việc chọn lại đường đúng vẫn có thể cộng thêm điểm; hiệu ứng tăng tốc được kích hoạt sau khi hoàn thành câu hỏi công dụng. Các quy tắc này chưa được sửa.

Tên bé tối đa 20 ký tự, mặc định “Bạn nhỏ”, giữ khi chơi lại; tên được hiển thị như văn bản, không được thực thi như HTML.

## Kiểm tra

Đối chiếu dữ liệu và các hàm luật chơi với bản gốc:

```powershell
git show 2f34bcf:index.html | node tests/check-contract.mjs --stdin
```

Kiểm thử trình duyệt cần server ở cổng 8765 và một Chrome kiểm thử với remote debugging ở cổng 9222, dùng hồ sơ riêng:

```powershell
node tests/run-browser.mjs
```

Không cần cài thư viện kiểm thử. Có thể đổi URL qua `GAME_URL` và `CHROME_DEBUG_URL`. Bộ thử mở rồi đóng tab riêng, kiểm tra toàn bộ hành trình, các nhánh đúng/sai, bố cục ở 360×800, 768×1024, 1280×850, 1280×720 và 1366×768, toàn màn hình, bản in, không có WebGL, mất CDN, mất context, tab ẩn, âm thanh và giảm chuyển động. Tệp bằng chứng được ghi vào `.screenshots/` và không đưa vào Git.

Hiệu năng 30–60 fps là mục tiêu thiết kế; cần đo thêm trên điện thoại cũ và máy chiếu thực tế. Các bài thử tự động rút ngắn đoạn chờ lái xe bằng cách đặt biển gần xe, vẫn chạy vật lý và thao tác các nút của game.
