var app = function () {

   var input = document.getElementById('input'), // captures the user's text input
       output = document.getElementById('output'); // renders the user's text input

    var gui = require('nw.gui'),
        fs = require('fs'),
        windowPrefs = {
          position: 'mouse',
          title: 'Untitled',
          width: 712,
          height: 820,
          show: false,
          frame: true,
          focus: false,
          toolbar: false
        };

   var fileName= undefined;
       filePath = undefined;

    document.onkeydown = function (e) {
        
        var keyCode = e.which;

        if (keyCode === 78 && e.metaKey) {
            newFile();
        };

        if (keyCode === 83 && e.metaKey) {
            saveFile();
        };

        if (keyCode === 79 && e.metaKey) {
            openFile();
        };
    };

    function buildMenu () {
        var menubar = new gui.Menu({ type: 'menubar' });
        var file = new gui.Menu();
        var win = gui.Window.get();

        file.append(new gui.MenuItem({
            label: 'New             ⌘N',
            click: function() {
            return newFile()
            }
        }));

        file.append(new gui.MenuItem({
            label: 'Open           ⌘O',
            click: function() {
              return openFile()
            }
        }));

        file.append(new gui.MenuItem({
            label: 'Save             ⌘S',
            click: function() {
              return saveFile()
            }
        }));
        
        file.append(new gui.MenuItem({ type: 'separator' }));

        file.append(new gui.MenuItem({
            label: 'Print',
            click: function() {
              return printFile()
            }
        }));

        var help = new gui.Menu();

        win.menu = menubar;
        win.menu.insert(new gui.MenuItem({ label: 'File', submenu: file}), 1);
        win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));


    }

    function newFile () {

      var win = gui.Window.get();

      var newX = win.x;
          newX += 32;

      var newY = win.y;
          newY += 32;

      gui.Window.open('index.html?newWindow=true&x=' + newX + '&y=' + newY, windowPrefs)    

    }

    function strip(html)
    {
       var tmp = window.document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }

   function getHTML (str) {
      str = '<p>' + str;
      str = str.replace(/[\n]/gi, "</p>");
      return str
   }

   function getText () {
      var str = output.innerHTML;
      str = str.replace(/<p>/gi, "");
      str = str.replace(/<\/p>/gi, "\n");
      str = str.replace(/&nbsp;/gi, "");
      str = str.replace(/\s<span class="strike">[^>]*<\/span>/g, '');
      str = str.replace(/<span class="strike">[^>]*<\/span>/g, '');
      str = str.replace(/<span>/gi, "");
      str = str.replace(/<\/span>/gi, "");
      return str
   }

   function saveFile (callback) {

      var data = getText();

      if (!filePath) {
         chooseFile('#saveDialog');
      } else {
         fs.writeFile(filePath, data, function(err) {
           if (err) throw err;

           if (callback) {
            return callback()
           }

           console.log('writeFile succeeded.');
         });         
      }

     function chooseFile(name) {
         var chooser = document.querySelector(name);
         chooser.addEventListener("change", function(evt) {
           
           var path = this.value;

            fs.writeFile(path, data, function(err) {
              if (err) throw err;
              filePath = path;
              fileName = filePath.replace(/^.*[\\\/]/, '');
              win = gui.Window.get();
              win.title = fileName;

              console.log('writeFile succeeded.');
            });

         }, false);

         chooser.click();  
       }
       

   }

  function getParams () {
    var params = {};
    if (location.search) {
        var parts = location.search.substring(1).split('&');

        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=');
            if (!nv[0]) continue;
            params[nv[0]] = nv[1] || true;
        }
    }
    return params
  };

  function openFile () {
    var win = gui.Window.get();

    var newX = win.x;
        newX += 32;

    var newY = win.y;
        newY += 32;

      var newWindow = gui.Window.open('index.html?open=true&x=' + newX + '&y=' + newY, windowPrefs);
  };

  function readFile () {

        chooseFile('#openDialog');

        function chooseFile(name) {
            var chooser = document.querySelector(name);
            chooser.addEventListener("change", function(evt) {

              filePath = this.value;
              fileName = filePath.replace(/^.*[\\\/]/, '');
              
              for (var i in global.openFiles) {
                if (global.openFiles[i] === filePath) {
                  return confirm( fileName + ' is already open in Typewriter.');
                }
              }

              fs.readFile(filePath, 'utf8', function(err, data) {

               if (err) throw err;
               win = gui.Window.get();
               win.title = fileName;

               input.innerHTML = getHTML(data);
               output.innerHTML  = getHTML(data);

               global.openFiles.push(filePath);

              });

            }, false);

            chooser.click();  
          }


    }

    return function init () {

      buildMenu();

      var currentWindow = gui.Window.get();

      // first app window
      if (!getParams().newWindow && !getParams().open) {
        global.openFiles = [];
      } 

      if (getParams().x && getParams().y) {
        var toX = parseInt(getParams().x);
        var toY = parseInt(getParams().y);                
        currentWindow.y = toY;
        currentWindow.x = toX;
      }
      
      currentWindow.show();
      currentWindow.focus();

      currentWindow.on('close', function(){
        if (filePath !== undefined || getText() === '') {
          return this.close(true);  
        }
        
        var reallyClose = window.confirm("You have not yet saved your work. Do you still want to close this document?");
        if (reallyClose) {
          this.close(true);          
        } else {
          saveFile();
        }          
      
      });

      if (getParams().open) {
        readFile();
      };

  
    }();

}