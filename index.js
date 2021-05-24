'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8081,'125.216.247.39');

var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }


  socket.on('message', function(message,userID,room) {
    log('Client said: ', message,userID);
    // for a real app, would be room-only (not broadcast)
    io.sockets.in(room).emit('message', message,userID);
  });

  socket.on('say', function (room,data) {
    io.sockets.in(room).emit(data)
  });
  
  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + -' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } 
    else if (numClients>1&&numClients<6) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      socket.join(room);
      io.sockets.in(room).emit('join', room);
    } 
    else {
      socket.emit('full', room);
    }
  });


});
