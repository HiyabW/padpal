import React, { useEffect, useRef } from "react";
import { Player } from "@lordicon/react";
import "./styles.css";

const homeIcon = require(`${process.env.PUBLIC_URL}/public/animatedIcons/homeIcon.json`);

function HomeIcon({ size = 80, className = "" }) {
  const playerRef = useRef(null);

  useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, []);

  return (
    <div className={`pp-sign-in-home-icon ${className}`.trim()} aria-hidden="true">
      <Player ref={playerRef} icon={homeIcon} size={size} />
    </div>
  );
}

export default HomeIcon;
