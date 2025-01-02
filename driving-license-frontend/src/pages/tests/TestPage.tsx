import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button'; // Adjust import path if needed

interface Question {
  id: number;
  category: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('supabaseToken');

  const { questions = [], testId = null }: { questions: Question[]; testId: number | null } =
    state || {};

  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const letterMap = ['A', 'B', 'C']; // If only 3 options

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  useEffect(() => {
    if (!questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  function jumpToQuestion(index: number) {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }

  function jumpToCategory(cat: string) {
    const idx = questions.findIndex((q) => q.category === cat);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  }

  const handleAnswer = async (selectedIndex: number) => {
    const currentQuestion = questions[currentIndex];
    const chosenLetter = letterMap[selectedIndex];
    const isCorrect = chosenLetter === currentQuestion.correctAnswer;

    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = chosenLetter;
      return updated;
    });

    // Record userAnswer
    await fetch('http://localhost:4444/api/user-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        testId,
        selected: chosenLetter,
        isCorrect
      }),
    });

    // Update score if correct
    if (isCorrect) {
      setScore((prev) => prev + (currentQuestion.points || 0));
    } else {
      // Optionally record a wrong answer
      try {
        await fetch('http://localhost:4444/api/wrong-answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            questionId: currentQuestion.id
          }),
        });
      } catch (err) {
        console.error('Error recording wrong answer:', err);
      }
    }

    // Go next or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

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
      console.log('Finish response:', data);

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

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-lightGray text-main-darkBlue">
        <p className="p-4">No questions loaded. Please start a test from the landing page.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary-lightGray text-main-darkBlue px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="flex gap-6">
          {/* Categories on the left */}
          <aside className="bg-white rounded shadow p-4 w-64 h-min">
            <h3 className="font-semibold text-lg mb-3">Categories</h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant="secondary"
                  className="px-6 py-3 bg-[#ECF0F1] hover:bg-[#BDC3C7] text-main-darkBlue min-w-[12rem]"
                  onClick={() => jumpToCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-6">
            {/* Timer & Score */}
            <div className="flex items-center justify-between">
              <div className="font-medium">
                Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm">Score: {score}</div>
            </div>

            {/* Question Navigation (numbers) */}
            <div className="flex flex-wrap gap-2">
              {questions.map((_, i) => (
                <Button
                  key={i}
                  variant="secondary"
                  className={`
                    px-3 py-1
                    ${i === currentIndex ? 'bg-main-green text-white' : 'bg-white'}
                  `}
                  onClick={() => jumpToQuestion(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            {/* Question Box */}
            <div className="bg-white rounded shadow p-6">
              <h2 className="text-xl font-bold mb-3">
                Question {currentIndex + 1} of {questions.length}
              </h2>
              {/* 
                For the question text to wrap:
                - whitespace-normal + break-words 
              */}
              <p className="mb-4 whitespace-normal break-words max-w-2xl">
                {currentQuestion.text}
              </p>

              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    /*
                      The keys for text-wrapping:
                      - 'whitespace-normal break-words'
                      - Use a <span> inside if needed
                    */
                    className="w-full text-left justify-start bg-secondary-greenBackground hover:bg-secondary.red hover:text-white max-w-2xl whitespace-normal break-words"
                    onClick={() => handleAnswer(idx)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TestPage;