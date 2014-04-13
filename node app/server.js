var config = require('./config'),
    express = require('express'),
    server = express(),
    page = require('./page'),
    
    // For sessions
    RedisStore = require('connect-redis')(express),
    redis = require("redis").createClient(),
    
    // For templating
    hogan = require('hogan-express');

server.configure(function(){

  // Avoids 404s on favicon requests. 
  server.use(express.favicon());
  
  // Serve contents of assets folder
  server.use("/public", express.static(__dirname + '/public'));
  
  // Look for templates in /views and complile them
  server.set('views', __dirname + '/public/html');
  server.set('view engine', 'html');
  server.engine('html', hogan);

  // Create and store sessions
  server.use(express.logger());
  server.use(express.bodyParser());
  server.use(express.cookieParser());
  server.use(express.session({
    secret: config.session_secret,
    store: new RedisStore({
      host: config.host,
      port: config.redis_port,
      client: redis,
      ttl: 86400 // session expires in this many seconds
    }) 
  }));

});

server.get('/', function(req, res){
   res.render('home')
});

server.post('/update', function(req, res){

   var slug = req.body.slug;
   var contents = req.body.contents;

   page.update(slug, contents, function(status){
      console.log('Entry ' + slug + ' updated...')
   });

});

server.get('/new', function(req, res){
  
  page.create(function(slug){
    
    // This is used by the 
    if (req.query.just_the_slug) {
      res.write(slug);
      res.end();
    } else {
      res.redirect('/' + slug);
    }
  });
});


server.get('/:slug', function(req, res){
   
   var slug = req.params.slug;

   page.get(slug, function(contents){
      res.locals.contents = contents;
      res.render('home')      
   });

});

// Exports the server
module.exports = server;