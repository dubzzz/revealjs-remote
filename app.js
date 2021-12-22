#!/usr/bin/nodejs
const express = require('express');
const fs = require('fs');
const fsPromise = require('fs/promises');
const concat = require('concat');
require('dotenv').config()

var context = process.env.CONTEXT;

function appendConfigIntoFile(appendConfigData, originaleFilePath, destinationFilePath) {
	fs.readFile(originaleFilePath, { encoding: 'utf8' }, (err, currentFileData) => {
		const newData = appendConfigData + '\r\n' + currentFileData;
		fs.writeFileSync(destinationFilePath, newData, 'utf8');
	});
}

const appendConfigData = 'var context = "' + context + '";\r\nvar uriRevealJS = "' + process.env.URI_REVEALJS + '";';
appendConfigIntoFile(appendConfigData, __dirname + '/remote.js', __dirname + '/static/remote/remote.js');
appendConfigIntoFile(appendConfigData, __dirname + '/listener.js', __dirname + '/static/presenter/listener.js');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
	path: context + '/socket.io',
	cors: {
		origin: process.env.URI_REVEALJS_REMOTE,
		methods: ["GET", "POST"],
		credentials: true
	}
});

// Serve static files
app
	.get(context + '/', function (req, res) {
		res.sendFile(__dirname + '/index.html');
	})
	.get(context + '/hammer.min.js', function (req, res) {
		res.sendFile(__dirname + '/static/remote/hammer.min.js');
	})
	.get(context + '/html2canvas.min.js', function (req, res) {
		res.sendFile(__dirname + '/static/presenter/html2canvas.min.js');
	})
	.get(context + '/remote.js', function (req, res) {
		res.sendFile(__dirname + '/static/remote/remote.js');
	})
	.get(context + '/remote.css', function (req, res) {
		res.sendFile(__dirname + '/static/remote/remote.css');
	})
	.get(context + '/listener.js', function (req, res) {
		res.sendFile(__dirname + '/static/presenter/listener.js');
	})
	;

var current_presenter = null;
var last_screenshot = null;
var registered_sockets = {};

io.of('/').on('connection', function (socket) {
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
	socket.on('register', function (type) {
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
	socket.on('command', function (command) {
		if (!current_presenter) {
			console.log("Send command " + command + ": canceled");
			return;
		}
		console.log("Send command " + command);
		io.sockets.to(current_presenter).emit('command', command);
	});

	// Broadcast commands to all registered remotes
	socket.on('screenshot', function (data) {
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
