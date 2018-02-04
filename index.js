var express = require('express');
var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);


var firebase = require('firebase');
var apps = firebase.initializeApp({
        apiKey: "AIzaSyALxMopDDvh22l3VjU2q5gV-ekxIo2Plnw",
        authDomain: "mangohack-f5793.firebaseapp.com",
        databaseURL: "https://mangohack-f5793.firebaseio.com",
        projectId: "mangohack-f5793",
        storageBucket: "",
        messagingSenderId: "1081064810330"
});



server.listen(3542);


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


var client = [];
var count = 0;


var usernames = {};

var rooms = ['room1'];

io.sockets.on('connection', function (socket) {
    client.push(socket.id);
    count++;
    if (count === 1){

        socket.emit('updatechat', 'SERVER', 'wait for second player');

    }

    if (count === 2){

        socket.broadcast.to('room1').emit('updatechat', 'SERVER', ' get ready');
        socket.emit('updatechat', 'SERVER', 'get ready');
    }


    if (count >= 3) {
        socket.disconnect();

    }

    socket.on('adduser', function(username){
var c = socket.id;
            var i = 100;
            var random = Math.floor(new Date().getTime() / 1000 + i);
            var k = 'Users/users';
            firebase.database().ref(k).set({
                name: username
            });

        socket.username = username;
        socket.room = 'room1';
        usernames[username] = username;

        socket.join('room1');

        socket.emit('updatechat', 'SERVER', 'you have connected to room1');
        socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'room1');


    });

    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });



    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

