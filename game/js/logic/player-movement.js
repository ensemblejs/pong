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
      return ['player' + playerId + '.pong.paddle.position', {
        x: position.x,
        y: movePaddleAlongRail(position.y, distance)
      }];
    }

    function up (state, data) {
      if (state.get('pong.status') !== 'in-game') {
        return;
      }

      var playerId = data.playerId;
      var position = state.player(playerId).unwrap('pong.paddle.position');

      return movePaddle(playerId, position, -paddleSpeed * data.delta);
    }

    function down (state, data) {
      if (state.get('pong.status') !== 'in-game') {
        return;
      }

      var playerId = data.playerId;
      var position = state.player(playerId).unwrap('pong.paddle.position');

      return movePaddle(playerId, position, paddleSpeed * data.delta);
    }

    return {
      up: up,
      down: down
    };
  }
};