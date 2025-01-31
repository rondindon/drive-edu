// src/pages/TestPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { Progress } from 'src/components/ui/progress';
import { FaFlag } from 'react-icons/fa'; // For the "report" icon

interface Question {
  id: number;
  category: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  imageUrl?: string;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('supabaseToken');

  const {
    questions = [],
    testId = null,
  }: { questions: Question[]; testId: number | null } = state || {};

  // Track if the test is fully finished (so we don’t prompt user again)
  const [testFinished, setTestFinished] = useState(false);

  // Standard local states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  // We'll treat timeLeft as a number of seconds
  const totalDuration = 30 * 60; // 30 min in seconds
  const [timeLeft, setTimeLeft] = useState(totalDuration);

  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  const letterMap = ['A', 'B', 'C'];

  // ================================
  // 1. Intercept Browser “Back”
  // ================================
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!testFinished) {
        // This intercepts the user pressing the back button
        e.preventDefault();

        const confirmLeave = window.confirm(
          'Are you sure you want to go back? The test is not finished. ' +
            'If you confirm, the test will be submitted and you will leave this page.'
        );
        if (confirmLeave) {
          finishTest(true); // finish the test, then navigate(-1)
          navigate(-1);
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // We push a dummy state so the user can always go “back” in a controlled manner
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testFinished]);

  // ================================
  // 2. Beforeunload Prompt
  // ================================
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!testFinished) {
        e.preventDefault();
        e.returnValue = ''; // Some browsers ignore custom text
        // Attempt minimal send if you like:
        if (testId) {
          const quickPayload = JSON.stringify({
            testId,
            message: 'User forcibly left. Partial data?',
          });
          const blob = new Blob([quickPayload], { type: 'application/json' });
          navigator.sendBeacon('https://drive-edu.onrender.com/api/tests/finish-quick', blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testFinished, testId]);

  // ================================
  // 3. Timer => auto-submit
  // ================================
  // Important: Use a "real-time" approach so it won't freeze when tabbed out.
  useEffect(() => {
    if (!questions.length) return;

    // We'll store the "start" time once, so we know the actual time elapsed.
    const startTimestamp = Date.now(); // in ms

    const timer = setInterval(() => {
      // how many seconds have actually passed
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);

      // The newTimeLeft is the total minus elapsed
      const newTimeLeft = totalDuration - elapsed;

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        finishTest();
        setTimeLeft(0);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [questions]);

  // For the progress bar
  const progressValue = (timeLeft / totalDuration) * 100;

  // For display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Unique categories in the question set
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // ================================
  // 4. Handling answers
  // ================================
  const handleAnswer = (selectedIndex: number) => {
    if (!questions.length) return;
    const q = questions[currentIndex];
    const chosenLetter = letterMap[selectedIndex];
    const isCorrect = chosenLetter === q.correctAnswer;

    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = chosenLetter;
      return updated;
    });

    // Optionally track local score
    if (isCorrect) {
      setScore((prev) => prev + (q.points || 0));
    } else {
      // deduct points if you like, or handle differently
      setScore((prev) => Math.max(prev - (q.points || 0), 0));
    }
  };

  // Next/Prev
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

  // Jump to question
  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // Jump to category
  const jumpToCategory = (cat: string) => {
    const idx = questions.findIndex((q) => q.category === cat);
    if (idx !== -1) setCurrentIndex(idx);
  };

  // ================================
  // 5. Finishing the Test
  // ================================
  const finishTest = (navigateBackAfter?: boolean) => {
    // If no valid test or already finished, just return or navigate away
    if (!testId) {
      alert('No valid testId found. Returning to homepage.');
      navigate('/');
      return;
    }

    // 1) compute final
    let finalScore = 0;
    const questionStatsPromises: Promise<any>[] = [];
    userAnswers.forEach((answer, idx) => {
      const q = questions[idx];
      const isCorrect = answer === q.correctAnswer;
      if (isCorrect) finalScore += (q.points || 0);

      // background stats
      questionStatsPromises.push(
        fetch('https://drive-edu.onrender.com/api/question-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionId: q.id, isCorrect }),
        })
      );
    });

    const isPassed = finalScore >= 90;
    // how many seconds were actually used
    const timeTaken = totalDuration - timeLeft;

    // 2) Build results data
    const resultsData = {
      isPassed,
      score: finalScore,
      totalQuestions: questions.length,
      testDate: '2023-10-07',
      group: 'B',
      timeTaken,
      questions: questions.map((q, i) => ({
        ...q,
        userAnswer: userAnswers[i],
      })),
    };

    // 3) Show results
    navigate('/results', {
      state: resultsData,
    });

    // 4) Fire off questionStats
    Promise.all(questionStatsPromises);

    // 5) final test data
    const payload = JSON.stringify({
      testId,
      score: finalScore,
      timeTaken,
      isPassed,
      userAnswers: userAnswers.map((answer, i) => ({
        questionId: questions[i].id,
        selected: answer,
        isCorrect: answer === questions[i].correctAnswer,
      })),
    });

    fetch('https://drive-edu.onrender.com/api/tests/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    })
      .then((res) => res.json())
      .then((data) => console.log('[finishTest] =>', data))
      .catch((err) => console.error('[finishTest] error =>', err));

    // Mark test as finished => no more prompts
    setTestFinished(true);

    // If we came from the "popstate" scenario, go back
    if (navigateBackAfter) {
      navigate(-1);
    }
  };

  // ================================
  // 6. Reporting logic
  // ================================
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [reportQuestionId, setReportQuestionId] = useState<number | null>(null);

  const openReportPopup = (qId: number) => {
    setReportQuestionId(qId);
    setReportDescription('');
    setShowReportPopup(true);
  };
  const closeReportPopup = () => {
    setShowReportPopup(false);
    setReportQuestionId(null);
    setReportDescription('');
  };

  const submitReport = async () => {
    if (!reportQuestionId || !reportDescription.trim()) {
      alert('Please provide a description');
      return;
    }

    try {
      const resp = await fetch('https://drive-edu.onrender.com/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: reportQuestionId,
          description: reportDescription,
          status: 'Pending',
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || 'Error creating report');
      }
      alert('Report submitted successfully');
      closeReportPopup();
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
    }
  };

  // If no questions
  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <p className="p-4">
          No questions loaded. Please start a test from the landing page.
        </p>
      </div>
    );
  }

  // Current question details
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];

  // answered vs. active highlight
  const isAnswered = (i: number) => !!userAnswers[i];
  const isActive = (i: number) => i === currentIndex;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-4 py-8">
      {/* Timer + progress + question points */}
      <div className="mb-6 w-[70%] flex items-center justify-between gap-4">
        <div className="flex items-center w-2/3 gap-2">
          <Progress
            value={progressValue}
            className="h-2 w-full bg-[hsl(var(--muted))] data-[state=fill]:bg-[hsl(var(--primary))]"
          />
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        <div className="text-sm font-medium text-right w-1/3">
          Points: {currentQuestion.points}
        </div>
      </div>

      <div className="w-[70%] flex gap-6 items-start">
        {/* Categories */}
        <aside
          className="
            bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]
            rounded shadow p-4
            text-left
            w-56 h-[39rem]
            overflow-auto
            shrink-0
          "
        >
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="secondary"
                size="reactive"
                className="
                  w-full text-xs whitespace-normal
                  bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]
                  hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]
                  break-words text-left leading-tight
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
          {/* Navigation row of question numbers */}
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => {
              let bgClass =
                'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]';
              if (isActive(i)) {
                // Darker green if active
                bgClass = 'bg-main-green text-white';
              } else if (isAnswered(i)) {
                // Lighter green if answered
                bgClass = 'bg-main-green/50 text-white';
              }

              return (
                <Button
                  key={i}
                  variant="secondary"
                  className={`
                    w-10 h-10
                    flex items-center justify-center
                    text-sm
                    hover:bg-main-green
                    hover:text-white
                    hover:-translate-y-1 hover:shadow-lg
                    transform transition-transform duration-200 ease-in-out
                    ${bgClass}
                  `}
                  onClick={() => jumpToQuestion(i)}
                >
                  {i + 1}
                </Button>
              );
            })}
          </div>

          {/* Question content */}
          <div className="relative bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded shadow p-6 flex-1 overflow-auto">
            {/* Report icon at top-right */}
            <Button
              variant="outline"
              className="absolute top-4 right-6 h-8 px-2 flex items-center justify-center hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
              onClick={() => openReportPopup(currentQuestion.id)}
              title="Report an issue with this question"
            >
              <FaFlag className="text-[hsl(var(--destructive))]" />
            </Button>

            <h2 className="text-xl font-bold mb-4 whitespace-normal break-words max-w-3xl">
              {currentQuestion.text}
            </h2>
            {currentQuestion.imageUrl && (
              <div className="mb-4">
                <img
                  src={currentQuestion.imageUrl}
                  alt="question"
                  className="max-w-full h-auto rounded shadow-sm"
                />
              </div>
            )}

            <div className="space-y-2 mb-4">
              {currentQuestion.options.map((option, idx) => {
                const letter = letterMap[idx];
                const isSelected = selectedAnswer === letter;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="reactive"
                    className={`
                      text-black
                      w-full text-left justify-start
                      whitespace-normal break-words
                      px-4 py-3 text-xs
                      bg-secondary-greenBackground
                      hover:bg-main-green
                      hover:text-white
                      ${isSelected ? 'bg-main-green text-white' : ''}
                    `}
                    onClick={() => handleAnswer(idx)}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]"
              >
                Previous
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  className="hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => finishTest()}
                  className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                >
                  Finish Test
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Report Popup */}
      {showReportPopup && (
        <div className="fixed inset-0 bg-[hsl(var(--foreground))]/50 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded p-6 w-[45vw] shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Report Issue</h3>
            <textarea
              className="w-full h-32 p-2 border border-[hsl(var(--muted))] rounded mb-4 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              placeholder="Describe the issue..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeReportPopup}
                className="hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={submitReport}
                className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;