process.title = 'comp120-app';

var express = require('express'), http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var redis = require("redis");

var port = process.env.PORT || 3001;

server.listen(port, function(){
  console.log('Express server listening on ' + port);
});

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

io.on('connection', function (socket) {

  // subscribe to redis
  var subscribe = redis.createClient();
  subscribe.subscribe('incidents.create');

  // relay redis messages to connected socket
  subscribe.on("message", function(channel, message) {
    console.log("from rails to subscriber:", channel, message);
    socket.emit('message', message)
  });

  // unsubscribe from redis if session disconnects
  socket.on('disconnect', function () {
    console.log("user disconnected");

    subscribe.quit();
  });

});
