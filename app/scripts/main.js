var stage, seconds, minutes, hours, days, months;

var start;

var START = -Math.PI / 2;
var TWO_PI = 2 * Math.PI;
var SECONDS = 0;
var MINUTES = 1;
var HOURS = 2;
var DAYS = 3;
var MONTHS = 4;

var init = function() {
  createjs.Ticker.setFPS(30);

  seconds = new createjs.Shape();
  minutes = new createjs.Shape();
  hours = new createjs.Shape();
  days = new createjs.Shape();
  months = new createjs.Shape();

  stage = new createjs.Stage('canvas');
  stage.addChild(seconds, minutes, hours, days, months);
}

var splitTime = function() {
  var time = [];
  var now = new Date();

  var seconds = (now.getSeconds() + now.getMilliseconds() / 1000);
  time.push(seconds * TWO_PI / 60 + START);
  var minutes = now.getMinutes() + seconds / 60;
  time.push(minutes * TWO_PI / 60 + START);
  var hours = now.getHours() + minutes / 24;
  time.push(hours * TWO_PI / 24 + START);
  // TODO 28, 29, 30 or 31 based on Month/(leap) Year
  var days = now.getDate() + hours / 30;
  time.push(days * TWO_PI / 30 + START);
  var months = now.getMonth() + days / 12;
  time.push(months * TWO_PI / 12 + START);

  return time;
};

var drawCircle = function(shape, color, angle, radius) {
  start = START;

  if (START < angle && angle <= TWO_PI / 60 * 0.5 + START) {
    start = ((angle - START) * 60 / TWO_PI) * TWO_PI / 0.5 + START;
  }

  shape.graphics.clear()
                .setStrokeStyle(8, 'round')
                .beginStroke(color)
                .arc(100, 100, radius, start, angle, false);
};

var update = function(e) {
  var time = splitTime();

  drawCircle(seconds, '#00BCD4', time[SECONDS], 50);
  drawCircle(minutes, '#CDDC39', time[MINUTES], 60);
  drawCircle(hours, '#FFEB3B', time[HOURS], 70);
  drawCircle(days, '#FF9800', time[DAYS], 80);
  drawCircle(months, '#FF5722', time[MONTHS], 90);

  stage.update();
};


init();
createjs.Ticker.addEventListener('tick', update);
