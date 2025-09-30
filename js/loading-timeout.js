/**
 * Таймер загрузки для AR приложения
 * Перенаправляет на страницу ошибки, если загрузка превышает лимит времени
 */
(function() {
  const limit = 15;          // секунд
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
