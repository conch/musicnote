# musicnote

musicnote is a full-sized 88-key piano that you can play online. It generates sheet music from what you play. You have the option to upload it to your <a href="http://www.evernote.com">Evernote</a> account. For those moments when you're playing around with melodies and need to remember that awesome jam that you just came up with.

The sheet music generation part is very primitive. It can handle single notes, chords, accidentals, and both treble and bass clefs, but nothing beyond that (e.g. timing, measures).

## Installation

You'll need to have RubyGems installed, and some gems (json, rack, sinatra).

To use the Evernote portion, you need to register to use <a href="http://www.evernote.com/about/developer/api/">their API</a>. You'll receive a Consumer Key and a Consumer Secret, which you must put into the auth_secrets.rb file. Also, this currently connects to the <a href="https://sandbox.evernote.com/">Evernote Sandbox</a>, so you'll need to create a user account there too.

To start the app on port 80:
    cd musicnote
    sudo ruby start.rb

A live running version of this can be found <a href="http://ec2-107-22-74-79.compute-1.amazonaws.com/">here</a>.

## How I made this

The piano itself comes from <a href="http://www.html5piano.ilinov.eu/full/">Mihail Ilinov</a> with a bunch of code cleanup, refactoring, and improvements.

Languages used: HTML5, CSS3, jQuery, Ruby

Other tools: <a href="http://www.lesscss.org">LESS</a>, <a href="http://http://www.sinatrarb.com/">Sinatra</a>, <a href="http://www.nihilogic.dk/labs/canvas2image/">Canvas2Image</a>, <a href="http://www.vexflow.com">VexFlow</a>