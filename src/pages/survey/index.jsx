import React from "react";
import { useState } from "react";
import "./styles.css";
import Cookies from "js-cookie";
import SurveyOptionsButtons from "./components/surveyOptionsButtons";
import { surveyQuestions } from "./questions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import SurveyOptionsCheckboxes from "./components/surveyOptionsCheckboxes";
import { motion } from "framer-motion";
import SurveyOptionsText from "./components/surveyOptionsText";
import SurveyOptionsSelect from "./components/surveyOptionsSelect";
import SurveyOptionsSlider from "./components/surveyOptionsSlider";
import SurveyOptionsDatePicker from "./components/surveyOptionsDatePicker";
import LinearProgress from "@mui/joy/LinearProgress";
import Alert from "@mui/material/Alert";
import MuiCard from "@mui/material/Card";
import styled from "@mui/material/styles/styled";
import MuiDivider from "@mui/material/Divider";
import Typography from "@mui/joy/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import SurveyHelp from "./components/surveyHelp";
import SurveyOptionsPictures from "./components/surveyOptionsPictures";
import SurveyFacialVerification from "./components/surveyFacialVerification";
import * as faceapi from "face-api.js";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  overflow: "scroll",
  borderRadius: "3rem",
  flexDirection: "column",
  alignSelf: "center",
  maxWidth: "70%",
  minHeight: "20rem",
  padding: "6vw",
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const Divider = styled(MuiDivider)(({ theme }) => ({
  marginTop: "1.5rem",
  width: "100%",
  borderRadius: 2,
  border: "0.2px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
}));

const Survey = () => {
  let [index, setIndex] = useState(-1);
  let [question, setQuestion] = useState(surveyQuestions[index]);
  let [currSelectedElement, setCurrSelectedElement] = useState(null);
  let [currSelectedAnswer, setCurrSelectedAnswer] = useState([]);
  let [userAnswers, setUserAnswers] = useState({});
  let [error, setError] = useState(null);
  let [progress, setProgress] = useState(0);
  const [openHelpIcon, setOpenHelpIcon] = React.useState(false);
  const [realTimePhoto, setRealTimePhoto] = React.useState(null);
  const [identificationPhoto, setIdentificationPhoto] = React.useState(null);
  const [facialVerificationLoading, setFacialVerificationLoading] =
    React.useState(false);

  const isLoggedIn = Cookies.get("isLoggedIn");
  if (!isLoggedIn) {
    window.location = "/";
  }

  const handleClickOpen = () => {
    setOpenHelpIcon(true);
  };

  const handleClose = () => {
    setOpenHelpIcon(false);
  };

  const back = () => {
    /* ... First reset current answer choices and update progress bar */
    setCurrSelectedElement(null);
    setCurrSelectedAnswer([]);
    setProgress((progress -= 6.4));
    setError(null);

    setIndex(--index);
    setQuestion(surveyQuestions[index]);
  };

  const next = async () => {
    let addedUserAnswers = null;
    if (index === -1) {
      setIndex(++index);
      setQuestion(surveyQuestions[index]);
      return;
    }
    if (
      (currSelectedAnswer?.length <= 0 || currSelectedAnswer === null) &&
      question.type !== "facialVerification"
    ) {
      setError("Please answer the following question before continuing");
      return;
    }
    ////////////////////// VALIDATIONS //////////////////////
    if (question?.label === "email" && currSelectedAnswer.indexOf("@") === -1) {
      setError("Please provide a valid email");
      return;
    }
    if (question?.label === "phone" && currSelectedAnswer?.length < 10) {
      setError("Please provide a valid phone number");
      return;
    }
    if (question?.label === "password" && currSelectedAnswer?.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (question?.label === "bio" && currSelectedAnswer?.length > 276) {
      setError(
        `Your current bio is ${currSelectedAnswer?.length} characters. Please shorten it to be under 276.`
      );
      return;
    }
    if (question?.type === "facialVerification") {
      const resultOfFacialVerification = await compareFaces();
      if (resultOfFacialVerification === 0) {
        setError(`Please upload both photos before continuing.`);
        return;
      } else if (resultOfFacialVerification === 1) {
        setError(
          `Facial verification failed. Either take you live picture in better lighting or use a better identification photo`
        );
        return;
      }
    }
    /////////////////////////////////////////////////////////
    /* First save answer */
    addedUserAnswers = { ...userAnswers };
    addedUserAnswers[`${question?.label}`] = currSelectedAnswer;
    setUserAnswers(addedUserAnswers);

    /* ... Then reset current answer choices and update progress bar */
    setCurrSelectedElement(null);
    setCurrSelectedAnswer([]);
    setProgress((progress += 6.4));
    setError(null);

    /* if survey is over, cue loading div. else, keep going */
    if (index === surveyQuestions.length - 1) {
      setProgress(100);
      // before doing anything, make sure user is signed in or else POST will fail
      if (!Cookies.get("id")) {
        alert("Session expired, please log back in.");
        window.location = "/";
        return;
      }
      console.log("FINAL USER ANSWER VALUES: ", addedUserAnswers);
      const formData = new FormData();
      formData.append("file", addedUserAnswers["pictures"]);

      // POST new user into db!
      fetch("https://palpal-api.onrender.com/auth/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: `${Cookies.get("id")}`,
          age: addedUserAnswers["age"],
          agePreferences: addedUserAnswers["agePreferences"],
          budget: addedUserAnswers["budget"][0],
          city: addedUserAnswers["city"],
          cleanlinessPreferences: `${addedUserAnswers["cleanlinessPreferences"]}`,
          gender: `${addedUserAnswers["gender"]}`,
          genderPreferences: addedUserAnswers["genderPreferences"],
          guestPreferences: `${addedUserAnswers["guestPreferences"]}`,
          leaseType: addedUserAnswers["leaseType"],
          petPreferences: `${addedUserAnswers["petPreferences"]}`,
          smokerPreferences: `${addedUserAnswers["smokerPreferences"]}`,
          bio: `${addedUserAnswers["bio"]}`,
          expectedMoveOut: addedUserAnswers["expectedMoveOut"],
          hobbies: addedUserAnswers["hobbies"],
        }),
      })
        .then((response) => response.json())
        .then(async function (data) {
          Cookies.set("needsOnboarding", true);
          await addImages();
          console.log(data);
        })
        .catch((err) => {
          alert(err);
        });

      async function addImages() {
        // Then POST all pictures (separate endpoint, separate fetch call)
        fetch("https://palpal-api.onrender.com/images/addImages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner: `${Cookies.get("id")}`,
            images: addedUserAnswers["pictures"],
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            window.location = "/feed";
            return data;
          });
      }
    }

    // increment index to change to next question, but we only do this if we aren't at the end of the survey
    if (index !== surveyQuestions.length - 1) {
      setIndex(++index);
      setQuestion(surveyQuestions[index]);
    }
  };

  /********************** Facial Verification Functions **********************/

  const compareFaces = async () => {
    setFacialVerificationLoading(true);
    
    console.log(0, realTimePhoto, identificationPhoto)

    if (!realTimePhoto || !identificationPhoto) return 0;

    console.log(1)

    const MODEL_URL = "/models";
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);

    console.log(2)

    const img1 = await faceapi.fetchImage(realTimePhoto);
    const img2 = await faceapi.fetchImage(identificationPhoto);

    console.log(3)

    const detections1 = await faceapi
      .detectAllFaces(img1)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const detections2 = await faceapi
      .detectAllFaces(img2)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections1.length > 0 && detections2.length > 0) {
      const descriptor1 = detections1[0].descriptor;
      const descriptor2 = detections2[0].descriptor;
      const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

      const result = distance < 0.6 ? 2 : 1;
      if (result) {
        setFacialVerificationLoading(false);
      }

      return result;
    }
  };

  /***************************************************************************/

  return (
    <div className="overArchingDiv gradient-background">
      {isLoggedIn && (
        <>
          {index === -1 && (
            <motion.div
              key={question?.id}
              className="Survey"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Card
                className="surveyIntroCard"
                height={"100%"}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Grid
                  container
                  spacing={2}
                  height={"100%"}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Grid size={8}>
                    <h2>Let us get to know you.</h2>
                    <p className="mt-3">
                      Take this short quiz to help us understand who you are and
                      what you're looking for in a roommate.
                    </p>
                    <br></br>
                    <Button variant="contained" onClick={next}>
                      Sounds good!
                    </Button>
                  </Grid>
                  <Grid
                    size={4}
                    sx={{
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div className="x">
                      <FactCheckIcon
                        className="introIcon"
                        sx={{ color: "#bdcaf0" }}
                      />
                    </div>
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          )}
          {index > -1 && progress < 100 && (
            <>
              <div>
                <LinearProgress
                  determinate
                  variant="outlined"
                  size="sm"
                  color="neutral"
                  thickness={24}
                  value={Number(progress)}
                  sx={{
                    "--LinearProgress-radius": "20px",
                    "--LinearProgress-thickness": "24px",
                    "border-color": "#2e2e2e",
                    width: "70%",
                    transform: "translateX(21.5%);",
                  }}
                >
                  <Typography
                    level="body-xs"
                    color="common.white"
                    sx={{
                      fontWeight: "xl",
                      color: progress > 50 ? "lightgray" : "difference",
                      zIndex: 2000,
                    }}
                  >
                    {`${Math.round(Number(progress))}%`}
                  </Typography>
                </LinearProgress>
              </div>
              <motion.div
                key={question?.id}
                className="Survey"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <>
                  <Card sx={{ height: "100%" }} className="surveyCard">
                    <div className="iconDiv">
                      <ArrowBackIosNewIcon
                        onClick={back}
                        className={`icon surveyBackArrow ${index > 0 ? "" : "invisible"
                          }`}
                        fontSize="large"
                      />
                      <HelpOutlineIcon
                        onClick={handleClickOpen}
                        className="icon surveyHelpIcon"
                        color="primary"
                        fontSize="large"
                      />
                      <SurveyHelp
                        open={openHelpIcon}
                        handleClose={handleClose}
                      />
                    </div>

                    <div className="survey">
                      <div className="surveySection">
                        {error && (
                          <div sx={{ width: "50%" }}>
                            <Alert severity="error">{error}</Alert>
                          </div>
                        )}
                        <h1 className="mb-3">Q{index + 1}</h1>
                        <h2>{question?.text}</h2>
                        {question?.subtext && (
                          <p className="mt-3">{question?.subtext}</p>
                        )}
                        <Divider />
                      </div>
                      <br></br>
                      <div className="surveySection" style={{ marginBottom: '2rem' }}>
                        {question?.type === "text" && (
                          <SurveyOptionsText
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "buttons" && (
                          <SurveyOptionsButtons
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "checkboxes" && (
                          <SurveyOptionsCheckboxes
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "select" && (
                          <SurveyOptionsSelect
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "slider" && (
                          <SurveyOptionsSlider
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "datePicker" && (
                          <SurveyOptionsDatePicker
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "pictures" && (
                          <SurveyOptionsPictures
                            question={question}
                            currSelectedElement={currSelectedElement}
                            setCurrSelectedElement={setCurrSelectedElement}
                            currSelectedAnswer={currSelectedAnswer}
                            setCurrSelectedAnswer={setCurrSelectedAnswer}
                          />
                        )}
                        {question?.type === "facialVerification" &&
                          !facialVerificationLoading && (
                            <>
                              <SurveyFacialVerification
                                question={question}
                                currSelectedElement={currSelectedElement}
                                setCurrSelectedElement={setCurrSelectedElement}
                                currSelectedAnswer={currSelectedAnswer}
                                setCurrSelectedAnswer={setCurrSelectedAnswer}
                                realTimePhoto={realTimePhoto}
                                setRealTimePhoto={setRealTimePhoto}
                                identificationPhoto={identificationPhoto}
                                setIdentificationPhoto={setIdentificationPhoto}
                              />
                            </>
                          )}
                        {question?.type === "facialVerification" &&
                          facialVerificationLoading && (
                            <CircularProgress color="inherit" />
                          )}
                      </div>
                      <div
                        style={{
                          width: "100%",
                          position: "relative",
                          height: "100%",
                          textAlign: "right",
                        }}
                      >
                        <Button
                          variant="contained"
                          className="next"
                          onClick={next}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </Card>
                </>
              </motion.div>
            </>
          )}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                textAlign: "center",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div sx={{ height: "100%" }}>
                <CircularProgress
                  size="10rem"
                  style={{ color: "white", marginBottom: "2rem" }}
                  sx={{
                    "--CircularProgress-thickness": "24px",
                  }}
                />
                {/* <h1 className="loadingText">Saving user data...</h1> */}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Survey;
