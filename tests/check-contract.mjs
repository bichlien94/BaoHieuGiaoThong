import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const original = process.argv.includes('--stdin') ? readFileSync(0, 'utf8')
  : execFileSync('git', ['show', '2f34bcf:index.html'], { encoding: 'utf8' });
const currentData = readFileSync(new URL('../data.js', import.meta.url), 'utf8');
const currentGame = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const originalData = original.slice(original.indexOf('const SVG_ICONS ='), original.indexOf('// Ảnh biển báo'))
  + original.slice(original.indexOf('const CAR_STYLES ='), original.indexOf('const game ='));
const readData = source => JSON.parse(vm.runInNewContext(source.replaceAll('export const', 'const')
  + '\nJSON.stringify({SVG_ICONS,SIGNS_DATA,CAR_STYLES,DESTINATIONS})'));
assert.deepEqual(readData(currentData), readData(originalData), 'Dữ liệu câu hỏi, xe hoặc quãng đường đã đổi');

function method(source, name) {
  const start = source.indexOf(`  ${name}(`);
  assert.ok(start >= 0, `Thiếu hàm ${name}`);
  const next = source.slice(start + 2).search(/\n  [a-zA-Z][a-zA-Z0-9]*\([^\n]*\) \{/);
  return source.slice(start, next < 0 ? undefined : start + 2 + next).replaceAll('\r\n', '\n').replace(/\s*\/\/[^\n]*/g, '').trim();
}
for (const name of ['startTrip', 'updatePhysics', 'scheduleNextSign', 'handleSignAnswer', 'handleRouteChoice', 'bumpScore', 'passCheckpoint']) {
  assert.equal(method(currentGame, name), method(original, name), `Luật trong ${name} đã đổi`);
}
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /maximum-scale=1\.0, user-scalable=no/);
assert.match(html, /three@0\.160\.0\/build\/three\.module\.js/);
assert.match(html, /maxlength="20"/);
assert.doesNotMatch(html, /onclick=/);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'ID HTML bị trùng');
console.log('PASS: dữ liệu gốc, 7 hàm luật chơi, CDN ghim phiên bản, viewport và ID HTML.');
