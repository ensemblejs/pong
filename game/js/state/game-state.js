'use strict';

module.exports = {
  type: 'StateSeed',
  deps: ['Config'],
  func: function Pong (config) {
    var ballConfig = config().pong.ball;
    var paddle = config().pong.paddle;

    return {
      pong: {
        ball: {
          position: ballConfig.position,
          radius: ballConfig.radius,
          velocity: {
            x: 1.0 * ballConfig.initialSpeed,
            y: -1.0 * ballConfig.initialSpeed
          }
        },
        round: 1,
        status: 'not-started'
      },
      player1: {
        pong: {
          paddle: {
            position: {x: 20, y: 255},
            width: paddle.width,
            height: paddle.height
          },
          score: 0,
          status: 'not-ready'
        },
      },
      player2: {
        pong: {
          paddle: {
            position: {x: 470, y: 255},
            width: paddle.width,
            height: paddle.height
          },
          score: 0,
          status: 'not-ready'
        }
      }
    };
  }
};