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

var last_screenshot = null;
var registered_sockets = {};

io.sockets.on('connection', function(socket) {
    console.log("Register socket #" + socket.id);
	registered_sockets[socket.id] = {
		'display-screenshots': false,
		'presenter': false,
	};
	
	// Unregister the socket
	socket.on('disconnect', function () {
        console.log("Unregister socket #" + socket.id);
		delete registered_sockets[socket.id];
	});

	// Register
	socket.on('register', function(type) {
		switch (type) {
			case "display-screenshots":
				console.log("Register '" + type + "' on socket #" + socket.id);
				registered_sockets[socket.id]['display-screenshots'] = true;
				io.sockets.to(socket.id).emit('screenshot', last_screenshot);
				break;
			case "presenter":
				console.log("Register '" + type + "' on socket #" + socket.id);
				registered_sockets[socket.id]['presenter'] = true;
			default:
				console.log("Unknown registration type for socket #" + socket.id);
				break;			
		}
	});
	
	// Broadcast commands to all registered sockets
	socket.on('command', function(command) {
		console.log("Broadcast command " + command);
		Object.keys(registered_sockets)
			.filter(id => registered_sockets[id]['presenter'])
			.forEach(id => io.sockets.to(id).emit('command', command));
	});
	
	// Broadcast commands to all registered remotes
	socket.on('screenshot', function(data) {
		console.log("Broadcast screenshot");
		last_screenshot = data;
		Object.keys(registered_sockets)
			.filter(id => registered_sockets[id]['display-screenshots'])
			.forEach(id => io.sockets.to(id).emit('screenshot', data));
	});
});

server.listen(8080);
