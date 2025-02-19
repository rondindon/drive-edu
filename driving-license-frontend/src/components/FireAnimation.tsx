// src/components/FireAnimation.tsx

import React from "react";
import { motion } from "framer-motion";

const FireAnimation: React.FC<{ width?: number; height?: number }> = ({ width = 50, height = 50 }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 185.68 238.8"
      width={width}
      height={height}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="fire-animation"
    >
      <defs>
        <style>
          {`
            .cls-1{fill:#FC7226;}
            .cls-2{fill:#FC8223;}
            .cls-3{fill:#FC8223;}
            .cls-4{fill:#FC9823;}
          `}
        </style>
      </defs>
      <title>Fire</title>
      
      <g className="cir" data-name="Layer 5">
        <motion.circle
          className="cls-1 cirGroup1"
          cx="59.04"
          cy="98.87"
          r="3.48"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
       
        <motion.circle
          id="my-circle"
          className="cls-1 cirGroup2"
          cx="35.53"
          cy="189.04"
          r="6.31"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          className="cls-1 cirGroup1"
          cx="145.7"
          cy="197.82"
          r="6.31"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          id="my-circle1"
          className="cls-1 cirGroup2"
          cx="159.7"
          cy="173.67"
          r="3.47"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          className="cls-1 cirGroup3"
          cx="48.51"
          cy="159.07"
          r="3.47"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          className="cls-1 cirGroup3"
          cx="141.07"
          cy="137.56"
          r="2.45"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          id="my-circle2"
          className="cls-1 cirGroup2"
          cx="100.67"
          cy="131.2"
          r="2.45"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </g>
      
      <g data-name="Layer 3">
        <motion.path
          className="cls-2 sideFlame1"
          d="M47.38,151c-9.76-4-34.9-17.48-34.9-17.48s2.29,46,15,68.12l.06.1q.33.58.68,1.13l.25.41a30.73,30.73,0,0,0,3.93,5.06l.18.17a34,34,0,0,0,46.91,2.17c14.19-12.33,16.39-34.45,3.38-48C71,150.36,57.14,155.07,47.38,151Z"
          animate={{
            fill: ["#FC7226", "#FC9823", "#FC7226"],
            y: [0, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        />
        <motion.path
          className="cls-2 sideFlame"
          d="M136.58,149c9.76-4,34.9-17.48,34.9-17.48s-2.29,46-15,68.12l-.06.1q-.33.58-.68,1.13l-.25.41a30.73,30.73,0,0,1-3.93,5.06l-.18.17a34,34,0,0,1-46.91,2.17c-14.19-12.33-16.39-34.45-3.38-48C112.91,148.36,126.82,153.07,136.58,149Z"
          animate={{
            fill: ["#FC7226", "#FC9823", "#FC7226"],
            y: [0, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        /> 
        
        <motion.path
          className="cls-1 flame"
          d="M158.83,151.17C145.08,107.52,91.48,42.72,91.48,42.72S39.85,107.18,25.64,148.44a60.27,60.27,0,0,0-5.34,24.82c0,20.82,10.67,39.35,27.26,51.29l.59.42,1.26.87A75.2,75.2,0,0,0,92,238.8c39.32,0,71.19-29.19,71.19-65.2A60.19,60.19,0,0,0,158.83,151.17Z"
          animate={{
            fill: ["#FC7226", "#FC9823", "#FC7226"],
            y: [0, -10, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
        />       
        <motion.path
          className="cls-3 flame3"
          d="M147.49,159.2c-11.43-39.6-56-98.38-56-98.38s-42.9,58.47-54.71,95.91a59.16,59.16,0,0,0,18.21,69l.49.38,1,.79a59.16,59.16,0,0,0,90.93-67.74Z"
          animate={{
            fill: ["#FC7226", "#FC9823", "#FC7226"],
            y: [0, -8, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
        />
        <motion.path
          className="cls-4 flame2"
          d="M141.34,174.68c-10.17-31.89-49.79-79.23-49.79-79.23s-38.17,47.09-48.68,77.23a43.59,43.59,0,0,0-4,18.13c0,15.21,7.89,28.75,20.15,37.47l.43.31.93.64a56.06,56.06,0,0,0,31.48,9.47c29.06,0,52.63-21.33,52.63-47.63A43.52,43.52,0,0,0,141.34,174.68Z"
          animate={{
            fill: ["#FC7226", "#FC9823", "#FC7226"],
            y: [0, -8, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
        />
      </g>
    </motion.svg>
  );
};

export default FireAnimation;