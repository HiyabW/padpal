import React from "react";
import "./styles.css";
import Grid from "@mui/material/Grid2";
import styled from "@mui/material/styles/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";

const SurveyOptionsPictures = ({
  images,
  image1,
  setImage1,
  image2,
  setImage2,
  image3,
  setImage3,
}) => {
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const cancel = (e, imageNumber) => {

    if (imageNumber === 1) {
      setImage1(null);
      if (images.current) {
        console.log("BEFORE: ", images.current);
        images.current = images.current.splice(0, 1);
        console.log("AFTER: ", images.current);
      }
    }
    if (imageNumber === 2) {
      setImage2(null);
      if (images.current) {
        images.current = images.current.splice(1, 1);
      }
    }
    if (imageNumber === 3) {
      setImage3(null);
      if (images.current) {
        images.current = images.current.splice(2, 1);
      }
    }
  };

  const updateAnswer = (e, imageNumber) => {
    e.target.classList.add("selected");

    // Convert file to base64, then save in currSelectedAnswer
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      console.log(reader.result);
      /* also update image states... */
      if (imageNumber === 1) {
        setImage1(reader.result);
      }
      if (imageNumber === 2) {
        setImage2(reader.result);
      }
      if (imageNumber === 3) {
        setImage3(reader.result);
      }
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };

    // console.log(currSelectedAnswer);
  };

  return (
    <Grid container className="surveyPictureDivEditProfile" spacing={2}>
      <Grid
        className={`surveyPictureDivItem ${image1 ? "selected" : ""}`}
        size={4}
      >
        {image1 && (
          <>
            <IconButton
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              className="surveyImageCancel"
            >
              <CancelIcon fontSize="large" onClick={(e) => cancel(e, 1)} />
            </IconButton>
            <img src={image1} className="surveyImage" />
          </>
        )}
        {!image1 && (
          <IconButton
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          >
            <AddCircleOutlineIcon fontSize="large" />
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => updateAnswer(e, 1)}
              className="picturesSurvey"
            />
          </IconButton>
        )}
      </Grid>

      <Grid
        className={`surveyPictureDivItem ${image2 ? "selected" : ""}`}
        size={4}
      >
        {image2 && (
          <>
            <IconButton
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              className="surveyImageCancel"
            >
              <CancelIcon fontSize="large" onClick={(e) => cancel(e, 2)} />
            </IconButton>
            <img src={image2} className="surveyImage" />
          </>
        )}
        {!image2 && (
          <IconButton
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          >
            <AddCircleOutlineIcon fontSize="large" />
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => updateAnswer(e, 2)}
              className="picturesSurvey"
            />
          </IconButton>
        )}
      </Grid>

      <Grid
        className={`surveyPictureDivItem ${image3 ? "selected" : ""}`}
        size={4}
      >
        {image3 && (
          <>
            <IconButton
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              className="surveyImageCancel"
            >
              <CancelIcon fontSize="large" onClick={(e) => cancel(e, 3)} />
            </IconButton>
            <img src={image3} className="surveyImage" />
          </>
        )}
        {!image3 && (
          <IconButton
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          >
            <AddCircleOutlineIcon fontSize="large" />
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => updateAnswer(e, 3)}
              className="picturesSurvey"
            />
          </IconButton>
        )}
      </Grid>
    </Grid>
  );
};

export default SurveyOptionsPictures;
