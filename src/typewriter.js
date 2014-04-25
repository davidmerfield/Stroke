var typewriter = function () {

   var input = document.getElementById('input'),
       output = document.getElementById('output');
   
   output.onkeydown = function (e) {      
      
      var keyCode = e.which;

      if (e.which === 8) {
         e.preventDefault();
         strikeOut();
         sync(input, output)
         return setFocus(input);         
      }

      if (keyCode === 16) {
         return
      }

      if (!isArrowKey(keyCode) && e.shiftKey) {
         e.preventDefault();
         return setFocus(input)
      }

      if (isArrowKey(keyCode) && !e.shiftKey) {
         return setFocus(input)
      }

      if (isArrowKey(keyCode) && e.shiftKey) {
         return ''
      }

      if (e.metaKey) {
         return setFocus(input)
      }

      if (selectedText()) {
         e.preventDefault()
      }

      return setFocus(input)

   }

   output.onkeyup = function (e) {
      if (!selectedText()) {
         return setFocus(input)
      }
   };

   input.onkeydown = function (e) {      
      
      var keyCode = e.which;

      // Disable delete key
      if (keyCode === 8) {
         e.preventDefault()
      };

      // Disable copy paste and shit
      if (e.metaKey && keyCode !== 82) {
         e.preventDefault()
      }

      // Handle arrow keys
      if (keyCode <= 40 && keyCode >= 37) {
         
         // If shift is held allow user to make selection in output
         if (e.shiftKey) {
            return setFocus(output);

         // Otherwise disable the arrow keys
         } else {
            e.preventDefault();            
         }

      };

      // Handle return key
      if (keyCode === 13) {
         input.innerHTML += '<p></p>&#xfeff;'; // zero width char to fix contenteditable focus bug
         e.preventDefault();
      };

      // We make a setTImeout because
      // input.innerHTML is not yet updated with e.char
      // and waiting for onkeypress is too slow
      return setTimeout(function(){

         sync(output, input);
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

      sync(output, input);

      setFocus(input);
   }();

}

// GO GO GADGET
typewriter();