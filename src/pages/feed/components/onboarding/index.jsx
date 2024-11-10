import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useTheme from "@mui/material/styles/useTheme";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Typography from "@mui/material/Typography";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import "./styles.css";

export default function Onboarding({ open, handleClose }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isOnboarded = () => {
    Cookies.remove("needsOnboarding");
    handleClose();
    // fetch("http://localhost:3007/auth/onboarded", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     id: `${Cookies.get("id")}`,
    //   }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log(data)
    //     handleClose()
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        component: "form",
        onSubmit: (event) => {
          event.preventDefault();
          handleClose();
        },
      }}
    >
      <DialogTitle>Getting Started.</DialogTitle>
      <DialogContent
        sx={{ display: "flex", justifyContent: "center", width: "100%", overflowX: 'hidden'}}
      >
        <DialogContentText>
          {activeStep === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <motion.div
                animate={{ y: 40, backgroundColor: ["#FF0000", "#292929"] }}
                initial={{ y: 0, borderRadius: "1rem" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  duration: 0.2,
                  repeatDelay: 1,
                  repeat: Infinity,
                }}
              >
                <ArrowLeftIcon className="keyIcon" />
              </motion.div>
              <motion.div
                style={{ marginLeft: "5vw" }}
                animate={{ y: 40, backgroundColor: ["#00ff00", "#292929"] }}
                initial={{ y: 0, borderRadius: "1rem" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  duration: 0.2,
                  repeatDelay: 1,
                  delay: 1,
                  repeat: Infinity,
                }}
              >
                <ArrowRightIcon className="keyIcon" />
              </motion.div>
            </Box>
          )}

          {activeStep === 1 && (
            <Box
              sx={{
                transform: "translateX(35%)",
              }}
            >
              <motion.div
                style={{ width: "10vw" }}
                animate={{ y: 40, backgroundColor: ["#D3D3D3", "#292929"] }}
                initial={{ y: 0, borderRadius: "1rem" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  duration: 0.2,
                  repeatDelay: 1,
                  repeat: Infinity,
                }}
              >
                <ArrowDropUpIcon className="keyIcon" />
              </motion.div>
              <motion.div
                style={{ width: "10vw", marginTop: "4vh", marginBottom: "2vw" }}
                animate={{ y: 50, backgroundColor: ["#D3D3D3", "#292929"] }}
                initial={{ y: 10, borderRadius: "1rem" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  duration: 0.2,
                  repeatDelay: 1,
                  delay: 1,
                  repeat: Infinity,
                }}
              >
                <ArrowDropDownIcon className="keyIcon" />
              </motion.div>
            </Box>
          )}

          <br></br>
          <br></br>
          <br></br>

          <Box sx={{ textAlign: "center" }}>
            <Typography>
              {activeStep === 0
                ? "Click the left arrow on your keyboard to decline a match, or the right arrow to send a match. If you are on a mobile device, swipe the card left or right to match or unmatch."
                : "Click the up and down arrows to go through the user's pictures. If you are on a mobile device, click the left and right arrow buttons at the bottom of the pictures."}
            </Typography>
          </Box>
          <MobileStepper
            variant="dots"
            steps={2}
            position="static"
            activeStep={activeStep}
            sx={{ flexGrow: 1 }}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === 1}
              >
                Next
                {theme.direction === "rtl" ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                {theme.direction === "rtl" ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        {activeStep === 1 && <Button onClick={isOnboarded}>Got It!</Button>}
      </DialogActions>
    </Dialog>
  );
}
