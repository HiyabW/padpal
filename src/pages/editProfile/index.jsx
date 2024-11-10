import React, { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import MuiCard from "@mui/material/Card";
import styled from "@mui/material/styles/styled";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SurveyOptionsPictures from "./components/surveyOptionsPictures";
import "./styles.css";
import SurveyOptionsDatePicker from "./components/surveyOptionsDatePicker";
import SurveyOptionsSlider from "./components/surveyOptionsSlider";
import SurveyOptionsCheckboxes from "./components/surveyOptionsCheckboxes";
import Box from "@mui/joy/Box";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";

const EditProfile = () => {
  const [user, setUser] = React.useState(null);
  const images = useRef(null);
  const isLoggedIn = Cookies.get("isLoggedIn");
  const [image1, setImage1] = React.useState(null);
  const [image2, setImage2] = React.useState(null);
  const [image3, setImage3] = React.useState(null);
  const [expectedMoveOut, setExpectedMoveOut] = React.useState(null);
  const [agePreferences, setAgePreferences] = React.useState(null);
  const [budget, setBudgetPreferences] = React.useState(null);
  const [genderPreferences, setGenderPreferences] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(null);

  const id = Cookies.get("id");

  const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    height: "auto",
    padding: theme.spacing(6),
    backgroundImage: "linear-gradient(#f2f4fc, #c1c4d1)",
    gap: theme.spacing(2),
    margin: "auto",
    boxShadow:
      "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    ...theme.applyStyles("dark", {
      boxShadow:
        "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
  }));

  const updateUser = () => {
    setIsLoading(true);
    fetch("http://localhost:3007/auth/survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: `${Cookies.get("id")}`,
        agePreferences: agePreferences.current,
        budget: budget.current,
        genderPreferences: genderPreferences,
        expectedMoveOut: expectedMoveOut,
      }),
    })
      .then((response) => response.json())
      .then(async function (data) {
        return await deletePreviousImages();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  async function deletePreviousImages() {
    // Then POST all pictures (separate endpoint, separate fetch call)
    fetch("http://localhost:3007/images/deleteImages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: `${Cookies.get("id")}`,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        addImages();
      });
  }

  async function addImages() {
    let myImages = [];
    if (image1 !== null) {
      myImages.push(image1);
    }
    if (image2 !== null) {
      myImages.push(image2);
    }
    if (image3 !== null) {
      myImages.push(image3);
    }
    // Then POST all pictures (separate endpoint, separate fetch call)
    fetch("http://localhost:3007/images/addImages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        owner: `${Cookies.get("id")}`,
        images: myImages,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location = `/viewProfile?id=${Cookies.get("id")}`;
      });
  }

  useEffect(() => {
    console.log("RERENDER");
    if (isLoggedIn) {
      // fetch data on currUser
      fetch("http://localhost:3007/feed/getUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data["user"]);
          images.current = data["images"];
          if (images.current[0]) {
            setImage1(images.current[0]["image"]);
          }
          if (images.current[1]) {
            setImage2(images.current[1]["image"]);
          }
          if (images.current[2]) {
            setImage3(images.current[2]["image"]);
          }

          setExpectedMoveOut(data["user"].expectedMoveOut);
          setAgePreferences([
            data["user"].agePreferences[0].min,
            data["user"].agePreferences[0].max,
          ]);
          setBudgetPreferences([
            data["user"].budget[0].min,
            data["user"].budget[0].max,
          ]);
          // genderPreferences.current = data["user"].genderPreferences
          setGenderPreferences(data["user"].genderPreferences);
          console.log(genderPreferences);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  function getAge(birthdayStr) {
    const today = new Date();
    let birthday = new Date(birthdayStr);
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();

    // If the birthday hasn't happened this year yet, subtract 1
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
      age--;
    }
    return age;
  }

  return (
    <div
      className="editProfile gradient-background"
      style={{ height: `${isLoading ? "100%" : ""}` }}
    >
      {isLoggedIn && user && images && !isLoading && (
        <Card className="userFeedCardDiv">
          <div class="userInfo">
            <h1>
              {user.name}, {getAge(user.age)}, {user.gender}
            </h1>
            <br></br>
            <div class="pictures" style={{ height: "100%" }}>
              <SurveyOptionsPictures
                images={images}
                image1={image1}
                setImage1={setImage1}
                image2={image2}
                setImage2={setImage2}
                image3={image3}
                setImage3={setImage3}
              />
            </div>

            <Divider sx={{ marginTop: "3rem", marginBottom: "3rem" }}>
              <p style={{ color: "grey", fontWeight: "2rem" }}>Preferences</p>
            </Divider>

            <Box className="userProfileContents">
              <Grid container spacing={4} sx={{ marginBottom: "2rem" }}>
                <Grid className="label verticallyAligned" size={3}>
                  Expected Move Out Date:
                </Grid>
                <Grid size={9} className="verticallyAligned">
                  <SurveyOptionsDatePicker
                    expectedMoveOut={expectedMoveOut}
                    setExpectedMoveOut={setExpectedMoveOut}
                    sx={{ width: "100%" }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={4} sx={{ marginBottom: "2rem" }}>
                <Grid className="label verticallyAligned" size={3}>
                  Age Range:
                </Grid>
                <Grid size={9} className="verticallyAligned">
                  <SurveyOptionsSlider
                    agePreferences={agePreferences}
                    setAgePreferences={setAgePreferences}
                    defaultMin={agePreferences[0]}
                    defaultMax={agePreferences[1]}
                    currSelectedAnswer={agePreferences}
                    defaultRange={[18, 60]}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={4} sx={{ marginBottom: "2rem" }}>
                <Grid className="label verticallyAligned" size={3}>
                  Budget:
                </Grid>
                <Grid size={9} className="verticallyAligned">
                  <SurveyOptionsSlider
                    agePreferences={budget}
                    setAgePreferences={setBudgetPreferences}
                    defaultMin={budget[0]}
                    defaultMax={budget[1]}
                    currSelectedAnswer={budget}
                    defaultRange={[0, 4000]}
                  />
                </Grid>
              </Grid>

              {/* <Grid container spacing={4} sx={{ marginBottom: "2rem" }}>
                <Grid className="label verticallyAligned" size={3}>
                  Gender Preference:
                </Grid>
                <Grid size={9} className="verticallyAligned">
                  <SurveyOptionsCheckboxes
                    genderPreferences={genderPreferences}
                    currSelectedElement={currSelectedElement}
                    setCurrSelectedElement={setCurrSelectedElement}
                    currSelectedAnswer={genderPreferences}
                    setCurrSelectedAnswer={setGenderPreferences}
                    options={[
                      {
                        name: "Men",
                      },
                      {
                        name: "Women",
                      },
                      {
                        name: "Non binary",
                      },
                    ]}
                  />
                </Grid>
              </Grid> */}
            </Box>
            <Button
              sx={{ width: "10rem", float: "right" }}
              variant="contained"
              disableElevation
              onClick={updateUser}
            >
              Save
            </Button>
          </div>
        </Card>
      )}
      {isLoading && (
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
          <div>
            <CircularProgress
              size="10rem"
              style={{ color: "white", marginBottom: "2rem" }}
              sx={{
                "--CircularProgress-thickness": "24px",
              }}
            />
            <h2>
              Saving user changes<br></br>This may take some time...
            </h2>
          </div>
        </motion.div>
      )}
      {!isLoggedIn && (
        <div className="centeredDiv">Session expired, please log back in.</div>
      )}
    </div>
  );
};

export default EditProfile;
