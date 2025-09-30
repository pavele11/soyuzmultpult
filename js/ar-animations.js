/**
 * AR Animations Component
 * Компонент для управления анимациями 3D моделей и спрайтов при появлении/исчезновении маркеров
 */

AFRAME.registerComponent('play-on-visible', {
  init() {
    const model   = this.el.firstElementChild;               // gltf
    const gifPlane = this.el.querySelector('#gif-element');  // плоскость

    /* появление маркера */
    this.el.addEventListener('targetFound', () => {
      /* GLB-анимация */
      model.removeAttribute('animation-mixer');
      model.setAttribute('animation-mixer', {
        loop: 'once',
        clampWhenFinished: true,
        timeScale: 1
      });

      /* scale-анимация GIF 0→1 */
      gifPlane.removeAttribute('animation__scale'); // сброс
      gifPlane.setAttribute('animation__scale', {
        property: 'scale',
        from: '0 0 0',
        to: '1 1 1',
        dur: 1000,
        easing: 'easeOutBack'
      });
    });

    /* исчезновение маркера (по желанию) */
    this.el.addEventListener('targetLost', () => {
      gifPlane.removeAttribute('animation__scale');
      gifPlane.setAttribute('scale', '0 0 0'); // прячем сразу
    });
  }
});
