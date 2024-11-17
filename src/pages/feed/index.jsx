import React from "react";
import Cookies from "js-cookie";
import UserCard from "./components/UserCard";
import "./styles.css";
import { useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { loadConfettiPreset } from "tsparticles-preset-confetti";
import Onboarding from "./components/onboarding";
import Grid from "@mui/material/Grid2";
import { Player } from '@lordicon/react'; // Import the Player component
const thumbDownIcon = require(`${process.env.PUBLIC_URL}/public/animatedIcons/thumbDownIcon.json`);
const heartIcon = require(`${process.env.PUBLIC_URL}/public/animatedIcons/heartIcon.json`);


const Feed = () => {
  const isLoggedIn = Cookies.get("isLoggedIn");
  const [loaded, setLoaded] = React.useState(false);
  const [users, setUsers] = React.useState({});
  const [images, setImages] = React.useState({});
  const [match, setMatch] = React.useState(null);
  const [currPfp, setCurrPfp] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [accept, setAccept] = React.useState(false)
  const [reject, setReject] = React.useState(false)

  const handleClose = () => {
    setOpen(false);
  };

  let isRotated = 1;

  useEffect(() => {
    if (isLoggedIn) {
      // first fetch data
      fetch("https://palpal-api.onrender.com/feed/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: `${Cookies.get("id")}`,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setUsers(data["compatibleUsers"]);
          if (Cookies.get("needsOnboarding")) {
            setOpen(true);
          }
          console.log("IMAGES: ", data["images"]);
          setImages(data["images"]);
          setLoaded(true);
        })
        .catch((err) => {
          console.log(err);
        });

      // ... then fetch currUser Pfp
      fetch("https://palpal-api.onrender.com/feed/getUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: `${Cookies.get("id")}`,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setCurrPfp(data["images"][0]["image"]);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  function closeMatchScreen() {
    setMatch(null);
  }

  const particlesInit = async (main) => {
    await loadFull(main);
    await loadConfettiPreset(main);
  };

  const particlesLoaded = (container) => {
    console.log(container);
  };

  /************* Animated Icon Stuff *************/

  const playerRefHeartIcon = useRef(null);
  if (accept) {
    playerRefHeartIcon.current?.playFromBeginning();
  }

  const playerRefThumbDownIcon = useRef(null);
  if (reject) {
    playerRefThumbDownIcon.current?.playFromBeginning();
  }

  /***********************************************/

  return (
    <div className="feed gradient-background">
      {/* --------------- ICONS --------------- */}
      {<div class="thumbsDown" style={{ position: "fixed", top: "40%", zIndex: "100", display: reject ? 'flex' : 'none', justifyContent: 'center', width: '100%' }}>
        <Player
          ref={playerRefThumbDownIcon}
          icon={thumbDownIcon}
          size={window.innerWidth <= 900 ? 100 : 300}
        />
      </div>}

      {<div class="heart" style={{ position: "fixed", top: "40%", zIndex: "100", display: accept ? 'flex' : 'none', justifyContent: 'center', width: '100%' }}>
        <Player
          ref={playerRefHeartIcon}
          icon={heartIcon}
          size={window.innerWidth <= 900 ? 100 : 300}
        />
      </div>}
      {/* ------------------------------------- */}
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, duration: "1" }}
          transition={{ ease: "easeInOut" }}
          className="matchedScreen"
        >
          <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            style={{ position: "absolute", top: 0 }}
            options={{
              preset: "confetti",
              fullScreen: {
                enable: true,
                zIndex: -1, // Ensure it's behind other elements
              },
              emitters: {
                position: { x: 50, y: -10 }, // Adjust to control emitter position
                size: {
                  width: 100, // Adjust to control emitter width
                  height: 0,
                },
                rate: {
                  quantity: 20, // Adjust to control number of particles emitted at once
                  delay: 0.1, // Adjust to control emission frequency
                },
                life: {
                  duration: 1, // Adjust to control how long particles stay on screen
                  count: 1, // Only emit once for a single burst
                },
              },
            }}
          />
          <Grid container spacing={10}>
            <Grid size={{ md: 3, sm: 12, xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.img
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: [-100, 0],
                  rotate: -15,
                }}
                transition={{ delay: 0.5 }}
                src={currPfp}
                className="currUserPfp matchedImg"
              />
            </Grid>

            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <motion.div initial={0} className="matchedScreenText">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [100, 0] }}
                  transition={{ delay: 0.5 }}
                >
                  It's a match!
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [-100, 0] }}
                  transition={{ delay: 0.5 }}
                >
                  <h2>
                    Head over to your chats to start a new conversation with{" "}
                    {match.name}.
                  </h2>
                  <Button
                    className="gotIt"
                    variant="contained"
                    onClick={closeMatchScreen}
                  >
                    Got it!
                  </Button>
                </motion.div>
              </motion.div>
            </Grid>

            <Grid size={{ md: 3, sm: 12, xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.img
                initial={{ opacity: 0 }}
                transition={{ delay: 0.5 }}
                animate={{
                  opacity: 1,
                  x: [100, 0],
                  rotate: 15,
                }}
                src={match.pfp}
                className="userPfp matchedImg"
              />
            </Grid>
          </Grid>
        </motion.div>
      )}
      {isLoggedIn && (
        <>
          <Onboarding open={open} handleClose={handleClose} />
          {!loaded && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ textAlign: "center" }}
            >
              <CircularProgress
                size="10rem"
                style={{ color: "white", marginBottom: "2rem" }}
                sx={{
                  "--CircularProgress-thickness": "24px",
                }}
              />
              <h1>Gathering Candidates...</h1>
            </motion.div>
          )}

          {Object.entries(users).map(([key, value]) => {
            isRotated += 1;
            return (
              <UserCard
                isRotated={isRotated}
                user={users[key]}
                users={users}
                setUsers={setUsers}
                setMatch={setMatch}
                images={images[users[key].email]}
                accept={accept}
                setAccept={setAccept}
                reject={reject}
                setReject={setReject}
              />
            );
          })}

          {Object.keys(users).length === 0 && loaded && (
            <Box className="p-4">
              <h1>no more candidates, come back later!</h1>
            </Box>
          )}
        </>
      )}
      {!isLoggedIn && (
        <div className="p-4 centeredDiv">
          Session expired, please log back in.
        </div>
      )}
    </div>
  );
};
export default Feed;
