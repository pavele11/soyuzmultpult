/**
 * Loading Timeout Script
 * Автоматический переход на страницу ошибки при зависании загрузки
 */

(function() {
  // Увеличиваем таймаут для медленных устройств
  const isSlowDevice = /iphone/.test(navigator.userAgent.toLowerCase()) && 
                      (/iphone os [6-9]_/.test(navigator.userAgent.toLowerCase()) || 
                       /iphone os 1[0-2]_/.test(navigator.userAgent.toLowerCase()));
  
  const limit = isSlowDevice ? 25 : 15;  // 25 секунд для старых iPhone, 15 для остальных
  const target = 'error.html';
  const tick = setTimeout(() => {
    // если до сих пор висит оверлей загрузки – значит «завис»
    if (!document.getElementById('loading-overlay').classList.contains('hidden')) {
      window.location.replace(target);
    }
  }, limit * 1000);

  // если загрузка всё-таки закончилась – отменяем таймер
  window.addEventListener('load', () => clearTimeout(tick));
})();
