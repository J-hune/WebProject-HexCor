import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

import {getPlayers} from "./events/getPlayers.js";
import {addPlayer} from "./events/addPlayer.js";
import {removePlayer} from "./events/removePlayer.js";
import {addPawn} from "./events/addPawn.js";
import {getPawns} from "./events/getPawns.js";
import {getGame} from "./events/getGame.js";
import {newGame} from "./events/newGame.js";
import {getMessages} from "./events/getMessages.js";
import {addMessage} from "./events/addMessage.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));

let GameData = {}
let GameMessages = []

io.on('connection', async (socket) => {
   console.log('New user connected ' + socket.id);

   socket.on("getMessages", () => getMessages(socket, GameData, GameMessages))
   socket.on("getGame", () => getGame(socket, GameData));
   socket.on("newGame", data => newGame(io, socket, GameData, data));
   socket.on("getPlayers", () => getPlayers(socket, GameData));
   socket.on("getPawns", () => getPawns(socket, GameData));
   socket.on("addPlayer", data => addPlayer(io, socket, GameData, data));
   socket.on("addMessage", data => addMessage(io, socket, GameData, GameMessages, data))
   socket.on("removePlayer", () => removePlayer(io, socket, GameData))
   socket.on("disconnect", () => removePlayer(io, socket, GameData))
   socket.on("addPawn", data => addPawn(io, socket, GameData, data))
});

httpServer.listen(3000, () => {
   console.log('App listening on port 3000 => http://localhost:3000');
});