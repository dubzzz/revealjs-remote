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
.get('/hammer.min.js', function(req, res) {
	res.sendFile(__dirname + '/hammer.min.js');
})
.get('/html2canvas.min.js', function(req, res) {
	res.sendFile(__dirname + '/html2canvas.min.js');
})
.get('/remote.js', function(req, res) {
	res.sendFile(__dirname + '/remote.js');
})
.get('/remote.css', function(req, res) {
	res.sendFile(__dirname + '/remote.css');
})
.get('/listener.js', function(req, res) {
	res.sendFile(__dirname + '/listener.js');
});

var registered_sockets = {};
var registered_remotes = {};

io.sockets.on('connection', function(socket) {
    console.log("Register socket #" + socket.id);
	registered_sockets[socket.id] = true;
	
	// Unregister the socket
	socket.on('disconnect', function () {
        console.log("Unregister socket #" + socket.id);
		delete registered_sockets[socket.id];
		delete registered_remotes[socket.id];
	});

	// Register
	socket.on('register', function(type) {
		if (type == "remote") {
			console.log("Register remote on socket #" + socket.id);
			registered_remotes[socket.id] = true;
		}
		else {
			console.log("Unknown registration type for socket #" + socket.id);
		}
	});
	
		// Broadcast commands to all registered sockets
		socket.on('command', function(command) {
			console.log("Broadcast command " + command);
			Object.keys(registered_sockets)
				.forEach(id => io.sockets.to(id).emit('command', command));
		});
		
		// Broadcast commands to all registered remotes
		socket.on('screenshot', function(data) {
			console.log("Broadcast screenshot");
			Object.keys(registered_remotes)
				.forEach(id => io.sockets.to(id).emit('screenshot', data));
		});
});

server.listen(8080);
