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