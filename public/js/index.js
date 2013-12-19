// tab breaks this


(function($) {
    $.fn.focusToEnd = function() {
        return this.each(function() {
            var v = $(this).val();
            $(this).focus().val("").val(v);
        });
    };
})(jQuery);



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
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return(html);
}

$(function() {

    $('#output').html($('#input').val());

    //Sample sound table
    var sounds = {"1":new Audio("/public/audio/1.mp3"),
                  "2":new Audio("/public/audio/2.mp3"),
                  "3":new Audio("/public/audio/3.mp3"),
                  "4":new Audio("/public/audio/4.mp3"),
                  "5":new Audio("/public/audio/5.mp3"),
              };


    //Resets a sound's timer and plays it from the start
    function playSound(){
    var name = Math.floor(Math.random()*6).toString();
    sounds[name].currentTime = 0;
    sounds[name].play();
    }
                        


    $(window)
        .click(function(){
            window.setTimeout(function(){
                if (!getSelectionHtml()) {
                    $('#input').focus();
                };
            }, 150)
        });

    $('#audio_toggle').click(function(){
        $(this).toggleClass('enabled');
    });


$('body')
    .keydown(function(e){
        var keyCode = e.which;
        // Delete


        // Disable arrow keys
        if (keyCode <= 40 && keyCode >= 37) {
             e.preventDefault();             
        }

        if (keyCode === 13) {
             $('#input').val($('#input').val() + '<br />')
        }

        if (keyCode === 9) {
            e.preventDefault();                         
            $('#input').val($('#input').val() + '&nbsp;&nbsp;&nbsp; ')
        }

        if (keyCode === 8) {
            
            console.log('this');

            // Don't delete anything, you can't delete words on a typewriter
            e.preventDefault();             

            // Strike out the text that would be deleted
            var strike = document.createElement('strike'),

            // Get the contents of 
                selectedText = window.getSelection().getRangeAt();

            console.log(selectedText);

            selectedText.surroundContents(strike);
            
            // Reflect strike in source textarea
            $('#input').val($('#output').html())

            // Move the caret to the end of the contenteditable
            // so the user can keep typing fluidly
            $('#input').focusToEnd();
        };
    });

  $('#input')
    .focus()
    .keyup(function(e){
        $('#output').html($('#input').val());
    })
    .keypress(function(e) {        
        
        if ($('#audio_toggle').hasClass('enabled')){
            playSound();            
        }
        
        $('#output').append(String.fromCharCode(e.which));
    });
});
