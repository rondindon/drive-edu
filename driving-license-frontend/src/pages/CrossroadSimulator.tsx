// src/pages/CrossroadSimulator.tsx
import React, { useState } from "react";
import Crossroad from "../components/Crossroad";
import { scenarios, Scenario } from "../utils/scenarios";
import { FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const CrossroadSimulator: React.FC = () => {
  // All scenario IDs
  const allScenarioIds = scenarios.map((s) => s.id);

  // State to track which scenario IDs haven't been solved yet
  const [unusedScenarioIds, setUnusedScenarioIds] = useState<string[]>([...allScenarioIds]);

  // Pick the first scenario by default
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  // Feedback message for correct/incorrect attempts
  const [feedback, setFeedback] = useState<{
    type: "error" | "success" | null;
    message: string;
  }>({ type: null, message: "" });

  // Helper to reset the user’s chosen order & feedback
  const resetOrder = () => {
    setSelectedOrder([]);
  };

  // On car click, toggle it in the user’s chosen order
  const handleCarClick = (carId: string) => {
    if (selectedOrder.includes(carId)) {
      // remove the car
      setSelectedOrder((prev) => prev.filter((id) => id !== carId));
    } else {
      // add if there's room
      if (selectedOrder.length < selectedScenario.cars.length) {
        setSelectedOrder((prev) => [...prev, carId]);
      }
    }
  };

  // Randomly pick a scenario from the list of unused scenarios
  // If none left, reset them to the full scenario list
  const pickRandomScenario = () => {
    setFeedback({ type: null, message: "" });

    // If we've used them all, reset
    if (unusedScenarioIds.length === 0) {
      setUnusedScenarioIds([...allScenarioIds]);
    }

    // Re-check in case we just reset
    const randomList =
      unusedScenarioIds.length === 0 ? [...allScenarioIds] : unusedScenarioIds;
    const randomId = randomList[Math.floor(Math.random() * randomList.length)];
    const found = scenarios.find((s) => s.id === randomId);

    if (found) {
      setSelectedScenario(found);
      setSelectedOrder([]);
    } else {
      // fallback if not found
      setSelectedScenario(scenarios[0]);
      setSelectedOrder([]);
    }
  };

  // Called when the user guesses the correct order
  const handleCorrectOrder = () => {
    setFeedback({
      type: "success",
      message: "Correct order!",
    });

    // Mark current scenario as used
    const usedId = selectedScenario.id;
    setUnusedScenarioIds((prev) => prev.filter((id) => id !== usedId));

    // After a brief delay, pick a new scenario
    setTimeout(() => {
      pickRandomScenario();
      resetOrder();
    }, 1000);
  };

  // Validate user’s chosen order
  const validateOrder = () => {
    // If there's a custom validator, use that
    if (selectedScenario.validateOrder) {
      const isCorrect = selectedScenario.validateOrder(selectedOrder);
      if (isCorrect) {
        handleCorrectOrder();
      } else {
        setFeedback({
          type: "error",
          message: "Incorrect. Please review the special rules for this scenario.",
        });
      }
      return;
    }

    // Otherwise check the array
    if (selectedScenario.correctOrder) {
      const correct =
        JSON.stringify(selectedOrder) === JSON.stringify(selectedScenario.correctOrder);
      if (correct) {
        handleCorrectOrder();
      } else {
        setFeedback({
          type: "error",
          message: "Incorrect order! Check your priority rules.",
        });
      }
    } else {
      setFeedback({
        type: "error",
        message: "No correctOrder or custom validation provided for this scenario.",
      });
    }
  };

  const canValidate = selectedOrder.length === selectedScenario.cars.length;

  // Called when user selects a scenario from the <select> (dev usage)
  const handleScenarioSelect = (scenarioId: string) => {
    const found = scenarios.find((s) => s.id === scenarioId);
    setSelectedScenario(found || scenarios[0]);
    resetOrder();
  };

  // Define animation variants for the main container
  const pageVariants = {
    hidden: { opacity: 0, y: +50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: { 
      opacity: 0, 
      y: 50,
      transition: { duration: 0.5, ease: "easeIn" },
    },
  };

  // Define variants for the feedback popup
  const feedbackVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // Define hover animation for buttons
  const buttonHover = {
    scale: 1.05,
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
  };

  // Define variants for selected order items
  const orderItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, delay: i * 0.05 },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col items-center gap-4 p-8 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-screen"
      >
        <h1 className="text-2xl font-bold">Crossroad Simulator</h1>

        {/* Scenario <select> (development usage) */}
        <motion.select
          className="p-2 border border-[hsl(var(--muted))] rounded bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          value={selectedScenario.id}
          onChange={(e) => handleScenarioSelect(e.target.value)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </motion.select>

        {/* Crossroad Display */}
        <Crossroad
          scenario={selectedScenario}
          onCarClick={handleCarClick}
          selectedOrder={selectedOrder}
        />

        {/* Feedback Popup with Animation */}
        <AnimatePresence>
          {feedback.type && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                flex items-center gap-2 px-4 py-2 rounded shadow
                ${
                  feedback.type === "error"
                    ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]"
                    : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                }
              `}
            >
              {feedback.type === "error" && <FaExclamationCircle className="text-xl" />}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons with Hover Animations */}
        <div className="flex gap-4">
          <motion.button
            whileHover={buttonHover}
            className="
              px-4 py-2 rounded shadow 
              bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]
              hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]
              transition-colors
            "
            onClick={resetOrder}
          >
            Reset
          </motion.button>
          <motion.button
            whileHover={buttonHover}
            disabled={!canValidate}
            className="
              px-4 py-2 rounded shadow
              bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-[hsl(var(--primary))]/90
              transition-colors
            "
            onClick={validateOrder}
          >
            Validate Order
          </motion.button>
        </div>

        {/* Show scenario details only if user guessed incorrectly */}
        <AnimatePresence>
          {feedback.type === "error" && (
            <motion.div
              variants={{
                hidden: { opacity: 0, height: 0 },
                visible: { 
                  opacity: 1, 
                  height: "auto",
                  transition: { duration: 0.5, ease: "easeOut" },
                },
                exit: { 
                  opacity: 0, 
                  height: 0,
                  transition: { duration: 0.3, ease: "easeIn" },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4 text-center bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4 rounded shadow w-full max-w-xl overflow-hidden"
            >
              <h2 className="text-lg font-bold mb-2">{selectedScenario.name}</h2>
              <p className="mb-2 text-sm">{selectedScenario.description}</p>
              <ul className="list-disc list-inside text-xs text-left space-y-1">
                {selectedScenario.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User's Chosen Order with Animations */}
        <motion.div
          className="mt-4 text-center w-full max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-bold">Selected Order</h2>
          <div className="flex gap-2 flex-wrap justify-center mt-2">
            {selectedOrder.map((carId, index) => (
              <motion.div
                key={carId}
                custom={index}
                variants={orderItemVariants}
                initial="hidden"
                animate="visible"
                className="
                  px-2 py-1 bg-[hsl(var(--muted))]
                  rounded border border-[hsl(var(--foreground))]
                  text-[hsl(var(--foreground))]
                "
              >
                {index + 1}. {carId.toUpperCase()}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrossroadSimulator;