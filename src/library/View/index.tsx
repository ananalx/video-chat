/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, type JSX, type CSSProperties } from "react";
import { getWindowDimensions } from "../../utils/windowDimensions";

interface IView extends React.ComponentProps<"div"> {
  children: JSX.Element | JSX.Element[];
  // style?: CSSProperties | undefined;
  // className?: string;
  // onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  // onMouseEnter?: React.MouseEventHandler<HTMLDivElement> | undefined;
  // onMouseLeave?: React.MouseEventHandler<HTMLDivElement> | undefined;
}

const View = (props: IView) => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const handleResize = () => {
    setWindowDimensions(getWindowDimensions());
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return <div {...props}>{props.children}</div>;
};

export default View;
