'use strict';

var PIXI = require('pixi.js');

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

    // GAME
    var hud = require('../../views/overlays/hud.jade');
    $()('#overlay').append(hud());

    return function setup (dims) {
      setupPixiJs(dims);

      var ball = createBall();
      var paddle1 = createPaddle();
      var paddle2 = createPaddle();

      stage.addChild(createBoard());
      stage.addChild(ball);
      stage.addChild(paddle1);
      stage.addChild(paddle2);

      tracker().onChangeOf('player.1.pong.paddle.position', updatePaddle, paddle1);
      tracker().onChangeOf('player.1.pong.score', updateHud, 'player-1-score');

      tracker().onChangeOf('player.2.pong.paddle.position', updatePaddle, paddle2);
      tracker().onChangeOf('player.2.pong.score', updateHud, 'player-2-score');

      tracker().onChangeOf('pong.ball.position', updateBall, ball);
      tracker().onChangeOf('pong.round', updateHud, 'pong-round');

      tracker().onChangeTo('ensemble.waitingForPlayers', false, removeWaiting);
    };
  }
};