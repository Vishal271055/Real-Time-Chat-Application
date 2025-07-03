const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = new Map(); // userId -> ws

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "register") {
      users.set(data.userId, ws);
    } else if (data.type === "message") {
      const target = users.get(data.to);
      if (target) {
        target.send(JSON.stringify(data));
      }
    }
  });

  ws.on("close", () => {
    for (let [userId, socket] of users.entries()) {
      if (socket === ws) users.delete(userId);
    }
  });
});

app.get("/", (req, res) => {
  res.send("WebSocket Chat Server Running");
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
