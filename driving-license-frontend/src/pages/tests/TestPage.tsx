import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button'; // shadcn button (adjust path as needed)

interface Question {
  id: number;
  category: string;           // <-- Make sure each question has a 'category'
  text: string;
  options: string[];          // e.g. ["Answer A", "Answer B", "Answer C"]
  correctAnswer: string;      // e.g. "A", "B", or "C"
  points: number;             // e.g. 1
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('supabaseToken');

  // If user navigated here via: navigate('/test/:id', { state: { questions, testId } })
  const { questions = [], testId = null }: { questions: Question[]; testId: number | null } =
    state || {};

  // Extract all categories
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // Mapping index => letter
  const letterMap = ['A', 'B', 'C']; // If only 3 options

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [userAnswers, setUserAnswers] = useState<string[]>(() =>
    new Array(questions.length).fill('')
  );

  // === TIMER EFFECT ===
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

  // === NAVIGATE TO CATEGORY ===
  function jumpToCategory(category: string) {
    // Find the first question that matches this category
    const index = questions.findIndex((q) => q.category === category);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }

  // === HANDLE ANSWER ===
  const handleAnswer = async (selectedIndex: number) => {
    const currentQuestion = questions[currentIndex];
    const chosenLetter = letterMap[selectedIndex];

    console.log('Selected letter:', chosenLetter);
    console.log('Correct letter:', currentQuestion.correctAnswer);

    // Track user's chosen letter
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = chosenLetter;
      return updated;
    });
    
    const isCorrect = chosenLetter === currentQuestion.correctAnswer;
  
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
        isCorrect: isCorrect
      }),
    });  

    // If correct, add points
    if (isCorrect) {
      setScore((prev) => prev + (currentQuestion.points || 0));
    } else {
      // Record a wrong answer in the DB
      try {
        console.log('Recording wrong answer...');
        await fetch('http://localhost:4444/api/wrong-answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            // If needed, pass userId or let your backend decode from token
          }),
        });
      } catch (err) {
        console.error('Error recording wrong answer:', err);
      }
    }

    // Move to next question or finish if last question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  // === FINISH TEST ===
  const finishTest = async () => {
    // Example pass/fail threshold (if total is 40, requiring 90 might be too high, adjust as needed)
    const isPassed = score >= 90; // e.g. pass if 30+ points

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

      // Navigate to a results page, passing final data
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
      <p className="p-4 text-main-darkBlue">
        No questions loaded. Please start a test from the landing page.
      </p>
    );
  }

  // Current question
  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // === LAYOUT: Sidebar + Main Content ===
  return (
    <div className="flex min-h-screen bg-secondary-lightGray text-main-darkBlue">
      {/* Sidebar with categories */}
      <aside className="w-64 bg-main-darkBlue text-white p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {categories.map((cat) => (
          <Button
            variant="secondary"
            key={cat}
            className="w-full justify-start bg-[#34495E] hover:bg-[#2C3E50]"
            onClick={() => jumpToCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Timer & Question Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-main-darkBlue font-medium">
            Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-main-darkBlue">
            Score: {score}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-3">
            Question {currentIndex + 1} of {questions.length}
          </h2>
          <p className="mb-4">{currentQuestion.text}</p>

          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full text-left justify-start bg-secondary-greenBackground hover:bg-secondary.red hover:text-white"
                onClick={() => handleAnswer(idx)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPage;