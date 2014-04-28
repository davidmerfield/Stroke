var demo = function () {
   
   el = document.getElementById('demo');

   input = document.getElementById('input');
   output = document.getElementById('output');

   function type(string, callback, p) {
      
      if (!p) {
         p = document.createElement('p');
         output.appendChild(p);
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

      var lastP = output.lastChild,
          lastPText = lastP.firstChild;

      selectChars(count);

      function selectChars(count) {

         if (count === i) {
            var selectedText = window.getSelection();
            typewriter().strikeOut(selectedText);
            return callback()
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
         }, Math.floor(Math.random()*200) + 100); 

      }
   }

   function newLine (callback) {

      setTimeout(function(){

         p = document.createElement('p');
         p.innerHTML = '&#xfeff;';
         output.appendChild(p);

         setTimeout(function(){
            return callback()
         }, Math.floor(Math.random()*200) + 100);

      }, Math.floor(Math.random()*200) + 100);
   }

   return function () {
      // input.onkeydown = function(e){return e.preventDefault()};

      typewriter().init();

      output.innerHTML = '';
      input.innerHTML = '';


      input.setAttribute('style', 'display:none');
      type('Typewriter is a simple text editor.', function(){

      newLine(function(){
      
      type(' Every letter you type is permanent. No editing. No formatting. A bit like a real typewriter.', function(){

      newLine(function(){
      
      type('Deleting text just strikes it out, so you can cover up mistskes', function(){

      crossOut(9, function(){
            
      type(' mistakes.', function(){    

      newLine(function(){
      
      type('Typewrite is perfect for first drafts. For forcing your ideas onto the page. For fixing writer\'s block.', function(){
      
      typewriter().setHTMLof(input).to(output)
            
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
