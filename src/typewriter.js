var typewriter = function () {

   var input = document.getElementById('input'), // captures the user's text input
       output = document.getElementById('output'); // renders the user's text input

   input.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Disable delete key
      if (keyCode === 8) {
         return e.preventDefault();
      };

      // Disable CMD or CNTRL if in browser
      if (e.metaKey && !inDesktop()) { 
         if (keyCode === 82) {return} // allow reload (CMD + r) to function normally in a browser
         return e.preventDefault();
      }
      
      // Arrow keys
      if (isArrowKey(keyCode)) {

         // User is trying to make a selection using the shift key
         if (e.shiftKey && keyCode !== 39) { // right key

            // so allow this to happen in #output
            return setFocus(output);
         };

         // Otherwise just disable them
         return e.preventDefault();
      };

      // Handle return key
      if (keyCode === 13) {
         input.innerHTML += '<p>&#xfeff;</p>'; // zero width char allows us to setfocus() after the br tag
         e.preventDefault();
      };

      // The timeout allows us to acces the
      // updated contents of input.innerHTML
      // without needing to wait til input.onkeyup
      return setTimeout(function(){
         setHTMLof(output).to(input);
         setFocus(input);
         return moveViewportToBottom();
      }, 0);

   }

   output.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Delete
      if (e.which === 8) {
         strikeOut(selectedText());
         setHTMLof(input).to(output);
         e.preventDefault();
         return setFocus(input);                  
      }

      // Allow normal operation if shift or shift + arrowkey is pressed... 
      if (e.shiftKey) {
         if (isArrowKey(keyCode)) {return}
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
      return typeof require !== 'undefined' ? true : false
   }

   function isArrowKey (keyCode) {
      return (keyCode <= 40 && keyCode >= 37) ? true : false
   }

   function moveViewportToBottom () {
      return window.scrollTo(0, document.body.offsetHeight);
   }   

   function extractTextNodes(range) {
      var subRanges = [],
          container = range.commonAncestorContainer;

      var treeWalker = document.createTreeWalker(
         container,
         NodeFilter.SHOW_TEXT,
         function(node) {
            if (node.isSameNode(container)) {return NodeFilter.FILTER_REJECT}
            if (range.intersectsNode(node)) {return NodeFilter.FILTER_ACCEPT}
            return NodeFilter.FILTER_REJECT
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

   function rangeHasNonTextNodes (range) {
      return range.commonAncestorContainer.nodeName !== '#text'
   }

   function strikeOut(selectedText) {

      var range = selectedText.getRangeAt();

      if (rangeHasNonTextNodes(range)) {
         
         var textNodeRanges = extractTextNodes(range);
         for (var i in textNodeRanges) {strike(textNodeRanges[i])}
         
      } else {
         strike(range)
      }

      function strike (range) {
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

   function setHTMLof (oldNode) {
      return {
         to: function(newNode) {
            return oldNode.innerHTML = newNode.innerHTML            
         }
      }
   };

   function setFocus (el) {

      var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
      
      var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
   }

   // This starts the typewriter
   return function init () {
      
      if (inDesktop()) {
         var desktop = require('./app.js');
         desktop.app();
         console.log('Running in desktop environment!')
      } 

      // If we're starting a new document add the first p tag
      if (input.innerHTML === '') {
         input.innerHTML += '<p>&#xfeff;</p>'
      }

      setHTMLof(output).to(input);
      setFocus(input);
   }();

}

// GO GO GADGET
typewriter();