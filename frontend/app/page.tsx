"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setMediaRecorder(new MediaRecorder(stream));
    });
  }, []);

  useEffect(() => {
    if (mediaRecorder) {
      const socket = io("ws://localhost:4000");

      socket.on("connect", async () => {
        console.log("client connected to websocket");
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            socket.emit("packet-sent", event.data);
          }
        });
        mediaRecorder.start(500);
      });
    }
  }, [mediaRecorder]);


  return (
    <>
      <div className="title">Deepgram demo testing</div>
    </>
  );
}
