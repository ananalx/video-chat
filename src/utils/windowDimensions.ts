import React from "react";
interface IWindow {
  width: number;
  height: number;
}
export function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}
export const WindowDimensions = React.createContext<IWindow>({
  width: 0,
  height: 0,
});
