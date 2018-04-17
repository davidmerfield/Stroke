var stroke = function () {

   // #Input is used to capture text input, is hidden from user
   var input = document.getElementById('input'),
   
   // #Output is used to render #Input's value
      output = document.getElementById('output');

   function init () {
      
      // Loads the desktop app's features if possible
      if (inDesktop()) {desktopApp()};

      // Add the first p tag to a new document
      if (!input.innerHTML) {input.innerHTML += '<p>&#xfeff;</p>'};
      // The zero width character allows us to set the caret's position inside the p tag

      // Tell output to render the text in input
      setHTMLof(output).to(input);

      // Move the user's real caret to input
      setFocus(input);

   };

   input.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Disable delete
      if (keyCode === 8) {
         return e.preventDefault();
      };

      // Command keys
      if (e.metaKey) {

         // C - Allow the user to copy text
         if (keyCode === 67) {return};

         // A - Allow the user to select all text
         if (keyCode === 65) {return selectContentsOf(output)};

         // R - Allow the user to reload the page in when in a browser
         if (keyCode === 82 && !inDesktop()) {return};

      };
      
      // Arrow keys
      if (isArrowKey(keyCode)) {

         // We want to allow the user to make a selection then modify it with
         // the arrow keys. Soo, if the user is holding shift and presses any
         // arrow key except the right key then we set the focus on #output.
         if (e.shiftKey && keyCode !== 39) {
            return setFocus(output); 
         };

         // Otherwise we need to stop the arrow keys from moving the caret since
         // new text can only be added to the end of the document.
         return e.preventDefault();
      };

      // Return key
      if (keyCode === 13) {

         // In order to set focus correctly on a content editable div,
         // we add a zero-width character inside the new p.

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

         // Make selected text appear struck out
         strikeOut(selectedText());

         // Update input to include the newly struck out text
         setHTMLof(input).to(output);

         return setFocus(input);                  
      }

      // Shift is pressed
      if (e.shiftKey || e.metaKey) {
         
         // allow default since shift is used to modify selection
         return
      }

      // But disable everything else
      e.preventDefault();
      return setFocus(input);         
   };

   // Disable Cut and Paste
   output.oncut = output.onpaste =
   input.onpaste = input.oncut = function(e) {return false};

   // Keep focus on input unless the user has selected text
   output.onkeyup = document.onmouseup = function (e) {
      if (!selectedText()) {return setFocus(input)}
   };

   // Takes the user's current text selection and strike it out
   function strikeOut(selectedText) {

      // Get the range representing the currently selected text
      var range = selectedText.getRangeAt(0);

      if (rangeHasNonTextNodes(range)) {
         
         // Since the selected text range contains non-text-nodes
         // we can't wrap it using range.surroundContents

         // Therefore we extract all the text nodes inside
         // the selected text range then surround them individually
         
         var textNodeRanges = extractTextNodes(range);
         
         for (var i in textNodeRanges) {
            surround(textNodeRanges[i]);
         };
         
      } else {
         surround(range);
      };

      // Surround takes a text node or range of text nodes
      // then wraps them in a span tag

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
      };
   };

   // Takes a range and returns an array of ranges containing a text node
   // within the original range

   function extractTextNodes(range) {

      var subRanges = [],
          container = range.commonAncestorContainer;

      // Walk through all the nodes inside the range's container
      var treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT,
         function(node) {
            if (node.isSameNode(container) || !range.intersectsNode(node)) {
               return NodeFilter.FILTER_REJECT;
            };
            return NodeFilter.FILTER_ACCEPT;
         },
         false
      );
            
      while (treeWalker.nextNode()) {

         var textNode = treeWalker.currentNode,
             subRange = document.createRange();
             subRange.selectNode(textNode);

         // If the user has selected part of a text node,
         // ensure the sub range reflects this
         if (textNode.isSameNode(range.startContainer)) {
            subRange.setStart(textNode, range.startOffset);
         }

         else if (textNode.isSameNode(range.endContainer)) {
            subRange.setEnd(textNode, range.endOffset);
         } 

         subRanges.push(subRange);

      };

      return subRanges;
   };

   // Used to check text selection range before striking out selection
   function rangeHasNonTextNodes (range) {
      return range.commonAncestorContainer.nodeName !== '#text'
   };

   // Used to synchronize the contents of two nodes
   function setHTMLof (oldNode) {
      return {
         to: function(newNode) {
            return oldNode.innerHTML = newNode.innerHTML            
         }
      }
   };

   function selectedText() {
      var selection = window.getSelection();
      return selection.type === 'Range' ? selection : false;
   };

   function inDesktop () {
      return typeof require !== 'undefined';
   };

   function isArrowKey (keyCode) {
      return (keyCode <= 40 && keyCode >= 37);
   };

   function moveViewportToBottom () {
      return window.scrollTo(0, document.body.offsetHeight);
   };

   // Used when the user presses Command + A
   function selectContentsOf (el) {

      var range = document.createRange();
          range.selectNodeContents(el);

      var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
   };

   // Used to move caret to end of contenteditable div
   function setFocus (el) {
            
      var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false); // false collapses the range to its endpoint
      
      var selection = window.getSelection();
          selection.removeAllRanges(); // clear existing user selection
          selection.addRange(range);
   };

   // Explose public methods
   return {
      init: init,
      setHTMLof: setHTMLof,
      setFocus: setFocus,
      strikeOut: strikeOut
   };

};