'use strict';

var stage, seconds, minutes, hours, days, months;
var TWO_PI = 2 * Math.PI;

// debug help
var DEBUG = false;
var DebugDate = function() {
  var inputs = {};
  [ 'seconds', 'minutes', 'hours', 'days', 'months' ].forEach(function(key) {
    inputs[key] = document.getElementById(key);
    inputs[key].style.display = DEBUG ? 'block' : 'none';
  });

  return {
    getMilliseconds: function() {
      return parseFloat(inputs['seconds'].value)  - this.getSeconds();
    },
    getSeconds: function() {
      return Math.floor(parseFloat(inputs['seconds'].value));
    },
    getMinutes: function() { return parseInt(inputs['minutes'].value); },
    getHours: function() { return parseInt(inputs['hours'].value); },
    getDate: function() { return parseInt(inputs['days'].value); },
    getMonth: function() { return parseInt(inputs['months'].value); },
  };
};
var DateFactory = DEBUG ? DebugDate : Date;
// end debug help


var init = function() {
  createjs.Ticker.setFPS(30);

  seconds = new createjs.Shape();
  minutes = new createjs.Shape();
  hours = new createjs.Shape();
  days = new createjs.Shape();
  months = new createjs.Shape();

  stage = new createjs.Stage('canvas');
  var container = new createjs.Container();
  container.x = stage.canvas.width / 2;
  container.y = stage.canvas.height / 2;
  container.rotation = -90;
  container.addChild(seconds, minutes, hours, days, months);
  stage.addChild(container);
};


var splitTime = function(now) {
  var time = {
    seconds: {},
    minutes: {},
    hours: {},
    days: {},
    months: {}
  };

  time.seconds.value = now.getSeconds();
  time.seconds.ts = time.seconds.value + now.getMilliseconds() / 1000;
  time.seconds.angle = time.seconds.ts * TWO_PI / 60;
  time.minutes.value = now.getMinutes();
  time.minutes.ts = time.minutes.value + time.seconds.ts / 60;
  time.minutes.angle = time.minutes.ts * TWO_PI / 60;
  time.hours.value = now.getHours();
  time.hours.ts = time.hours.value + time.minutes.ts / 24;
  time.hours.angle = time.hours.ts * TWO_PI / 24;
  // TODO 28, 29, 30 or 31 based on Month/(leap) Year
  time.days.value = now.getDate();
  time.days.ts = time.days.value + time.hours.ts / 30;
  time.days.angle = time.days.ts * TWO_PI / 30;
  time.months.value = now.getMonth();
  time.months.ts = time.months.value + time.days.ts / 12;
  time.months.angle = time.months.ts * TWO_PI / 12;

  return time;
};


var drawCircle = function(shape, color, time, seconds, radius) {
  var start = 0;

  if (time.value === 0 && seconds.ts <= 0.5) {
    start = seconds.ts * TWO_PI / 0.5;
  }

  shape.graphics.clear()
                .setStrokeStyle(8, 'round')
                .beginStroke(color)
                .arc(0, 0, radius, start, time.angle, false);
};


var update = function() {
  var now = new DateFactory();
  var time = splitTime(now);

  drawCircle(seconds, '#00BCD4', time.seconds, time.seconds, 50);
  drawCircle(minutes, '#CDDC39', time.minutes, time.seconds, 60);
  drawCircle(hours, '#FFEB3B', time.hours, time.seconds, 70);
  drawCircle(days, '#FF9800', time.days, time.seconds, 80);
  drawCircle(months, '#FF5722', time.months, time.seconds, 90);

  stage.update();
};


init();
createjs.Ticker.addEventListener('tick', update);
