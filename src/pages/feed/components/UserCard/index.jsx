import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../../../../api/client";
import {
  ActionBar,
  SwipeCard,
  SwipeEdgeGlow,
  useSwipeGesture,
} from "../../../../components/swipe";
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
  const stackRotateOffset = 0;

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
    <>
      <SwipeEdgeGlow gesture={gesture} active={enabled && isFront} />
      <motion.div
      className={[
        "userFeedCardDiv",
        isFront && "userFeedCardDiv--front",
        !isFront && "userFeedCardDiv--back",
        feedOrViewProfile !== "feed" ? "viewProfile" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={gesture.shellStyle}
    >
      <div className="userFeedCardClip">
        <div className="userFeedCardScroll">
          <SwipeCard gesture={gesture} isStacked={!isFront}>
            <UserCardContent
              user={user}
              images={images}
              feedOrViewProfile={feedOrViewProfile}
              isActive={isFront}
            />
            {enabled && (
              <ActionBar
                onReject={() => gesture.swipeProgrammatic("left", { slow: true })}
                onMatch={() => gesture.swipeProgrammatic("right", { slow: true })}
                onShare={() => {}}
                onReport={() => {}}
                disabled={!isFront}
              />
            )}
          </SwipeCard>
        </div>
      </div>
      </motion.div>
    </>
  );
};

export default React.memo(UserCard);
