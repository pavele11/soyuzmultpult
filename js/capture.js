/* =========================================================
   AR-скриншот «во весь экран» без искажений
   (мобильный-Chrome-friendly: toBlob + синхронный click)
   ========================================================= */

// фоновая картинка
const bgImg = new Image();
// Создаем абсолютный путь для GitHub Pages совместимости
const getImagePath = (imageName) => {
  const basePath = window.location.pathname.includes('/soyuzmultpult/') 
    ? window.location.pathname.split('/soyuzmultpult/')[0] + '/soyuzmultpult/' 
    : './';
  return basePath + 'img/' + imageName;
};
bgImg.src = getImagePath('ui_background.png');

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
document.getElementById('photoBtn').addEventListener('click', () => {
  const video   = document.querySelector('video');
  const sceneEl = document.querySelector('a-scene');
  if (!video || !video.videoWidth) { alert('Камера не готова'); return; }

  // Показываем попап сразу
  overlay.classList.remove('hidden');
  
  // Показываем спиннер вместо изображения
  const previewImg = document.getElementById('previewImg');
  previewImg.style.display = 'none';
  
  // Добавляем или обновляем спиннер загрузки
  let loadingSpinner = document.getElementById('photo-loading-spinner');
  if (!loadingSpinner) {
    loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'photo-loading-spinner';
    loadingSpinner.className = 'photo-loading-spinner';
    loadingSpinner.innerHTML = '<div class="spinner"></div>';
    previewImg.parentNode.insertBefore(loadingSpinner, previewImg.nextSibling);
  } else {
    loadingSpinner.style.display = 'block';
  }

  // Делаем кнопку "Сохранить" неактивной и меняем изображение на loading
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnImg = downloadBtn.querySelector('img');
  downloadBtn.disabled = true;
  downloadBtn.classList.add('disabled');
  downloadBtnImg.src = getImagePath('button_save_loading.png');

  video.pause();

  /* 1. холст = размер экрана */
  const canvas = document.createElement('canvas');
  canvas.width  = window.innerWidth  * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  /* 2. видео «object-fit:contain» по центру */
  const vW = video.videoWidth;
  const vH = video.videoHeight;
  const scale = Math.min(window.innerWidth / vW, window.innerHeight / vH);
  const dw = vW * scale;
  const dh = vH * scale;
  const dx = (window.innerWidth  - dw) / 2;
  const dy = (window.innerHeight - dh) / 2;

  /* 3. фон */
  const bgScale = Math.max(window.innerWidth / bgImg.width, window.innerHeight / bgImg.height);
  const bw = bgImg.width  * bgScale;
  const bh = bgImg.height * bgScale;
  const bx = (window.innerWidth  - bw) / 2;
  const by = (window.innerHeight - bh) / 2;
  ctx.drawImage(bgImg, bx, by, bw, bh);

  /* 4. видео */
  ctx.drawImage(video, 0, 0, vW, vH, dx, dy, dw, dh);

  /* 5. AR-слой */
  const arCanvas = sceneEl.components.screenshot.getCanvas('perspective');
  ctx.drawImage(arCanvas, 0, 0, window.innerWidth, window.innerHeight);

  /* 6. конвертируем в Blob и создаём URL сразу */
  canvas.toBlob(blob => {
    const blobUrl = URL.createObjectURL(blob);

    /* 7. показываем превью */
    currentBlobUrl = blobUrl;
    preview.src = blobUrl;
    
    // Скрываем спиннер загрузки и показываем изображение
    const loadingSpinner = document.getElementById('photo-loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    previewImg.style.display = 'block';
    
    // Активируем кнопку "Сохранить" и возвращаем обычное изображение
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtnImg = downloadBtn.querySelector('img');
    downloadBtn.disabled = false;
    downloadBtn.classList.remove('disabled');
    downloadBtnImg.src = getImagePath('button_save.png');
    
    video.play();

    /* 8. кнопка «Скачать» – Яндекс-friendly */
downBtn.onclick = () => {
  const isYandex = /YaBrowser/.test(navigator.userAgent);

  if (isYandex) {
    /* для Яндекса делаем dataURL */
    const reader = new FileReader();
    reader.onloadend = () => {
      const link = document.createElement('a');
      link.href = reader.result;          // dataURL
      link.download = 'SMP_' + Date.now() + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsDataURL(blob);           // читаем Blob → dataURL
  } else {
    /* для всех остальных – быстрый Blob-URL */
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'mindar_' + Date.now() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  afterOverlay.classList.remove('hidden');
};
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