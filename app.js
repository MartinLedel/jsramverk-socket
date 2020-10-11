const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.origins(['https://ml-jsramverk.me/:443']);

function chatLimit(chat, data) {
    if (chat.length >= 5) {
        console.log(chat[0]);
        chat.splice(0, 1, data);
    } else {
        chat.push(data);
    }

    return chat;
}

io.on('connection', function(socket) {
    let chatArr = [];

    socket.on('user connecting', function(user) {
        console.info('user connected', user);
        let data = "[" + user.time + " User " + user.user + " connected]";

        chatArr = chatLimit(chatArr, data);
        io.emit('user broadcast', chatArr);
    });

    socket.on('chat message', function (message) {
        console.info('chat message', message);
        let data = "[" + message.time + "] " + message.user + ": " + message.message;

        chatArr = chatLimit(chatArr, data);
        io.emit('chat message', chatArr);
    });
});

server.listen(8300);
