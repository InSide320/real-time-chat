const socket = io();
const messages = document.querySelector('#messages');
const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');
const typing = document.querySelector('#typing');
const dialog = document.querySelector('#nameDialog');
const nameInput = document.querySelector('#nameInput');
let myName = sessionStorage.getItem('chat-name') || '';
let typingTimer;
let typingClearTimer;
let seenMessages = new Set();

if (!myName) dialog.showModal();
else joinChat(myName);

document.querySelector('#nameForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim().slice(0, 24);
    if (!name) return;
    myName = name;
    sessionStorage.setItem('chat-name', name);
    dialog.close();
    joinChat(name);
});

document.querySelector('#profileAvatar').addEventListener('click', () => {
    nameInput.value = myName;
    dialog.showModal();
});

function joinChat(name) {
    socket.emit('user:join', name);
    document.querySelector('#profileAvatar').textContent = name.charAt(0).toLocaleUpperCase('uk');
    input.focus();
}

socket.on('connect', () => {
    document.querySelector('#roomStatus').textContent = 'На зв’язку';
    document.querySelector('#connectionLabel').textContent = '● Socket.io підключено';
    if (myName) socket.emit('user:join', myName);
});
socket.on('disconnect', () => {
    document.querySelector('#roomStatus').textContent = 'З’єднання перервано';
    document.querySelector('#connectionLabel').textContent = 'Перепідключаємось…';
});
socket.on('presence:count', (count) => { document.querySelector('#onlineCount').textContent = count; });
socket.on('chat:history', (items) => items.forEach(renderMessage));
socket.on('message:new', renderMessage);
socket.on('chat:notice', ({ text }) => {
    const item = document.createElement('div');
    item.className = 'notice';
    item.textContent = text;
    messages.append(item);
    scrollToBottom();
});
socket.on('typing:update', ({ name, isTyping }) => {
    if (!isTyping) { typing.textContent = ''; return; }
    typing.textContent = `${name} набирає повідомлення…`;
    clearTimeout(typingClearTimer);
    typingClearTimer = setTimeout(() => { typing.textContent = ''; }, 1800);
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || !myName) return;
    socket.emit('message:send', text);
    input.value = '';
    socket.emit('typing:update', false);
    input.focus();
});

input.addEventListener('input', () => {
    socket.emit('typing:update', true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => socket.emit('typing:update', false), 900);
});

document.querySelector('#emojiButton').addEventListener('click', () => {
    input.value += '🙂';
    input.focus();
    input.dispatchEvent(new Event('input'));
});

function renderMessage(message) {
    if (!message?.id || seenMessages.has(message.id)) return;
    seenMessages.add(message.id);
    const row = document.createElement('article');
    row.className = `message${message.name === myName ? ' mine' : ''}`;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = message.name.charAt(0).toLocaleUpperCase('uk');
    const body = document.createElement('div');
    body.className = 'message-body';
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const name = document.createElement('span');
    name.className = 'message-name';
    name.textContent = message.name;
    const time = document.createElement('time');
    time.className = 'message-time';
    const date = new Date(message.time);
    time.dateTime = date.toISOString();
    time.textContent = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message.text;
    meta.append(name, time);
    body.append(meta, text);
    row.append(avatar, body);
    messages.append(row);
    scrollToBottom();
}

function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }
