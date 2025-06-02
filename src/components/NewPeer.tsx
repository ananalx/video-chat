import React, { useEffect, useRef } from "react";
import type CustomPeer from "../screens/room/CustomPeer";
import "./animatedText/text.css";
interface VideoProps {
  peer: CustomPeer;
}

const NewPeer: React.FC<VideoProps> = ({ peer }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("newpeer");
    peer.on("stream", (stream: MediaStream) => {
      console.log("newpeer stream");
      if (ref.current) {
        ref.current.srcObject = stream;
        console.log("newpeer stream data", stream);
      }
    });
  }, [peer]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "5%",
      }}
    >
      <video
        muted
        ref={ref}
        autoPlay
        playsInline
        style={{ width: "30vw", borderRadius: ".5rem" }}
      />
      <text className="name">{peer.username}</text>
    </div>
  );
};

export default NewPeer;
