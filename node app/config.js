config = {
   
   server_port: 3030,
   redis_port: 6379,

   // Used to encode sessions
   session_secret: "foobat1234"
}


if (process.argv[2] == "production") {
   config.environment = "production";
   config.host = "foo.com";
} else {
   config.environment = "local",   
   config.host = "localhost:" + config.server_port;
}

module.exports = config;