import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Define a Question interface for clarity
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  // Add more fields if needed (e.g., imageUrl, difficulty, etc.)
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // If the user was navigated here via `navigate('/test/:testId', { state: { questions, testId } })`,
  // we can extract them from `state`. If not found, default to empty.
  const { questions = [], testId = null }: { questions: Question[]; testId: number | null } =
    state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  // 30 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Optionally, track user's answers (if you want to show them at the end or store them).
  const [userAnswers, setUserAnswers] = useState<string[]>(() =>
    new Array(questions.length).fill('')
  );

  // === 1. TIMER EFFECT ===
  useEffect(() => {
    // Only start the countdown if we actually have questions
    if (!questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // If time runs out, auto-finish
        if (prev <= 1) {
          clearInterval(timer);
          finishTest(); // automatically finish test
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // === 2. HANDLE ANSWER ===
  const handleAnswer = (selectedAnswer: string) => {
    const currentQuestion = questions[currentIndex];

    // Update user's answer in local state (optional, for reference)
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = selectedAnswer;
      return updated;
    });

    // If correct, add points
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + currentQuestion.points);
    } else {
      // Optionally record a "wrong answer" in the DB
      // E.g., fetch('/wrong-answers', { ... })
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
    // Example pass/fail condition: 90 points or more is a pass
    const isPassed = score >= 90;

    // If there's no `testId`, we can’t finish. (Could handle gracefully.)
    if (!testId) {
      alert('No valid testId found. Returning to homepage.');
      navigate('/');
      return;
    }

    try {
      const response = await fetch('/tests/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          score,
          timeTaken: 30 * 60 - timeLeft, // how much time the user spent
          isPassed,
        }),
      });

      const data = await response.json();
      // e.g., { message: 'Test finished!', test: { ... } }
      alert(data.message || 'Test completed');
    } catch (error) {
      console.error('Error finishing test:', error);
      alert('Error finishing test');
    } finally {
      // Navigate away from the Test page. Could go to a "Results" page instead.
      navigate('/');
    }
  };

  // === 4. RENDERING ===
  if (!questions.length) {
    // If there are no questions, show a message or redirect
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
          onClick={() => handleAnswer(option)}
          className="block w-full text-left p-2 my-2 bg-blue-200 hover:bg-blue-300 rounded transition-colors"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default TestPage;