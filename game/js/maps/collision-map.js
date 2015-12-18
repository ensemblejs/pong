'use strict';

function bounceBallX (state) {
  return [
    'pong.ball.velocity.x', state.get('pong.ball.velocity.x') * -1
  ];
}

function bounceBallY (state) {
  return [
    'pong.ball.velocity.y', state.get('pong.ball.velocity.y') * -1
  ];
}

function resetBall (state, delta, config) {
  var ball = state.unwrap('pong.ball');
  ball.velocity.x *= -1;
  ball.position = config.pong.ball.position;

  return ['pong.ball', ball];
}

function player1wins (state) {
  return ['player.1.pong.score', state.player(1).get('pong.score') + 1];
}

function player2wins (state) {
  return ['player.2.pong.score', state.player(2).get('pong.score') + 1];
}

module.exports = {
  type: 'CollisionMap',
  deps: ['Config'],
  func: function (config) {
    return {
      'ball': [
        { and: ['paddles'], start: bounceBallX },
        { and: ['walls'], start: bounceBallY },
        { and: ['left-end-zone'], start: [player2wins, resetBall], data: [config()] },
        { and: ['right-end-zone'], start: [player1wins, resetBall], data: [config()] }
      ]
    };
  }
};