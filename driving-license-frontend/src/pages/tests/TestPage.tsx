import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { Progress } from 'src/components/ui/progress'; // or wherever your shadcn progress is

interface Question {
  id: number;
  category: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  imageUrl?: string; // If you store an image URL
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('supabaseToken');

  const { questions = [], testId = null }: { questions: Question[]; testId: number | null } =
    state || {};

  // Unique categories
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // If only 3 options
  const letterMap = ['A', 'B', 'C'];

  const [currentIndex, setCurrentIndex] = useState(0);

  // We'll track "score" if needed for your final pass/fail, 
  // but we won't push each answer to the DB individually.
  const [score, setScore] = useState(0);

  // 30 minutes => 1800 seconds
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Local answers: userAnswers[i] = 'A'|'B'|'C'
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  // === Timer Effect ===
  useEffect(() => {
    if (!questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest(); // auto-finish if time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // Convert timeLeft to a % for the progress bar
  const totalDuration = 30 * 60; // 1800
  const progressValue = (timeLeft / totalDuration) * 100;

  // For display: minutes:seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Store user’s choice locally (no immediate DB calls)
  const handleAnswer = (selectedIndex: number) => {
    const currentQuestion = questions[currentIndex];
    const chosenLetter = letterMap[selectedIndex];
    const isCorrect = chosenLetter === currentQuestion.correctAnswer;

    // Update userAnswers
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = chosenLetter;
      return updated;
    });

    // Optionally track local "score"
    if (isCorrect) {
      setScore((prev) => prev + (currentQuestion.points || 0));
    } else {
      setScore((prev) => Math.max(prev - (currentQuestion.points || 0), 0));
    }
    // No further navigation here—Next/Previous is separate
  };

  // Navigation
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  function jumpToQuestion(index: number) {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }

  function jumpToCategory(cat: string) {
    const idx = questions.findIndex((q) => q.category === cat);
    if (idx !== -1) setCurrentIndex(idx);
  }

  // Finish test: one final POST with userAnswers
  const finishTest = async () => {
    const isPassed = score >= 90; 
    if (!testId) {
      alert('No valid testId found. Returning to homepage.');
      navigate('/');
      return;
    }

    try {
      const response = await fetch('http://localhost:4444/api/tests/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          testId,
          score,
          timeTaken: totalDuration - timeLeft, // how long user spent
          isPassed,
          // include final answers for DB if needed
          userAnswers: userAnswers.map((answer, i) => ({
            questionId: questions[i].id,
            selected: answer,
            isCorrect: answer === questions[i].correctAnswer
          })),
        }),
      });

      const data = await response.json();
      console.log('Finish response:', data);

      // Navigate to results
      navigate('/results', {
        state: {
          score,
          totalQuestions: questions.length,
          isPassed,
        },
      });
    } catch (error) {
      console.error('Error finishing test:', error);
      alert('Error finishing test');
      navigate('/');
    }
  };

  // If no questions
  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-lightGray text-main-darkBlue">
        <p className="p-4">No questions loaded. Please start a test from the landing page.</p>
      </div>
    );
  }

  // Current question
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex]; // Get selected answer for current question

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary-lightGray text-main-darkBlue px-4 py-8">
      {/* Top row: progress bar & time left + question points */}
      <div className="mb-6 w-[70%] flex items-center justify-between gap-4">
        {/* Left side: progress bar + time left */}
        <div className="flex items-center w-2/3 gap-2">
          <Progress value={progressValue} className="h-2 w-full" />
          <span className="text-sm font-medium text-main-darkBlue">
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        {/* Right side: Points for current question */}
        <div className="text-sm font-medium text-right w-1/3">
          Points: {currentQuestion.points}
        </div>
      </div>

      {/* Main container */}
      <div className="w-[70%]">
        <div className="flex gap-6 items-start">
          {/* Categories box */}
          <aside
            className="
              bg-white
              rounded
              shadow
              p-4
              text-left
              w-56
              h-[39rem]
              overflow-auto
              shrink-0
            "
          >
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant="secondary"
                  size={'reactive'}
                  className="
                    w-full
                    text-xs
                    whitespace-normal
                    break-words
                    text-left
                    leading-tight
                    bg-[#ECF0F1]
                    hover:bg-[#BDC3C7]
                    text-main-darkBlue
                    px-4 py-2
                  "
                  onClick={() => jumpToCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </aside>

          {/* Main column */}
          <main className="flex-1 flex flex-col gap-4">
            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {questions.map((_, i) => (
                <Button
                  key={i}
                  variant="secondary"
                  className={`
                    w-10 h-10
                    flex items-center justify-center
                    text-sm
                    ${i === currentIndex ? 'bg-main-green text-white' : 'bg-white'}
                  `}
                  onClick={() => jumpToQuestion(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            {/* Question box */}
            <div className="bg-white rounded shadow p-6 flex-1 overflow-auto">
              {/* Title = question text */}
              <h2 className="text-xl font-bold mb-4 whitespace-normal break-words max-w-4xl">
                {currentQuestion.text}
              </h2>

              {/* If there's an image, display it */}
              {currentQuestion.imageUrl && (
                <div className="mb-4">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="question"
                    className="max-w-full h-auto rounded shadow-sm"
                  />
                </div>
              )}

              {/* Answers */}
              <div className="space-y-2 mb-4">
                {currentQuestion.options.map((option, idx) => {
                  const optionLetter = letterMap[idx];
                  const isSelected = selectedAnswer === optionLetter;

                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size={'reactive'}
                      className={`
                        w-full
                        text-left
                        justify-start
                        bg-secondary-greenBackground
                        hover:bg-secondary.red
                        hover:text-white
                        whitespace-normal
                        break-words
                        px-4 py-3
                        max-w-3xl
                        text-xs
                        ${isSelected ? 'bg-main-green text-white' : ''}
                      `}
                      onClick={() => handleAnswer(idx)}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>

              {/* Next/Prev + Finish on last */}
              <div className="flex justify-between">
                <Button onClick={() => prevQuestion()} disabled={currentIndex === 0}>
                  Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                  <Button onClick={() => nextQuestion()}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={finishTest}
                    className="bg-main-green text-white hover:bg-green-700"
                  >
                    Finish Test
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TestPage;