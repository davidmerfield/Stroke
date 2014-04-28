var app = function () {

  var gui = require('nw.gui'),
      fs = require('fs'),

      input = document.getElementById('input'), // captures the user's text input
      output = document.getElementById('output'), // renders the user's text input

      currentWindow = gui.Window.get(),

      windowView = 'index.html',
      windowPrefs = {
        position: 'mouse',
        title: 'Untitled',
        width: 712,
        height: 820,
        show: false,
        focus: false,
        frame: true,
        toolbar: false,
        min_width: 300,
        min_height: 200
      };

  document.fileName = undefined;
  document.filePath = undefined;

  // Listen for app keyboard shortcuts
  document.onkeydown = function (e) {
      
      var keyCode = e.which;

      // CMD + N
      if (keyCode === 78 && e.metaKey) {
          newFile();
      };

      // CMD + S
      if (keyCode === 83 && e.metaKey) {
          saveFile();
      };

      // CMD + O
      if (keyCode === 79 && e.metaKey) {
          openFile();
      };
  };

  function newFile (openFile) {

    var newX = currentWindow.x + 32,
        newY = currentWindow.y + 32;
        url = windowView + '?x=' + newX + '&y=' + newY;

    if (openFile) {
       url += '&openFile=true' // Tells the new window to open the select file interface
    }

    gui.Window.open(url, windowPrefs);
  }

  function openFile () {
     newFile(true);
  }

  function closeFile () {
    if (document.filePath !== undefined || output.innerHTML === '') {
      return this.close(true);  
    }
    
    var reallyClose = window.confirm("You have not yet saved your work. Do you still want to close this document?");
    
    if (reallyClose) {
      currentWindow.close(true);          
    } else {
      saveFile();
    };

  }

  function saveFile (callback) {

    var text = htmlToText(output.innerHTML);

    if (document.filePath) {
      return fs.writeFile(document.filePath, text, function(err) {
        if (err) throw err;
      })
    }

    filePicker('saveDialog', function(value){
      
      document.filePath = value;
      document.fileName = filePath.replace(/^.*[\\\/]/, '');

      fs.writeFile(document.filePath, text, function(err) {
        if (err) throw err;
        currentWindow.title = document.fileName;
      });

    });     
  }

  function readFile () {

    filePicker('openDialog', function(value){
      
      document.filePath = value;
      document.fileName = document.filePath.replace(/^.*[\\\/]/, '');
      
      if (fileIsOpen(document.filePath)) {
        var openWindow = fileIsOpen(document.filePath);
            openWindow.focus();
        return currentWindow.close(true);
      };

      fs.readFile(document.filePath, 'utf8', function(err, data) {

       if (err) throw err;
       currentWindow.title = document.fileName;

       input.innerHTML = htmlToText(data);
       output.innerHTML  = htmlToText(data);

      });
    })

  }

  function filePicker (id, callback) {
    var picker = document.getElementById(id);

    picker.addEventListener('change', function(e){

      return callback(this.value)

    }, false);

    picker.click();
  }

  function fileIsOpen (path) {

    for (var i in global.typewriterWindows) {

      var openWindow = global.typewriterWindows[i],
          openPath = global.typewriterWindows[i].window.document.filePath;

      if (openWindow === currentWindow) {continue};

      if (openPath === path) {return openWindow};
    }

    return false
  }

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

  function textToHTML (text) {
    text = '<p>' + text;
    text = text.replace(/[\n]/gi, "</p>");
    return text
  }

  function htmlToText (html) {
    html = html.replace(/<p>/gi, "");
    html = html.replace(/<\/p>/gi, "\n");
    html = html.replace(/&nbsp;/gi, "");
    html = html.replace(/\s<span class="strike">[^>]*<\/span>/g, '');
    html = html.replace(/<span class="strike">[^>]*<\/span>/g, '');
    html = html.replace(/<span>/gi, "");
    html = html.replace(/<\/span>/gi, "");
    return html
  }

  return function init () {

      var params = getParams();

      if (params.firstWindow) {
        alert('first window');
        global.typewriterWindows = [currentWindow];
      } else {
        global.typewriterWindows.push(currentWindow)
      }

      if (params.x && params.y) {
        currentWindow.x = parseInt(params.x);
        currentWindow.y = parseInt(params.y);
      }
      
      currentWindow.show();
      currentWindow.focus();

      if (params.openFile) {
        readFile();
      };

      currentWindow.on('close', closeFile);
  
    }();
}