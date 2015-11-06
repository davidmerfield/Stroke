(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-8666188-9', 'llllll.li');
ga('send', 'pageview');

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

      if (length === 'longish') {
         return Math.floor(Math.random()*200) + 100
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

         var delay = makeDelay('longish');

         if (count === i) {

            var selectedText = window.getSelection();

            return setTimeout(function(){
               typewriter().strikeOut(selectedText);
               typewriter().setFocus(input);
               return callback()
            }, makeDelay('long')); 

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

      type('Typewriter is a text editor.', function(){

      newLine(function(){
      
      type('Every letter you type is permanent. You can stirke', function(){

      crossOut(7, function(){
            
      type(' strike out your mistakes but you can\'t delete them. You just have to keep on writing...', function(){    

      newLine(function(){
      
      type('Typewriter is quite silly', function(){

      crossOut(6, function(){
       
      type(' useful for first drafts and overcoming writer\'s block.', function(){
      
      typewriter().setHTMLof(input).to(output)
            
            output.setAttribute('class', '');               
            input.setAttribute('style', 'display:block');   

      }, output.lastChild);          
      });
      });
      });
      }, output.lastChild);          
      });
      });
      });
      });
   }()
};
