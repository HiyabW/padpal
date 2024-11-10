import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import "./styles.css";

const DotProgress = ({ steps, currentStep, user, nextPicture, previousPicture, imageIndex, images }) => {
  return (
    <div class="dot-progress">
      <IconButton
        className="mobilePictureCaroselButtons"
        sx={{ marginRight: "4rem"}}
        disabled={imageIndex===0 ? true : false}
      >
        <ChevronLeftIcon sx={{marginBottom: '0.5rem'}} onClick={previousPicture} />
      </IconButton>

      {steps.map((step, index) => {
        return (
          <span className={`dot ${index <= currentStep ? "active" : ""}`} />
        );
      })}

      <IconButton
        className="mobilePictureCaroselButtons"
        sx={{ marginLeft: "4rem"}}
        disabled={imageIndex===images.length-1 ? true : false}
      >
        <ChevronRightIcon sx={{marginBottom: '0.5rem'}} onClick={nextPicture} />
      </IconButton>
    </div>
  );
};

export default DotProgress;
