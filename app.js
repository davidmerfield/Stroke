
var Typewriter = {},
    util = loadUtilities();

Typewriter.init = function() {

    // This is to get around the weird highlighting
    // issues for contenteditable

    var firstDiv = document.createElement('div');

    firstDiv.innerHTML = '&#8203;';

    var input = document.getElementById('input');
    input.appendChild(firstDiv);

    // Initiate
    Typewriter.sync('output', 'input');

};

Typewriter.sync = function(oldNodeID, newNodeID) {
    
    var newNode = document.getElementById(newNodeID),
        oldNode = document.getElementById(oldNodeID);

    // Update #output to reflect the changes made to #input
    return oldNode.innerHTML = newNode.innerHTML
};

$(function() {

    Typewriter.init();

    // Keep focus on input no matter what
    $(window).click(function(){
        window.setTimeout(function(){
            if (!util.getSelectionHtml()) {
                util.setEndOfContenteditable('input');
            };
        }, 150)
    });

    // Typing Handler
    $('body').keydown(function(e){
        
        var keyCode = e.which;

        // ARROW KEYS
        if (keyCode <= 40 && keyCode >= 37) {
             e.preventDefault(); // disable them
        };

        // ENTER
        if (keyCode === 13) {
            $('#input').append('<div><br></div>'); // make new paragraph
            e.preventDefault();
        };

        // DELETE
        if (keyCode === 8) {
                
            // Don't delete any characters
            e.preventDefault();             

            // Check for selected text to strike out

            var selectedText = window.getSelection().getRangeAt();

            // If selected text contains non text nodes then strikeout will not work
            if (selectedText.commonAncestorContainer.nodeName === '#text'){
                strikeOut(selectedText)
            } else {

                var textRanges = splitUp(selectedText),
                    textRangeLen = textRanges.length;

                for (var i = 0;i<textRangeLen;i++){
                    strikeOut(textRanges[i]);
                }
                
            }

            function strikeOut(range) {

                // The black line through the text
                var strike = document.createElement('span');
                    strike.className = 'strikeOut';

                range.surroundContents(strike);

                // The 'empty' span is to counter
                // weird behaviour when setting focus of contenteditable
                // Without it, you can keep typing within strike out text
                var emptySpan = document.createElement('span');
                    emptySpan.innerHTML = '&#8203;'; // zero width character

                // Adds empty span after strike
                range.collapse(false);
                range.insertNode(emptySpan);

            }

            // The purpose of this function is to take a range which includes non text nodes and
            // split it into a series of ranges whose common ancestor is a text node
            // then pass these ranges to strikeout()

            function splitUp(range) {

                var output = [];

                console.log(range);

                var selEms = util.getSelectedElementTags(window);
                var textNodes = [];

                for (var i = 0;i<selEms.length;i++) {
                    if (selEms[i].id !== 'output' &&
                        selEms[i].nodeName !== 'BR') {
                        textNodes.push(selEms[i])
                    }
                }

                for (var i = 0;i<textNodes.length;i++) {
                    
                    var node = textNodes[i];

                    for (var key in node.childNodes) {


                        var text = node.childNodes[key];

                        console.log(text);

                        if (text.nodeName === '#text') {

                            var subRange = document.createRange();

                            subRange.selectNode(text)                                

                            if (text.isSameNode(range.startContainer)) {
                                subRange.setStart(text, range.startOffset);
                                // if this doesn't work check that node is added to the range
                            }

                            else if (text.isSameNode(range.endContainer)) {
                                subRange.setEnd(text, range.endOffset);
                            } 

                            output.push(subRange);

                        }
                    };

                }

                return output

            }

            // Reflect strike in source textarea
             Typewriter.sync('input', 'output');
        };

        Typewriter.sync('output', 'input');
        util.setEndOfContenteditable('input');

    });

    $('#input')
        .focus()
        .keyup(function(e){Typewriter.sync('output', 'input')})
        .keypress(function(e){        
            $('#output div:last-child').append(String.fromCharCode(e.which));        
        });

});



function loadUtilities () {
    return {
        rangeIntersectsNode: function(range, node) {
            var nodeRange;
            if (range.intersectsNode) {
                return range.intersectsNode(node);
            } else {
                nodeRange = node.ownerDocument.createRange();
                try {
                    nodeRange.selectNode(node);
                } catch (e) {
                    nodeRange.selectNodeContents(node);
                }

                return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
                    range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
            }
        },

        getSelectedElementTags: function(win) {

            var range, sel, elmlist, treeWalker, containerElement;

            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
            }

            if (range) {
                containerElement = range.commonAncestorContainer;
                if (containerElement.nodeType != 1) {
                    containerElement = containerElement.parentNode;
                }

                treeWalker = win.document.createTreeWalker(
                    containerElement,
                    NodeFilter.SHOW_ELEMENT,
                    function(node) { return util.rangeIntersectsNode(range, node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; },
                    false
                );

                elmlist = [treeWalker.currentNode];

                while (treeWalker.nextNode()) {
                    elmlist.push(treeWalker.currentNode);
                }

                return elmlist;
            }
        },

        setEndOfContenteditable: function(elId) {
            var range,
                selection;

            var contentEditableElement = document.getElementById(elId);

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
