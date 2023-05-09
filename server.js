//server

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const users = []; //store all online user's name

app.use('/', express.static(__dirname + '/public', {index: 'communication.html'}));
// app.get('/public', (req, res) => {
//     res.sendFile(__dirname + "/communication.html");
// });

server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
  });

//socket part
io.sockets.on('connection', function(socket) {
    //user enter room and set username
    socket.on('login', function(username) {
        if (users.indexOf(username) > -1) {
            socket.emit('nameExisted');
        }
        else {
            socket.userIndex = users.length;
            socket.username = username;
            users.push(username);
            socket.emit('loginSuccess');
            const arrStr = JSON.stringify(users);
            io.sockets.emit('system', username, arrStr, 'login'); //emit user's name to all online users
        }
    });

    //user leave
    socket.on('disconnect', function() {
        //delete user who leave from users
        users.splice(socket.userIndex, 1);
        const arrStr = JSON.stringify(users);
        //anounce online user
        socket.broadcast.emit('system', socket.username, arrStr, 'logout');
    });

    //reveive new message
    socket.on('userMsg', function(msg) {
        //send message to all users except for me
        socket.broadcast.emit('userMsg', socket.username, msg, 'other');
    });

    //receive the event of typing
    socket.on('typing', function() {
        //send typing event to all users
        io.emit('typing', socket.username);
    });

    //receive the event of stoping
    socket.on('noTyping', function(){
        io.emit('noTyping', socket.username);
    })
})
