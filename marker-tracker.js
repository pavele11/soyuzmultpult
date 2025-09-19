// Отслеживание состояния всех маркеров
let markerStates = {
  0: false,
  1: false,
  2: false
};

function updateGifVisibility() {
  const gifElement = document.querySelector('#gif-element');
  const allMarkersActive = markerStates[0] && markerStates[1] && markerStates[2];
  
  if (gifElement) {
    gifElement.setAttribute('visible', allMarkersActive);
    console.log('All markers active:', allMarkersActive);
  }
}

// Функция для установки состояния маркера
function setMarkerState(targetIndex, isActive) {
  markerStates[targetIndex] = isActive;
  console.log(`Marker ${targetIndex}:`, isActive ? 'ACTIVE' : 'INACTIVE');
  updateGifVisibility();
}

// Обработчики событий для каждого маркера
document.addEventListener('DOMContentLoaded', function() {
  // targetIndex: 0
  const marker0 = document.querySelector('a-entity[mindar-image-target="targetIndex: 0"]');
  if (marker0) {
    marker0.addEventListener('targetFound', function() {
      setMarkerState(0, true);
    });
    marker0.addEventListener('targetLost', function() {
      setMarkerState(0, false);
    });
  }
  
  // targetIndex: 1
  const marker1 = document.querySelector('a-entity[mindar-image-target="targetIndex: 1"]');
  if (marker1) {
    marker1.addEventListener('targetFound', function() {
      setMarkerState(1, true);
    });
    marker1.addEventListener('targetLost', function() {
      setMarkerState(1, false);
    });
  }
  
  // targetIndex: 2
  const marker2 = document.querySelector('a-entity[mindar-image-target="targetIndex: 2"]');
  if (marker2) {
    marker2.addEventListener('targetFound', function() {
      setMarkerState(2, true);
    });
    marker2.addEventListener('targetLost', function() {
      setMarkerState(2, false);
    });
  }
  
  // Изначально скрываем GIF элемент
  const gifElement = document.querySelector('#gif-element');
  if (gifElement) {
    gifElement.setAttribute('visible', false);
  }
});
