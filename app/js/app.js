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

  function openFile () {

    openFilePicker('readFile', function(value){
      
      filePath = value;

      // Check if this file is already open
      if (global.typewriter.openFiles[filePath]) {
        
        // If so focus the window editing it
        global.typewriter.openFiles[filePath].focus(); 

        // And close this window
        return currentWindow.close(true);
      };

      // Update this window's title 
      currentWindow.title = fileNameFrom(filePath);
      
      // Let other windows know this file is open
      global.typewriter.openFiles[filePath] = currentWindow;
      
      // Populate the typewriter with the contents of the file
      readFile();

    });
  };

  function saveFile (callback) {

    // If we have a filepath, write the data there
    if (filePath) {

      // Get the text to save to disk
      var text = htmlToText(typewriter.getHTMLof('output'));
    
      return fs.writeFile(filePath, text, function(err){
        
        if (err) {throw(err)};

        if (callback) {return callback()};
      });
    };

    // Otherwise ask the user to pick a location to save the file
    openFilePicker('saveFile', function(value){
      
      filePath = value;

      // If we just overwrote a file already open, close that window
      if (global.typewriter.openFiles[filePath]) {
        global.typewriter.openFiles[filePath].close(true);
      };

      // Let other windows know the file is open in this window
      global.typewriter.openFiles[filePath] = currentWindow;

      // Update the window title
      currentWindow.title = fileNameFrom(filePath);

      // Save the file's contents to disk
      return saveFile(callback);
    });     
  };

  function closeWindow (options) {

    // If we're quitting, let other windows know too
    if (options && options.quit) {global.typewriter.quit = true};

    var closeConfirmation = "You have not yet saved your work. Do you still want to close this document?";

    // Check if the user wants to save the file
    if (!filePath && !typewriter.isEmpty() && !window.confirm(closeConfirmation)) {
      
      // If so then pause the quit process
      global.typewriter.quit = false

      // and save the file
      return saveFile(function() {

        // If the file was saved, then resume quitting
        closeWindow({quit: true})
      });               
    };

    // Let other windows know this file is no longer open
    if (filePath) {delete global.typewriter.openFiles[filePath]};

    // And finally close this window
    return currentWindow.close(true);   
  };

  function readFile () {   

    // No file to read!
    if (!filePath) {return};

    fs.readFile(filePath, 'utf8', function(err, data) {

      if (err) throw err;

      typewriter.setContents(textToHTML(data));
    });
  };

  // Used to read and save files
  function openFilePicker (id, callback) {

    var picker = document.getElementById(id);

    picker.addEventListener('change', function(e){
      return callback(this.value)
    }, false);

    picker.click();
  };

  // Adds any selected text to keyboard
  function copytext () {
    if (selectedText()) {
      var clipboard = gui.Clipboard.get(),
          text = selectedText().toString();

      return clipboard.set(text, 'text');
    };
  };

  function drawMenuBar () {

    var file = new gui.Menu();

    file.append(new gui.MenuItem({
      label: 'New             ⌘N',
      click: function () {focussedWindow().desktopApp.newWindow()}
    }));

    file.append(new gui.MenuItem({
      label: 'Open…\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A\u200A⌘O',
      click: function() {focussedWindow().desktopApp.newWindow({open: true})}
    }));

    file.append(new gui.MenuItem({
      label: 'Save\u200A\u200A            ⌘S',
      click: function() {focussedWindow().desktopApp.saveFile()}
    }));

    file.append(new gui.MenuItem({
      type: 'separator'
    }));

    file.append(new gui.MenuItem({
      label: 'Print\u200A\u200A\u200A\u200A           ⌘P',
      click: function() {focussedWindow().window.print()}
    }));

    currentWindow.menu = new gui.Menu({type: 'menubar'});
    currentWindow.menu.insert(new gui.MenuItem({ label: 'File', submenu: file}), 1);
  };

  function keyBoardShortcuts (e) {
      
    var keyCode = e.which;

    if (e.metaKey) {
      
      // CMD + C
      if (keyCode == 67) {
        copytext();
      };

      // CMD + N
      if (keyCode === 78) {
        newWindow();
      };

      // CMD + O
      if (keyCode === 79) {
        newWindow({open: true});
      };

      // CMD + P 
      if (keyCode == 80) {
        window.print();
      };

      // CMD + Q
      if (keyCode === 81) {
        e.preventDefault();        
        closeWindow({quit: true});
      };

      // CMD + S
      if (keyCode === 83) {
        saveFile();
      };
    };
  };

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