import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import { useParams } from "react-router-dom";

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

interface VideoProps {
  peer: Peer.Instance;
}

const Video: React.FC<VideoProps> = ({ peer }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("newpeer");
    peer.on("stream", (stream: MediaStream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      style={{ width: "50%", height: "40%" }}
    />
  );
};

const Room: React.FC = () => {
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const { roomID } = useParams<{ roomID: string }>();

  useEffect(() => {
    console.log("roomId", roomID);
    socketRef.current = io("http://192.168.1.38:8000");

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        socketRef.current?.emit("join room", roomID);
        console.log("roomId", roomID);

        socketRef.current?.on("all users", (users: string[]) => {
          const peersList: Peer.Instance[] = [];

          users.forEach((userID) => {
            const socketId = socketRef.current?.id;
            if (socketId) {
              const peer = createPeer(userID, socketId, stream);
              peersRef.current.push({ peerID: userID, peer });
              peersList.push(peer);
            } else {
              console.error("Socket ID is undefined, cannot create peer.");
            }
          });

          setPeers(peersList);
        });

        socketRef.current?.on(
          "user joined",
          (payload: { signal: Peer.SignalData; callerID: string }) => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({ peerID: payload.callerID, peer });
            setPeers((prevPeers) => [...prevPeers, peer]);
          }
        );

        socketRef.current?.on(
          "receiving returned signal",
          (payload: { id: string; signal: Peer.SignalData }) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            if (item) {
              item.peer.signal(payload.signal);
            }
          }
        );
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  }, [roomID]);

  function createPeer(
    userToSignal: string,
    callerID: string,
    stream: MediaStream
  ): Peer.Instance {
    console.log("stream", stream);
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signal) => {
      socketRef.current?.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(
    incomingSignal: Peer.SignalData,
    callerID: string,
    stream: MediaStream
  ): Peer.Instance {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current?.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  return (
    <div
      style={{
        // padding: "20px",
        display: "flex",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        // margin: "auto",
        // flexWrap: "wrap",
        // background: "red",
      }}
    >
      <video
        muted
        ref={userVideo}
        autoPlay
        playsInline
        style={{ width: "50vw", height: "50vh" }}
      />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>
  );
};

export default Room;
