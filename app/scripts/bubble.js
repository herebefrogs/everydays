'use strict';

var stage;
var container;

var COLORS = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 0, g: 255, b: 255 },
  { r: 255, g: 0, b: 255 }
];
var MIN_SIZE = 20;
var MAX_SIZE = 200;
var MIN_FOCUS = 0.5;
var MAX_FOCUS = 1;
var MIN_CIRCLES = 2;
var MAX_CIRCLES = 10;
var MIN_X = 0.2;
var MAX_X = 0.8;
var MIN_DURATION = 15; // in seconds
var MAX_DURATION = 45;

// max excluded
var random = function(min, max) {
  return Math.random() * (max - min) + min;
};

// max included
var randomInt = function(min, max) {
  return Math.floor(random(min, max + 1));
}

var pickColor = function() {
  return COLORS[randomInt(1, COLORS.length) - 1];
};

var pickSize = function() {
  return randomInt(MIN_SIZE, MAX_SIZE);
};

var pickFocus = function() {
  return random(MIN_FOCUS, MAX_FOCUS);
};

var pickX = function() {
  return randomInt(stage.canvas.width * MIN_X, stage.canvas.width * MAX_X);
};

var pickY = function(size, is_down) {
  return is_down ? stage.canvas.height + size : -size
};

var pickPosition = function(size) {
  var is_down = randomInt(0, 1) === 0;

  return {
    x: pickX(),
    y: pickY(size, is_down)
  };
};

var rgbaColor = function(color, alpha) {
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
};


var createCircle = function(color, size, focus, position) {
  var shape = new createjs.Shape();

  var plainColor = rgbaColor(color, 1);
  var transparentColor = rgbaColor(color, 0);
  shape.graphics.beginRadialGradientFill(
                  [ plainColor, plainColor, transparentColor ],
                  [ 0, focus, 1 ],
                  0, 0, 0,
                  0, 0, size)
                .drawCircle(0, 0, size);

  shape.alpha = focus;
  shape.compositeOperation = 'lighter';
  shape.x = position.x;
  shape.y = position.y;

  var duration = randomInt(MIN_DURATION, MAX_DURATION) * 1000;
  var dest_x = pickX();
  var dest_y = pickY(size, shape.y < 0);

  var clearTweens = function() {
    shape.activeTweens -= 1;

    if (!shape.activeTweens) {
      createjs.Tween.removeTweens(shape);
      container.removeChild(shape);
    }
  };

  createjs.Tween.get(shape).to({ x: dest_x }, duration, createjs.Ease.elasticInOut)
                           .call(clearTweens);
  createjs.Tween.get(shape).to({ y: dest_y }, duration, createjs.Ease.sineInOut)
                           .call(clearTweens);
  shape.activeTweens = 2;

  return shape;
};

var addCircle = function() {
    var color = pickColor();
    var size = pickSize();
    var focus = pickFocus();
    var position = pickPosition(size);
    container.addChild(createCircle(color, size, focus, position));
};

var init = function() {
  createjs.Ticker.setFPS(30);

  stage = new createjs.Stage('canvas');
  container = new createjs.Container();
  stage.addChild(container);

  for (var i = randomInt(MIN_CIRCLES, MAX_CIRCLES); i > 0; i--) {
    addCircle();
  }
};

var update = function() {
  if (container.numChildren < MAX_CIRCLES) {
    // add some backoff probability, the less children the more probable one is added
    addCircle();
  }

  stage.update();
};


init();
createjs.Ticker.addEventListener('tick', update);
