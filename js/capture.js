/* =========================================================
   AR-СЃРєСЂРёРЅС€РѕС‚ В«РІРѕ РІРµСЃСЊ СЌРєСЂР°РЅВ» Р±РµР· РёСЃРєР°Р¶РµРЅРёР№
   (РјРѕР±РёР»СЊРЅС‹Р№-Chrome-friendly: toBlob + СЃРёРЅС…СЂРѕРЅРЅС‹Р№ click)
   ========================================================= */

// С„РѕРЅРѕРІР°СЏ РєР°СЂС‚РёРЅРєР°
const bgImg = new Image();
bgImg.src = '../Images/ui_background.png';

/* Р¶РґС‘Рј РїРѕСЏРІР»РµРЅРёСЏ screenshot-РєРѕРјРїРѕРЅРµРЅС‚Р° MindAR 1.2.5 */
const awaitScreenshot = setInterval(() => {
  const scene = document.querySelector('a-scene');
  if (scene && scene.components && scene.components.screenshot) {
    clearInterval(awaitScreenshot);
    document.getElementById('photoBtn').disabled = false;
  }
}, 200);

/* ---------- СЌР»РµРјРµРЅС‚С‹ РёРЅС‚РµСЂС„РµР№СЃР° ---------- */
const overlay   = document.getElementById('previewOverlay');
const preview   = document.getElementById('previewImg');
const closeBtn  = document.getElementById('closeBtn');
const downBtn   = document.getElementById('downloadBtn');

const afterOverlay = document.getElementById('afterOverlay');
const afterImg     = document.getElementById('afterImg');
const laterBtn     = document.getElementById('laterBtn');

let currentBlobUrl = null;          // С‡С‚РѕР±С‹ РѕСЃРІРѕР±РѕР¶РґР°С‚СЊ РїСЂРµРґС‹РґСѓС‰РёР№ Blob

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

/* ---------- РѕСЃРЅРѕРІРЅРѕР№ РєР»РёРє В«РЎРґРµР»Р°С‚СЊ С„РѕС‚РѕВ» ---------- */
document.getElementById('photoBtn').addEventListener('click', () => {
  const video   = document.querySelector('video');
  const sceneEl = document.querySelector('a-scene');
  if (!video || !video.videoWidth) { alert('РљР°РјРµСЂР° РЅРµ РіРѕС‚РѕРІР°'); return; }

  // РџРѕРєР°Р·С‹РІР°РµРј РїРѕРїР°Рї СЃСЂР°Р·Сѓ
  overlay.classList.remove('hidden');
  
  // РџРѕРєР°Р·С‹РІР°РµРј СЃРїРёРЅРЅРµСЂ РІРјРµСЃС‚Рѕ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
  const previewImg = document.getElementById('previewImg');
  previewImg.style.display = 'none';
  
  // Р”РѕР±Р°РІР»СЏРµРј РёР»Рё РѕР±РЅРѕРІР»СЏРµРј СЃРїРёРЅРЅРµСЂ Р·Р°РіСЂСѓР·РєРё
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

  // Р”РµР»Р°РµРј РєРЅРѕРїРєСѓ "РЎРѕС…СЂР°РЅРёС‚СЊ" РЅРµР°РєС‚РёРІРЅРѕР№ Рё РјРµРЅСЏРµРј РёР·РѕР±СЂР°Р¶РµРЅРёРµ РЅР° loading
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnImg = downloadBtn.querySelector('img');
  downloadBtn.disabled = true;
  downloadBtn.classList.add('disabled');
  downloadBtnImg.src = '../Images/button_save_loading.png';

  video.pause();

  /* 1. С…РѕР»СЃС‚ = СЂР°Р·РјРµСЂ СЌРєСЂР°РЅР° */
  const canvas = document.createElement('canvas');
  canvas.width  = window.innerWidth  * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  /* 2. РІРёРґРµРѕ В«object-fit:containВ» РїРѕ С†РµРЅС‚СЂСѓ */
  const vW = video.videoWidth;
  const vH = video.videoHeight;
  const scale = Math.min(window.innerWidth / vW, window.innerHeight / vH);
  const dw = vW * scale;
  const dh = vH * scale;
  const dx = (window.innerWidth  - dw) / 2;
  const dy = (window.innerHeight - dh) / 2;

  /* 3. С„РѕРЅ */
  const bgScale = Math.max(window.innerWidth / bgImg.width, window.innerHeight / bgImg.height);
  const bw = bgImg.width  * bgScale;
  const bh = bgImg.height * bgScale;
  const bx = (window.innerWidth  - bw) / 2;
  const by = (window.innerHeight - bh) / 2;
  ctx.drawImage(bgImg, bx, by, bw, bh);

  /* 4. РІРёРґРµРѕ */
  ctx.drawImage(video, 0, 0, vW, vH, dx, dy, dw, dh);

  /* 5. AR-СЃР»РѕР№ */
  const arCanvas = sceneEl.components.screenshot.getCanvas('perspective');
  ctx.drawImage(arCanvas, 0, 0, window.innerWidth, window.innerHeight);

  /* 6. РєРѕРЅРІРµСЂС‚РёСЂСѓРµРј РІ Blob Рё СЃРѕР·РґР°С‘Рј URL СЃСЂР°Р·Сѓ */
  canvas.toBlob(blob => {
    const blobUrl = URL.createObjectURL(blob);

    /* 7. РїРѕРєР°Р·С‹РІР°РµРј РїСЂРµРІСЊСЋ */
    currentBlobUrl = blobUrl;
    preview.src = blobUrl;
    
    // РЎРєСЂС‹РІР°РµРј СЃРїРёРЅРЅРµСЂ Р·Р°РіСЂСѓР·РєРё Рё РїРѕРєР°Р·С‹РІР°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёРµ
    const loadingSpinner = document.getElementById('photo-loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    previewImg.style.display = 'block';
    
    // РђРєС‚РёРІРёСЂСѓРµРј РєРЅРѕРїРєСѓ "РЎРѕС…СЂР°РЅРёС‚СЊ" Рё РІРѕР·РІСЂР°С‰Р°РµРј РѕР±С‹С‡РЅРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtnImg = downloadBtn.querySelector('img');
    downloadBtn.disabled = false;
    downloadBtn.classList.remove('disabled');
    downloadBtnImg.src = '../Images/button_save.png';
    
    video.play();

    /* 8. РєРЅРѕРїРєР° В«РЎРєР°С‡Р°С‚СЊВ» вЂ“ РЇРЅРґРµРєСЃ-friendly */
downBtn.onclick = () => {
  const isYandex = /YaBrowser/.test(navigator.userAgent);

  if (isYandex) {
    /* РґР»СЏ РЇРЅРґРµРєСЃР° РґРµР»Р°РµРј dataURL */
    const reader = new FileReader();
    reader.onloadend = () => {
      const link = document.createElement('a');
      link.href = reader.result;          // dataURL
      link.download = 'SMP_' + Date.now() + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsDataURL(blob);           // С‡РёС‚Р°РµРј Blob в†’ dataURL
  } else {
    /* РґР»СЏ РІСЃРµС… РѕСЃС‚Р°Р»СЊРЅС‹С… вЂ“ Р±С‹СЃС‚СЂС‹Р№ Blob-URL */
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

/* ---------- РїРѕРєР°Р· РєРЅРѕРїРєРё РїРѕСЃР»Рµ СЃРєСЂС‹С‚РёСЏ loading-overlay ---------- */
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
