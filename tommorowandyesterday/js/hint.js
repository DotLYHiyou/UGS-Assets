var hintBig = true;
var lastBig = (new Date()).getTime();
// $('#hint').click(function(){
//     hintBig = !hintBig;
//     hoverHint = false;
//     updateHint();
// });
// var hoverHint = false;
// $('#hint').mouseenter(function(){
//     if (!hintBig) {
//         hintBig = true;
//         hoverHint = true;
//         updateHint();
//     }
// });
// $('#hint').mouseleave(function(){
//     if (hoverHint) {
//         hintBig = false;
//         hoverHint = false;
//         updateHint();
//     }
// });
function relaxHint() {
  //if ((new Date()).getTime() > lastBig + 1000*3){
  updateHint(false);

  //}
}

function updateHint(x) {
  if (typeof x != "undefined")
    hintBig = x;
  if (hintBig)
    lastBig = (new Date()).getTime();
  if (hintBig)
    $('#hint').fadeIn();
  else
    $('#hint').fadeOut();

}

function resizeHint() {
  // $('#innerhint').css({
  //     top: Math.max(window.innerHeight/2 - $('#innerhint').height()/2,0)
  // });

}

function resizeMenu() {
  // $('#innermenu').css({
  //     top: Math.max(window.innerHeight/2 - $('#innermenu').height()/2,0)
  // });
}

function addMenuItem(text, func, css) {
  var div = document.createElement("div");
  div.innerHTML = text;
  div.onclick = func;
  div.className = "menuitem";
  if (css)
    $(div).css(css)
  $('#innermenu').append(div);
  resizeMenu();
}

function hideMenu() {
  if (touchable) {
    requestFullScreen();
    $('#buttons').show();
  }
  $('#innerhint').fadeIn();
  $('#menu').fadeOut();
}

function clearMenu() {
  $('#innermenu').html("");

  resizeMenu();
}

function mainMenu(needsBack) {
  $('#buttons').hide();
  clearMenu();
  $('#innerhint').fadeOut();
  var retMenu = function() {
    mainMenu(needsBack);
  }
  $('#menu').fadeIn();
  $('#innermenu').html("<div class='menutitle'>Tomorrow & Yesterday</div>");
  addMenuItem((needsBack == true) ? "Select Level" : "Play", function() {

    if (cookieLevel < 0) {
      curlevel = -1;
      loadLevel();
      hideMenu();
    } else {
      clearMenu();
      addMenuItem("Back", retMenu);
      for (var i = cookieLevel + 1; i >= 0; i--) {
        if (level[i]) {
          (function() {
            var levelIndex = i;
            addMenuItem("Level " + (levelIndex + 1) + "<div class='leveldesc'>" + hint[levelIndex] + "</div>", function() {
              curlevel = levelIndex - 1;
              loadLevel();
              hideMenu();
            });
          })();
        }
      }
    }
  });
  addMenuItem("Controls", function() {
    clearMenu();
    addMenuItem("Restart: R", retMenu);
    addMenuItem("Sleep: S", retMenu);
    addMenuItem("Menu: Esc", retMenu);
    if (cookieLevel >= 23)
      addMenuItem("Drop Time Machine: Enter, Space", retMenu);
    addMenuItem("Back", retMenu);
  });
  addMenuItem("Options", function() {
    clearMenu();
    addMenuItem("Music: " + (!localStorage.TAYmusicoff ? "On" : "Off"), function() {
      if (localStorage.TAYmusicoff)
        localStorage.TAYmusicoff = "";
      else
        localStorage.TAYmusicoff = "off";

      $(this).html("Music: " + (!localStorage.TAYmusicoff ? "On" : "Off"));
      if (localStorage.TAYmusicoff) {
        bgmusic.pause();
      } else {
        bgmusic.play();
      }
    });
    addMenuItem("Sound: " + (!localStorage.TAYsoundoff ? "On" : "Off"), function() {
      if (localStorage.TAYsoundoff)
        localStorage.TAYsoundoff = "";
      else
        localStorage.TAYsoundoff = "off";

      $(this).html("Sound: " + (!localStorage.TAYsoundoff ? "On" : "Off"));

    });
    addMenuItem("Back", retMenu);
  });
  addMenuItem("Credits", function() {
    clearMenu();
    addMenuItem("Game by Joel Einbinder", retMenu);
    addMenuItem("Level Design by Dennis Bradford, Joel Einbinder, and Justin Forman", retMenu, {
      fontSize: 20
    });
    addMenuItem(
      "\"On the Ground\"<br>" +
      "Kevin MacLeod (incompetech.com)<br>" +
      "Licensed under Creative Commons: By Attribution 3.0<br>" +
      "http://creativecommons.org/licenses/by/3.0/", retMenu, {
        fontSize: 14
      });
    addMenuItem("Back", retMenu);
  });
  if (needsBack === true) {
    addMenuItem("Return to Game", hideMenu);
  }
  if (cookieLevel >= level.length - 1) {
    addMenuItem("You won! Wow! I'm impressed.", function() {
      window.open("mailto:timetravel@firecaster.com?Subject=I%20Won&Body=If you want to talk to me about time travel send me an email!", '_blank');
    })
  }
}

function requestFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  if (!requestFullScreen)
    return;
  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
}