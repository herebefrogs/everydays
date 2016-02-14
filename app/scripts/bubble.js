'use strict';

var stage;
var container;
var elapsed_time = 0;

var COLORS = [
  { r: 118, g: 10, b: 45 },   // red
  { r: 63, g: 157, b: 41 },   // green
  { r: 14, g: 153, b: 217 },  // cyan
  { r: 255, g: 241, b: 118 }, // yellow
  { r: 106, g: 27, b: 154 }   // purple
];
var EASE_X = [
  createjs.Ease.elasticIn,
  createjs.Ease.elasticInOut,
  createjs.Ease.elasticInOut,
  createjs.Ease.elasticOut,
];
var EASE_Y = [
  createjs.Ease.sineIn,
  createjs.Ease.sineInOut,
  createjs.Ease.sineInOut,
  createjs.Ease.sineOut,
];
var MIN_SIZE = 50;
var MAX_SIZE = 125;
var MIN_FOCUS = 0.4;  // somewhat blurry outline
var MAX_FOCUS = 0.95; // crisp outline
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

var pickEaseX = function() {
  return EASE_X[randomInt(1, EASE_X.length) - 1];
};

var pickEaseY = function() {
  return EASE_Y[randomInt(1, EASE_Y.length) - 1];
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

  // render circle
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

  // animate circle
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

  createjs.Tween.get(shape).to({ x: dest_x }, duration, pickEaseX())
                           .call(clearTweens);
  createjs.Tween.get(shape).to({ y: dest_y }, duration, pickEaseY())
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
