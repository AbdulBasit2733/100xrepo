import {WebSocketServer} from "ws";
import { client } from "@repo/postgres/client";
const server = new WebSocketServer({port:8083})


server.on("connection", async (socket) => {
    await client.user.create({
        data:{
            username:Math.random().toString(),
            password:Math.random().toString(),
        }
    })
    socket.send("Connected To The Server")
})