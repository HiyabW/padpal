import React, { useState } from "react";
import "./styles.css";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import styled from "@mui/material/styles/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import Camera from "./components/Camera";
import Modal from "react-bootstrap/Modal";

function MyVerticallyCenteredModal(props) {
  function saveRealTimePhoto() {
    props.setRealTimePhoto(props.url);
    props.setModalShow(false);
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Say cheese!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Make sure you take a clear photo of youself in a well lit room</p>
        <br></br>
        <Camera url={props.url} setUrl={props.setUrl} />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="contained"
          disableElevation
          onClick={saveRealTimePhoto}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const SurveyFacialVerification = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  realTimePhoto,
  setRealTimePhoto,
  identificationPhoto,
  setIdentificationPhoto,
  setCurrSelectedAnswer,
}) => {
  const [modalShow, setModalShow] = React.useState(false);
  const [url, setUrl] = useState(null);

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
      setRealTimePhoto(null);
      setUrl(null);
    }
    if (imageNumber === 2) {
      setIdentificationPhoto(null);
    }
  };

  const updateAnswer = (e, imageNumber) => {
    if (currSelectedElement) {
      currSelectedElement.classList.remove("selected");
    }
    e.target.classList.add("selected");
    setCurrSelectedElement(e.target);

    // Convert file to base64, then save
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      console.log(reader.result);
      /* also update image states... */
      if (imageNumber === 1) {
        setRealTimePhoto(reader.result);
      }
      if (imageNumber === 2) {
        setIdentificationPhoto(reader.result);
      }
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  };

  return (
    <>
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        realTimePhoto={realTimePhoto}
        setRealTimePhoto={setRealTimePhoto}
        url={url}
        setUrl={setUrl}
        setModalShow={setModalShow}
      />
      <Grid container className="surveyPictureDiv" spacing={2}>
        <Grid
          className={`surveyPictureDivItem ${realTimePhoto ? "selected" : ""}`}
          size={4}
        >
          {realTimePhoto && (
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
              <img src={realTimePhoto} className="surveyImage" />
            </>
          )}
          {!realTimePhoto && (
            <>
              <IconButton
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                onClick={() => setModalShow(true)}
              >
                <AddCircleOutlineIcon className="addImageIcon" fontSize="large" />
              </IconButton>
              <p className="addPicDesc" style={{color:'#757575'}}>Take live photo</p>
            </>
          )}
        </Grid>

        {/* <AllCameras /> */}

        <Grid
          className={`surveyPictureDivItem ${
            identificationPhoto ? "selected" : ""
          }`}
          size={4}
        >
          {identificationPhoto && (
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
              <img src={identificationPhoto} className="surveyImage" />
            </>
          )}
          {!identificationPhoto && (
            <><IconButton
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
            >
              <AddCircleOutlineIcon className="addImageIcon" fontSize="large" />
              <VisuallyHiddenInput
                type="file"
                onChange={(e) => updateAnswer(e, 2)}
                label={question.placeholder}
                className="picturesSurvey" />
            </IconButton><p className="addPicDesc" style={{color:'#757575'}}>Upload identification</p></>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default SurveyFacialVerification;
