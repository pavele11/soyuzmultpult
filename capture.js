/* ждём появления screenshot-компонента (MindAR 1.2.5) */
const awaitScreenshot = setInterval(() => {
    const scene = document.querySelector('a-scene');
    if (scene && scene.components && scene.components.screenshot) {
      clearInterval(awaitScreenshot);
      document.getElementById('photoBtn').disabled = false;
    }
  }, 200);
  
  /* элементы превью */
  const overlay   = document.getElementById('previewOverlay');
  const preview   = document.getElementById('previewImg');
  const closeBtn  = document.getElementById('closeBtn');
  const downBtn   = document.getElementById('downloadBtn');
  
  /* элементы второго поп-апа */
  const afterOverlay = document.getElementById('afterOverlay');
  const afterImg     = document.getElementById('afterImg');
  const laterBtn     = document.getElementById('laterBtn');
  
  function hidePreview(){
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
  
  /* основной клик по «Сделать фото» */
  document.getElementById('photoBtn').addEventListener('click', () => {
    const video   = document.querySelector('video');
    const sceneEl = document.querySelector('a-scene');
    if (!video || !video.videoWidth) { alert('Камера не готова'); return; }
  
    video.pause();
  
    /* 1. рисуем кадр */
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const ar = sceneEl.components.screenshot.getCanvas('perspective');
    ctx.drawImage(ar, 0, 0, canvas.width, canvas.height);
  
    /* 2. dataURL – работает в Яндексе */
    const dataURL = canvas.toDataURL('image/png');
  
    /* 3. показываем превью */
    preview.src = dataURL;
    overlay.classList.remove('hidden');
    video.play();
  
    /* 4. кнопка «Скачать» – синхронно */
    downBtn.onclick = () => {
      /* 4a. скачивание */
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'mindar_' + Date.now() + '.png';
      document.body.appendChild(link);   // для Яндекса
      link.click();
      document.body.removeChild(link);
  
      /* 4b. сразу показываем второй поп-ап */
      afterImg.src = dataURL;   // если хотите без картинки – уберите строку
      afterOverlay.classList.remove('hidden');
    };
  });