// Establishing websockets connection between 
// frontend and backend through socket.io

import http from "http";
import { getDeepgramLiveConnection } from "./deepgram";
import { Server, Socket } from "socket.io";

const server = http.createServer();

const socketIOServer = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});


socketIOServer.on("connection", (socket) => {
  console.log("socket: client connected");

  socket.on("packet-sent", (data) => {
    const readyState = deepgramLive.getReadyState();
    console.log(`readyState is: ${readyState}`)
    if (readyState === 1) {
      deepgramLive.send(data);
    } else {
      console.log(
        `socket: data couldn't be sent to deepgram. readyState was ${readyState}`
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("socket: client disconnected");
  });
});

server.listen(4000, () => {
  console.log("server listening on port 4000");
});

const deepgramLive = getDeepgramLiveConnection(async (data: string) => {
  const transcriptData = JSON.parse(data);
  // ignore metadata messages
  if (transcriptData.type !== "Results") {
    return;
  }
  const transcript = transcriptData.channel.alternatives[0].transcript ?? "";
  if (transcript) {
    console.log(`transcript received: "${transcript}"`);
  }
});