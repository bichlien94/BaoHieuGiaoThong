import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Dùng Chrome DevTools Protocol có sẵn, không cài thư viện kiểm thử.
const base = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const debug = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9222';
const output = fileURLToPath(new URL('../.screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
class CDP {
  constructor(url) {
    this.socket = new WebSocket(url); this.next = 0; this.pending = new Map(); this.events = [];
    this.ready = new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; });
    this.socket.onmessage = ({ data }) => {
      const item = JSON.parse(data);
      if (item.id) {
        const task = this.pending.get(item.id); this.pending.delete(item.id);
        if (item.error) task.reject(new Error(JSON.stringify(item.error))); else task.resolve(item.result);
      } else this.events.push(item);
    };
  }
  async send(method, params = {}) {
    await this.ready; const id = ++this.next;
    return await new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
}
const version = await (await fetch(debug + '/json/version')).json();
const browser = new CDP(version.webSocketDebuggerUrl);
const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
const targets = await (await fetch(debug + '/json/list')).json();
const tab = new CDP(targets.find(target => target.id === targetId).webSocketDebuggerUrl);
await Promise.all([tab.send('Page.enable'), tab.send('Runtime.enable'), tab.send('Network.enable')]);
const results = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const inspect = expression => tab.evaluate(`(async()=>{const {presentation:p}=await import('./ui.js');${expression}})()`);
async function ready() {
  for (let i = 0; i < 200; i++) {
    try { if (await inspect('return p.ready')) return; } catch { /* Đợi document mới nạp module. */ }
    await wait(50);
  }
  throw new Error('Trang không khởi tạo sau 10 giây');
}
async function load(width = 1280, height = 850) {
  await tab.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width === 360 });
  await tab.send('Page.navigate', { url: base });
  await wait(300); await ready();
}
async function shot(name) {
  await wait(360);
  const { data } = await tab.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(output + name + '.png', Buffer.from(data, 'base64'));
}
async function trip(options) {
  const result = await tab.evaluate(`import('./tests/browser-smoke.js').then(m=>m.runTrip(${JSON.stringify(options)}))`);
  results.push(result); console.log('PASS chuyến đi:', JSON.stringify(result));
}
async function layout(width, height) {
  await load(width, height);
  assert.equal(await inspect('return !!p.manager'), true, 'Three.js không chạy');
  if (width >= 900) {
    assert.ok(await inspect("const s=document.getElementById('screen-start');return s.scrollHeight<=s.clientHeight+1"), 'Màn laptop phải vừa khung');
    assert.ok(await inspect("return document.querySelectorAll('.car-card')[3].getBoundingClientRect().bottom<=document.querySelector('.launch-footer').getBoundingClientRect().top"), 'Thẻ xe che nút xuất phát');
  }
  await shot(`start-${width}`);
  await inspect("document.getElementById('city-map').scrollIntoView({block:'center'}); return true");
  await wait(150);
  const bounds = await inspect(`return [...document.querySelectorAll('.dest-card')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height}})`);
  bounds.forEach(rect => { assert.ok(rect.left >= 0 && rect.right <= width, 'Nhãn bản đồ nằm ngoài màn hình'); assert.ok(rect.height >= 56); });
  await shot(`city-${width}`);
  await inspect("document.getElementById('btn-start-game').click();p.game.isDriving=false;p.game.signZ=90;return true");
  await wait(100);
  assert.equal(await inspect(`const sign=p.manager.signs.traffic_light;const v=sign.position.clone();v.y=3;v.project(p.manager.camera);return Math.abs(v.x)<1&&Math.abs(v.y)<1`), true, 'Biển nằm ngoài camera');
  await shot(`drive-${width}`);
  await inspect("p.game.openSignQuestion('traffic_light');return true");
  await shot(`question-${width}`);
  assert.ok(await inspect(`const el=document.querySelector('.dialog-box');return el.clientHeight<=innerHeight&&[...document.querySelectorAll('.opt-choice-btn')].every(b=>b.getBoundingClientRect().height>=56)`));
  await inspect("document.getElementById('overlay-question').classList.add('hidden');p.game.openJunctionMap();return true");
  await shot(`junction-${width}`);
  assert.equal(await inspect('return p.manager.routes.length'), 3);
  await inspect("document.querySelectorAll('.route-choice-card')[1].click();return true");
  await wait(1300);
  assert.equal(await inspect('return document.getElementById("btn-map-continue").disabled'), false);
  await load(width, height);
  console.log(`PASS bố cục ${width}×${height}`);
}
try {
  for (const [width, height] of [[360, 800], [768, 1024], [1280, 850], [1280, 720], [1366, 768]]) await layout(width, height);
  // Phím F là thao tác người dùng thật để mở Fullscreen API.
  await tab.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'f', code: 'KeyF', windowsVirtualKeyCode: 70 });
  await tab.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'f', code: 'KeyF', windowsVirtualKeyCode: 70 });
  await wait(500);
  assert.equal(await inspect('return document.fullscreenElement?.id'), 'game-container');
  assert.equal(await inspect("return document.getElementById('game-container').classList.contains('presenting')"), true);
  assert.ok(await inspect("const s=document.getElementById('screen-start');return s.scrollHeight<=s.clientHeight+1"), 'Trình chiếu phải vừa khung');
  await shot('projector-1366');
  await trip({ destination: 'library', car: 'red_family' });
  await inspect('await document.exitFullscreen();return true');
  await wait(150);
  assert.equal(await inspect("return document.getElementById('btn-presentation').getAttribute('aria-pressed')"), 'false');
  for (const [destination, car] of [['library', 'red_family'], ['hospital', 'yellow_taxi'], ['school', 'police_car'], ['park', 'school_bus']]) await trip({ destination, car });
  await load(768, 1024);
  await trip({ destination: 'school', car: 'police_car', correct: false, shortest: false, name: '' });
  await load(360, 800);
  await trip({ destination: 'park', car: 'school_bus', correct: false, shortest: true, name: '<b>Bé</b>' });
  assert.equal(await inspect("return document.querySelector('#res-diploma-text b').textContent.includes('<b>Bé</b>')"), true);
  await inspect("p.game.showScreen('screen-result');return true");
  await shot('result-360');
  await tab.send('Emulation.setEmulatedMedia', { media: 'print' });
  assert.equal(await inspect("return getComputedStyle(document.querySelector('.result-actions-row')).display"), 'none');
  const pdf = await tab.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
  await writeFile(output + 'diploma-print.pdf', Buffer.from(pdf.data, 'base64'));
  await tab.send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await load(360, 800);
  await inspect('p.celebrate();return true');
  assert.equal(await inspect('return p.particles.length'), 0, 'Chưa giảm confetti');
  await inspect("document.getElementById('btn-start-game').click();return true");
  const paused = await inspect(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));return p.game.roadDistance`);
  await wait(200);
  assert.equal(await inspect('return p.game.roadDistance'), paused, 'Game chưa dừng khi tab ẩn');
  await inspect("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));return true");
  await wait(150);
  assert.ok(await inspect('return p.game.roadDistance') > paused);
  // Mất context giữa chuyến đi phải trở về 2D mà không reset điểm/trạng thái.
  await inspect("p.game.isDriving=false;p.game.score=17;p.manager.renderer.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));return true");
  assert.deepEqual(await inspect('return [!!p.manager,p.game.score]'), [false, 17]);
  await tab.send('Emulation.setEmulatedMedia', { media: '', features: [] });
  await tab.send('Network.setBlockedURLs', { urls: ['*cdn.jsdelivr.net*'] });
  await load(360, 800);
  assert.equal(await inspect('return !!p.manager'), false, 'Chưa dự phòng khi mất CDN');
  await trip({ destination: 'library', correct: false, shortest: false });
  await tab.send('Network.setBlockedURLs', { urls: [] });
  const injection = await tab.send('Page.addScriptToEvaluateOnNewDocument', { source: `const originalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/i.test(kind)?null:originalGetContext.call(this,kind,...args)};` });
  await load(768, 1024);
  assert.equal(await inspect('return !!p.manager'), false, 'Chưa dự phòng khi không có WebGL');
  await trip({ destination: 'hospital', car: 'yellow_taxi' });
  await shot('fallback-768');
  await tab.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injection.identifier });
  await load(1280, 850);
  assert.equal(await inspect("const {audio}=await import('./audio.js');return audio.ctx"), null, 'AudioContext khởi tạo quá sớm');
  await tab.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 1170, y: 70, button: 'left', clickCount: 1 });
  await tab.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1170, y: 70, button: 'left', clickCount: 1 });
  assert.equal(await inspect("const {audio}=await import('./audio.js');return !!audio.ctx"), true, 'Chưa mở âm thanh sau chạm');
  await inspect("document.getElementById('btn-sound-toggle').click();return true");
  assert.equal(await inspect("const {audio}=await import('./audio.js');return document.getElementById('btn-sound-toggle').getAttribute('aria-pressed')===String(audio.muted)"), true);
  const exceptions = tab.events.filter(event => event.method === 'Runtime.exceptionThrown');
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
  await writeFile(output + 'verification.json', JSON.stringify({ passed: true, trips: results, layouts: ['360×800', '768×1024', '1280×850', '1280×720', '1366×768'], print: 'diploma-print.pdf', extras: ['fullscreen-projector', 'no-webgl', 'cdn-blocked', 'context-lost', 'reduced-motion', 'visibility', 'audio-gesture', 'name-escaping'] }, null, 2));
  console.log('PASS: 9 chuyến đi, 5 kích thước, trình chiếu, dự phòng, giảm chuyển động, tab ẩn, âm thanh và bản in.');
} finally {
  await browser.send('Target.closeTarget', { targetId }); tab.socket.close(); browser.socket.close();
}
