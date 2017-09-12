#!/usr/bin/nodejs

var app = require('express')(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	path = require('path');

// Serve static files
app
.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})
.get('/remote.js', function(req, res) {
	res.sendFile(__dirname + '/remote.js');
})
.get('/listener.js', function(req, res) {
	res.sendFile(__dirname + '/listener.js');
});

var registered_sockets = {};

io.sockets.on('connection', function(socket) {
    console.log("Register socket #" + socket.id);
	registered_sockets[socket.id] = true;
	
	// Unregister the socket
	socket.on('disconnect', function () {
        console.log("Unregister socket #" + socket.id);
        delete registered_sockets[socket.id];
	});

	// Broadcast commands to all registered sockets
	socket.on('command', function(command) {
        console.log("Broadcast command " + command);
        Object.keys(registered_sockets)
            .forEach(id => io.sockets.to(id).emit('command', command));
	});
});

server.listen(8080);
