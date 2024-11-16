import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./styles.css"

const MobileIntro = ({ text }) => {
    return <motion.div
        className="mobileIntro text-center"
        initial={{ scale: 0 }}           // Initial scale (small)
        animate={{ scale: 1 }}           // Animate to original size
        transition={{
            type: 'spring',
            stiffness: 300,               // Spring stiffness
            damping: 25,                  // Damping for smoothness
            duration: 0.5,                 // Duration of the animation
        }}
    >
        <h1>
            <i>PadPal</i>
        </h1>
    </motion.div>;
}

export default MobileIntro