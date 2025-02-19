import React, { useState } from "react";
import Crossroad from "../components/Crossroad";
import { scenarios, Scenario } from "../utils/scenarios";
import { FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const randomizeScenarioColors = (scenario: Scenario): Scenario => {
  const colorPalette = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "teal",
  ];
  const randomizedCars = scenario.cars.map((car) => ({
    ...car,
    color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
  }));
  return { ...scenario, cars: randomizedCars };
};

const CrossroadSimulator: React.FC = () => {
  const allScenarioIds = scenarios.map((s) => s.id);

  const [unusedScenarioIds, setUnusedScenarioIds] = useState<string[]>([
    ...allScenarioIds,
  ]);

  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    randomizeScenarioColors(scenarios[0])
  );
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  const [feedback, setFeedback] = useState<{
    type: "error" | "success" | null;
    message: string;
  }>({ type: null, message: "" });

  const resetOrder = () => {
    setSelectedOrder([]);
  };

  const handleCarClick = (carId: string) => {
    if (selectedOrder.includes(carId)) {
      setSelectedOrder((prev) => prev.filter((id) => id !== carId));
    } else {
      if (selectedOrder.length < selectedScenario.cars.length) {
        setSelectedOrder((prev) => [...prev, carId]);
      }
    }
  };

  const pickRandomScenario = () => {
    setFeedback({ type: null, message: "" });

    // Determine available scenario IDs: unused or all if none left
    let availableIds =
      unusedScenarioIds.length > 0 ? [...unusedScenarioIds] : [...allScenarioIds];

    if (availableIds.length > 1) {
      availableIds = availableIds.filter((id) => id !== selectedScenario.id);
    }

    const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
    const found = scenarios.find((s) => s.id === randomId);

    if (found) {
      setSelectedScenario(randomizeScenarioColors(found));
      setSelectedOrder([]);
    } else {
      setSelectedScenario(randomizeScenarioColors(scenarios[0]));
      setSelectedOrder([]);
    }
  };

  const handleCorrectOrder = () => {
    setFeedback({
      type: "success",
      message: "Correct order!",
    });

    const usedId = selectedScenario.id;
    setUnusedScenarioIds((prev) => prev.filter((id) => id !== usedId));

    setTimeout(() => {
      pickRandomScenario();
      resetOrder();
    }, 1000);
  };

  const validateOrder = () => {
    if (selectedScenario.validateOrder) {
      const isCorrect = selectedScenario.validateOrder(selectedOrder);
      if (isCorrect) {
        handleCorrectOrder();
      } else {
        setFeedback({
          type: "error",
          message: "Incorrect order, please try again.",
        });
      }
      return;
    }

    if (selectedScenario.correctOrder) {
      const correct =
        JSON.stringify(selectedOrder) === JSON.stringify(selectedScenario.correctOrder);
      if (correct) {
        handleCorrectOrder();
      } else {
        setFeedback({
          type: "error",
          message: "Incorrect order, please try again.",
        });
      }
    } else {
      setFeedback({
        type: "error",
        message: "Validation error: missing correct order data.",
      });
    }
  };

  const canValidate = selectedOrder.length === selectedScenario.cars.length;

  // Called when user selects a scenario from the <select> (development usage)
  const handleScenarioSelect = (scenarioId: string) => {
    const found = scenarios.find((s) => s.id === scenarioId);
    setSelectedScenario(randomizeScenarioColors(found || scenarios[0]));
    resetOrder();
  };

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

  const buttonHover = {
    scale: 1.05,
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
  };

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

        <motion.div
          className="mt-4 flex items-center justify-center w-full max-w-xl min-h-[48px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-bold mr-4">Selected Order:</h2>
          <div className="flex gap-2">
            {selectedOrder.map((carId, index) => (
              <motion.div
                key={carId}
                custom={index}
                variants={orderItemVariants}
                initial="hidden"
                animate="visible"
                className="px-2 py-1 bg-[hsl(var(--muted))] rounded border border-[hsl(var(--foreground))] text-[hsl(var(--foreground))]"
              >
                {index + 1}. {carId.toUpperCase()}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Crossroad
          scenario={selectedScenario}
          onCarClick={handleCarClick}
          selectedOrder={selectedOrder}
        />

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
                    : "bg-green-500 text-white"
                }
              `}
            >
              {feedback.type === "error" && (
                <FaExclamationCircle className="text-xl" />
              )}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
      </motion.div>
    </AnimatePresence>
  );
};

export default CrossroadSimulator;