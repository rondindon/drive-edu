import React from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  isActive: boolean;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, isActive }) => {
  return (
    <motion.span
      className={`relative inline-block ${
        isActive
          ? "bg-gradient-to-r from-main-green to-main-darkBlue bg-clip-text text-transparent animate-gradient"
          : "text-secondary-lightGray"
      }`}
      style={
        isActive
          ? {
              backgroundSize: "200% auto", // Makes gradient span across
              animation: "gradientMove 2s linear infinite",
            }
          : {}
      }
    >
      {text}
    </motion.span>
  );
};

export default AnimatedText;