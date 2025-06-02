import { useState } from "react";
import { v1 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { Button, View } from "../../library";
import AnimatedText from "../../components/animatedText/AnimatedText";
import MotionElement from "../../components/MotionElement/MotionElement";
import DialogBox from "../../components/DialogBox/DialogBox";
import { TextField } from "@mui/material";
import labels from "./labels.json";

const CreateRoom = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [dialogueHeading, setDialogueHeading] = useState("");
  const [dialogueButton, setDialogueButton] = useState("");
  const [error, setError] = useState({ name: false, roomId: false });

  const navigate = useNavigate();
  function create() {
    setOpen(true);
    setDialogueHeading(labels.createRoom);
    setDialogueButton(labels.create);
  }
  function join() {
    setOpen(true);
    setDialogueHeading(labels.joinRoom);
    setDialogueButton(labels.join);
  }

  const handleButton = () => {
    let error = false;
    if (dialogueButton === labels.join) {
      if (!name) {
        setError((p) => ({ ...p, name: true }));
        error = true;
      }
      if (!roomId) {
        setError((p) => ({ ...p, roomId: true }));
        error = true;
      }
      if (error) {
        return;
      }
      navigate(`/room/${roomId}`, { state: { userName: name } });
      return;
    }
    if (!name) {
      setError((p) => ({ ...p, name: true }));
      error = true;
    }
    if (error) {
      return;
    }
    const id = uuid();
    navigate(`/room/${id}`, { state: { userName: name } });
  };

  return (
    <View className="container">
      <DialogBox open={open} setOpen={setOpen} heading={dialogueHeading}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Name"
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            fullWidth
            error={error.name}
          />
          {dialogueButton === "Join" && (
            <TextField
              placeholder="Room Id"
              label="RoomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              margin="normal"
              fullWidth
              error={error.roomId}
            />
          )}
          <Button onClick={handleButton}>{dialogueButton}</Button>
        </div>
      </DialogBox>
      <View style={{ marginTop: "5%" }}>
        <AnimatedText text={labels.heading} />
      </View>
      <View
        style={{
          // background: "red",
          width: "100vw",
          height: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <MotionElement
          show={{ scale: 1 }}
          hide={{ scale: 0 }}
          duration={1}
          delay={1.5}
        >
          <Button onClick={create}>{labels.createRoom}</Button>
        </MotionElement>
        <MotionElement
          show={{ scale: 1 }}
          hide={{ scale: 0 }}
          duration={1}
          delay={1.7}
        >
          <Button onClick={join}>{labels.joinRoom}</Button>
        </MotionElement>
      </View>
    </View>
  );
};

export default CreateRoom;
