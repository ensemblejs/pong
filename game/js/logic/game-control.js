'use strict';

var contains = require('lodash').contains;
var map = require('lodash').map;

function toggleReady (state, ack, players) {
  // var player = {};

  return map(players, function (playerNumber) {
    var key = ['player', playerNumber, 'pong', 'status'].join('.');
    var value = contains(players, playerNumber) ? 'ready' : 'not-ready';

    console.log(key, value);

    return [key, value];
    // player[playerNumber] = {
    //   pong: {
    //     status: contains(players, playerNumber) ? 'ready' : 'not-ready'
    //   }
    // };
  });

  // return ['player', player];
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