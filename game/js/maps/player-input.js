'use strict';

module.exports = {
  type: 'ActionMap',
  deps: ['Pong-PlayerMovement', 'SaveProgress'],
  func: function Pong (movement, saveProgress) {
    return {
      up: [{call: movement().up}],
      down: [{call: movement().down}],
      space: [ {ack: 'player-ready', whenWaiting: true, onRelease: true} ],
      'face-0': [{ack: 'player-ready', whenWaiting: true, onRelease: true}],
      f11: [ {call: saveProgress().now} ]
    };
  }
};