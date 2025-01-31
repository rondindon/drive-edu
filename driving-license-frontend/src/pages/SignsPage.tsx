// src/pages/SignsPage.tsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card"; // Adjust the path as needed
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/LoadingSpinner"; // Optional spinner
import { ThemeContext } from "../context/ThemeContext"; // Import ThemeContext

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

const SignsPage: React.FC = () => {
  const [questions, setQuestions] = useState<RoadSignQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // The user's selected letter (e.g., "A", "B", "C")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  
  // Letters that have been removed due to incorrect selections
  const [removedLetters, setRemovedLetters] = useState<string[]>([]);
  
  // Current animation state: "idle", "correct", or "incorrect"
  const [animationState, setAnimationState] = useState<AnimationState>("idle");

  // Indicates if the current question has been answered correctly
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  // Flag to prevent multiple navigations
  const [isNavigating, setIsNavigating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const token = localStorage.getItem("supabaseToken");

  // Access Theme Context
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    // Fetch & shuffle questions from backend
    const fetchRoadSigns = async () => {
      try {
        const response = await axios.get("https://drive-edu.onrender.com/api/questions/road-signs", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // Loading, error, or empty state handling
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <LoadingSpinner />
      </div>
    );
  }

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

  // Current question data
  const currentQuestion = questions[currentIndex];
  
  // Determine correctness
  const isCorrect = selectedLetter === currentQuestion.correctAnswer;

  // Progress calculation
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Letters for labeling options
  const letters = ["A", "B", "C", "D"];
  const displayedOptions = currentQuestion.options.slice(0, letters.length);

  // Handle option selection
  const handleSelectOption = (letter: string) => {
    // Prevent selection if already answered correctly or mid-animation
    if (hasAnsweredCorrectly || animationState !== "idle" || isNavigating) return;

    setSelectedLetter(letter);

    if (letter === currentQuestion.correctAnswer) {
      // Correct answer selected
      setAnimationState("correct");
      setHasAnsweredCorrectly(true);
    } else {
      // Incorrect answer selected
      setAnimationState("incorrect");
    }
  };

  // Handle animations completion
  const handleAnimationComplete = () => {
    if (animationState === "correct" && !isNavigating) {
      setIsNavigating(true);
      // After correct animation, auto-advance to next question
      setTimeout(() => {
        handleNext();
        setIsNavigating(false);
      }, 800); // Adjusted delay for faster animation
    } else if (animationState === "incorrect") {
      // Remove the incorrectly selected letter and allow user to choose again
      if (selectedLetter) {
        setRemovedLetters((prev) => [...prev, selectedLetter]);
      }
      setAnimationState("idle"); // Reset animation state
      setSelectedLetter(null);    // Reset selected letter
    }
  };

  // Move to next question
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
    resetState();
  };

  // Move to previous question
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
      transition: { duration: 1.5 },
    },
    correct: {
      y: [0, -10, 0], // Smaller jump
      scale: [1, 1.05, 1], // Smaller scale
      transition: { duration: 1 },
    },
  };

  // Animation variants for the options
  const optionVariants = {
    idle: { opacity: 1, scale: 1 },
    incorrect: {
      backgroundColor: "#ef4444", // Tailwind red-500
      color: "#fff",
      opacity: [1, 1, 0],
      scale: [1, 1.05, 0],
      transition: { duration: 0.8 },
    },
    correct: {
      backgroundColor: "#10b981", // Tailwind green-500
      color: "#fff",
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 },
    },
  };

  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  // Animation variants for navigation buttons
  const navButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">

      {/* Progress Bar with Animation */}
      <div className="w-full max-w-xl mb-6 mt-12">
        <div className="h-3 bg-gray-200 rounded-md overflow-hidden">
          <motion.div
            className="bg-green-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {/* Updated the text color to match the title */}
        <div className="text-right text-sm text-gray-900 dark:text-gray-100 mt-1">
          {currentIndex + 1} / {questions.length} ({progress}%)
        </div>
      </div>

      {/* AnimatePresence to handle mounting/unmounting animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id} // Ensure unique key per question
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-xl"
        >
          <Card
            className="p-6 shadow-lg rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          >
            {/* Animated Image */}
            {currentQuestion.imageUrl && (
              <motion.img
                src={currentQuestion.imageUrl}
                alt="Road Sign"
                className="w-64 h-64 object-contain rounded-md mx-auto mb-4"
                variants={imageVariants}
                animate={animationState}
                initial="idle"
                onAnimationComplete={handleAnimationComplete}
              />
            )}

            {/* Question Text with Fade In */}
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
                // Skip rendering if this letter has been removed due to incorrect selection
                if (removedLetters.includes(letter)) return null;

                const isSelected = letter === selectedLetter;
                const isAnswer = letter === currentQuestion.correctAnswer;

                // Determine the animation variant
                let animateVariant: "idle" | "correct" | "incorrect" = "idle";
                if (selectedLetter === letter) {
                  animateVariant = isCorrect ? "correct" : "incorrect";
                }

                return (
                  <motion.button
                    key={`${currentQuestion.id}-${letter}`} // Unique key per option per question
                    onClick={() => handleSelectOption(letter)}
                    disabled={hasAnsweredCorrectly || animationState !== "idle" || isNavigating}
                    className={`block w-full mb-2 p-2 rounded-md border text-left 
                      ${
                        isSelected && !hasAnsweredCorrectly
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      }
                      hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors
                      cursor-pointer focus:outline-none
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

            {/* Feedback for Correct Answer with Animation */}
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

      {/* Navigation Buttons with Theme-Aware Colors and Animations */}
      <div className="flex space-x-4 mt-6">
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={navButtonVariants}
        >
          <Button
            variant="outline"
            onClick={handlePrev}
            className={`${
              theme === 'dark'
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 hover:text-[hsl(var(--primary-foreground))]"
            }`}
            aria-label="Previous Question"
          >
            Previous
          </Button>
        </motion.div>

        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={navButtonVariants}
        >
          <Button
            variant="outline"
            onClick={handleNext}
            className={`${
              theme === 'dark'
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/90"
                : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 hover:text-[hsl(var(--primary-foreground))]"
            }`}
            aria-label="Next Question"
          >
            Next
          </Button>
        </motion.div>
      </div>

      {/* Question Counter with updated color */}
      <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
        Question {currentIndex + 1} of {questions.length}
      </p>
    </div>
  );
};

export default SignsPage;