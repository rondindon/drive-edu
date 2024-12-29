import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define a Question interface for clarity
interface Question {
  id: number;
  text: string;
  options: string[];      // e.g. ["Answer A text", "Answer B text", "Answer C text"]
  correctAnswer: string;  // either "A", "B", or "C"
  points: number;         // e.g. 1
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem("supabaseToken");

  // If user navigated via navigate('/test/:testId', { state: { questions, testId } })
  const { questions = [], testId = null }: { questions: Question[]; testId: number | null } =
    state || {};

  // Mapping index 0 -> "A", 1 -> "B", 2 -> "C"
  const letterMap = ["A", "B", "C"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  // 30 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Track user answers for potential debugging/review (optional)
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  // === 1. TIMER EFFECT ===
  useEffect(() => {
    if (!questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest(); // automatically finish if time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // === 2. HANDLE ANSWER ===
  const handleAnswer = (selectedIndex: number) => {
    const currentQuestion = questions[currentIndex];
    // Convert selectedIndex (0,1,2) to a letter "A", "B", or "C"
    const chosenLetter = letterMap[selectedIndex];

    console.log("Selected letter:", chosenLetter);
    console.log("Correct letter:", currentQuestion.correctAnswer);

    // Store user’s chosen letter (optional, for reference)
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = chosenLetter;
      return updated;
    });

    // Compare with question’s correctAnswer
    if (chosenLetter === currentQuestion.correctAnswer) {
      setScore((prev) => prev + (currentQuestion.points || 0));
    } else {
      // Optionally record a "wrong answer" in the DB
      // fetch('/wrong-answers', { ... })
    }

    // Move to next question or finish if last question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  // === 3. FINISH TEST LOGIC ===
  const finishTest = async () => {
    // Example pass/fail if your max is 40 points. Adjust as needed.
    const isPassed = score >= 35;

    if (!testId) {
      alert('No valid testId found. Returning to homepage.');
      navigate('/');
      return;
    }

    try {
      const response = await fetch('http://localhost:4444/api/tests/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          testId,
          score,
          timeTaken: 30 * 60 - timeLeft,
          isPassed,
        }),
      });

      const data = await response.json();
      console.log("Finish response:", data);
      alert(data.message || 'Test completed');
    } catch (error) {
      console.error('Error finishing test:', error);
      alert('Error finishing test');
    } finally {
      navigate('/');
    }
  };

  // === 4. RENDERING ===
  if (!questions.length) {
    return <p className="p-4">No questions loaded. Please start a test from the landing page.</p>;
  }

  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Timer */}
      <div className="text-right text-red-600 font-semibold mb-2">
        Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-3">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="mb-4">{currentQuestion.text}</p>

      {/* Options */}
      {currentQuestion.options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => handleAnswer(idx)} // Pass the index (0,1,2)
          className="block w-full text-left p-2 my-2 bg-blue-200 hover:bg-blue-300 rounded transition-colors"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default TestPage;