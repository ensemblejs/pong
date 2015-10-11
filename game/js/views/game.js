'use strict';

var PIXI = require('pixi.js');

module.exports = {
  type: 'OnClientReady',
  deps: ['StateTracker', 'Config', 'DefinePlugin', '$'],
  func: function Pong (tracker, config, define, $) {

    function p1Paddle (state) { return state.player['1'].paddle.position; }
    function p2Paddle (state) { return state.player['2'].paddle.position; }
    function p1Score (state) { return state.player['1'].score; }
    function p2Score (state) { return state.player['2'].score; }
    function round (state) { return state.pong.round; }
    function ballPosition (state) { return state.pong.ball.position; }

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

    // function boardIsBiggerThenScreen(boardDimensions, screenDimensions) {
    //   return (boardDimensions.width > screenDimensions.usableWidth ||
    //       boardDimensions.height > screenDimensions.usableHeight);
    // }

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

    // function calculateScale (boardDimensions, screenDimensions) {
    //   if (boardIsBiggerThenScreen(boardDimensions, screenDimensions)) {
    //     return {
    //       x: screenDimensions.usableWidth / boardDimensions.width,
    //       y: screenDimensions.usableHeight / boardDimensions.height
    //     };
    //   } else {
    //     return { x: 1, y: 1 };
    //   }
    // }

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

    // define()('OnResize', function () {
    //   return function resizeScene (dims) {
    //     if (!stage) {
    //       return;
    //     }

    //     var scale = calculateScale(config().pong.board, dims);
    //     stage.scale.x = scale.x;
    //     stage.scale.y = scale.y;

    //     var offset = calculateOffset(config().pong.board, dims);
    //     stage.position.x = offset.x;
    //     stage.position.y = offset.y;
    //   };
    // });

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

      tracker().onChangeOf(p1Paddle, updatePaddle, paddle1);
      tracker().onChangeOf(p1Score, updateHud, 'player-1-score');

      tracker().onChangeOf(p2Paddle, updatePaddle, paddle2);
      tracker().onChangeOf(p2Score, updateHud, 'player-2-score');

      tracker().onChangeOf(ballPosition, updateBall, ball);
      tracker().onChangeOf(round, updateHud, 'pong-round');

      // function createWall (x, y, w, h) {
      //   var wall = new PIXI.Graphics();
      //   wall.beginFill(0xffffff);
      //   wall.drawRect(x, y, w, h);
      //   wall.position.x = x;
      //   wall.position.y = y;

      //   return wall;
      // }

      // //collision debug view
      // var width = config().pong.board.width;
      // var height = config().pong.board.height;
      // stage.addChild(createWall(0, -50, width, 50));
    };
  }
};