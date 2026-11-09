const path = require('node:path');
const http = require('node:http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const history = [];
const MAX_HISTORY = 50;
const users = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
    socket.emit('chat:history', history);
    io.emit('presence:count', users.size);

    socket.on('user:join', (rawName) => {
        const name = String(rawName || '').trim().slice(0, 24) || 'Гість';
        users.set(socket.id, name);
        socket.data.name = name;
        io.emit('presence:count', users.size);
        io.emit('chat:notice', { text: `${name} приєднався до чату` });
    });

    socket.on('message:send', (rawText) => {
        const text = String(rawText || '').trim().slice(0, 1000);
        if (!text || !socket.data.name) return;
        const message = {
            id: `${Date.now()}-${socket.id}`,
            name: socket.data.name,
            text,
            time: new Date().toISOString(),
        };
        history.push(message);
        if (history.length > MAX_HISTORY) history.shift();
        io.emit('message:new', message);
    });

    socket.on('typing:update', (isTyping) => {
        if (!socket.data.name) return;
        socket.broadcast.emit('typing:update', {
            name: socket.data.name,
            isTyping: Boolean(isTyping),
        });
    });

    socket.on('disconnect', () => {
        const name = users.get(socket.id);
        users.delete(socket.id);
        io.emit('presence:count', users.size);
        if (name) io.emit('chat:notice', { text: `${name} вийшов з чату` });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Chat server listening on port ${PORT}`);
});
