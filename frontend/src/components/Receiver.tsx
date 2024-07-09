import { useEffect } from "react";

export const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };
    startReceiving(socket);

    return () => {
      socket.close();
    };
  }, []);

  function startReceiving(socket: WebSocket) {
    const video = document.createElement("video");
    video.autoplay = true;
    video.controls = true;
    document.body.appendChild(video);

    const pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      video.srcObject = stream;
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: answer,
          })
        );
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };
  }

  return <div>Receiver</div>;
};
