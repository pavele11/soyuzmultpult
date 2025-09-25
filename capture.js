/* =========================================================
   AR-скриншот «во весь экран» без искажений
   (мобильный-Chrome-friendly: toBlob + синхронный click)
   ========================================================= */

// фоновая картинка
const bgImg = new Image();
bgImg.src = 'Images/ui_background.png';

/* ждём появления screenshot-компонента MindAR 1.2.5 */
const awaitScreenshot = setInterval(() => {
  const scene = document.querySelector('a-scene');
  if (scene && scene.components && scene.components.screenshot) {
    clearInterval(awaitScreenshot);
    document.getElementById('photoBtn').disabled = false;
  }
}, 200);

/* ---------- элементы интерфейса ---------- */
const overlay   = document.getElementById('previewOverlay');
const preview   = document.getElementById('previewImg');
const closeBtn  = document.getElementById('closeBtn');
const downBtn   = document.getElementById('downloadBtn');

const afterOverlay = document.getElementById('afterOverlay');
const afterImg     = document.getElementById('afterImg');
const laterBtn     = document.getElementById('laterBtn');

let currentBlobUrl = null;          // чтобы освобождать предыдущий Blob

function hidePreview() {
  overlay.classList.add('hidden');
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
}

closeBtn.addEventListener('click', hidePreview);
overlay.addEventListener('click',  e => { if (e.target === overlay) hidePreview(); });

laterBtn.addEventListener('click', () => {
  afterOverlay.classList.add('hidden');
  hidePreview();
});
afterOverlay.addEventListener('click', e => { if (e.target === afterOverlay) afterOverlay.classList.add('hidden'); });

/* ---------- основной клик «Сделать фото» ---------- */
/* ---------- «Сделать фото» ---------- */
document.getElementById('photoBtn').addEventListener('click', async () => {
  const btn   = document.getElementById('photoBtn');
  const scene = document.querySelector('a-scene');
  /* 1. берём именно системное видео MindAR */
  const video = [...document.querySelectorAll('video')].find(v => v.id !== 'myVideo');

  /* 2. если кадр ещё не пришёл – просто ничего не делаем, молча выходим */
  if (!video || !video.videoWidth) return;

  btn.disabled = true;                       // защита от двойного клика

  /* 3. один кадр на паузу – достаточно, чтобы нарисовать его в canvas */
  video.pause();

  /* 4. создаём canvas = размер экрана */
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  /* 5. рисуем фон */
  const bgScale = Math.max(window.innerWidth / bgImg.width, window.innerHeight / bgImg.height);
  ctx.drawImage(bgImg,
                (window.innerWidth  - bgImg.width  * bgScale) / 2,
                (window.innerHeight - bgImg.height * bgScale) / 2,
                bgImg.width  * bgScale,
                bgImg.height * bgScale);

  /* 6. рисуем видео «object-fit:contain» */
  const vW = video.videoWidth,  vH = video.videoHeight;
  const scale = Math.min(window.innerWidth / vW, window.innerHeight / vH);
  const dw = vW * scale,  dh = vH * scale;
  const dx = (window.innerWidth  - dw) / 2;
  const dy = (window.innerHeight - dh) / 2;
  ctx.drawImage(video, 0, 0, vW, vH, dx, dy, dw, dh);

  /* 7. рисуем AR-слой */
  const arCanvas = scene.components.screenshot.getCanvas('perspective');
  ctx.drawImage(arCanvas, 0, 0, window.innerWidth, window.innerHeight);

  /* 8. сразу возвращаем поток в PLAY */
  video.play();

  /* 9. в Blob и показываем превью */
  canvas.toBlob(blob => {
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = URL.createObjectURL(blob);
    preview.src = currentBlobUrl;
    overlay.classList.remove('hidden');
    btn.disabled = false;              // кнопка снова активна
  }, 'image/png');
});

/* ---------- показ кнопки после скрытия loading-overlay ---------- */
const loadingOverlay = document.getElementById('loading-overlay');
const photoBtn = document.getElementById('photoBtn');

const loadingObserver = new MutationObserver(() => {
  if (loadingOverlay.classList.contains('hidden')) {
    photoBtn.style.visibility = 'visible';
    loadingObserver.disconnect();
  }
});
loadingObserver.observe(loadingOverlay, {
  attributes: true,
  attributeFilter: ['class']
});