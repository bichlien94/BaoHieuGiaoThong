// Chạy trên trang HTTP cục bộ; rút ngắn thời gian chờ lái, giữ nguyên xử lý câu trả lời.
import { presentation } from '../ui.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const visible = id => !document.getElementById(id).classList.contains('hidden');
function check(condition, message) { if (!condition) throw new Error(message); }
async function until(test, message) {
  for (let i = 0; i < 60; i++) { if (test()) return; await wait(50); }
  throw new Error(message);
}

export async function runTrip({ destination = 'library', car = 'red_family', correct = true, shortest = true, name = 'Minh Anh' } = {}) {
  const game = presentation.game;
  game.goStart();
  const input = document.getElementById('child-name-input');
  input.value = name; input.dispatchEvent(new Event('input'));
  document.querySelector(`[data-car="${car}"]`).click();
  document.querySelector(`[data-dest="${destination}"]`).click();
  document.getElementById('btn-start-game').click();
  let mapChecked = false;
  for (let i = 0; i < 4; i++) {
    if (i === 2) {
      await until(() => visible('overlay-map'), 'Không mở ngã rẽ');
      check(presentation.mode === 'junction', 'Sai màn ngã rẽ');
      const routes = game.currentDest.routes;
      const index = routes.findIndex(route => shortest ? route.id === game.currentDest.shortestId : route.id !== game.currentDest.shortestId);
      document.querySelectorAll('.route-choice-card')[index].click();
      await until(() => !document.getElementById('btn-map-continue').disabled, 'Xe chạy thử không kết thúc');
      document.getElementById('btn-map-continue').click();
      mapChecked = true;
    }
    game.signZ = 91;
    await until(() => visible('overlay-question'), `Không mở biển ${i + 1}`);
    check(!game.isDriving && game.carSpeed === 0, 'Xe chưa dừng trước biển');
    for (let phase = 0; phase < 2; phase++) {
      const options = document.querySelectorAll('.opt-choice-btn');
      options[correct ? 0 : 1].click();
      check([...options].every(button => button.disabled), 'Đáp án chưa khóa');
      document.getElementById('btn-q-continue').click();
    }
    check(game.signIndex === i + 1, 'Sai thứ tự biển');
  }
  game.signZ = 91;
  await until(() => visible('screen-result'), 'Không về bằng khen');
  const expectedScore = (correct ? 80 : 24) + (shortest ? 50 : 0);
  check(game.score === expectedScore, `Điểm sai: ${game.score}, cần ${expectedScore}`);
  check(game.correctSigns === 4, 'Không giữ cách đếm biển cũ');
  check(document.getElementById('res-dist').textContent === `${game.chosenRoute.total} m`, 'Sai quãng đường');
  check(document.getElementById('res-student-name').textContent === (name || 'Bạn nhỏ'), 'Sai tên bằng khen');
  const result = { destination, car, score: game.score, distance: game.chosenRoute.total, stars: document.querySelectorAll('.star-reward').length, mapChecked, renderer: !!presentation.manager };
  game.goStart();
  check(input.value === name, 'Chơi lại không giữ tên');
  return result;
}
