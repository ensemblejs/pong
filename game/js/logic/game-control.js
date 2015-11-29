'use strict';

var contains = require('lodash').contains;
var each = require('lodash').each;

function toggleReady (state, ack, players) {
  var player = {};

  each(players, function (playerNumber) {
    player[playerNumber] = {
      pong: {
        status: contains(players, playerNumber) ? 'ready' : 'not-ready'
      }
    };
  });

  return ['player', player];
}

function start () {
  return ['pong.status', 'in-game'];
}

module.exports = {
  type: 'Pong-GameControl',
  deps: ['DelayedJobs'],
  func: function (delayedJobs) {

    function beginCountdown () {
      delayedJobs().add('key', 3, 'Pong-GameControl', 'start');
      return ['pong.status', 'countdown'];
    }

    return {
      toggleReady: toggleReady,
      beginCountdown: beginCountdown,
      start: start
    };
  }
};