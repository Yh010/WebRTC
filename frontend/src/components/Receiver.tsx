import { useEffect } from "react";

function Receiver() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        pc.setLocalDescription(answer);
        socket?.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.setLocalDescription })
        );
      }
    };
  }, []);
  return <div>Receiver</div>;
}

export default Receiver;
