const express = require('express');
const app = express();

const mongo = require('mongodb').MongoClient;
const dsn = 'mongodb://localhost:27017';
const colName = 'history';

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// io.origins(['https://ml-jsramverk.me:443']);

async function insertToCollection(msg) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const result = await col.insertOne({ message: msg });
    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );
    await client.close();
}

io.on('connection', async function(socket) {
    let chatArr = [];

    socket.on('user connecting', async function(user) {
        console.info('user connected', user);
        let data = `[${user.time}] User ${user.user} has connected`;

        chatArr.push(data);
        io.emit('user broadcast', chatArr);
        await insertToCollection(data).catch(console.dir);
    });

    socket.on('chat message', async function (message) {
        console.info('chat message', message);
        let data = `[${message.time}] ${message.user}: ${message.message}`;

        chatArr.push(data);
        io.emit('chat message', chatArr);
        await insertToCollection(data).catch(console.dir);
    });
});

console.log("Server up and running on port 8300");
server.listen(8300);
