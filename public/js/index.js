; (function($) {
    $.fn.focusToEnd = function() {
        return this.each(function() {
            var v = $(this).val();
            $(this).focus().val("").val(v);
        });
    };
})(jQuery);

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

$(function() {

    // populate();

    function populate () {
        var foo = '',
            rows = 2,

        for (var i = 0;i < rows; i++){
          foo+= '1 ';
        }

        for (var i = 0;i < rows; i++){
          foo+= '0';
        }

        // for (var i = 0;i < rows*cols; i++){
        //   foo+= 'new line \n';
        // }

        $('#input').html(foo)
    }

    function strike(position, content) {
        

        console.log('called');

        var cols = parseInt($('#input').attr('cols')) + 1,
            lineHeight = 36,
            characterWidth = 14;

            positionY = lineHeight*Math.floor(position/cols),
            positionX = characterWidth*(position%cols);

        var position = position + 1;

        console.log('position ' + position);
        console.log('positionX: ' + positionX);

        // for (var i = 0; i < positionX;i++){
        //     content = '\u00a0' + content;
        //     console.log(content);
        // };

        var html = '<textarea style="top:' + positionY + 'px;text-indent:' + positionX +  'px">' + content + '</textarea>';

            console.log('position: ' + position);
            console.log('cols: ' + cols);
            console.log('column offset: ' + position%cols);
            
        $('#strikes').append(html);

    }


  $('#helper').click(function(e){
    e.preventDefault();

    console.log($('#output').selection());
    console.log($.selection('html'));
    return false
  });



    function replaceSpace(){

        if ($('#input').selection()) {
            
            console.log($('#input').selection());

            var selectedText = $('#input').selection(),
                replacement = selectedText.replace(/\S/g, '\u00a0'),
                position = $('#input').selection('getPos').start;

            console.log(position);

            $('#input').selection('replace', {text: replacement, caret: 'keep'});

            strike(position, selectedText);

        }

        return setTimeout(function() {
            $('#input').focusToEnd();
        }, 0);            

    }

  $('#input')
    .keydown(function(e) {
        
        if ($('#input').selection() && e.which !== 8){
            e.preventDefault();
            return false
        }

        if (e.which <= 40 &&
            e.which >= 37) {
            e.preventDefault();             
        }

        if (e.which === 13) {
            
            e.preventDefault();             

            var val = $("#input").val(),
                position = $("#input").selection('getPos').start + 1,
                cols = parseInt($('#input').attr('cols')) + 1,
                replacementLength = cols - (position)%cols,
                replacement = '';

            if (position === 0) {replacementLength = cols};

            console.log('replacementLength: ' + replacementLength);
            console.log('position: ' + position);

            while (replacement.length < replacementLength) {
                replacement += ' ';
            }

            $("#input").val(val + replacement + '\n');

        }

        if (document.URL.slice(-1) === "/") {

            $("#itch").fadeOut();

            var slug = Math.random().toString(36).slice(2, 8);
            
            $.get('/new', {just_the_slug: true}, function(slug, textStatus) {
                // console.log(slug);
                // console.log(textStatus);
                window.history.pushState("", "Typewriter", "/" + slug);  
            });
        };

        // $.post('/update', {slug: document.URL.slice(-6), contents: $(this).val()}, function(data, textStatus) {
        //     // console.log(data);
        //     // console.log(textStatus);
        // });

        // Disable backspace
        if (e.which === 8) {
            
            e.preventDefault();             
            replaceSpace();
        };

    });
});
