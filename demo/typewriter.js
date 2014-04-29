var typewriter = function () {

   var input = document.getElementById('input'), // captures the user's text input
       output = document.getElementById('output'); // renders the user's text input

   // Keydown fires first
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

         // If holding shift and not right arrow then 
         if (e.shiftKey && keyCode !== 39) {
            return setFocus(output); // move to output to allow selection
         };

         // Otherwise just disable them
         return e.preventDefault();
      };

      // Handle return key
      if (keyCode === 13) {
         input.innerHTML += '<p>&#xfeff;</p>'; // zero width char allows us to setfocus() after the br tag
         e.preventDefault();
      };

      // Handle tab key
      if(keyCode === 9) {
         input.lastChild.innerHTML += '&nbsp;&nbsp;';
         e.preventDefault();
      }

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

      // Modify delete  
      if (e.which === 8) {
         e.preventDefault();
         strikeOut(selectedText());
         setHTMLof(input).to(output);
         return setFocus(input);                  
      }

      // Shift is pressed
      if (e.shiftKey) {
         // allow default event since
         // shift is used to modify selection
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

   // Ensures caret is always in view
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
      // Works by creating a user selection then collapses it
   
      var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false); // false to collapse at end of range
      
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