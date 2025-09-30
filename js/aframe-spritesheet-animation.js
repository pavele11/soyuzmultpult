/**
 * Spritesheet-animation
 * Author: Lee Stemkoski
 * (переработано, функционал и API без изменений)
 */
/* global AFRAME */
AFRAME.registerComponent('spritesheet-animation', {
    schema: {
      rows           : {type: 'number', default: 1},
      columns        : {type: 'number', default: 1},
      firstFrameIndex: {type: 'number', default: 0},
      lastFrameIndex : {type: 'number', default: -1}, // включительно
      frameDuration  : {type: 'number', default: 1},  // секунды
      loop           : {type: 'boolean', default: true}
    },
  
    init() {
      const d = this.data;
  
      this._texCols = d.columns;
      this._texRows = d.rows;
  
      // если последний кадр не задан — используем всю таблицу
      if (d.lastFrameIndex < 0) {
        this._lastFrame = d.columns * d.rows - 1;
      } else {
        this._lastFrame = d.lastFrameIndex;
      }
  
      this._firstFrame = d.firstFrameIndex;
      this._duration   = d.frameDuration;
      this._loop       = d.loop;
  
      this._mesh = this.el.getObject3D('mesh');
      this._accum = 0;
      this._index = this._firstFrame;
      this._done  = false;
  
      // предрасчёт UV-шага
      this._stepU = 1 / this._texCols;
      this._stepV = 1 / this._texRows;
    },
  
    tick(t, dt) {
      if (this._done) return;
  
      this._accum += dt * 0.001; // секунды
  
      while (this._accum >= this._duration) {
        this._accum -= this._duration;
        this._index++;
  
        if (this._index > this._lastFrame) {
          if (this._loop) {
            this._index = this._firstFrame;
          } else {
            this._done = true;
            return;
          }
        }
      }
  
      const row = Math.floor(this._index / this._texCols);
      const col = this._index % this._texCols;
  
      const offsetU = col * this._stepU;
      const offsetV = 1 - (row + 1) * this._stepV;
  
      const map = this._mesh?.material?.map;
      if (map) {
        map.repeat.set(this._stepU, this._stepV);
        map.offset.set(offsetU, offsetV);
      }
    }
  });
