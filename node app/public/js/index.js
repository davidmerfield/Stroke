// Helper functions

function setEndOfContenteditable(contentEditableElement) {
    
    var range,
        selection;

    if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(contentEditableElement);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function getSelectionHtml() {
    var html = "";

    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    }

    if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }

    return(html);
}

var Typewriter = {};


var sourcePath = '/public/audio/';

// should this be automated? Looks super repetitive
Typewriter.sounds = {
    "0":new Audio(sourcePath + "1.mp3"),
    "1":new Audio(sourcePath + "2.mp3"),
    "2":new Audio(sourcePath + "3.mp3"),
    "3":new Audio(sourcePath + "4.mp3"),
    "4":new Audio(sourcePath + "5.mp3")    
};

Typewriter.sounds.play = function() {
    var name = Math.floor(Math.random()*5).toString();
    sounds[name].currentTime = 0;
    sounds[name].play();
};

Typewriter.sync = {

};

Typewriter.init = function() {

    // This is to get around the weird highlighting
    // issues for contenteditable
    $('#input').append('<div><br></div>');


};

$(function() {

    function synchronize(div) {
        
        // Update #output to reflect the changes made to #input
        if (div === '#output'){
            return $('#output').html($('#input').html());
        }
        
        // Else update #input to reflect changes to #output
        return $('#input').html($('#output').html());
    };

    // Initiate
    synchronize('#output');

    //Sample sound table
    var sounds = {
        "0":new Audio("/public/audio/1.mp3"),
        "1":new Audio("/public/audio/2.mp3"),
        "2":new Audio("/public/audio/3.mp3"),
        "3":new Audio("/public/audio/4.mp3"),
        "4":new Audio("/public/audio/5.mp3"),
    };

    //Resets a sound's timer and plays it from the start
    function playSound(){
        var name = Math.floor(Math.random()*5).toString();
        sounds[name].currentTime = 0;
        sounds[name].play();
    }
                        

    $('#wrapper').click(function(){
        $(this).attr('class','enabled')
    });
    $('#start').click(function(e){
        e.preventDefault();
        $('#wrapper').attr('class','enabled')
    });

    $(window)
        .click(function(){
            window.setTimeout(function(){
                if (!getSelectionHtml()) {
                    setEndOfContenteditable($('#input')[0]);
                };
            }, 150)
        });

    $('#audio_toggle').click(function(){
        $(this).toggleClass('enabled');
    });

    $('#focus').click(function(){
        setEndOfContenteditable($('#input')[0]);
    });

$('body')
    .keydown(function(e){
        
        console.log(e.which)
        var keyCode = e.which;

        if(keyCode !== 91) {
            $('#wrapper').attr('class','enabled');
        }
            
        // Disable arrow keys
        if (keyCode <= 40 && keyCode >= 37) {
             e.preventDefault();             
        };



        if (keyCode === 8) {
            
            console.log('this');

            // Don't delete anything, you can't delete words on a typewriter
            e.preventDefault();             

            // Strike out the text that would be deleted
            var strike = document.createElement('strike'),
                selectedText = window.getSelection().getRangeAt(); 
    
            selectedText.surroundContents(strike);

            // Reflect strike in source textarea
             synchronize('#input');
        };

        synchronize('#output');
        setEndOfContenteditable($('#input')[0]);

    });

  $('#input')
    .focus()
    .keyup(function(e){
        synchronize('#output');
    })
    .keypress(function(e) {        
        
        $('#output div:last-child').append(String.fromCharCode(e.which));

        if ($('#audio_toggle').hasClass('enabled')){
            playSound();            
        }
        
    });
});
