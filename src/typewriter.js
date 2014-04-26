var typewriter = function () {

   var input = document.getElementById('input'), // captures the user's text input
       output = document.getElementById('output'); // renders the user's text input

   input.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Delete key
      if (keyCode === 8) {
         return e.preventDefault();
      };

      // CMD on Mac or CNTRL on Windows
      if (e.metaKey) { 
         if (keyCode === 82 && !inDesktop()) {
            return // allow reload (CMD + r) to function normally in a browser
         } 
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

   document.onmouseup = function (e) {
      
      // We need to keep focus on input unless there's selected text
      if (!selectedText()) {
         setFocus(input);
      }

      // Since theres selected text,
      // perhaps prepare for strikeout?

   }

   
   function buildGUIMenu () {
      return
   }

   // Used to check if the user has selected text
   function selectedText() {
      var selection = window.getSelection();
      return selection.type === 'Range' ? selection : false
   }

   function sync (oldNode, newNode) {
      return oldNode.innerHTML = newNode.innerHTML
   }

   function inDesktop () {
      return typeof require !== 'undefined' ? true : false
   }

   function isArrowKey (keyCode) {
      return (keyCode <= 40 && keyCode >= 37) ? true : false
   }

   function moveViewportToBottom () {
      window.scrollTo(0, document.body.offsetHeight);
   }   

   function strikeOut() {

      var selectedText = window.getSelection().getRangeAt();

      console.log(window.getSelection());
      console.log(window.getSelection().getRangeAt());

      // The black line through the text
      var strike = document.createElement('span');
          strike.className = 'strike';

      selectedText.surroundContents(strike);

      // The 'empty' span is to counter
      // weird behaviour when setting focus of contenteditable
      // Without it, you can keep typing within strike out text
      var emptySpan = document.createElement('span');
          emptySpan.innerHTML = '&#8203;'; // zero width character

      // Adds empty span after strike
      selectedText.collapse(false);
      selectedText.insertNode(emptySpan);

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