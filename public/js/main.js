var PIANO_KEYS = 88;
var notes = []; // queue that keeps track of the notes that have been recorded
var currentNote = []; // holds the current note or chord. each element is an array of tuples. each tuple has the form (toneId, time).

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
      notes = [];
      currentNote = [];
    } else if (buttonId == "view") { // view sheet music
      // add last note
      if (currentNote.length > 0) {
        notes.push(currentNote);
        currentNote = [];
      }
      // redirect to sheet music page
      url = "sheet_music/";
      for (i = 0; i < notes.length; i++) {
        url += "|";
        for (j = 0; j < notes[i].length; j++) {
          if (j != 0) {
            url += "_";
          }
          url += notes[i][j][0];
        }
        url += "|";
      }
      window.location.href = url;
    } else if (buttonId == "toggleKeyNames") {
      $("#piano div.keyname").toggle();
      $(this).toggleClass("pressed");
    } else if (buttonId == "toggleOctaves") {
      $("#piano div.oN").toggle();
      $(this).toggleClass("pressed");
    }
  });

  // configure key presses
  $(".key").mousedown(function() {
    toneId = $(this).attr("id");
    pressNote(toneId);
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
        pressNote(evt.data.sound);
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
  audiochannels[a]['start'] = -1;
}

// play audio
function play_multi_sound(s) {
  thistime = new Date();
  currentTime = thistime.getTime();
  for (a = 0; a < audiochannels.length; a++) {
    if (audiochannels[a]['finished'] < currentTime) { // is this channel finished?
      try {
        audiochannels[a]['start'] = currentTime;
        audiochannels[a]['finished'] = currentTime + document.getElementById(s).duration*1000;
        audiochannels[a]['channel'] = document.getElementById(s);
        audiochannels[a]['channel'].currentTime = 0;
        audiochannels[a]['channel'].volume = 1;
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

var pressNote = function(toneId) {
  regex = /tone-(.+)/;
  match = regex.exec(toneId);
  // record if the record button is down
  if ($("#record").hasClass("pressed")) {
    // toneId is the octave number plus the note, so middle C (fourth octave) is "3C"
    // octave numbers are zero-indexed
    if (match) {
      saveNote(match[1]);
    } else {
      saveNote(toneId);
    }
  }
  // play audio
  if (!match) {
    toneId = "tone-" + toneId;
  }
  play_multi_sound(toneId);
};

function saveNote(s) {
  currentTime = new Date().getTime();
  // check if the note falls into a 50 millisecond window. if it does, it's part of a chord
  if (currentNote[0]) {
    if (currentTime > currentNote[0][1] + 50) { // not part of previous note/chord
      notes.push(currentNote);
      currentNote = [];
    }
  }
  currentNote.push([s, currentTime]);
}