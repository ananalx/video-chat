import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import CustomPeer from "./CustomPeer";
import { useParams, useLocation } from "react-router-dom";
import NewPeer from "../../components/NewPeer";
import "./index.css";
import { Button } from "../../library";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { useNavigate } from "react-router-dom";

const Room: React.FC = () => {
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);

  const [peers, setPeers] = useState<CustomPeer[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<
    { peerID: string; peer: CustomPeer; peerName: string }[]
  >([]);
  const { roomID } = useParams<{ roomID: string }>();
  const location = useLocation();
  const data = location.state;
  const navigate = useNavigate();

  useEffect(() => {
    console.log("peers", peers, peersRef);
  }, [peers, peersRef]);

  useEffect(() => {
    console.log("roomId", roomID);
    socketRef.current = io("http://localhost:4000/");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        socketRef.current?.emit("join room", { roomID, name: data.userName });
        console.log("roomId", roomID, data);

        socketRef.current?.on(
          "all users",
          (users: { id: string; name: string }[]) => {
            const peersList: CustomPeer[] = [];

            users.forEach((user) => {
              const socketId = socketRef.current?.id;
              if (socketId) {
                const peer = createPeer(user.id, socketId, stream, user.name);
                peersRef.current.push({
                  peerID: user.id,
                  peer,
                  peerName: user.name,
                });
                peersList.push(peer);
              } else {
                console.error("Socket ID is undefined, cannot create peer.");
              }
            });

            setPeers(peersList);
          }
        );

        socketRef.current?.on(
          "user joined",
          (payload: {
            signal: Peer.SignalData;
            callerID: string;
            userName: string;
          }) => {
            const peer = addPeer(
              payload.signal,
              payload.callerID,
              stream,
              payload.userName
            );
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
              peerName: payload.userName,
            });
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

        socketRef.current?.on("remove-user", (peerID) => {
          console.log(`User disconnected: ${peerID}`);

          // Remove peer from references
          peersRef.current = peersRef.current.filter(
            (p) => p.peerID !== peerID
          );

          // Update state to reflect changes
          setPeers((prevPeers) =>
            prevPeers.filter((peer) => {
              console.log(peer.peerID, peerID);
              return peer.peerID !== peerID;
            })
          );
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  }, [roomID]);

  function createPeer(
    userToSignal: string,
    callerID: string,
    stream: MediaStream,
    name: string
  ): CustomPeer {
    console.log("stream", stream);
    const peer = new CustomPeer(
      { initiator: true, trickle: false, stream },
      name,
      userToSignal
    );

    peer.on("signal", (signal) => {
      socketRef.current?.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        name,
      });
    });

    return peer;
  }

  function addPeer(
    incomingSignal: Peer.SignalData,
    callerID: string,
    stream: MediaStream,
    userName: string
  ): CustomPeer {
    const peer = new CustomPeer(
      {
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        },
      },
      userName,
      callerID
    );

    peer.on("signal", (signal) => {
      socketRef.current?.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  function handleToggleAudio() {
    setAudio((p) => !p);

    const videoElem = userVideo.current;
    if (videoElem && videoElem.srcObject instanceof MediaStream) {
      const stream = videoElem.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }

  function handleToggleVideo() {
    setVideo((p) => !p);
    const videoElem = userVideo.current;
    if (videoElem && videoElem.srcObject instanceof MediaStream) {
      const stream = videoElem.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }

  // Disconnect function
  function disconnectPeer() {
    const socketId = socketRef.current?.id;
    if (socketId && socketRef.current) {
      socketRef.current.emit("user-disconnect", socketId);
    }

    // Destroy the peer connections
    peersRef.current.forEach(({ peer }) => peer.destroy());

    // Reset state
    setPeers([]);
    navigate(`/`);
  }

  return (
    <>
      <div
        style={{
          // padding: "20px",

          height: "90vh",
          width: "100vw",
          display: "grid",
          gridTemplateColumns: "repeat(3, .8fr)",
          gap: "0px",
          // margin: "auto",
          // flexWrap: "wrap",
        }}
      >
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
            ref={userVideo}
            autoPlay
            playsInline
            style={{ width: "30vw", borderRadius: ".5rem" }}
          />
          <text className="text">{data.userName}</text>
        </div>

        {peers.map((peer, index) => (
          <NewPeer key={index} peer={peer} />
        ))}
      </div>
      <div
        style={{
          height: "10vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          style={{ width: "100px", height: "50px" }}
          onClick={handleToggleVideo}
        >
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </Button>
        <Button onClick={disconnectPeer} style={{ height: "50px" }}>
          Leave room
        </Button>
        <Button
          style={{ width: "100px", height: "50px" }}
          onClick={handleToggleAudio}
        >
          {audio ? <MicIcon /> : <MicOffIcon />}
        </Button>
      </div>
    </>
  );
};

export default Room;
