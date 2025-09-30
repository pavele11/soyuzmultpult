/**
 * Управление UI элементами AR приложения
 * Обрабатывает popup'ы, карусель изображений и взаимодействие с пользователем
 */
document.addEventListener('DOMContentLoaded', function() {
  const accessPopup = document.querySelector('.access-popup');
  const loadingOverlay = document.querySelector('#loading-overlay');
  const scanningOverlay = document.querySelector('#scanning-overlay');
  
  // Показываем popup через 1 секунду после загрузки
  setTimeout(() => {
    accessPopup.classList.add('show');
  }, 1000);
  
  // Функция для скрытия popup
  function hidePopup() {
    accessPopup.style.display = 'none';
  }
  
  // Функция для показа popup
  function showPopup() {
    accessPopup.style.display = 'block';
  }
  
  // Скрываем popup при появлении экрана сканирования
  const scanningObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!scanningOverlay.classList.contains('hidden')) {
          hidePopup();
        }
      }
    });
  });
  
  // Скрываем popup при скрытии экрана загрузки (когда переходим к основному экрану)
  const loadingObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (loadingOverlay.classList.contains('hidden')) {
          hidePopup();
        }
      }
    });
  });
  
  scanningObserver.observe(scanningOverlay, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  loadingObserver.observe(loadingOverlay, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Карусель картинок на экране сканирования
  let imageInterval = null;
  
  function startCarousel() {
    const images = document.querySelectorAll('.main-image');
    if (images.length === 0) return;
    
    let currentIndex = 0;
    
    function switchImage() {
      console.log('Switching image, current index:', currentIndex);
      // Убираем активный класс с текущей картинки
      images[currentIndex].classList.remove('active');
      
      // Переходим к следующей картинке
      currentIndex = (currentIndex + 1) % images.length;
      
      // Добавляем активный класс к новой картинке
      images[currentIndex].classList.add('active');
      console.log('New active image index:', currentIndex);
    }
    
    // Очищаем предыдущий интервал если есть
    if (imageInterval) {
      clearInterval(imageInterval);
    }
    
    // Запускаем смену картинок каждые 3 секунды
    imageInterval = setInterval(switchImage, 3000);
    console.log('Carousel started');
  }
  
  // Запускаем карусель сразу
  setTimeout(startCarousel, 100);
  
  // Останавливаем карусель когда экран сканирования скрывается
  const stopCarouselObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (scanningOverlay.classList.contains('hidden')) {
          if (imageInterval) {
            clearInterval(imageInterval);
            imageInterval = null;
            console.log('Carousel stopped');
          }
        } else {
          // Запускаем карусель когда экран сканирования появляется
          setTimeout(startCarousel, 100);
        }
      }
    });
  });
  
  stopCarouselObserver.observe(scanningOverlay, {
    attributes: true,
    attributeFilter: ['class']
  });
});
