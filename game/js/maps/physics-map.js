'use strict';

module.exports = {
  type: 'PhysicsMap',
  deps: ['Config'],
  func: function (config) {
    return {
      'ball': ['pong.ball'],
      'paddles': ['player1.pong.paddle', 'player2.pong.paddle'],
      'walls': [
        {
          position: { x: -100, y: -100},
          width: config().pong.board.width + 200,
          height: 100
        },
        {
          position: {x: -100, y: config().pong.board.height},
          width: config().pong.board.width + 200,
          height: 100
        },
      ],
      'left-end-zone': [{
        position: {x: -100, y: -100},
        width: 100,
        height: config().pong.board.height + 200
      }],
      'right-end-zone': [{
        position: {x: config().pong.board.width, y: -100},
        width: 100,
        height: config().pong.board.height + 200
      }]
    };
  }
};