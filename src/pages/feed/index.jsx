import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import UserCard from "./components/UserCard";
import "./styles.css";
import { styled } from '@mui/material/styles';
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import Onboarding from "./components/onboarding";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Button from "@mui/material/Button";
import { MatchOverlay } from "../../components/match";
import { preloadImage } from "../../components/match/preloadImage";

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: '1rem',
    maxWidth: window.innerWidth <= 900 ? '18rem' : '40rem',
  },
}));


const Feed = () => {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();
  const [loaded, setLoaded] = React.useState(false);
  const [users, setUsers] = React.useState({});
  const [images, setImages] = React.useState({});
  const [match, setMatch] = React.useState(null);
  const [currPfp, setCurrPfp] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [openTooltip, setOpenTooltip] = React.useState(false);

  const handleTooltipClose = useCallback(() => {
    setOpenTooltip(false);
  }, []);

  const handleTooltipOpen = useCallback(() => {
    setOpenTooltip(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    if (isAuthenticated) {
      apiFetch("/feed/", {
        method: "POST",
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          setUsers(data["compatibleUsers"]);
          if (Cookies.get("needsOnboarding")) {
            setOpen(true);
          }
          setImages(data["images"]);
          setLoaded(true);
        })
        .catch((err) => {
          console.log(err);
        });

      apiFetch("/feed/getUser", {
        method: "POST",
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          const pfp = data["images"]?.[0]?.image;
          if (pfp) {
            preloadImage(pfp);
            setCurrPfp(pfp);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [loading, isAuthenticated, navigate]);

  const closeMatchScreen = useCallback(() => {
    setMatch(null);
  }, []);

  const handleMatchChat = useCallback(() => {
    setMatch(null);
    navigate("/chat");
  }, [navigate]);

  useEffect(() => {
    if (currPfp) preloadImage(currPfp);
  }, [currPfp]);

  useEffect(() => {
    Object.values(users).forEach((user) => {
      const src = images[user.email]?.[0]?.image;
      if (src) preloadImage(src);
    });
  }, [users, images]);

  const userCards = useMemo(() => {
    let rotated = 1;
    return Object.entries(users).map(([key, user]) => {
      rotated += 1;
      return {
        key,
        user,
        isRotated: rotated,
        images: images[user.email],
      };
    });
  }, [users, images]);

  return (
    <div className="feed gradient-background">
      <MatchOverlay
        open={Boolean(match && currPfp)}
        currentUser={{ image: currPfp }}
        matchedUser={{
          name: match?.name ?? "",
          image: match?.pfp ?? "",
        }}
        onChat={handleMatchChat}
        onClose={closeMatchScreen}
      />
      {isAuthenticated && (
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

          {
            loaded && Object.keys(users).length > 0 && (
              <ClickAwayListener onClickAway={handleTooltipClose}>
                <div>
                  <LightTooltip placement='left-start' title={
                    <React.Fragment>
                      {window.innerWidth > 900 && "Click the ← arrow on your keyboard to decline, and → to match. Use the ↑ and ↓ arrows to toggle through pictures."}
                      {window.innerWidth <= 900 && "Swipe left to decline, and swipe right to match."}
                    </React.Fragment>
                  }
                    onClose={handleTooltipClose}
                    open={openTooltip}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: window.innerWidth <= 900 ? [0, -14] : [0, 0],
                            },
                          },
                        ],
                      },
                    }}
                  >
                    <Button className='helpTooltip' onClick={handleTooltipOpen}>
                      <HelpOutlineOutlinedIcon fontSize="large" />
                    </Button>
                  </LightTooltip>
                </div>
              </ClickAwayListener>)
          }

          {userCards.map(({ key, user, isRotated, images: userImages }) => (
            <UserCard
              key={key}
              isRotated={isRotated}
              user={user}
              users={users}
              setUsers={setUsers}
              setMatch={setMatch}
              images={userImages}
            />
          ))}

          {Object.keys(users).length === 0 && loaded && (
            <Box className="p-4">
              <h1>no more candidates, come back later!</h1>
            </Box>
          )}
        </>
      )}
      {!loading && !isAuthenticated && (
        <div className="p-4 centeredDiv">
          Session expired, please log back in.
        </div>
      )}
    </div>
  );
};
export default Feed;
