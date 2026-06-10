import React, { useCallback, useEffect } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTime from "@mui/icons-material/AccessTime";
import MuiDivider from "@mui/material/Divider";
import styled from "@mui/material/styles/styled";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import DotProgress from "./components/DotProgress";
import { useAuth } from "../../../../context/AuthContext";
import { appNavigate } from "../../../../navigation";

const Divider = styled(MuiDivider)(({ theme }) => ({
  marginTop: "1rem",
  width: "100%",
  borderRadius: 2,
  border: "0.2px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
}));

function redirectToEditProfile() {
  appNavigate("/editProfile");
}

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
  const birthday = new Date(birthdayStr);
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthday.getDate())
  ) {
    age--;
  }

  return age;
}

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

const UserCardContent = ({ user, images, feedOrViewProfile = "feed" }) => {
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.id;
  const [imageIndex, setImageIndex] = React.useState(0);

  const nextPicture = useCallback(() => {
    setImageIndex((prev) => {
      const next = prev + 1;
      return next < images.length ? next : prev;
    });
  }, [images.length]);

  const previousPicture = useCallback(() => {
    setImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        nextPicture();
      }
      if (event.key === "ArrowUp") {
        previousPicture();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextPicture, previousPicture]);

  return (
    <>
      <div className="userFeedImageDiv">
        {images.length > 1 && (
          <div className="dotProgressDiv">
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
        <img className="userFeedImage" src={images[imageIndex].image} />
      </div>
      <div className="userFeedInfoDiv">
        <Grid
          container
          spacing={2}
          sx={{ marginBottom: user._id === currentUserId ? "1rem" : "" }}
        >
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: user._id === currentUserId ? 6 : 12,
            }}
            sx={{ overflowWrap: "break-word" }}
          >
            <h2>
              {user.name}
              {user._id !== "673eed0fd24e7b1c05d6616e" && user?.age
                ? `, ${getAge(user.age)}`
                : ``}
            </h2>
          </Grid>
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 6 }} sx={{ display: "flex" }}>
            {user._id === currentUserId && (
              <Button
                variant="contained"
                disableElevation
                className="editProfileButton"
                onClick={redirectToEditProfile}
              >
                Edit Profile
              </Button>
            )}
          </Grid>
        </Grid>
        {user._id !== "673eed0fd24e7b1c05d6616e" && (
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
        <div
          className="userFeedInfo"
          style={{ height: window.innerWidth <= 900 ? "27rem" : "" }}
        >
          <p>{user.bio}</p>
          <br />
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
          <br />
          <div className="hobbies">
            {user.hobbies.map((hobby) => {
              return (
                <Button key={hobby} className="option" variant="outlined">
                  {hobby}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCardContent;
