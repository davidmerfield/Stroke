var app = function () {

   var input = document.getElementById('input'), // captures the user's text input
       output = document.getElementById('output'); // renders the user's text input

    var gui = require('nw.gui'),
        fs = require('fs'),
        windowPrefs = {
            title: "New document",
            position: 'center',
            title: 'Untitled',
            width: 640,
            height: 800,
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
            label: 'New       N',
            click: function() {
            return newFile()
            }
        }));

        file.append(new gui.MenuItem({
            label: 'Open       O',
            click: function() {
              return openFile()
            }
        }));

        file.append(new gui.MenuItem({
            label: 'Save        S',
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
        // See this for more control over the window
        // https://github.com/rogerwang/node-webkit/wiki/Preserve-window-state-between-sessions

        var newWindow = gui.Window.open('index.html', windowPrefs);
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

            console.log(this);
              
             //  var path = this.value,
             //    output = window.document.getElementById('output'),
             //        data = output.textContent;

             // window.alert(path);

             //  fs.writeFile(path, data, function(err) {
             //                          if (err) throw err;
             //                          console.log('writeFile succeeded.');
             //    });

            }, false);

            chooser.click();  
          }
          chooseFile('#saveDialog');

    }
    
    function printFile() {

    }

    function openFile () {

        function chooseFile(name) {
            var chooser = document.querySelector(name);
            chooser.addEventListener("change", function(evt) {
              console.log(this.value);
            }, false);

            chooser.click();  
          }
          chooseFile('#fileDialog');


    }

    return function init () {

        buildMenu();
        gui.Window.get().focus();
        
    }();

}

exports.app = app