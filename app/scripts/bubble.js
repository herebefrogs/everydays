'use strict';

var stage;
var container;
var elapsed_time = 0;

var COLORS = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 0, g: 255, b: 255 },
  { r: 255, g: 0, b: 255 }
];
var MIN_SIZE = 50;
var MAX_SIZE = 100;
var MIN_FOCUS = 0.5; // somewhat blurry outline
var MAX_FOCUS = 1;   // crisp outline
var MIN_CIRCLES = 10;
var MAX_CIRCLES = 20;
var CIRCLE_CAPACITY_DELTA = MAX_CIRCLES - MIN_CIRCLES;
var MIN_X = 0.2;
var MAX_X = 0.8;
var MIN_DURATION = 15; // in seconds
var MAX_DURATION = 45;
var MIN_TIME_ADDING_CIRCLE_ATTEMPT = 1; // in seconds

// max excluded
var random = function(min, max) {
  return Math.random() * (max - min) + min;
};

// max included
var randomInt = function(min, max) {
  return Math.floor(random(min, max + 1));
};

var pickColor = function() {
  return COLORS[randomInt(1, COLORS.length) - 1];
};

var pickRadius = function() {
  return randomInt(MIN_SIZE, MAX_SIZE);
};

var pickFocus = function() {
  return random(MIN_FOCUS, MAX_FOCUS);
};

var pickX = function() {
  return randomInt(stage.canvas.width * MIN_X, stage.canvas.width * MAX_X);
};

var pickY = function(radius, is_down) {
  return is_down ? stage.canvas.height + radius : -radius;
};

var pickPosition = function(radius) {
  var is_down = randomInt(0, 1) === 0;

  return {
    x: pickX(),
    y: pickY(radius, is_down)
  };
};

var rgbaColor = function(color, alpha) {
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
};


var createCircle = function(color, radius, focus, position) {
  var shape = new createjs.Shape();

  var plainColor = rgbaColor(color, 1);
  var transparentColor = rgbaColor(color, 0);
  shape.graphics.beginRadialGradientFill(
                  [ plainColor, plainColor, transparentColor ],
                  [ 0, focus, 1 ],
                  0, 0, 0,
                  0, 0, radius)
                .drawCircle(0, 0, radius);

  shape.alpha = focus;
  shape.compositeOperation = 'lighter';
  shape.x = position.x;
  shape.y = position.y;

  var duration = randomInt(MIN_DURATION, MAX_DURATION) * 1000;
  var dest_x = pickX();
  var dest_y = pickY(radius, shape.y < 0);

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
    var radius = pickRadius();
    var focus = pickFocus();
    var position = pickPosition(radius);

    var added = false;
    // add most focused circle at top of display list (aka last child)
    // add most unfocused circle at the bottom of the display list (aka first child)
    for (var i = container.numChildren - 1; i >= 0; i--) {
      if (container.getChildAt(i).alpha < focus) {
        container.addChildAt(createCircle(color, radius, focus, position), i + 1);
        added = true;
        break;
      }
    }
    if (!added || !container.numChildren) {
      // add unfocused circle frist or add the first circle
      container.addChildAt(createCircle(color, radius, focus, position), 0);
    }
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

var update = function(event) {
  if (container.numChildren < MAX_CIRCLES) {
    elapsed_time += event.delta / 1000;
    // more circles could be added
    if (elapsed_time > MIN_TIME_ADDING_CIRCLE_ATTEMPT) {
      // it's been more than 1 second since the last attempt to add a circle

      // attempt to add a circle
      // the less circles there is, the more probable one will be added
      var circle_capacity_delta_left = MAX_CIRCLES - container.numChildren;
      var roll = random(0, CIRCLE_CAPACITY_DELTA);
      if (circle_capacity_delta_left > roll) {
        addCircle();
      }

      elapsed_time = 0;
    }
  } else {
    elapsed_time = 0;
  }

  stage.update();
};


init();
createjs.Ticker.addEventListener('tick', update);
