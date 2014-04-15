// Load native UI library
var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

var gui = require('nw.gui');
var win = gui.Window.get();

var windowPrefs = {
      "title": "Untitled Document",
      "toolbar": false,
      "frame": true,
      "width": 640,
      "height": 800,
      "position": "center",
      "min_width": 300,
      "min_height": 200
    };

var Typewriter = {},
    util = loadUtilities();

Typewriter.init = function() {


    // This is to get around the weird highlighting
    // issues for contenteditable
    var firstDiv = document.createElement('div');
    firstDiv.innerHTML = '&#8203;';
    var input = document.getElementById('input');
    input.appendChild(firstDiv);

Typewriter.buildMenu();

    // Initiate
    Typewriter.sync('output', 'input');

};

Typewriter.newFile = function(){

    var newWindow = window.open('index.html', windowPrefs);
};

Typewriter.saveFile = function(){
    
    function choose(name) {
      var chooser = document.querySelector(name);
      chooser.addEventListener("change", function(evt) {
        console.log(this.value);
      }, false);

      chooser.click();  
    }
    choose('#saveFile');

};

Typewriter.openFile = function(){

    function chooseFile(name) {
        var chooser = document.querySelector(name);
        chooser.addEventListener("change", function(evt) {
          console.log(this.value);
        }, false);

        chooser.click();  
      }
      chooseFile('#fileDialog');


};

Typewriter.buildMenu = function(){
    var menubar = new gui.Menu({ type: 'menubar' });
    var file = new gui.Menu();

    file.append(new gui.MenuItem({
        label: 'New',
        click: function() {
        return Typewriter.newFile()
        }
    }));

    file.append(new gui.MenuItem({
        label: 'Open',
        click: function() {
          return Typewriter.openFile()
        }
    }));

    file.append(new gui.MenuItem({
        label: 'Save',
        click: function() {
          return Typewriter.saveFile()
        }
    }));
    
    file.append(new gui.MenuItem({ type: 'separator' }));

    file.append(new gui.MenuItem({
        label: 'Print',
        click: function() {
          return Typewriter.printFile()
        }
    }));

    var help = new gui.Menu();
    win.menu = menubar;
    win.menu.insert(new gui.MenuItem({ label: 'File', submenu: file}), 1);
    win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));


};

// Typewriter.makeTextFile = function(){

//     var text = document.getElementById('output').textContent;

//     var data = new Blob([text], {type: 'text/plain'});

//     // If we are replacing a previously generated file we need to
//     // manually revoke the object URL to avoid memory leaks.
//     if (textFile !== null) {
//       window.URL.revokeObjectURL(textFile);
//     }

//     textFile = window.URL.createObjectURL(data);

//     return textFile;
// };

Typewriter.sync = function(oldNodeID, newNodeID) {
    
    var newNode = document.getElementById(newNodeID),
        oldNode = document.getElementById(oldNodeID);

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

        if (keyCode === 78 && event.metaKey) {
            Typewriter.newFile();
        };

        if (keyCode === 83 && event.metaKey) {
            Typewriter.saveFile();
        };

        if (keyCode === 79 && event.metaKey) {
            Typewriter.openFile();
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

                var selEms = util.getSelectedElementTags(window);
                var textNodes = [];

                for (var i = 0;i<selEms.length;i++) {
                    if (selEms[i].id !== 'output' &&
                        selEms[i].nodeName !== 'BR') {
                        textNodes.push(selEms[i])
                    }
                }

                // This removes an extra element from the end of the range
                // Don't really understand why the element is there to begin with
                if (range.endOffset === 0) {
                    textNodes.pop()
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
