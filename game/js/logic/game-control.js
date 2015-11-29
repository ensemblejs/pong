'use strict';

var contains = require('lodash').contains;

function toggleReady (state, ack, players) {
  return {
    player: {
      1: {
        pong: { status: contains(players, 1) ? 'ready' : 'not-ready' }
      },
      2: {
        pong: { status: contains(players, 2) ? 'ready' : 'not-ready' }
      }
    }
  };
}

function start () {
  console.log('start');
  return {
    pong: {
      status: 'in-game'
    }
  };
}

module.exports = {
  type: 'Pong-GameControl',
  deps: ['DelayedJobs'],
  func: function (delayedJobs) {

    function beginCountdown () {
      delayedJobs().add('key', 3, 'Pong-GameControl', 'start');

      return {
        pong: {
          status: 'countdown'
        }
      };
    }

    return {
      toggleReady: toggleReady,
      beginCountdown: beginCountdown,
      start: start
    };
  }
};