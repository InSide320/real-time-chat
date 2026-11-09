# Kolo — Real-Time Chat

A minimal real-time chat built with Socket.IO. The frontend and server run as a single Node.js app, so you only need one Render service for the demo.

## Run locally

You need Node.js 20 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in two browser tabs or windows and enter different names. Messages and typing indicators are delivered through Socket.IO.

## Demo features

- One shared room for all connected users
- Each participant's name is saved in the current browser tab
- The latest 50 messages are kept in memory
- Online participant count and typing indicator
- Responsive user interface in Ukrainian

Chat data is stored in server memory only. The message history is cleared when Render restarts the service; a database is not required for this learning demo.