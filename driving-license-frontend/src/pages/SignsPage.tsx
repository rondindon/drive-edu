import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/LoadingSpinner";
import TypedText from "src/components/TypedText";
import { ThemeContext } from "../context/ThemeContext";
import AppHelmet from "src/components/AppHelmet";

// Define the shape of a Road Sign Question
interface RoadSignQuestion {
  id: number;
  text: string;          // Question text
  options: string[];     // e.g., ["Stop sign", "Yield sign", "Speed limit"]
  correctAnswer: string; // "A", "B", "C", or "D"
  imageUrl?: string;
  explanation?: string;
}

type AnimationState = "idle" | "correct" | "incorrect";

// Array of messages to be typed out in the spinner
const typedMessages = [
  "Checking your license status...",
  "Reviewing your traffic knowledge...",
  "Adjusting your side mirrors...",
  "Ready... Set... Go!",
];

const SignsPage: React.FC = () => {
  // State for questions and navigation
  const [questions, setQuestions] = useState<RoadSignQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [removedLetters, setRemovedLetters] = useState<string[]>([]);
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const token = localStorage.getItem("supabaseToken");

  // Theme Context
  const { theme } = useContext(ThemeContext);

  // States for typed messages during loading
  const [typedIndex, setTypedIndex] = useState(0);
  const [showMessage, setShowMessage] = useState<string>(typedMessages[0]);

  // Animation variants for loading spinner
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  // Cycle through typed messages while loading
  useEffect(() => {
    if (!loading) return;

    setShowMessage(typedMessages[0]);
    setTypedIndex(0);

    const interval = setInterval(() => {
      setTypedIndex((prev) => {
        const nextIndex = (prev + 1) % typedMessages.length;
        setShowMessage(typedMessages[nextIndex]);
        return nextIndex;
      });
    }, 2200); // Change message every 2.2 seconds

    return () => clearInterval(interval);
  }, [loading]);

  // Fetch & shuffle road sign questions from the backend
  useEffect(() => {
    const fetchRoadSigns = async () => {
      try {
        const response = await axios.get("http://localhost:4444/api/questions/road-signs");
        // Optionally shuffle the questions if not already shuffled server-side
        const shuffledQuestions = response.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
      } catch (err: any) {
        console.error("Error fetching road signs:", err);
        setFetchError("Failed to load road signs.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoadSigns();
  }, [token]);

  // Fallback: If there's no image (and thus no onAnimationComplete trigger)
  // then trigger handleAnimationComplete after the expected animation duration.
  useEffect(() => {
    if (animationState === "incorrect" && !questions[currentIndex]?.imageUrl) {
      const timer = setTimeout(() => {
        handleAnimationComplete();
      }, 800); // Duration matching the option's incorrect animation
      return () => clearTimeout(timer);
    }
  }, [animationState, currentIndex, questions]);

  // Loading state: show spinner with typed messages
  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <LoadingSpinner>
            <TypedText text={showMessage} typingSpeed={30} />
          </LoadingSpinner>
        </motion.div>
      </motion.div>
    );
  }

  // Error or empty state handling
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-[hsl(var(--background))]">
        {fetchError}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <p>No road sign questions found.</p>
      </div>
    );
  }

  // Current question and progress calculation
  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedLetter === currentQuestion.correctAnswer;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const letters = ["A", "B", "C", "D"];
  const displayedOptions = currentQuestion.options.slice(0, letters.length);

  // Handle option selection
  const handleSelectOption = (letter: string) => {
    if (hasAnsweredCorrectly || animationState !== "idle" || isNavigating) return;

    setSelectedLetter(letter);

    if (letter === currentQuestion.correctAnswer) {
      setAnimationState("correct");
      setHasAnsweredCorrectly(true);
    } else {
      setAnimationState("incorrect");
    }
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (animationState === "correct" && !isNavigating) {
      setIsNavigating(true);
      // Auto-advance to next question after a short delay
      setTimeout(() => {
        handleNext();
        setIsNavigating(false);
      }, 800);
    } else if (animationState === "incorrect") {
      // Remove the incorrectly selected letter and allow user to choose again
      if (selectedLetter) {
        setRemovedLetters((prev) => [...prev, selectedLetter]);
      }
      setAnimationState("idle");
      setSelectedLetter(null);
    }
  };

  // Navigation: Move to next or previous question
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
    resetState();
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
    resetState();
  };

  // Reset states for a new question
  const resetState = () => {
    setRemovedLetters([]);
    setAnimationState("idle");
    setHasAnsweredCorrectly(false);
    setSelectedLetter(null);
  };

  // Animation variants for the image
  const imageVariants = {
    idle: { x: 0, rotate: 0, scale: 1 },
    incorrect: {
      // Shake horizontally
      x: [0, -10, 10, -10, 10, -10, 10, 0],
      transition: { duration: .75 },
    },
    correct: {
      y: [0, -10, 0],
      scale: [1, 1.05, 1],
      transition: { duration: .75 },
    },
  };

  const optionVariants = {
    idle: { opacity: 1, scale: 1 },
    incorrect: {
      backgroundColor: "#ef4444",
      color: "#fff",
      opacity: [1, 1, 0],
      scale: [1, 1.05, 0],
      transition: { duration: 0.5 },
    },
    correct: {
      backgroundColor: "#10b981",
      color: "#fff",
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const navButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <AppHelmet title="DriveReady - Road Signs Practice" description="Test your knowledge of road signs with this interactive quiz. Identify the correct road sign based on the image and options provided." />
      <div className="w-full max-w-xl mb-6 mt-12">
        <div className="h-3 bg-gray-200 rounded-md overflow-hidden">
          <motion.div
            className="bg-green-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right text-sm text-gray-900 dark:text-gray-100 mt-1">
          {currentIndex + 1} / {questions.length} ({progress}%)
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-xl"
        >
          <Card className="p-6 shadow-lg rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            {currentQuestion.imageUrl && (
              <motion.img
                key={`${currentQuestion.id}-${animationState}`}
                src={currentQuestion.imageUrl}
                alt="Road Sign"
                className="w-64 h-64 object-contain rounded-md mx-auto mb-4"
                variants={imageVariants}
                animate={animationState}
                initial="idle"
                onAnimationComplete={handleAnimationComplete}
              />
            )}

            <motion.h2
              className="text-xl font-semibold text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {currentQuestion.text}
            </motion.h2>

            {/* Multiple-Choice Options */}
            <div className="w-full">
              {displayedOptions.map((optionText, idx) => {
                const letter = letters[idx];
                if (removedLetters.includes(letter)) return null;

                const isSelected = letter === selectedLetter;
                let animateVariant: "idle" | "correct" | "incorrect" = "idle";
                if (selectedLetter === letter) {
                  animateVariant = isCorrect ? "correct" : "incorrect";
                }

                return (
                  <motion.button
                    key={`${currentQuestion.id}-${letter}`}
                    onClick={() => handleSelectOption(letter)}
                    disabled={hasAnsweredCorrectly || animationState !== "idle" || isNavigating}
                    className={`block w-full mb-2 p-2 rounded-md border text-left 
                      ${
                        isSelected && !hasAnsweredCorrectly
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      }
                      hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer focus:outline-none
                    `}
                    variants={optionVariants}
                    initial="idle"
                    animate={animateVariant}
                    transition={{ duration: 0.5 }}
                    aria-label={`Option ${letter}: ${optionText}`}
                  >
                    <span className="font-bold mr-2">{letter})</span>
                    {optionText}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback for Correct Answer */}
            <AnimatePresence>
              {hasAnsweredCorrectly && (
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-semibold text-lg text-green-600">Correct!</p>
                  {currentQuestion.explanation && (
                    <p className="mt-2 text-sm italic">
                      Explanation: {currentQuestion.explanation}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex space-x-4 mt-6">
        <motion.div whileHover="hover" whileTap="tap" variants={navButtonVariants}>
          <Button
            variant="outline"
            onClick={handlePrev}
            className={`${
              theme === "dark"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 hover:text-[hsl(var(--primary-foreground))]"
            }`}
            aria-label="Previous Question"
          >
            Previous
          </Button>
        </motion.div>

        <motion.div whileHover="hover" whileTap="tap" variants={navButtonVariants}>
          <Button
            variant="outline"
            onClick={handleNext}
            className={`${
              theme === "dark"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 hover:text-[hsl(var(--primary-foreground))]"
            }`}
            aria-label="Next Question"
          >
            Next
          </Button>
        </motion.div>
      </div>

      {/* Question Counter */}
      <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
        Question {currentIndex + 1} of {questions.length}
      </p>
    </div>
  );
};

export default SignsPage;