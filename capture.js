/* =========================================================
   AR-скриншот «во весь экран» без искажений
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
  
  function hidePreview() {
    overlay.classList.add('hidden');
    URL.revokeObjectURL(preview.src);
  }
  
  closeBtn.addEventListener('click', hidePreview);
  overlay.addEventListener('click', e => { if (e.target === overlay) hidePreview(); });
  
  laterBtn.addEventListener('click', () => {
    afterOverlay.classList.add('hidden');
    hidePreview();
  });
  afterOverlay.addEventListener('click', e => {
    if (e.target === afterOverlay) afterOverlay.classList.add('hidden');
  });
  
  /* ---------- основной клик «Сделать фото» ---------- */
  document.getElementById('photoBtn').addEventListener('click', () => {
    const video   = document.querySelector('video');
    const sceneEl = document.querySelector('a-scene');
    if (!video || !video.videoWidth) { alert('Камера не готова'); return; }
  
    video.pause();
  
    /* ---------- 1. холст = размер экрана ---------- */
    const canvas = document.createElement('canvas');
    canvas.width  = window.innerWidth  * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  
    /* ---------- 2. видео «object-fit:contain» по центру ---------- */
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const scale = Math.min(window.innerWidth / vW, window.innerHeight / vH);
    const dw = vW * scale;
    const dh = vH * scale;
    const dx = (window.innerWidth  - dw) / 2;
    const dy = (window.innerHeight - dh) / 2;
  
    /* ---------- ДЕБАГ-ЛОГ ---------- */
    console.group('📸 DEBUG screenshot');
    console.log('video.videoWidth / videoHeight :', vW, '/', vH);
    console.log('window.innerWidth / innerHeight :', window.innerWidth, '/', window.innerHeight);
    const arCanvas = sceneEl.components.screenshot.getCanvas('perspective');
    console.log('AR-canvas size :', arCanvas.width, '×', arCanvas.height);
    console.log('final canvas CSS-size :', window.innerWidth, '×', window.innerHeight);
    console.log('video drawImage params :', 'dx=', dx, 'dy=', dy, 'dw=', dw, 'dh=', dh);
    console.groupEnd();
    /* ---------- /ДЕБАГ-ЛОГ ---------- */
  
  /* ---------- заливаем фоном ---------- */
  const bgScale = Math.max(
    window.innerWidth / bgImg.width,
    window.innerHeight / bgImg.height
  );
  const bw = bgImg.width * bgScale;
  const bh = bgImg.height * bgScale;
  const bx = (window.innerWidth - bw) / 2;
  const by = (window.innerHeight - bh) / 2;
  ctx.drawImage(bgImg, bx, by, bw, bh);

/* ---------- рисуем видео поверх ---------- */
ctx.drawImage(video, 0, 0, vW, vH, dx, dy, dw, dh);

/* ---------- рисуем AR поверх всего ---------- */
ctx.drawImage(arCanvas, 0, 0, window.innerWidth, window.innerHeight);
  
    /* ---------- 3. показываем превью ---------- */
    const dataURL = canvas.toDataURL('image/png');
    preview.src   = dataURL;
    overlay.classList.remove('hidden');
    video.play();
  
    /* ---------- 4. кнопка «Скачать» ---------- */
    downBtn.onclick = () => {
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'mindar_' + Date.now() + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      afterOverlay.classList.remove('hidden');
    };
  });

  // Ждём, пока исчезнет #loading-overlay, и только потом показываем кнопку
const loadingOverlay = document.getElementById('loading-overlay');
const photoBtn = document.getElementById('photoBtn');

const loadingObserver = new MutationObserver(() => {
  if (loadingOverlay.classList.contains('hidden')) {
    photoBtn.style.visibility = 'visible';
    loadingObserver.disconnect(); // больше не нужен
  }
});

loadingObserver.observe(loadingOverlay, {
  attributes: true,
  attributeFilter: ['class']
});