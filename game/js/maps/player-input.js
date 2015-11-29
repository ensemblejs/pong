'use strict';

module.exports = {
  type: 'ActionMap',
  deps: ['Pong-PlayerMovement'],
  func: function Pong (movement) {
    return {
      up: [{call: movement().up}],
      down: [{call: movement().down}],
      space: [ {ack: 'player-ready', whenWaiting: true, onRelease: true} ]
    };
  }
};