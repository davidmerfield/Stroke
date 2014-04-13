# HOGAN-EXPRESS

Mustache template engine for express 3.x. 

Use twitter's [hogan.js](https://github.com/twitter/hogan.js) engine.

Supports
  - partials 
  - layout
  - caching

### Install

`npm install hogan-express`

### Usage

Setup:
```
app.set('view engine', 'html')
app.set('layout', 'layout') # rendering by default
app.set('partials', head: "head") # partails using by default on all pages
app.enable('view cache')
app.engine 'html', require('hogan-express')
```

Rendering template:
```
app.get '/', (req,res)->
  res.locals = what: 'World'
  res.render "index", partials: {temp: 'temp'}
```
(will render `layout.html` with `index.html`, `head.html` and `temp.html` partials)

`{{{ yield }}}` variable in template means the place where your page are rendered inside the layout.

For render page with custom layout, just specify it in options `res.render "admin.html", layout: "admin-layout"`

### License
MIT License