import { useEffect, useState } from "react";

export default function Sender() {
  const [socket, setsocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setsocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  async function sendVideo() {
    if (!socket) return;

    const pc = new RTCPeerConnection();

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(JSON.stringify({ type: "createOffer", sdp: offer }));
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
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
  }

  return (
    <div>
      Sender
      <button onClick={sendVideo}>Start Video</button>
    </div>
  );
}
