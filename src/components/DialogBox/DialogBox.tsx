/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, type JSX } from "react";
import { Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// import { styles } from "../../screens/BookingPage/Booking.styles";
import { createPortal } from "react-dom";
import { motion, useAnimation } from "framer-motion";

import "./Dialog.css";

interface IDialog {
  heading: string;
  children: JSX.Element;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

const DialogBox = ({ children, heading, setOpen, open }: IDialog) => {
  const mainControls = useAnimation();

  useEffect(() => {
    mainControls.start("show");
  }, [open]);
  return createPortal(
    <>
      {open && (
        <motion.div
          className="background"
          onClick={() => {
            mainControls.start("hide");
            setTimeout(() => {
              setOpen(false);
            }, 200);
          }}
          variants={{
            hide: { opacity: 0 },
            show: { opacity: 1 },
          }}
          initial="hide"
          animate={mainControls}
          transition={{ duration: 0.2, delay: 0 }}
        >
          <motion.div
            className="dialog"
            onClick={(e) => {
              e.stopPropagation();
            }}
            variants={{
              hide: { opacity: 0, y: 100 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hide"
            animate={mainControls}
            transition={{
              duration: 0.5,
              delay: 0,
              type: "spring",
              bounce: ".4",
            }}
          >
            <div className="heading">
              <Typography
                style={{
                  fontFamily: "Poppins",
                  fontWeight: "medium",
                  fontSize: "1.5rem",
                }}

                // style={{
                //   ...styles.heading,
                // }}
              >
                {heading}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={() => {
                  mainControls.start("hide");
                  setTimeout(() => {
                    setOpen(false);
                  }, 200);
                }}
              >
                <CloseIcon sx={{ color: "black", fontSize: "1.8rem" }} />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </>,
    document.body
  );
};

export default DialogBox;
