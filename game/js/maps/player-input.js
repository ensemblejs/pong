'use strict';

module.exports = {
  type: 'ActionMap',
  deps: ['Pong-PlayerMovement'],
  func: function Pong (movement) {
    return {
      up: [{target: movement().up}],
      down: [{target: movement().down}]
    };
  }
};