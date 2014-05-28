window.desktopApp = (function () {

  var gui = require('nw.gui'), 
      fs = require('fs'), 

      defaultWindow = {
        position: 'center',
        title: 'Untitled',
        width: 712,
        height: 820,
        min_width: 300,
        min_height: 300,
        frame: true,
        toolbar: false,
        focus: false,
        show: false
      },

      windowView = 'index.html#',
      // the hash stops application cache freaking out when we pass params
      // see: https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache#Gotchas

      currentWindow, // refers to the app window this script will run in

      filePath; // refers to the file being edited in this window

  function init () {

    currentWindow = gui.Window.get();

    // Check if this is the first application window
    if (!global.typewriter) {

      if (isFirstWindow()) {

        drawMenuBar();        
      };
    };

    // Bind the handlers for window events
    currentWindow.on('close', closeWindow);
    currentWindow.on('blur', windowBlur);
    currentWindow.on('focus', windowFocus);

    // Retrieve any parameters passed to this window
    var params = getParams();

    // Set the window's title
    currentWindow.title = defaultWindow.title;

    // Set the window's size
    sizeWindow();

    // Set the window's position
    positionWindow(params);
    
    // Open the read file dialog if the user requested it
    if (params.openFile) {openFile()};

    // Listen for keyboard shortcuts
    document.onkeydown = keyBoardShortcuts;

    // Autosave when the document changes
    document.onkeyup = function (e) {if (filePath) {saveFile()}};
  };

  function newWindow (options) {

    // We pass the position of the current window to help position the new window
    var url = windowView + '?x=' + currentWindow.x + '&y=' + currentWindow.y;

    // Tells the new window to open the select file interface
    if (options && options.open) {url += '&openFile=true'};

    gui.Window.open(url, defaultWindow);
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
        global.typewriter.quit = true;
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
  };

  function removeWindow (currentWindow) {
    for (var i in global.typewriter.openWindows) {

      var openWindow = global.typewriter.openWindows[i];

      if (openWindow === currentWindow) {
        global.typewriter.openWindows.splice(i, 1);
        return 
      };
    }
  };

  function closeFile () {

    if (document.filePath === undefined && output.textContent.trim() !== '') {

      var reallyClose = window.confirm("You have not yet saved your work. Do you still want to close this document?");
      
      if (!reallyClose) {
        global.typewriter.quit = false;
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
          global.typewriter.quit = true;
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
      typewriter().setHTMLof(output).to(input);
      typewriter().setFocus(input);

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

    for (var i in global.typewriter.openWindows) {

      var openWindow = global.typewriter.openWindows[i],
          openPath = global.typewriter.openWindows[i].window.document.filePath;

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
  };

  function htmlToText (html) {
    
    var tmp = document.createElement('section');
        tmp.innerHTML = html;
    
    do {
        var strikes = tmp.getElementsByClassName('strike'),
            strikeLength = strikes.length;
        
        for (var i in strikes) {
            var strikeNode = strikes[i];
            if (strikeNode.parentNode) {strikeNode.parentNode.removeChild(strikeNode)}
        };
    } while (strikeLength > 0);
    
    html = tmp.innerHTML;
    
    html = html.replace(/<p>/gi, "");
    html = html.replace(/<\/p>/gi, "\n");
    html = html.replace(/&nbsp;/gi, " ");
    html = html.replace(/&#xfeff;/gi, " ");
    html = html.replace(/<span>/gi, "");
    html = html.replace(/<\/span>/gi, "");

    return html
  };

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

  };

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

  };

  function windowFocus () {    
    
    output.setAttribute('class', '');
    
    typewriter().setFocus(input);
    
    if (global.typewriter.quit) {currentWindow.close()}

  };

  function windowBlur () {
    output.setAttribute('class', 'blurred');
  };

  return init();
}