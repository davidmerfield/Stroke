

Typewriter.init = function() {

    // This is to get around the weird highlighting
    // issues for contenteditable
    $('#input').append('<div><br></div>');


};

Typewriter.sync = function(oldNodeID, newNodeID) {
    
    console.log
    var newNode = document.getElementById(newNodeID),
        oldNode = document.getElementById(oldNodeID)
    
    ;

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
        
        var keyCode = e.which;

        if(keyCode !== 91) {
            $('#wrapper').attr('class','enabled');
        }
            
        // Disable arrow keys
        if (keyCode <= 40 && keyCode >= 37) {
             e.preventDefault();             
        };



        if (keyCode === 8) {
            
            // Don't delete anything, you can't delete words on a typewriter
            e.preventDefault();             

            // Strike out the text that would be deleted
            var strike = document.createElement('strike'),
                selectedText = window.getSelection().getRangeAt(); 
    
            selectedText.surroundContents(strike);

            // Reflect strike in source textarea
             Typewriter.sync('input', 'output');
        };

        Typewriter.sync('output', 'input');
        util.setEndOfContenteditable($('#input')[0]);

    });

  $('#input')
    .focus()
    .keyup(function(e){
        synchronize('#output');
    })
    .keypress(function(e) {        
        
        $('#output div:last-child').append(String.fromCharCode(e.which));

});

function loadUtilities () {
    return {
        setEndOfContenteditable: function(contentEditableElement) {
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
        },

        getSelectionHtml: function() {
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
    }
};
