'use strict';

var PIXI = require('pixi.js');
var each = require('lodash').each;

module.exports = {
  type: 'OnClientReady',
  deps: ['StateTracker', 'Config', 'DefinePlugin', '$'],
  func: function Pong (tracker, config, define, $) {

    function updatePaddle (current, prior, paddleShape) {
      paddleShape.position.x = current.x;
      paddleShape.position.y = current.y;
    }

    function updateHud (current, prior, id) {
      $()('#' + id).text(current);
    }

    function updateBall (current, prior, ballShape) {
      ballShape.position.x = current.x;
      ballShape.position.y = current.y;
    }

    //Game
    function createBoard () {
      var board = new PIXI.Graphics();
      board.beginFill(config().pong.board.colour);
      board.drawRect(0, 0, config().pong.board.width, config().pong.board.height);

      return board;
    }

    function createBall () {
      var ball = new PIXI.Graphics();
      ball.beginFill(config().pong.ball.colour);
      ball.drawCircle(0, 0, config().pong.ball.radius);

      return ball;
    }

    function createPaddle () {
      var paddle = new PIXI.Graphics();
      paddle.beginFill(config().pong.paddle.colour);
      paddle.drawRect(0, 0, config().pong.paddle.width, config().pong.paddle.height);


      return paddle;
    }

    //PIXIJS
    function boardIsSmallerThenScreen(boardDimensions, screenDimensions) {
      return (boardDimensions.width < screenDimensions.usableWidth ||
          boardDimensions.height < screenDimensions.usableHeight);
    }

    function calculateOffset (boardDimensions, screenDimensions) {
      if (boardIsSmallerThenScreen(boardDimensions, screenDimensions)) {
        return {
          x: (screenDimensions.usableWidth - boardDimensions.width) / 2,
          y: (screenDimensions.usableHeight - boardDimensions.height) / 2
        };
      } else {
        return { x: 0, y: 0 };
      }
    }

    var stage;
    var renderer;
    function setupPixiJs (dims) {
      stage = new PIXI.Container();
      renderer = PIXI.autoDetectRenderer(dims.usableWidth, dims.usableHeight);
      $()('#' + config().client.element).append(renderer.view);

      //Position pixi renderer in centre of screen
      var offset = calculateOffset(config().pong.board, dims);
      stage.position.x = offset.x;
      stage.position.y = offset.y;
    }

    define()('OnRenderFrame', function OnRenderFrame () {
      return function renderScene () {
        if (!renderer) {
          return;
        }

        renderer.render(stage);
      };
    });

    function removeWaiting () {
      $()('#waiting-for-players').remove();
    }

    function notStarted () {
      $()('#game-not-started').show();
      $()('#countdown').hide();
      $()('#playing').hide();
      $()('#game-over').hide();
    }

    function countdown () {
      $()('#game-not-started').hide();
      $()('#countdown').show();
      $()('#playing').hide();
      $()('#game-over').hide();
    }

    function inGame () {
      $()('#game-not-started').hide();
      $()('#countdown').hide();
      $()('#playing').show();
      $()('#game-over').hide();
    }

    function gameOver () {
      $()('#game-not-started').hide();
      $()('#countdown').hide();
      $()('#playing').hide();
      $()('#game-over').show();
    }

    function playerReady (id) {
      $()('.player-' + id + '-status .ready').text('Ready');
    }

    function playerNotReady (id) {
      $()('.player-' + id + '-status .ready').text('Not Ready');
    }

    function p1NotReady () { playerNotReady(1); }
    function p2NotReady () { playerNotReady(2); }
    function p1Ready () { playerReady(1); }
    function p2Ready () { playerReady(2); }

    // GAME
    var hud = require('../../assets/views/overlays/hud.jade');
    $()('#overlay').append(hud());

    define()('OnPlayerGroupChange', function OnPlayerGroupChange () {
      function online (player) {
        $()('.player-' + player.id + '-status .connection').hide();
        $()('.player-' + player.id + '-status .ready').show();
      }

      function offline (player) {
        $()('.player-' + player.id + '-status .connection').show();
        $()('.player-' + player.id + '-status .ready').hide();
      }

      var updateDisplay = {
        online: online,
        offline: offline,
        'not-joined': offline
      };

      return function handle (players) {
        each(players, function (player) {
          updateDisplay[player.status](player);
        });
      };
    });

    return function setup (dims) {
      setupPixiJs(dims);

      var ball = createBall();
      var paddle1 = createPaddle();
      var paddle2 = createPaddle();

      stage.addChild(createBoard());
      stage.addChild(ball);
      stage.addChild(paddle1);
      stage.addChild(paddle2);

      var viewMap = {
        'player.1.pong.paddle.position':[
          { onChange: updatePaddle, data: paddle1 }
        ],
        'player.2.pong.paddle.position': [
          { onChange: updatePaddle, data: paddle2 }
        ],
        'pong.ball.position': [
          { onChange: updateBall, data: ball }
        ],
        'player.1.pong.score': [
          { onChange: updateHud, data: 'player-1-score' }
        ],
        'player.2.pong.score': [
          { onChange: updateHud, data: 'player-2-score' }
        ],
        'pong.round': [
          { onChange: updateHud, data: 'pong-round' }
        ],
        'pong.status': [
          { equals: 'not-started', call: notStarted},
          { equals: 'countdown', call:countdown},
          { equals: 'in-game', call: inGame},
          { equals: 'game-over', call: gameOver}
        ],
        'player.1.pong.status': [
          { equals: 'not-ready', call: p1NotReady },
          { equals: 'ready', call: p1Ready }
        ],
        'player.2.pong.status': [
          { equals: 'not-ready', call: p2NotReady },
          { equals: 'ready', call: p2Ready }],
        'ensemble.waitingForPlayers': [ {equals: false, call: removeWaiting }]
      };

      tracker().onChangeOf('player.1.pong.paddle.position', updatePaddle, paddle1);
      tracker().onChangeOf('player.1.pong.score', updateHud, 'player-1-score');

      tracker().onChangeOf('player.2.pong.paddle.position', updatePaddle, paddle2);
      tracker().onChangeOf('player.2.pong.score', updateHud, 'player-2-score');

      tracker().onChangeOf('pong.ball.position', updateBall, ball);
      tracker().onChangeOf('pong.round', updateHud, 'pong-round');

      tracker().onChangeTo('pong.status', 'not-started', notStarted);
      tracker().onChangeTo('pong.status', 'countdown', countdown);
      tracker().onChangeTo('pong.status', 'in-game', inGame);
      tracker().onChangeTo('pong.status', 'game-over', gameOver);

      tracker().onChangeTo('player.1.pong.status', 'not-ready', p1NotReady);
      tracker().onChangeTo('player.1.pong.status', 'ready', p1Ready);

      tracker().onChangeTo('player.2.pong.status', 'not-ready', p2NotReady);
      tracker().onChangeTo('player.2.pong.status', 'ready', p2Ready);

      tracker().onChangeTo('ensemble.waitingForPlayers', false, removeWaiting);
    };
  }
};