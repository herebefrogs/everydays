'use strict';

var stage;

var COLORS = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 0, g: 255, b: 255 },
  { r: 255, g: 0, b: 255 }
];
var MAX_SIZE = 200;
var MAX_NUM_CIRCLES = 10;

var randomRange = function(min, max) {
  return Math.random() * (max - min) + min;
};

var pickColor = function() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

var pickSize = function() {
  return MAX_SIZE * randomRange(0.2, 1);
};

var pickFocus = function() {
  return randomRange(0.25, 1);
};

var pickPosition = function() {
  return {
    x: Math.floor(stage.canvas.width * randomRange(0.2, 0.8)),
    y: Math.floor(stage.canvas.height * randomRange(0.2, 0.8))
  };
};

var rgbaColor = function(color, alpha) {
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
};


var createCircle = function(color, size, focus, position) {
  console.log(focus, position);
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
  
  return shape;
};

var init = function() {
  createjs.Ticker.setFPS(30);

  stage = new createjs.Stage('canvas');
  var container = new createjs.Container();
  stage.addChild(container);

  for (var i = Math.ceil(MAX_NUM_CIRCLES * Math.random()); i > 0; i--) {
    container.addChild(createCircle(pickColor(), pickSize(), pickFocus(), pickPosition()));
  }
};

var update = function() {
  // move circles (unless Tweened)?
  // add some more?
  stage.update();
};


init();
createjs.Ticker.addEventListener('tick', update);
