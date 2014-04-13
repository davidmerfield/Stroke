var config   = require('./config'),
    server   = require('./server');

server.listen(config.server_port);
console.log('Listening on ' + config.server_port);
