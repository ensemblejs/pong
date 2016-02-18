'use strict';

var add = require('distributedlife-sat').vector.add;
var scale = require('distributedlife-sat').vector.scale;

module.exports = {
  type: 'OnPhysicsFrame',
  func: function BallMovement () {
    return function moveBall (state, delta) {
      if (state.get('pong.status') !== 'in-game') {
        return;
      }

      var ball = state.unwrap('pong.ball');

      return [
        'pong.ball.position', add(ball.position, scale(ball.velocity, delta))
      ];
    };
  }
};