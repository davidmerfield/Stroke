var demo = function () {
   
   el = document.getElementById('demo');

   input = document.getElementById('input');
   output = document.getElementById('output');

   function makeDelay(length) {

      if (length === 'short') {
         return Math.floor(Math.random()*120) + 30
      };

      if (length === 'medium') {
         return Math.floor(Math.random()*150) + 40
      };

      if (length === 'long') {
         return Math.floor(Math.random()*200) + 200
      };

      return Math.floor(Math.random()*100)+40

   };

   function type(string, callback, p) {
      
      var delay = makeDelay('short');

      if (!p) {
         p = document.createElement('p');
         output.appendChild(p);
      }

      // Typing complete
      if (string === '') {
         return callback()
      }

      setTimeout(function(){

         var character = string.slice(0,1);
             string = string.slice(1);

         if (character === '.') {
            delay = makeDelay('long');
         }

         if (character === ' ') {
            delay = makeDelay('medium');
         }

         p.innerHTML += character;
         
         type(string, callback, p);

      }, delay); 
   }

   function crossOut(count, callback) {

      var i = 1;

      var lastP = output.lastChild,
          lastPText = lastP.firstChild;

      selectChars(count);

      function selectChars(count) {

         var delay = makeDelay('long');

         if (count === i) {

            var selectedText = window.getSelection();

            return setTimeout(function(){
               typewriter().strikeOut(selectedText);
               typewriter().setFocus(input);
               return callback()
            }, delay); 

         };

         var range = document.createRange();

         range.selectNode(lastPText);
         range.setStart(lastPText, lastPText.length - i);

         var selection = window.getSelection();

         selection.removeAllRanges();
         selection.addRange(range);

         i++;

         setTimeout(function(){
            selectChars(count);
         }, delay); 

      }
   }

   function newLine (callback) {

      var delay = makeDelay('long');

      setTimeout(function(){

         p = document.createElement('p');
         p.innerHTML = '&#xfeff;';
         output.appendChild(p);

         setTimeout(function(){
            return callback()
         }, delay);

      }, delay);

   }

   return function () {
      // input.onkeydown = function(e){return e.preventDefault()};

      typewriter().init();

      output.innerHTML = '';
      input.innerHTML = '';


      input.setAttribute('style', 'display:none');
      output.setAttribute('class', 'solidCursor');               

      type('Typewriter is a simple text editor.', function(){

      newLine(function(){
      
      type('Every letter you type is permanent. A bit like a real typewriter.', function(){

      newLine(function(){
      
      type('You can\'t delete your mistakes but you can coevr', function(){

      crossOut(6, function(){
            
      type(' cover them up.', function(){    

      newLine(function(){
      
      type('Typewriter is perfect for that difficult first draft. For forcing ideas from your head and overcoming writer\'s block.', function(){
      
      typewriter().setHTMLof(input).to(output)
            
            output.setAttribute('class', '');               
            input.setAttribute('style', 'display:block');   

      });
      });
      }, output.lastChild);          
      });
      });
      });
      });
      });
      });
   }()
}

setTimeout(function(){
   demo();
}, 300);
