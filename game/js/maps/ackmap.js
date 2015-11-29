'use strict';

module.exports = {
  type: 'AcknowledgementMap',
  deps: ['Pong-GameControl'],
  func: function PongControl (control) {
    return {
      'player-ready': [{
        onProgress: control().toggleReady,
        onComplete: control().beginCountdown,
        type: 'once-for-all'
      }]
    };
  }
};