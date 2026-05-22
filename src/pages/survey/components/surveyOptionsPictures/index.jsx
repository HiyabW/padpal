import React from "react";
import "./styles.css";
import Grid from "@mui/material/Grid2";
import styled from "@mui/material/styles/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import CircularProgress from "@mui/material/CircularProgress";
import { deleteProfileImage, uploadProfileImage } from "../../../../utils/uploadImage";

const SurveyOptionsPictures = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {

  const [image1, setImage1] = React.useState(null);
  const [image2, setImage2] = React.useState(null);
  const [image3, setImage3] = React.useState(null);
  const [uploadingSlot, setUploadingSlot] = React.useState(null);
  const [uploadError, setUploadError] = React.useState(null);

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

  const getImageForSlot = (imageNumber) => {
    if (imageNumber === 1) {
      return image1;
    }
    if (imageNumber === 2) {
      return image2;
    }
    return image3;
  };

  const cancel = async (e, imageNumber) => {
    const removedUrl = getImageForSlot(imageNumber);
    let currSelectedAnswerTemp = [...currSelectedAnswer];

    if (imageNumber === 1) {
      currSelectedAnswerTemp = currSelectedAnswerTemp.filter(
        (item) => item !== image1
      );
      setImage1(null);
    }
    if (imageNumber === 2) {
      currSelectedAnswerTemp = currSelectedAnswerTemp.filter(
        (item) => item !== image2
      );
      setImage2(null);
    }
    if (imageNumber === 3) {
      currSelectedAnswerTemp = currSelectedAnswerTemp.filter(
        (item) => item !== image3
      );
      setImage3(null);
    }

    setUploadError(null);
    setCurrSelectedAnswer(currSelectedAnswerTemp);

    if (!removedUrl) {
      return;
    }

    try {
      await deleteProfileImage(removedUrl);
    } catch (error) {
      setUploadError(error.message || "Failed to delete image");
    }
  };

  const setImageForSlot = (imageNumber, imageUrl) => {
    if (imageNumber === 1) {
      setImage1(imageUrl);
    }
    if (imageNumber === 2) {
      setImage2(imageUrl);
    }
    if (imageNumber === 3) {
      setImage3(imageUrl);
    }
  };

  const updateAnswer = async (e, imageNumber) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (currSelectedElement) {
      currSelectedElement.classList.remove("selected");
    }
    e.target.classList.add("selected");

    setUploadError(null);
    setUploadingSlot(imageNumber);

    const previousUrl = getImageForSlot(imageNumber);

    try {
      const imageUrl = await uploadProfileImage(file);
      const updatedAnswer = currSelectedAnswer.filter((item) => item !== previousUrl);
      updatedAnswer.push(imageUrl);
      setCurrSelectedAnswer(updatedAnswer);
      setImageForSlot(imageNumber, imageUrl);

      if (previousUrl && previousUrl !== imageUrl) {
        await deleteProfileImage(previousUrl);
      }
    } catch (error) {
      setUploadError(error.message || "Failed to upload image");
    } finally {
      setUploadingSlot(null);
      e.target.value = "";
    }
  };

  const renderSlot = (imageNumber, imageValue) => {
    const isUploading = uploadingSlot === imageNumber;

    return (
      <Grid
        className={`surveyPictureDivItem ${imageValue ? "selected" : ""}`}
        size={4}
      >
        {isUploading && (
          <CircularProgress size={48} className="surveyImageUploading" />
        )}
        {imageValue && !isUploading && (
          <>
            <IconButton
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              className="surveyImageCancel"
            >
              <CancelIcon fontSize="large" onClick={(e) => cancel(e, imageNumber)} />
            </IconButton>
            <img src={imageValue} className="surveyImage" alt="" />
          </>
        )}
        {!imageValue && !isUploading && (
          <IconButton
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          >
            <AddCircleOutlineIcon className="addImageIcon" fontSize="large" />
            <VisuallyHiddenInput
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => updateAnswer(e, imageNumber)}
              className="picturesSurvey"
            />
          </IconButton>
        )}
      </Grid>
    );
  };

  return (
    <>
      {uploadError && <p className="surveyImageUploadError">{uploadError}</p>}
      <Grid container className="surveyPictureDiv" spacing={2}>
        {renderSlot(1, image1)}
        {renderSlot(2, image2)}
        {renderSlot(3, image3)}
      </Grid>
    </>
  );
};

export default SurveyOptionsPictures;
