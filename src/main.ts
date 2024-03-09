import express from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

app.get("/", (req, res) => {
  res.sendFile(join(process.cwd(), "templates/index.html"));
});

server.listen(4000, () => {
  console.log("server running at http://localhost:4000");
});
