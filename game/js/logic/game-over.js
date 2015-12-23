'use strict';

function p1Wins () {
  console.log('player 1 wins!');
}

function p2Wins() {
  console.log('player 2 wins!');
}

module.exports = {
  type: 'TriggerMap',
  func: function GameOver () {
    return {
      'player.1.pong.score': [ {eq: 9, call: p1Wins} ],
      'player.2.pong.score': [ {eq: 9, call: p2Wins} ]
    };
  }
};