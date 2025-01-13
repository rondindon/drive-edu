import React, { useEffect, useState } from "react";

interface TypedTextProps {
  text: string;
  typingSpeed?: number; // Optional: ms delay between letters
  onTypingComplete?: () => void; // Optional: callback after typing finishes
}

const TypedText: React.FC<TypedTextProps> = ({
  text,
  typingSpeed,
  onTypingComplete,
}) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let isUnmounted = false;
    setDisplayed(""); // reset typed content when text changes

    const typeLetterByLetter = async () => {
      for (let i = 0; i < text.length; i++) {
        if (isUnmounted) break;
        setDisplayed((prev) => prev + text[i]);
        await new Promise((resolve) => setTimeout(resolve, typingSpeed));
      }
      if (!isUnmounted && onTypingComplete) {
        onTypingComplete();
      }
    };

    typeLetterByLetter();

    return () => {
      isUnmounted = true;
    };
  }, [text, typingSpeed, onTypingComplete]);

  return <p className="text-sm whitespace-pre-wrap animate-fadeIn">{displayed}</p>;
};

export default TypedText;