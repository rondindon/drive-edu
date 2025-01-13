// CrossroadSimulator.tsx
import React, { useState } from "react";
import Crossroad from "../components/Crossroad";
import { scenarios, Scenario } from "../utils/scenarios";
import { FaExclamationCircle } from "react-icons/fa";

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

  return (
    <div className="flex flex-col items-center gap-4 p-8 animate-fadeIn bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-screen">
      <h1 className="text-2xl font-bold">Crossroad Simulator</h1>

      {/* Scenario <select> (development usage) */}
      <select
        className="p-2 border border-[hsl(var(--muted))] rounded bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
        value={selectedScenario.id}
        onChange={(e) => handleScenarioSelect(e.target.value)}
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>

      {/* Crossroad Display */}
      <Crossroad
        scenario={selectedScenario}
        onCarClick={handleCarClick}
        selectedOrder={selectedOrder}
      />

      {/* Feedback Popup */}
      {feedback.type && (
        <div
          className={`
            flex items-center gap-2 px-4 py-2 rounded shadow
            transition-all duration-300 transform
            ${
              feedback.type === "error"
                ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] animate-scaleUp"
                : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] animate-scaleUp"
            }
          `}
        >
          {feedback.type === "error" && <FaExclamationCircle className="text-xl" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={resetOrder}
          className="
            px-4 py-2 rounded shadow 
            bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]
            hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]
          "
        >
          Reset
        </button>
        <button
          onClick={validateOrder}
          disabled={!canValidate}
          className="
            px-4 py-2 rounded shadow
            bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[hsl(var(--primary))]/90
          "
        >
          Validate Order
        </button>
      </div>

      {/* Show scenario details only if user guessed incorrectly */}
      {feedback.type === "error" && (
        <div className="mt-4 text-center bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4 rounded shadow w-full max-w-xl">
          <h2 className="text-lg font-bold mb-2">{selectedScenario.name}</h2>
          <p className="mb-2 text-sm">{selectedScenario.description}</p>
          <ul className="list-disc list-inside text-xs text-left space-y-1">
            {selectedScenario.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* User's Chosen Order */}
      <div className="mt-4 text-center w-full max-w-xl">
        <h2 className="text-lg font-bold">Selected Order</h2>
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {selectedOrder.map((carId, index) => (
            <div
              key={carId}
              className="
                px-2 py-1 bg-[hsl(var(--muted))]
                rounded border border-[hsl(var(--foreground))]
                text-[hsl(var(--foreground))]
              "
            >
              {index + 1}. {carId.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossroadSimulator;