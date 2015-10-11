'use strict';

var circle = require('distributedlife-sat').shapes.circle;
var rectangle = require('distributedlife-sat').shapes.tlRectangle;

module.exports = {
  type: 'StateSeed',
  deps: ['Config'],
  func: function Pong (config) {
    var ballConfig = config().pong.ball;
    var paddle = config().pong.paddle;

    var ball = circle(ballConfig.position, ballConfig.radius);
    ball.velocity = {
      x: 1.0 * ballConfig.initialSpeed,
      y: -1.0 * ballConfig.initialSpeed
    };

    return {
      pong: {
        ball: ball,
        round: 1
      },
      player: {
        1: {
          paddle: rectangle({x: 20, y: 225}, paddle.width, paddle.height),
          score: 0
        },
        2: {
          paddle: rectangle({x: 470, y: 225}, paddle.width, paddle.height),
          score: 0
        }
      }
    };
  }
};