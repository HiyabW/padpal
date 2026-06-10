import React, { useCallback } from "react";
import { apiFetch } from "../../../../api/client";
import { ActionBar, SwipeCard, useSwipeGesture } from "../../../../components/swipe";
import UserCardContent from "./UserCardContent";
import "./styles.css";

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
  feedOrViewProfile = "feed",
}) => {
  const isFront =
    feedOrViewProfile === "view profile" ? true : isKeyLast(users, user.email);
  const enabled = feedOrViewProfile === "feed";
  const stackRotateOffset =
    isFront || window.innerWidth <= 900 ? 0 : isRotated % 2 ? 4 : -4;

  const handleSwipe = useCallback(
    (isAMatch) => {
      apiFetch("/match/saveMatch", {
        method: "POST",
        body: JSON.stringify({ to: user._id, isAMatch }),
      })
        .then((r) => r.json())
        .then(() =>
          apiFetch("/match/getMatch", {
            method: "POST",
            body: JSON.stringify({ to: user._id }),
          })
        )
        .then((r) => r.json())
        .then((data) => {
          if (data.isAMatch) {
            setMatch({ name: user.name, pfp: images[0].image });
          }
        })
        .catch(console.log);

      setUsers((prev) => {
        const next = { ...prev };
        delete next[user.email];
        return next;
      });
    },
    [user, images, setMatch, setUsers]
  );

  const gesture = useSwipeGesture({
    enabled,
    isActive: isFront,
    onSwipeLeft: () => handleSwipe(false),
    onSwipeRight: () => handleSwipe(true),
    stackRotateOffset,
  });

  return (
    <div className={feedOrViewProfile !== "feed" ? "viewProfile" : ""}>
      <SwipeCard gesture={gesture} isStacked={!isFront} isFront={isFront}>
        <UserCardContent
          user={user}
          images={images}
          feedOrViewProfile={feedOrViewProfile}
        />
      </SwipeCard>
      {enabled && (
        <ActionBar
          onReject={() => gesture.swipeProgrammatic("left")}
          onMatch={() => gesture.swipeProgrammatic("right")}
          onShare={() => {}}
          onReport={() => {}}
          disabled={!isFront}
        />
      )}
    </div>
  );
};

export default React.memo(UserCard);
