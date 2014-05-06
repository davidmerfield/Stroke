/*

The following removes lots of useful functionality from a contenteditable div. Specifically:

- No text can be deleted from the div.
- Only text the user types is added to the div. 
- Text can only be added to the end of the div. 
- Selected text is struck out when the user presses the delete key

*/
var typewriter = function () {

   var input = document.getElementById('input'),
       // #Input captures text input, is hidden from user

       output = document.getElementById('output');
       // #Output renders #Input's text and is used to capture strikethroughs

   input.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Disable delete
      if (keyCode === 8) {
         return e.preventDefault();
      };

      // Disable CMD or CNTRL keys in the browser
      if (e.metaKey && !inDesktop()) {

         // But allow reload (CMD + r)
         if (keyCode === 82) {return}
         
         return e.preventDefault();
      }
      
      // Arrow keys
      if (isArrowKey(keyCode)) {

         // We need to stop the arrow keys from moving the caret since
         // new text can only be added to the end of the document.
         // However, we also want to allow the user to make a selection
         // and modify it with the arrow keys

         // Therefore, if the user is holding shift and presses
         // any arrow key except the right key we set the focus on #output.
         if (e.shiftKey && keyCode !== 39) {
            return setFocus(output); 
         };

         // Otherwise just disable the arrow keys
         return e.preventDefault();
      };

      // Return key
      if (keyCode === 13) {

         // The default behaviour of the return key in a contenteditable
         // is to append a new empty <p> tag only when the next key is pressed.

         // However, we need a line break immediately to ensure the caret 
         // behaves correctly. Also in order to set focus correctly on the 
         // content editable div, we add a zero-width character inside the new p.

         input.innerHTML += '<p>&#xfeff;</p>'; 
         e.preventDefault();
      };

      // Tab key
      if(keyCode === 9) {

         // We want the tab key to behave like one in a text editor.

         input.lastChild.innerHTML += '&nbsp;&nbsp;';
         e.preventDefault();
      };

      // The timeout allows us to acces the new and updated contents
      // of input.innerHTML without needing to wait til input.onkeyup
      return setTimeout(function(){
         
         setHTMLof(output).to(input);
         setFocus(input);

         // Ensures caret is always in view
         return moveViewportToBottom(); 
      }, 0);

   }

   output.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Delete key
      if (e.which === 8) {

         // Don't remove any text
         e.preventDefault();

         // Wrap any selected text in a span which make the text appear
         // like it's been struck out
         strikeOut(selectedText());

         // Update input's content to reflect the new span tag
         setHTMLof(input).to(output);

         return setFocus(input);                  
      }

      // Shift is pressed
      if (e.shiftKey) {
         
         // allow default since shift is used to modify selection
         return
      }

      // But disable everything else
      e.preventDefault();
      return setFocus(input);         
   }

   // Keep focus on input unless the user has selected text
   output.onkeyup = document.onmouseup = function (e) {
      if (!selectedText()) {return setFocus(input)}
   };

   // Used to check if the user has selected text
   function selectedText() {
      var selection = window.getSelection();
      return selection.type === 'Range' ? selection : false
   }

   function inDesktop () {
      return typeof require !== 'undefined'
   }

   function isArrowKey (keyCode) {
      return (keyCode <= 40 && keyCode >= 37)
   }

   function moveViewportToBottom () {
      return window.scrollTo(0, document.body.offsetHeight);
   }   

   // Used to strike out text across non text nodes
   function extractTextNodes(range) {
      var subRanges = [],
          container = range.commonAncestorContainer;

      var treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT,
         function(node) {
            if (node.isSameNode(container) || !range.intersectsNode(node)) {return NodeFilter.FILTER_REJECT}
            return NodeFilter.FILTER_ACCEPT
         },
         false
      );
            
      while (treeWalker.nextNode()) {

         var textNode = treeWalker.currentNode,
             subRange = document.createRange();
             subRange.selectNode(textNode);

         if (textNode.isSameNode(range.startContainer)) {
            subRange.setStart(textNode, range.startOffset);
         }

         else if (textNode.isSameNode(range.endContainer)) {
            subRange.setEnd(textNode, range.endOffset);
         } 

         subRanges.push(subRange);

      };

      return subRanges;
   }

   // Used to check text selection range before striking out selection
   function rangeHasNonTextNodes (range) {
      return range.commonAncestorContainer.nodeName !== '#text'
   }

   // Makes a line through text
   function strikeOut(selectedText) {

      var range = selectedText.getRangeAt();

      if (rangeHasNonTextNodes(range)) {
         
         var textNodeRanges = extractTextNodes(range);
         for (var i in textNodeRanges) {surround(textNodeRanges[i])}
         
      } else {
         surround(range)
      }

      function surround (range) {
         var strike = document.createElement('span');
             strike.className = 'strike';

         range.surroundContents(strike);

         // The 'empty' span is to stop the user typing within strike out text
         var emptySpan = document.createElement('span');
             emptySpan.innerHTML = '&#8203;'; // zero width character

         // Adds empty span after strike
         range.collapse(false);
         range.insertNode(emptySpan);         
      }
   }

   // Used to synchronize the contents of two nodes
   function setHTMLof (oldNode) {
      return {
         to: function(newNode) {
            return oldNode.innerHTML = newNode.innerHTML            
         }
      }
   };

   function setFocus (el) {
      
      // .focus() puts caret at start of el
      // This works by creating a selection then collapsing it
   
      var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false); // false collapses the range to its endpoint
      
      var selection = window.getSelection();
          selection.removeAllRanges(); // clear existing user selection
          selection.addRange(range); 
   }

   return {

      init: function () {
         
         if (inDesktop()) {
            app(); // start the app functionality
            console.log('Running in desktop environment!')
         } 

         // If we're starting a new document add the first p tag
         // to recieve the user's typing input
         if (input.innerHTML === '') {
            input.innerHTML += '<p>&#xfeff;</p>'
         }

         setHTMLof(output).to(input);
         setFocus(input);
      },

      setHTMLof: setHTMLof,
      setFocus: setFocus,
      strikeOut: strikeOut

   };


};