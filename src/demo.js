var demo = function (el) {
   
   el = document.getElementById(el);
   input = document.getElementById('input');
   output = document.getElementById('output');

   function setHTMLof (oldNode) {
      return {
         to: function(newNode) {
            return oldNode.innerHTML = newNode.innerHTML            
         }
      }
   };

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
      }, Math.floor(Math.random()*100)+40); 
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
      // input.onkeydown = function(e){return e.preventDefault()};

      output.innerHTML = '';

      type('Typewrite is a simple text editor.', function(){

      newLine(function(){
      
      type(' Every letter you type is permanent. No editing. No formatting. A little bit like a typewriter.', function(){

      newLine(function(){
      
      type('Deleting text just strikes it out, so you can cover up mistskes', function(){

      crossOut(9, function(){
      
      strike(function(){
      
      type(' mistakes.', function(){    

      newLine(function(){
      
      type('Typewrite is perfect for first drafts. For forcing your ideas onto the page. For fixing writer\'s block.', function(){
      
      setHTMLof(input).to(output)
                           
      });
      });
      }, el.lastChild);          
      });
      });
      });
      });
      });
      });
      });
   }()
}

setTimeout(function(){
   demo('output');
}, 300);
