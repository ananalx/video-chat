import { useEffect, useState } from "react";
import MotionSpan from "../MotionSpan";
import "./text.css";

interface IUserChat {
  text: string;
}

export default function AnimatedText(props: IUserChat) {
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAnim(true);
    }, props.text.length * 100);
  }, []);

  return (
    <>
      {!anim && (
        <span
          style={{
            fontSize: "4rem",
            color: "#7953cd",
            fontWeight: "normal",
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "0.5px",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          {props.text.split("").map((char, index) => (
            <MotionSpan
              key={index}
              show={{ opacity: 1 }}
              hide={{ opacity: 0 }}
              duration={5}
              delay={index / 30}
            >
              {char}
            </MotionSpan>
          ))}
        </span>
      )}
      {anim && <text className="animated">{props.text}</text>}
    </>
  );
}
