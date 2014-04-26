var demo = function (el) {
   
   el = document.getElementById(el);

   function type(string, callback, p) {
      
      if (!p) {
         p = document.createElement('p');
         el.appendChild(p);
      }

      if (string === '') {
         return callback()
      }

      setTimeout(function(){
         var character = string.slice(0,1);
             string = string.slice(1);

         p.innerHTML += character;
         type(string, callback, p)
      }, Math.floor(Math.random()*200)); 
   }

   function crossOut(count, callback) {

      var i = 1;

      var lastP = el.lastChild,
          lastPText = lastP.firstChild;

      selectChars(count);

      function selectChars(count) {

         if (count === i) {return callback()};

         var range = document.createRange();

         range.selectNode(lastPText);
         range.setStart(lastPText, lastPText.length - i);

         var selection = window.getSelection();

         selection.removeAllRanges();
         selection.addRange(range);

         i++;

         setTimeout(function(){
            selectChars(count);
         }, Math.floor(Math.random()*200) + 100); 

      }
   }

   function strike(callback) {
      var selectedText = window.getSelection();
      var range = selectedText.getRangeAt();

      var strike = document.createElement('span');
          strike.className = 'strike';

      range.surroundContents(strike);

      // The 'empty' span is to stop the user typing within strike out text
      var emptySpan = document.createElement('span');
          emptySpan.innerHTML = '&#8203;'; // zero width character

      // Adds empty span after strike
      range.collapse(false);
      range.insertNode(emptySpan);         
   
      setFocus(document.getElementById('input'));

      return callback()
   }

   function setFocus (el) {

      var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
      
      var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
   }

   function newLine (callback) {

      setTimeout(function(){

         p = document.createElement('p');
         p.innerHTML = '&#xfeff;';
         el.appendChild(p);

         setTimeout(function(){
            return callback()
         }, Math.floor(Math.random()*200) + 100);

      }, Math.floor(Math.random()*200) + 100);
   }

   return function () {
      type('Typewriter is a text editor for Mac', function(){
         newLine(function(){
            type('Hello this worked', function(){
               newLine();
            });
         });
      });
   }()
}

demo('output');