/**
 * Performance Optimizer для iPhone и медленных устройств
 * Оптимизирует загрузку и производительность AR приложения
 */

(function() {
  'use strict';
  
  // Определяем медленное устройство
  const isSlowDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIPhone = /iphone/.test(userAgent);
    const isOldIPhone = /iphone os [6-9]_/.test(userAgent) || /iphone os 1[0-2]_/.test(userAgent);
    const memory = navigator.deviceMemory || 4; // По умолчанию предполагаем 4GB
    
    return isIPhone && (isOldIPhone || memory < 3);
  };
  
  // Оптимизации для медленных устройств
  if (isSlowDevice()) {
    console.log('Обнаружено медленное устройство, применяем оптимизации...');
    
    // 1. Уменьшаем качество видео для медленных устройств
    const optimizeVideoConstraints = () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        const mindarImage = scene.getAttribute('mindar-image');
        if (mindarImage) {
          // Обновляем ограничения устройства для медленных iPhone
          scene.setAttribute('mindar-image', {
            ...mindarImage,
            deviceConstraints: {
              video: {
                facingMode: 'environment',
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 15, max: 30 }
              }
            }
          });
        }
      }
    };
    
    // 2. Откладываем загрузку тяжелых ресурсов
    const delayHeavyResources = () => {
      setTimeout(() => {
        // Загружаем 3D модели только после полной инициализации
        const models = document.querySelectorAll('a-asset-item[src*=".glb"]');
        models.forEach(model => {
          if (model.getAttribute('preload') === 'false') {
            model.setAttribute('preload', 'true');
          }
        });
      }, 3000); // 3 секунды задержки
    };
    
    // 3. Уменьшаем качество рендеринга
    const optimizeRendering = () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        // Уменьшаем разрешение рендеринга
        scene.setAttribute('renderer', {
          colorManagement: true,
          physicallyCorrectLights: false, // Отключаем для экономии ресурсов
          antialias: false,
          precision: 'medium'
        });
      }
    };
    
    // Применяем оптимизации после загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
      optimizeVideoConstraints();
      delayHeavyResources();
      optimizeRendering();
    });
    
    // Дополнительная оптимизация при готовности сцены
    document.addEventListener('DOMContentLoaded', () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.addEventListener('loaded', () => {
          // Уменьшаем частоту обновления для экономии батареи
          scene.setAttribute('renderer', {
            ...scene.getAttribute('renderer'),
            powerPreference: 'low-power'
          });
        });
      }
    });
  }
  
  // Универсальные оптимизации для всех устройств
  const universalOptimizations = () => {
    // Предзагрузка критических ресурсов
    const preloadCriticalResources = () => {
      const criticalResources = [
        'img/sprite_sheet.jpg',
        'img/Pult.gif',
        'img/ui_background.png'
      ];
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.jpg') || resource.endsWith('.png') || resource.endsWith('.gif') ? 'image' : 'fetch';
        document.head.appendChild(link);
      });
    };
    
    // Применяем универсальные оптимизации
    preloadCriticalResources();
  };
  
  // Запускаем оптимизации
  universalOptimizations();
  
})();
