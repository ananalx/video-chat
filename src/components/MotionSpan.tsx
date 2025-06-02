/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import {
  useInView,
  motion,
  useAnimation,
  type HTMLMotionProps,
} from "motion/react";

interface ILaserBrief extends HTMLMotionProps<"span"> {
  duration?: number;
  delay?: number;
  show: any;
  hide: any;
  children: string;
  type?: string;
  reverse?: boolean;
  renderNow?: boolean;
}

const MotionSpan = ({
  children,
  delay = 0,
  duration,
  hide,
  show,
  type = "spring",
  reverse = false,
  renderNow = false,
  ...props
}: ILaserBrief) => {
  const motionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(motionRef, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      console.log("showHeading");
      mainControls.start("showHeading");
      return;
    }
  }, [isInView]);

  useEffect(() => {
    if (reverse) {
      mainControls.start("hideHeading");
      return;
    }
  }, [reverse]);

  useEffect(() => {
    if (renderNow) {
      mainControls.start("showHeading");
      return;
    }
  }, []);

  return (
    <motion.span
      {...props}
      ref={motionRef}
      variants={{
        hideHeading: hide,
        showHeading: show,
      }}
      initial="hideHeading"
      animate={mainControls}
      transition={{
        duration,
        delay,
        type,
        bounce: 0.5,
      }}
    >
      {children}
    </motion.span>
  );
};
export default MotionSpan;
