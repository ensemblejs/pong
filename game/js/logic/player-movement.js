'use strict';

function createMovePaddleAlongRailFunction (minimum, maximum) {
  return function movePaddleAlongRail (position, distance) {
    var newPosition = position + distance;

    if (newPosition < minimum) {
      return minimum;
    }

    if (newPosition > maximum) {
      return maximum;
    }

    return newPosition;
  };
}

module.exports = {
  type: 'Pong-PlayerMovement',
  deps: ['Config'],
  func: function PongPlayerMovement (config) {
    var paddleSpeed = config().pong.paddle.speed;

    var movePaddleAlongRail = createMovePaddleAlongRailFunction(
      config().pong.paddle.bounds.minimum,
      config().pong.paddle.bounds.maximum
    );

    function movePaddle (playerId, position, distance) {
      var player = {};
      player[playerId] = {
        paddle: {
          position: {
            x: position('x'),
            y: movePaddleAlongRail(position('y'), distance)
          }
        }
      };

      return {
        player: player
      };
    }

    function up (state, data) {
      var playerId = data.playerId;
      var position = state.player(playerId).get('paddle')('position');

      return movePaddle(playerId, position, -paddleSpeed * data.delta);
    }

    function down (state, data) {
      var playerId = data.playerId;
      var position = state.player(playerId).get('paddle')('position');

      return movePaddle(playerId, position, paddleSpeed * data.delta);
    }

    return {
      up: up,
      down: down
    };
  }
};