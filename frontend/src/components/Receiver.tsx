import { useEffect, useRef } from "react";

function Receiver() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/");
    let pc: RTCPeerConnection | null = null;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        pc = new RTCPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        pc.ontrack = (event) => {
          const video = document.createElement("video");
          document.body.appendChild(video);

          video.srcObject = new MediaStream([event.track]);
          video.play();
        };
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
      } else if (message.type === "iceCandidate") {
        if (pc !== null) {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      }
    };

    return () => {
      if (pc !== null) {
        pc.close();
      }
      socket.close();
    };
  }, []);
  return (
    <div>
      Receiver
      <video ref={videoRef}></video>
    </div>
  );
}

export default Receiver;
