import { useEffect, useState } from "react";

function Sender() {
  const [socket, setsocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  async function sendVideo() {
    if (!socket) return;
    const pc = new RTCPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.send(
      JSON.stringify({ type: "createOffer", sdp: pc.setLocalDescription })
    );

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createAnswer") {
        pc.setRemoteDescription(message.sdp);
      }
    };
  }

  return (
    <div>
      Sender
      <button onClick={sendVideo}>start video</button>
    </div>
  );
}

export default Sender;
