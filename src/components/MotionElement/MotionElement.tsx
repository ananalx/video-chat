import React, { useEffect, useRef, type JSX } from "react";
import { useInView, motion, useAnimation } from "framer-motion";

import type { Variant } from "framer-motion";

interface ILaserBrief {
  duration?: number;
  delay?: number;
  show: Variant;
  hide: Variant;
  children: JSX.Element;
  type?: string;
  reverse?: boolean;
  renderNow?: boolean;
}

const MotionElement = ({
  children,
  delay = 0,
  duration = 0.5,
  hide,
  show,
  type = "spring",
  reverse = false,
  renderNow = false,
}: ILaserBrief) => {
  const motionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(motionRef, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
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
    <motion.div
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
    </motion.div>
  );
};
export default MotionElement;
