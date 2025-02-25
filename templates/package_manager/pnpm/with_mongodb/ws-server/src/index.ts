import {WebSocketServer} from "ws";
import { connectDB, User } from "@repo/mongodb/client";

const server = new WebSocketServer({port:8083})

// Connect to MongoDB
connectDB();

server.on("connection", async (socket) => {
    await User.create({
        username: Math.random().toString(),
        password: Math.random().toString()
    });
    socket.send("Connected To The Server")
})