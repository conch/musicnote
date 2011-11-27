var PIANO_KEYS = 88;
var trebleNotes = []; // queue that keeps track of the notes that have been recorded in the treble staff
var bassNotes = []; // queue that keeps track of the notes in the bass staff

$(document).ready(function() {
  // create the menu bar
  $("#menu").css("top", $("#piano").height() + 100 + "px");
  $("#menu div").click(function() {
    buttonId = $(this).attr("id");
    if (buttonId == "record") { // start/resume or stop recording
      $(this).toggleClass("pressed");
      $("#recordOrPause").toggleClass("record");
      $("#recordOrPause").toggleClass("pause");
    } else if (buttonId == "reset") { // erase what's been recorded so far
      $("#record").removeClass("pressed");
      $("#recordOrPause").addClass("record");
      $("#recordOrPause").removeClass("pause");
      trebleNotes = [];
      bassNotes = [];
    } else if (buttonId == "view") { // view sheet music
      window.location.href = "sheet_music";
    } else if (buttonId == "toggleKeyNames") {
      $("#piano div.keyname").toggle();
      $(this).toggleClass("pressed");
    } else if (buttonId == "toggleOctaves") {
      $("#piano div.oN").toggle();
      $(this).toggleClass("pressed");
    }
  });

  // configure key presses
  $(".key").mousedown(function () {
    toneId = $(this).attr('id');
    play_multi_sound("tone-" + toneId);
    // record if the record button is down
    if ($("#record").hasClass("pressed")) {
      // toneId is the octave number plus the note, so middle C (fourth octave) is "3C"
      // octave numbers are zero-indexed
      regex = /(\d+)\D+/;
      match = regex.exec(toneId);
      // match[1] is the number of the octave
      if (match[1] < 3) { // notes in the bass staff
        trebleNotes.push(toneId);
      } else { // treble
        bassNotes.push(toneId);
      }
    }
  });

  //Toggles and other stuffs
  $("#Strings").click(function () {
    $("#pianoStrings").toggle();
    $(this).toggleClass('on');
   });
})

//ARRAY WITH ALL THE KEYS
//the array content starts from element 1 so eleemnt 0 i zero, empty, nada, 0 gree
var keyboardKeys = new Array (PIANO_KEYS); 
var k;

for (k=0;k < PIANO_KEYS; k++) {
  keyboardKeys[k] = eval("pKey" + k);
}

//LOOP trought all the  keyboard-piano keys
for (i = 0; i < keyboardKeys.length; i++) {
    //BIND ON KEY DOWN
    $(document).bind('keydown', keyboardKeys[i], function (evt){
      //check the flag: false - key is down, true - key is up
      if(evt.data.flag) {
        evt.data.flag = false;
        $(evt.data.value).addClass('pressed');
        play_multi_sound(evt.data.sound);
      }
      return false;
    });

    //BIND ON KEY UP
    $(document).bind('keyup', keyboardKeys[i], function (evt){
      //check the flag false - key is down, true - key is up
      evt.data.flag = true;
      $(evt.data.value).removeClass('pressed');
      // stop_multi_sound(evt.data.sound); //don't so cool as shoud
      return false;
    });
}

var channel_max = 32; // number of channels
audiochannels = new Array();

for (a = 0; a < channel_max; a++) { // prepare the channels
  audiochannels[a] = new Array();
  audiochannels[a]['channel'] = new Audio(); // create a new audio object
  audiochannels[a]['finished'] = -1; // expected end time for this channel
  audiochannels[a]['keyvalue'] = '';
}

//PLAY SOUND
function play_multi_sound(s) {
  for (a = 0; a < audiochannels.length; a++) {
    thistime = new Date();
    if (audiochannels[a]['finished'] < thistime.getTime()) { // is this channel finished?
      try {
        audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
        audiochannels[a]['channel'] = document.getElementById(s);
        audiochannels[a]['channel'].currentTime = 0;
        audiochannels[a]['channel'].volume=1;
        audiochannels[a]['channel'].play();
        audiochannels[a]['keyvalue'] = s;
      }
      catch(v) {
        console.log(v);
      }
      break;
    }
  }
}

function stop_multi_sound(s, sender) {
  for (a = 0; a < audiochannels.length; a++) {
    if (audiochannels[a]['keyvalue'] == s) { // is this channel finished?
      try {
        audiochannels[a]['channel'] = document.getElementById(s);

        // audiochannels[a]['channel'].currentTime =  audiochannels[a]['channel'].duration;
        // audiochannels[a]['keyvalue'] = 'nema';

        if(sender != undefined && sender == 'mouse') {
          setTimeout ("audiochannels[a]['channel'].pause()", 2500 );
          setTimeout ("audiochannels[a]['channel'].currentTime = 0", 2500 );
        } else {
          //audiochannels[a]['channel'].volume=0;
          setTimeout ("audiochannels[a]['channel'].pause()", 2500 );
          setTimeout ("audiochannels[a]['channel'].currentTime = 0", 2500 );
        }
      } catch(v) {
        console.log(v.message);
      }
      break;
    }
  }
}