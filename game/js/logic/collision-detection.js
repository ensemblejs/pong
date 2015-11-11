'use strict';

var test = require('distributedlife-sat').collision.test;

module.exports = {
  type: 'OnClientReady',
  deps: ['Config', 'DefinePlugin'],
  func: function CollisionDetection (config, define) {

    function unwrapBall(ball) {
      return {
        position: {
          x: ball('position')('x'),
          y: ball('position')('y')
        },
        velocity: {
          x: ball('velocity')('x'),
          y: ball('velocity')('y')
        },
        radius: ball('radius')
      };
    }

    function unwrapPaddle (paddle) {
      return {
        position: {
          x: paddle('position')('x'),
          y: paddle('position')('y')
        },
        angle: paddle('angle'),
        offset: {
          x: paddle('offset')('x'),
          y: paddle('offset')('y'),
        },
        calcPoints: paddle('calcPoints'),
        edges: paddle('edges'),
        normals: paddle('normals'),
        points: paddle('points')
      };
    }

    define()('OnPhysicsFrame', function () {
      return function bounceBall (state, delta) {
        var radius = config().pong.ball.radius;
        var board = config().pong.board;

        var ball = unwrapBall(state.get('pong.ball'));
        ball.position.x += (ball.velocity.x * delta);
        ball.position.y += (ball.velocity.y * delta);

        var p1 = state.player(1);
        var p2 = state.player(2);

        var players = {
          1: { score: p1.get('pong.score') },
          2: { score: p2.get('pong.score') }
        };

        function playerWins (p) {
          ball.velocity.x *= -1;
          ball.position = config().pong.ball.position;
          players[p].score += 1;
        }

        //bounce of walls
        if (ball.position.x + radius >= board.width) {
          playerWins(1);
        }
        if (ball.position.x - radius <= 0) {
          playerWins(2);
        }

        if ((ball.position.y + radius >= board.height) || (ball.position.y - radius <= 0)) {
          ball.velocity.y *= -1;
        }

        function bounceOfPaddle () {
          ball.velocity.x *= -1;
        }

        //bounce off paddles
        var paddle1 = unwrapPaddle(p1.get('pong.paddle'));
        var paddle2 = unwrapPaddle(p2.get('pong.paddle'));

        test(paddle1, ball, bounceOfPaddle);
        test(paddle2, ball, bounceOfPaddle);

        return {
          pong: {
            ball: ball
          },
          player: players
        };
      };
    });

    return function setup () {};
  }
};