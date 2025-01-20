import React, { useEffect, useState } from 'react';
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

  // ========================
  // Standard local states
  // ========================
  const [testFinished, setTestFinished] = useState(false); // to skip prompts if finished
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  const letterMap = ['A', 'B', 'C'];

  // ========================
  // 1. Intercept Browser “Back”
  // ========================
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!testFinished) {
        e.preventDefault();
        const confirmLeave = window.confirm(
          'Are you sure you want to go back? The test is not finished. ' +
          'If you confirm, the test will be submitted and you will leave this page.'
        );
        if (confirmLeave) {
          finishTest(true);
          navigate(-1);
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Push dummy state so we intercept
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testFinished]);

  // ========================
  // 2. Beforeunload Prompt
  // ========================
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!testFinished) {
        e.preventDefault();
        e.returnValue = '';
        // Optional partial data beacon
        if (testId) {
          const quickPayload = JSON.stringify({ testId, message: 'User forcibly left. Partial data?' });
          const blob = new Blob([quickPayload], { type: 'application/json' });
          navigator.sendBeacon('http://localhost:4444/api/tests/finish-quick', blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testFinished, testId]);

  useEffect(() => {
    if (!questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest(); // auto-finish
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions]);

  // For the timer display & progress bar
  const totalDuration = 30 * 60; // 1800 seconds
  const progressValue = (timeLeft / totalDuration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ========================
  // Unique categories
  // ========================
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // ========================
  // 4. Handle answers
  // ========================
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
      setScore((prev) => Math.max(prev - (q.points || 0), 0));
    }
  };

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
  const jumpToQuestion = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
    }
  };
  const jumpToCategory = (cat: string) => {
    const idx = questions.findIndex((q) => q.category === cat);
    if (idx !== -1) setCurrentIndex(idx);
  };

  // ========================
  // 5. Animated “Finish” states
  // ========================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [didPass, setDidPass] = useState<boolean | null>(null);

  // We'll also track a small pause at 70%
  const [pauseAtSeventy, setPauseAtSeventy] = useState(false);

  const handleFinishClick = () => {
    if (!questions.length) return;

    // Compute pass/fail quickly
    let localScore = 0;
    userAnswers.forEach((answer, idx) => {
      if (answer === questions[idx].correctAnswer) {
        localScore += (questions[idx].points || 0);
      }
    });
    setDidPass(localScore >= 90);

    // Start the animation
    setIsSubmitting(true);
    setSubmitProgress(0);
    setPauseAtSeventy(false);
  };

  // ========================
  // 6. useEffect to increment progress
  // ========================
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSubmitting && submitProgress < 100) {
      // If we're not paused at 70, keep incrementing
      if (!pauseAtSeventy) {
        interval = setInterval(() => {
          setSubmitProgress((prev) => {
            const nextVal = prev + 1;
            if (nextVal === 80) {
              // We'll pause at 70
              setPauseAtSeventy(true);
            }
            return Math.min(nextVal, 100);
          });
        }, 30); // speed of fill (lower = smoother/faster)
      }
      // If we just hit 70, do a short pause
      else if (pauseAtSeventy && submitProgress === 80) {
        // Pause for e.g. 800ms
        interval = setTimeout(() => {
          setPauseAtSeventy(false); // resume
        }, 800);
      }
    }
    // Once we hit 100, do a short final pause
    else if (isSubmitting && submitProgress === 100) {
      const timeoutId = setTimeout(() => {
        finishTest(); // finalize
      }, 400); // wait 600ms so they see final color
      return () => clearTimeout(timeoutId);
    }

    return () => {
      // Clear either setInterval or setTimeout
      if (interval) clearInterval(interval as number | NodeJS.Timeout);
    };
  }, [isSubmitting, submitProgress, pauseAtSeventy]);

  // ========================
  // 7. Finishing the Test
  // ========================
  const finishTest = (navigateBackAfter?: boolean) => {
    if (!testId) {
      alert('No valid testId found. Returning home.');
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

      questionStatsPromises.push(
        fetch('http://localhost:4444/api/question-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ questionId: q.id, isCorrect }),
        })
      );
    });
    const isPassed = finalScore >= 90;
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

    fetch('http://localhost:4444/api/tests/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: payload,
    })
      .then((res) => res.json())
      .then((data) => console.log('[finishTest] =>', data))
      .catch((err) => console.error('[finishTest] error =>', err));

    setTestFinished(true);
    if (navigateBackAfter) {
      navigate(-1);
    }
  };

  // ========================
  // 8. Reporting logic
  // ========================
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
      const resp = await fetch('http://localhost:4444/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  // ========================
  // 9. Rendering
  // ========================
  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="p-4">No questions loaded. Please start a test from the landing page.</p>
      </div>
    );
  }

  // Current question
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];
  const isAnswered = (i: number) => !!userAnswers[i];
  const isActive = (i: number) => i === currentIndex;

  // ========================
  // Button background logic
  // ========================
  // Using these colors (feel free to adjust):
  const NEUTRAL_COLOR = '#7a8ef0'; // neutral gray
  const PASS_COLOR    = '#22c55e'; // green-500
  const FAIL_COLOR    = '#ef4444'; // red-500
  const UNFILLED      = '#e2e8f0'; // slate-200

  const fill = Math.min(Math.max(submitProgress, 0), 100);
  let buttonBackground = NEUTRAL_COLOR; // default: neutral for idle

  if (isSubmitting) {
    if (fill < 80) {
      // 0..fill => NEUTRAL, fill..100 => UNFILLED
      buttonBackground = `linear-gradient(to right,
        ${NEUTRAL_COLOR} 0%,
        ${NEUTRAL_COLOR} ${fill}%,
        ${UNFILLED} ${fill}%,
        ${UNFILLED} 100%
      )`;
    } else {
      const colorAfter70 = didPass ? PASS_COLOR : FAIL_COLOR;
      buttonBackground = `linear-gradient(to right,
        ${NEUTRAL_COLOR} 0%,
        ${NEUTRAL_COLOR} 80%,
        ${colorAfter70} 80%,
        ${colorAfter70} ${fill}%,
        ${UNFILLED} ${fill}%,
        ${UNFILLED} 100%
      )`;
    }
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-4 py-8">
      {/* Timer + progress + question points */}
      <div className="mb-6 w-[70%] flex items-center justify-between gap-4">
        <div className="flex items-center w-2/3 gap-2">
          <Progress
            value={progressValue}
            className="h-2 w-full bg-[hsl(var(--muted))]"
          />
          <span className="text-sm font-medium">
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
            bg-[hsl(var(--card))] rounded shadow p-4
            w-56 h-[39rem] overflow-auto shrink-0
          "
        >
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="secondary"
                size="reactive"
                onClick={() => jumpToCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Column */}
        <main className="flex-1 flex flex-col gap-4">
          {/* Question navigation buttons */}
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => {
              let bgClass = 'bg-[hsl(var(--card))]';
              if (isActive(i)) {
                bgClass = 'bg-green-600 text-white';
              } else if (isAnswered(i)) {
                bgClass = 'bg-green-300 text-white';
              }
              return (
                <Button
                  key={i}
                  variant="secondary"
                  className={`
                    w-10 h-10 flex items-center justify-center text-sm
                    hover:bg-green-500 hover:text-white
                    ${bgClass}
                  `}
                  onClick={() => jumpToQuestion(i)}
                >
                  {i + 1}
                </Button>
              );
            })}
          </div>

          {/* Question card */}
          <div className="relative bg-[hsl(var(--card))] rounded shadow p-6 flex-1 overflow-auto">
            {/* Report button */}
            <Button
              variant="outline"
              className="absolute top-4 right-6 h-8 px-2 flex items-center justify-center"
              onClick={() => openReportPopup(currentQuestion.id)}
              title="Report an issue with this question"
            >
              <FaFlag className="text-red-600" />
            </Button>

            <h2 className="text-xl font-bold mb-4 max-w-3xl">
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

            {/* Options */}
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
                      w-full text-left justify-start
                      ${isSelected ? 'bg-green-500 text-white' : ''}
                    `}
                    onClick={() => handleAnswer(idx)}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-between">
              {/* Prev */}
              <Button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              {/* Next or Finish */}
              {currentIndex < questions.length - 1 ? (
                <Button onClick={nextQuestion}>
                  Next
                </Button>
              ) : (
                <button
                  onClick={handleFinishClick}
                  disabled={isSubmitting}
                  className="relative text-white font-semibold py-2 px-4 rounded"
                  style={{
                    background: buttonBackground,
                    transition: 'background 0.3s linear',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Finish Test'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Report Popup */}
      {showReportPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[300px] shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Report Issue</h3>
            <textarea
              className="w-full h-24 p-2 border border-gray-300 rounded mb-4"
              placeholder="Describe the issue..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeReportPopup}>
                Cancel
              </Button>
              <Button variant="default" onClick={submitReport} className="bg-red-600 text-white">
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