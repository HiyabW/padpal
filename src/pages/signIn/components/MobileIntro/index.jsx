import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./styles.css"
import { Player } from '@lordicon/react'; // Import the Player component
const homeIcon = require(`${process.env.PUBLIC_URL}/animatedIcons/homeIcon.json`);

const MobileIntro = ({ text }) => {
    const playerRef = useRef(null);
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    return <motion.div
        className="mobileIntro text-center"
        // initial={{ scale: 0 }}           // Initial scale (small)
        // animate={{ scale: 1 }}           // Animate to original size
        // transition={{
        //     type: 'spring',
        //     stiffness: 300,               // Spring stiffness
        //     damping: 25,                  // Damping for smoothness
        //     duration: 0.5,                 // Duration of the animation
        // }}
        style={{
            display: 'flex',
            alignItems: 'end'
        }}
    >

        <Player
            ref={playerRef}
            icon={homeIcon}
            size={100}
        />
        <h1 style={{marginLeft: '1rem'}}>
            <i>PadPal</i>
        </h1>
    </motion.div>;
}

export default MobileIntro