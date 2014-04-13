var client = require("redis").createClient(),
    prefix = "page";

var page = {
   
   // this should check the db for collisions
   create: function(callback) {

      function generate_slug () {
         
         // Generate random 6 character alphanumeric string
         var slug = Math.random().toString(36).slice(2, 8);

         // Check slug's uniqueness
         client.get(prefix + ":" + slug, function(status, contents){
            
            // Slug is unique
            if (contents !== "") {return callback(slug)}
            
            // Slug is already in use
            generate_slug();
         });   
      };

      generate_slug();
   },

   update: function(slug, contents, callback) {
      client.set(prefix + ":" + slug, contents, function(status){
         if (status) {console.log(status)};
         return callback();
      });
   },

   get: function(slug, callback) {
      client.get(prefix + ":" + slug, function(status, contents){
         return callback(contents);
      })
   }
}

module.exports = page;