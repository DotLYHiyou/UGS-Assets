var touchable = false; //'createTouch' in document;
var hintEle = document.getElementById("hint");
var touchx;
var touchy;
var lastx;
var lasty;
var canvas = document.getElementById("gamescreen");

canvas.addEventListener('touchstart', onTouchStart, false);
canvas.addEventListener('touchmove', onTouchMove, false);
canvas.addEventListener('touchend', onTouchEnd, false);
hintEle.addEventListener('touchstart', onTouchStart, false);
hintEle.addEventListener('touchmove', onTouchMove, false);
hintEle.addEventListener('touchend', onTouchEnd, false);
document.getElementById("menu").addEventListener("touchstart", function() {
  touchable = true;
  hint = hint.map(function(hint) {
    hint = hint.replace(resetInstruction, "tap Restart");
    hint = hint.replace(sleepInstruction, "tap Sleep");
    hint = hint.replace(menuInstruction, "tapping Menu");
    hint = hint.replace(moveInstruction, "Swipe in a direction");
    return hint;
  });
  hint[0] = "Swipe in a direction to move. Go to the white cube. To read this message again, just go back to the start position.";
  hint[1] = "There is going to be some really important information in these messages. Please read them.";
  hint[2] = "The black box is a time machine. It will take you back in time to when you first started this level.";
}, false);
$('#restart').click(function() {
  if (!menu) {
    loadLevel(true);
  }
});
$('#sleep').click(function() {
  if (!menu) {
    sleep();
  }
});
$('#menu-button').click(function() {
  if (!menu) {
    mainMenu(true);
  }
});
$('#drop').click(function() {
  if (!menu) {
    dropTimeMachine();
  }
});

function onTouchStart(e) {
  touchable = true;
  //do stuff
  var x;
  var y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    if (e.touches && e.touches[0]) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    }
  }
  touchx = x;
  touchy = y;
  lastx = x;
  lasty = y;
  //e.preventDefault();

}

function onTouchMove(e) {
  // Prevent the browser from doing its default thing (scroll, zoom)
  var x;
  var y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    if (e.touches && e.touches[0]) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    }
  }
  lastx = x;
  lasty = y;
  key[left] = false;
  key[right] = false;
  key[up] = false;
  key[down] = false;
  keyLocked[left] = false;
  keyLocked[right] = false;
  keyLocked[up] = false;
  keyLocked[down] = false;
  if (Math.abs(touchx - x) > Math.abs(touchy - y)) {
    if (touchx > x) {
      key[left] = true;
    } else {
      key[right] = true;
    }
  } else {
    if (touchy > y) {
      key[up] = true;
    } else {
      key[down] = true;
    }
  }
  e.preventDefault();
}

function onTouchEnd(e) {
  //do stuff
  key[left] = false;
  key[right] = false;
  key[up] = false;
  key[down] = false;

  //e.preventDefault();

}
k({
  static: true,
  update: function() {
    easeTouches();
    if (player.hasTm) {
      $('#drop').show();
    } else {
      $('#drop').hide();
    }
  }
});

function easeTouches() {
  if (touchable) {
    touchx = (touchx * 5 + lastx) / 6;
    touchy = (touchy * 5 + lasty) / 6;
  }
}