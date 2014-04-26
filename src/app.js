var app = function () {

    var gui = global.window.nwDispatcher.requireNwGui(),
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


    window.document.onkeydown = function (e) {
        
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
            label: 'New',
            click: function() {
            return newFile()
            }
        }));

        file.append(new gui.MenuItem({
            label: 'Open',
            click: function() {
              return openFile()
            }
        }));

        file.append(new gui.MenuItem({
            label: 'Save',
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

    function saveFile () {

        function chooseFile(name) {
            var chooser = document.querySelector(name);
            chooser.addEventListener("change", function(evt) {
              
              var path = this.value,
                output = document.getElementById('output'),
                    data = output.textContent;


              fs.writeFile(path, data, function(err) {
                                      if (err) throw err;
                                      console.log('writeFile succeeded.');
                });

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