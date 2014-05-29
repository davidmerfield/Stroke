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
    if (isFirstWindow()) {

      // If so draw the menu bar
      bindMenuBar();
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
      readFile(filePath, function (text){

        typewriter.setContents(textToHTML(text));

      });

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

  function readFile (filePath, callback) {   

    // No file to read!
    if (!filePath) {
      return callback(false)
    };

    fs.readFile(filePath, 'utf8', function(err, data) {

      if (err) throw err;

      return callback(data);
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

  // if the window which draws the menu bar is closed,
  // then thesefunctions wont work
  function bindMenuBar () {

    var file = new gui.Menu();

    // I wrote http://jsfiddle.net/DpgQy/ for generating menu labels of the right width

    file.append(new gui.MenuItem({
      label: 'New                       ⌘N',
      click: function() {newWindow()}
    }));

    file.append(new gui.MenuItem({
      label: 'Open...           ⌘O',
      click: function() {newWindow({open: true})}
    }));

    file.append(new gui.MenuItem({
      label: 'Save                      ⌘S',
      click: function() {saveFile()}
    }));

    file.append(new gui.MenuItem({
      type: 'separator'
    }));

    file.append(new gui.MenuItem({
      label: 'Print                      ⌘P',
      click: function() {window.print()}
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

  // Produces a dictionary from a series of url parameters
  function getParams () {
    var params = {};
    if (location.hash) {

        var hasParams = location.hash.indexOf('?');

        if (hasParams > -1) {var parts = location.hash.slice(hasParams + 1)}

        parts = parts.split('&');

        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=');
            if (!nv[0]) continue;
            params[nv[0]] = nv[1] || true;
        }
    };
    return params
  };

  // takes text, returns html with p tags etc.
  function textToHTML (text) {

    if (!text) {var text = ''};

    text = '<p>' + text;
    text = text.replace(/[\n]/gi, "</p><p>");
    if (text.slice(-3) === '<p>') {
      text = text.slice(0, -3)
    };
    return text
  };

  // takes html, removes struck out text then returns text with newlines etc
  function htmlToText (html) {
    html = removeStrikes(html);
    html = html.replace(/<p>/gi, "");
    html = html.replace(/<\/p>/gi, "\n");
    html = html.replace(/&nbsp;/gi, " ");
    html = html.replace(/&#xfeff;/gi, " ");
    html = html.replace(/<span>/gi, "");
    html = html.replace(/<\/span>/gi, "");
    return html
  };

  function removeStrikes(html) {
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
    
    return tmp.innerHTML;
  };

  // Ensures window fits on screen
  function sizeWindow () {

    var screenWidth = currentWindow.window.screen.width,
        screenHeight = currentWindow.window.screen.height;

    if (screenHeight*0.90 < currentWindow.height) {
      currentWindow.height = screenHeight*0.75;
      currentWindow.width = screenHeight*0.6;
    } else {
      currentWindow.width = defaultWindow.width;
      currentWindow.height = defaultWindow.height;
    }

    currentWindow.setMinimumSize(defaultWindow.min_width, defaultWindow.min_height);

  };

  // Centers then shows the window
  function positionWindow (params) {

    // x and y distance in pixels of new window from old window
    var newWindowOffset = 32;

    // Ensure the window is not on screen
    currentWindow.x = -10000;
    currentWindow.y = -10000;

    // Make the window visible
    currentWindow.show();

    // Set the focus on the window
    currentWindow.focus();

    // Move the window to the passed preference
    if (params.x && params.y) {
      currentWindow.x = parseInt(params.x) + newWindowOffset;
      return currentWindow.y = parseInt(params.y) + newWindowOffset;
    }

    var screenWidth = currentWindow.window.screen.width,
        screenHeight = currentWindow.window.screen.height;

    // Center the window
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

    // make sure the menu bar functions apply to this window
    bindMenuBar(); // this sometimes causes flashing 

    // let other windows know this window is in focus
    global.typewriter.focussedWindow = currentWindow;

    // Determine whether or not to close this window
    if (global.typewriter.quit) {currentWindow.close()};

    // make the caret visible
    typewriter.enableCaret();

  };

  function focussedWindow () {
    return global.typewriter.focussedWindow.window
  };

  // set up global object for first window
  function isFirstWindow () {
    
    if (!global.typewriter) {
      
      // used to prevent same file open in multiple windows
      global.typewriter = {openFiles: {}};

      return true
    } else {
      return false
    };
  };

  function windowBlur () {
    typewriter.disableCaret();
  };
  
  function selectedText() {
     var selection = window.getSelection();
     return selection.type === 'Range' ? selection : false;
  };

  function fileNameFrom (path) {
    return path.replace(/^.*[\\\/]/, '')
  };

  return {
    init: init,
    newWindow: newWindow,
    closeWindow: closeWindow,
    saveFile: saveFile
  };
}());