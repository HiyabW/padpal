import React from "react";
import "./styles.css";
import Grid from "@mui/material/Grid2";
import styled from "@mui/material/styles/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import CircularProgress from "@mui/material/CircularProgress";
import { deleteProfileImage, uploadProfileImage } from "../../../../utils/uploadImage";

const EMPTY_SLOTS = [null, null, null];

const normalizeSlots = (answer) => {
  if (!Array.isArray(answer)) {
    return [...EMPTY_SLOTS];
  }

  return [
    answer[0] ?? null,
    answer[1] ?? null,
    answer[2] ?? null,
  ];
};

const SurveyOptionsPictures = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {
  const [uploadingSlot, setUploadingSlot] = React.useState(null);
  const [uploadError, setUploadError] = React.useState(null);
  const slots = normalizeSlots(currSelectedAnswer);

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

  const getImageForSlot = (imageNumber) => slots[imageNumber - 1];

  const cancel = async (e, imageNumber) => {
    const removedUrl = getImageForSlot(imageNumber);
    const updatedSlots = normalizeSlots(currSelectedAnswer);
    updatedSlots[imageNumber - 1] = null;

    setUploadError(null);
    setCurrSelectedAnswer(updatedSlots);

    if (!removedUrl) {
      return;
    }

    try {
      await deleteProfileImage(removedUrl);
    } catch (error) {
      setUploadError(error.message || "Failed to delete image");
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
      const updatedSlots = normalizeSlots(currSelectedAnswer);
      updatedSlots[imageNumber - 1] = imageUrl;
      setCurrSelectedAnswer(updatedSlots);

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
        {renderSlot(1, slots[0])}
        {renderSlot(2, slots[1])}
        {renderSlot(3, slots[2])}
      </Grid>
    </>
  );
};

export default SurveyOptionsPictures;
