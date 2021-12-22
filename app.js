#!/usr/bin/nodejs
const express = require('express');
const fs = require('fs');
const concat = require('concat');

var context = "";

concat([__dirname + '/config.js', __dirname + '/remote.js'], __dirname + '/static/remote/remote.js');
concat([__dirname + '/config.js', __dirname + '/listener.js'], __dirname + '/static/presenter/listener.js');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, { 
	path: context+'/socket.io',
	cors: {
		origin: "http://localhost:8008",
		methods: ["GET", "POST"],
		credentials: true
	}
});
/*var io = require('socket.io')();
io.path(context+'/socket.io');
io.listen(server);*/

// Serve static files
app
.get(context+'/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})
.get(context+'/hammer.min.js', function(req, res) {
    res.sendFile(__dirname + '/static/remote/hammer.min.js');
})
.get(context+'/html2canvas.min.js', function(req, res) {
    res.sendFile(__dirname + '/static/presenter/html2canvas.min.js');
})
.get(context+'/remote.js', function(req, res) {
    res.sendFile(__dirname + '/static/remote/remote.js');
})
.get(context+'/remote.css', function(req, res) {
    res.sendFile(__dirname + '/static/remote/remote.css');
})
.get(context+'/listener.js', function(req, res) {
    res.sendFile(__dirname + '/static/presenter/listener.js');
})
;

var current_presenter = null;
var last_screenshot = null;
var registered_sockets = {};

io.of(context+'/').on('connection', function(socket) {
    console.log("Register socket #" + socket.id);
	registered_sockets[socket.id] = {
		'display-screenshots': false,
		'presenter': false,
	};
	
	// Unregister the socket
	socket.on('disconnect', function () {
		console.log("Unregister socket #" + socket.id);
		if (current_presenter == socket.id) {
			current_presenter = Object.keys(registered_sockets)
					.find(id => registered_sockets[id]['presenter']) || null;
		}
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
				current_presenter = socket.id;
			default:
				console.log("Unknown registration type for socket #" + socket.id);
				break;			
		}
	});
	
	// Broadcast commands to all registered sockets
	socket.on('command', function(command) {
		if (! current_presenter) {
			console.log("Send command " + command + ": canceled");
			return;
		}
		console.log("Send command " + command);
		io.sockets.to(current_presenter).emit('command', command);
	});
	
	// Broadcast commands to all registered remotes
	socket.on('screenshot', function(data) {
		if (socket.id != current_presenter) {
			console.log("Broadcast screenshot: canceled")
			return;
		}
		console.log("Broadcast screenshot");
		last_screenshot = data;
		Object.keys(registered_sockets)
			.filter(id => registered_sockets[id]['display-screenshots'])
			.forEach(id => io.sockets.to(id).emit('screenshot', data));
	});
});

server.listen(8080);
