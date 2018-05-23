# socketio-chat-sample
Socket.IO enables real-time bidirectional event-based communication. It consists in:

* Node.js server (this repository)
* Javascript client library for the browser (or a Node.js client)
##  Installation
```js
npm install socket.io express ejs --save
```
## How to use
The following example attaches socket.io to a plain Node.JS HTTP server listening on port 50000.
```js
var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(client){
  client.on('event', function(data){});
  client.on('disconnect', function(){});
});
server.listen(50000);
```
## Standalone
```js
var io = require('socket.io')();
io.on('connection', function(client){});
io.listen(50000);
```
## In conjunction with Express
Starting with 3.0, express applications have become request handler functions that you pass to http or http Server instances. You need to pass the Server to socket.io, and not the express application function. Also make sure to call .listen on the server, not the app.
```js
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(){ /* … */ });
server.listen(50000);
```

## Debug / logging
Socket.IO is powered by debug. In order to see all the debug output, run your app with the environment variable DEBUG including the desired scope.

To see the output from all of Socket.IO's debugging scopes you can use:
```js
DEBUG=socket.io* node myapp
```

## How to run
```js
node server.js
```
