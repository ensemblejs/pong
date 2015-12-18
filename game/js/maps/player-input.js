'use strict';

module.exports = {
  type: 'ActionMap',
  deps: ['Pong-PlayerMovement', 'SaveGame'],
  func: function Pong (movement, saveGame) {
    return {
      up: [{call: movement().up}],
      down: [{call: movement().down}],
      space: [ {ack: 'player-ready', whenWaiting: true, onRelease: true} ],
      f11: [ {call: saveGame().now} ]
    };
  }
};