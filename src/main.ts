import express from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server);

const rooms = [
  {
    id: "1",
    name: "Room 1",
  },
  {
    id: "2",
    name: "Room 2",
  },
];

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("join_room", (roomId, cb) => {
    socket.join(roomId);
    cb({
      status: "ok",
      message: `room: ${roomId} joined`,
    });
  });

  socket.on("leave_room", (roomId, cb) => {
    socket.leave(roomId);
    cb({
      status: "ok",
      message: `room: ${roomId} left`,
    });
  });

  for (const room of rooms) {
    socket.on(`message_${room.id}`, (msg, cb) => {
      io.to(room.id).emit(`message_${room.id}`, msg);
      cb({
        status: "ok",
        message: `message sent to room: ${room.id}`,
      });
    });
  }

  socket.onAny((event, ...args) => {
    console.log("event", event, args);
  });

  socket.on("chat_message", async (msg, cb) => {
    try {
      const response = await socket
        .timeout(5000)
        .emitWithAck("chat_message", msg);
      cb({
        status: "ok",
        message: "message sent",
      });
    } catch (e) {
      console.error("error", e);
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(join(process.cwd(), "templates/index.html"));
});

app.get("/room", (req, res) => {
  res.sendFile(join(process.cwd(), "templates/room.html"));
});

server.listen(4000, () => {
  console.log("server running at http://localhost:4000");
});
