import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import "./styles.css";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MuiDivider from "@mui/material/Divider";
import styled from "@mui/material/styles/styled";
import AccessTime from "@mui/icons-material/AccessTime";
import Button from "@mui/material/Button";
import DotProgress from "./components/DotProgress";
import Cookies from "js-cookie";
import Grid from "@mui/material/Grid2";

const Divider = styled(MuiDivider)(({ theme }) => ({
  marginTop: "1rem",
  width: "100%",
  borderRadius: 2,
  border: "0.2px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
}));

function redirectToEditProfile() {
  window.location = "/editProfile";
}

/************* Utils functions *************/

// date utils
function formatDateStr(dateString) {
  const date = new Date(dateString);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}`;
}

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

function isKeyLast(obj, key) {
  const keys = Object.keys(obj);
  return obj[keys[keys.length - 1]]["email"] === obj[key]["email"];
}

/*******************************************/

const UserCard = ({
  isRotated,
  user,
  users,
  setUsers,
  images,
  setMatch,
  accept,
  setAccept,
  reject,
  setReject,
  feedOrViewProfile = "feed",
}) => {
  console.log(users);

  /************* Keyboard Shortcut functions *************/
  // handle what happens on key press
  const handleKeyPress = (event) => {
    console.log(`Key pressed: ${event.key}`);
    if (event.key === "ArrowRight" && isFront) {
      handle = setInterval(() => incrementValue(x, "right"), 50);
    }
    if (event.key === "ArrowLeft" && isFront) {
      handle = setInterval(() => incrementValue(x, "left"), 50);
    }
    if (event.key === "ArrowDown" && isFront) {
      nextPicture();
    }
    if (event.key === "ArrowUp" && isFront) {
      previousPicture();
    }
  };

  function nextPicture() {
    let nextImageIndex = imageIndex;
    nextImageIndex += 1;
    if (nextImageIndex < images.length) setImageIndex(nextImageIndex);
  }

  function previousPicture() {
    let nextImageIndex = imageIndex;
    nextImageIndex -= 1;
    if (nextImageIndex >= 0) setImageIndex(nextImageIndex);
  }

  var handle;
  // slowly do mousemove utils
  function incrementValue(x, direction) {
    if (feedOrViewProfile !== "view profile") {
      if (direction === "left") {
        x.set((x.get() - 5) * 1.5);
      } else {
        x.set((x.get() + 5) * 1.5);
      }
      console.log(x.get());

      if (Math.abs(x.get()) >= 200) {
        window.clearInterval(handle);
        handleDragEnd();
      }
    }
  }

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);
  /*******************************************/

  const [imageIndex, setImageIndex] = React.useState(0);

  const x = useMotionValue(0);

  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);

  console.log(user);
  const isFront =
    feedOrViewProfile == "view profile" ? true : isKeyLast(users, user.email);

  const rotate = useTransform(() => {
    console.log("isRotated: ", isRotated);
    const offset = (isFront || window.innerWidth <= 900) ? 0.00001 : isRotated % 2 ? 4 : -4;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = () => {
    if (Math.abs(x.get()) > 20) {
      const isAMatch = x.get() > 0 ? true : false;
      if (x.get() > 0) {
        setAccept(true)
        setTimeout(() => {
          setAccept(false)
        }, "1000");
      }
      else {
        setReject(true)
        setTimeout(() => {
          setReject(false)
        }, "1000");
      }
      // first POST req to /saveMatch
      fetch("https://palpal-api.onrender.com/match/saveMatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${Cookies.get("id")}`,
          to: user._id,
          isAMatch,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });

      // ...then GET /getMatch to see if they've matched back. if so, call foundMatch to que match screen
      //req body should have from:userEmail, to:currUserEmail, isAMatch:isAMatch
      fetch("https://palpal-api.onrender.com/match/getMatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: user._id,
          to: `${Cookies.get("id")}`,
          isAMatch,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.isAMatch) {
            console.log("matched!");
            setMatch({ name: user.name, pfp: images[0].image });
          }
        })
        .catch((err) => {
          console.log(err);
        });

      // finally, get rid of front card
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        delete newUsers[user.email];
        return newUsers;
      });
    }
  };

  /**************** Util preference translations *****************/

  const smokerTranslation = {
    "Don't care": "Neutral on smoking",
    No: "No smokers",
    Yes: "Smoker",
  };
  const cleanlinessTranslation = {
    "Very Important": "Very clean",
    "Somewhat Important": "Somewhat clean",
    "Not Important": "Neutral on cleanliness",
  };

  const guestTranslation = {
    "Very Often": "Always has guests",
    Sometimes: "Sometimes has guests",
    Never: "Never has guests",
  };

  const petTranslation = {
    Yes: "Pet friendly",
    No: "No pets",
    "Don't care": "Neutral on pets",
  };

  /*************************************************************/

  return (<>
    <motion.div
      className={`userFeedCardDiv hover:cursor-grab active:cursor-grabbing ${feedOrViewProfile!=="feed" ? "viewProfile" : ""}`}
      drag={feedOrViewProfile === "feed" ? "x" : ""}
      style={{
        x,
        opacity,
        rotate,
        boxShadow: isFront ? "0px 10px 30px" : undefined,
      }}
      transition="0.125s transform"
      animate={{
        scale: isFront ? 1 : 0.95,
      }}
      onDragEnd={handleDragEnd}
      dragConstraints={{ left: 0, right: 0 }}
    >

      <motion.div className="userFeedImageDiv">
        {images.length > 1 && (
          <div class="dotProgressDiv">
            <DotProgress
              imageIndex={imageIndex}
              nextPicture={nextPicture}
              images={images}
              previousPicture={previousPicture}
              steps={images}
              currentStep={imageIndex}
              user={user}
            />
          </div>
        )}
        <img
          drag={feedOrViewProfile === "feed" ? "x" : ""}
          style={{
            x,
            opacity,
            zIndex: 1,
          }}
          transition="0.125s transform"
          onDragEnd={handleDragEnd}
          dragConstraints={{ left: 0, right: 0 }}
          className="userFeedImage"
          src={images[imageIndex].image}
        />
      </motion.div>
      <motion.div className="userFeedInfoDiv">
        {/* If AI BOT, don't show budget or expected move out */}
        <Grid container spacing={2} sx={{marginBottom: user._id === Cookies.get("id") ? "1rem" : ""}}>
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 6 }}>
            <h2>
              {user.name}
              {user?.age ? `, ${getAge(user.age)}` : ``}
            </h2>
          </Grid>
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 6 }} sx={{ display: 'flex' }}>
            {user._id === Cookies.get("id") &&
              <Button variant="contained" disableElevation className="editProfileButton" onClick={redirectToEditProfile}>Edit Profile</Button>
            }
          </Grid>
        </Grid>
        {user._id !== "6730784af24ec4375cf95a17" && (
          <>
            <h3 style={{ marginTop: "6px" }}>
              <AttachMoneyIcon className="muiIcon" />
              {user.budget[0].max}
            </h3>
            <h3>
              <AccessTime className="muiIcon" />
              {formatDateStr(user.expectedMoveOut)}
            </h3>
          </>
        )}
        <Divider />
        <div className="userFeedInfo" style={{ height: window.innerWidth <= 900 ? '20rem' : '' }} >
          <p>{user.bio}</p>
          <br></br>
          <div className="preferences">
            <Button className="option" variant="contained">
              {cleanlinessTranslation[user.cleanlinessPreferences]}
            </Button>
            <Button className="option" variant="contained">
              {smokerTranslation[user.smokerPreferences]}
            </Button>
            <Button className="option" variant="contained">
              {petTranslation[user.petPreferences]}
            </Button>
            <Button className="option" variant="contained">
              {guestTranslation[user.guestPreferences]}
            </Button>
          </div>
          <br></br>
          <div className="hobbies">
            {user.hobbies.map((hobby) => {
              return (
                <Button className="option" variant="outlined">
                  {hobby}
                </Button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  </>
  );
};

export default UserCard;
