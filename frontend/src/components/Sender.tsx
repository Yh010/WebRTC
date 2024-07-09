import { useEffect, useState } from "react";

function Sender() {
  const [socket, setsocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setsocket(socket);
  }, []);

  async function sendVideo() {
    if (!socket) return;
    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.send(
        JSON.stringify({ type: "createOffer", sdp: pc.setLocalDescription })
      );
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createAnswer") {
        pc.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        pc.addIceCandidate(message.candidate);
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    pc.addTrack(stream.getVideoTracks()[0]);
    // pc.addTrack(stream.getAudioTracks()[0]);
  }

  return (
    <div>
      Sender
      <button onClick={sendVideo}>start video</button>
    </div>
  );
}

export default Sender;
