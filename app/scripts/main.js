var stage, seconds, minutes, hours, days, months;

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

  console.log(seconds, minutes, hours, days, months);

  return time;
};

var update = function(e) {
  var time = splitTime();

  seconds.graphics.clear()
                  .setStrokeStyle(8, 'round')
                  .beginStroke('red')
                  .arc(100, 100, 50, START, time[SECONDS], false);
  minutes.graphics.clear()
                  .setStrokeStyle(8, 'round')
                  .beginStroke('green')
                  .arc(100, 100, 60, START, time[MINUTES], false);
  hours.graphics.clear()
                .setStrokeStyle(8, 'round')
                .beginStroke('blue')
                .arc(100, 100, 70, START, time[HOURS], false);
  days.graphics.clear()
               .setStrokeStyle(8, 'round')
               .beginStroke('yellow')
               .arc(100, 100, 80, START, time[DAYS], false);
  months.graphics.clear()
                 .setStrokeStyle(8, 'round')
                 .beginStroke('purple')
                 .arc(100, 100, 90, START, time[MONTHS], false);

  stage.update();
};


init();
createjs.Ticker.addEventListener('tick', update);
