var desktopApp = function () {

  var gui = require('nw.gui'),
      fs = require('fs'),

      input = document.getElementById('input'), // captures the user's text input
      output = document.getElementById('output'), // renders the user's text input

      currentWindow = gui.Window.get(),

      windowView = 'https://stroke.lllllllllllllllll.com/app/index.html#cache',

      windowPrefs = {
        position: 'center',
        title: 'Untitled',
        width: 712,
        height: 820,
        show: false,
        focus: false,
        frame: true,
        toolbar: false,
        min_width: 300,
        min_height: 300
      };

  document.fileName = undefined;
  document.filePath = undefined;

  // Listen for app keyboard shortcuts
  document.onkeydown = function (e) {
      
      var keyCode = e.which;

      // CMD + C
      if (keyCode == 67 && e.metaKey) {
        var clipboard = gui.Clipboard.get();
        clipboard.set(htmlToText(output.innerHTML), 'text');
      }

      // CMD + P 
      if (keyCode == 80 && e.metaKey) {
        printFile();
      };

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

      if (keyCode === 81 && e.metaKey) {
        e.preventDefault();
        setQuitState(true);
        closeFile();
      }
  };

  document.onkeyup = function (e) {
    if (document.filePath) {
      saveFile()
    }
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

  function removeWindow (currentWindow) {
    for (var i in global.windowManager) {

      var openWindow = global.windowManager[i];

      if (openWindow === currentWindow) {
        global.windowManager.splice(i, 1);
        return 
      };
    }
  }

  function closeFile () {

    if (document.filePath === undefined && output.textContent.trim() !== '') {

      var reallyClose = window.confirm("You have not yet saved your work. Do you still want to close this document?");
      
      if (!reallyClose) {
        setQuitState(false);
        return saveFile(true);               
      }

    } 

    removeWindow(currentWindow);
    return currentWindow.close(true);   
      
  
  }

  function saveFile (thenClose) {

    var text = htmlToText(output.innerHTML);

    if (document.filePath !== undefined) {
      return fs.writeFile(document.filePath, text, function(err) {
        if (err) throw err;
      })
    }

    filePicker('saveDialog', function(value){
      
      document.filePath = value;
      document.fileName = document.filePath.replace(/^.*[\\\/]/, '');

      fs.writeFile(document.filePath, text, function(err) {
        if (err) throw err;
        if (thenClose) {
          setQuitState(true);
          currentWindow.close(true);
        }
        currentWindow.title = document.fileName;
      });

    });     
  }

  function updateFile (filePath) {
    
    if (!filePath && document.filePath !== undefined) {
      var filePath = document.filePath
    } 

    fs.readFile(filePath, 'utf8', function(err, data) {

      if (err) throw err;

      input.innerHTML = textToHTML(data);
      stroke().setHTMLof(output).to(input);
      stroke().setFocus(input);

    });

  }

  function printFile () {
    window.print();
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

      currentWindow.title = document.fileName;

      updateFile(document.filePath);

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

    for (var i in global.windowManager) {

      var openWindow = global.windowManager[i],
          openPath = global.windowManager[i].window.document.filePath;

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
         label: 'Print             ⌘P',
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
    if (location.hash) {
        var parts = location.hash.substring(7).split('&');

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
    text = text.replace(/[\n]/gi, "</p><p>");
    text = text + '&#xfeff;</p>';
    if (text.substring(text.length - 15) === '<p>&#xfeff;</p>') {
      text = text.substring(0, text.length - 15);
    }
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

  function sizeWindow () {

    var screenWidth = currentWindow.window.screen.width,
        screenHeight = currentWindow.window.screen.height;

    // Moves window to center, and on screen
    if (screenHeight*0.90 < currentWindow.height) {
      currentWindow.height = screenHeight*0.75;
      currentWindow.width = screenHeight*0.6;
    } else {
      currentWindow.width = windowPrefs.width;
      currentWindow.height = windowPrefs.height;
    }

    currentWindow.setMinimumSize(windowPrefs.min_width, windowPrefs.min_height);

  }

  function positionWindow (params) {

    if (params.x && params.y) {
      currentWindow.x = parseInt(params.x);
      return currentWindow.y = parseInt(params.y);
    }

    var screenWidth = currentWindow.window.screen.width,
        screenHeight = currentWindow.window.screen.height;

    currentWindow.x = (screenWidth - currentWindow.width)/2;
    currentWindow.y = (screenHeight - currentWindow.height)/2;

    // Ensure frame is always visible      
    if (currentWindow.y < 22) { // 22 is height of apple menu bar
      currentWindow.y = 22
    }

    if (currentWindow.x < 0) {
      currentWindow.x = 0
    }

  }

  function setQuitState (state) {
    global.strokeQuit = state;
  }

  function getQuitState () {
    return global.strokeQuit
  }

  return function init () {

      var params = getParams();

      if (global.windowManager) {
        global.windowManager.push(currentWindow)
      } else {
        buildMenu();
        global.windowManager = [currentWindow];
        setQuitState(false)
      }

      sizeWindow();
      positionWindow(params);
      
      currentWindow.title = windowPrefs.title;

      // We've got the window in a good spot, show it
      currentWindow.show();
      currentWindow.focus();
      
      if (params.openFile) {
        readFile();
      };

      currentWindow.on('close', closeFile);

      currentWindow.on('blur', function(){
        output.setAttribute('class', 'blurred')
      });
      
      currentWindow.on('focus', function(){

        output.setAttribute('class', '');
        stroke().setFocus(input);
        if (getQuitState()) {currentWindow.close()}

      });

    }();
}