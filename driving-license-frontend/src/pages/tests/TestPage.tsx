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

  // Unique categories
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // For 3-option questions
  const letterMap = ['A', 'B', 'C'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // userAnswers[i] = letter "A", "B", or "C"
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  // 30 min timer
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

  const totalDuration = 30 * 60;
  const progressValue = (timeLeft / totalDuration) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // handleAnswer
  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentIndex];
    const chosenLetter = letterMap[selectedIndex];
    const isCorrect = chosenLetter === q.correctAnswer;

    // local userAnswers
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = chosenLetter;
      return updated;
    });

    // local score
    if (isCorrect) {
      setScore((prev) => prev + (q.points || 0));
    } else {
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
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  // Report popup
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

  /**
   * Finish Test:
   * 1) Recompute final score, identify correct/wrong
   * 2) For each question, call /api/question-stats => increment correct or wrong
   * 3) Then /api/tests/finish
   * 4) Navigate to results
   */
  const finishTest = async () => {
    if (!testId) {
      alert('No valid testId found. Returning to homepage.');
      navigate('/');
      return;
    }

    // 1) final score & correct/wrong list
    let finalScore = 0;
    // We'll store an array of promises for question stats
    const questionStatsPromises: Promise<any>[] = [];

    userAnswers.forEach((answer, idx) => {
      const q = questions[idx];
      const isCorrect = answer === q.correctAnswer;

      if (isCorrect) {
        finalScore += (q.points || 0);
      }

      // create the record for question stat
      // isCorrect => increment correctCount, else increment wrongCount
      questionStatsPromises.push(
        fetch('http://localhost:4444/api/question-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId: q.id,
            isCorrect,
          }),
        })
      );
    });

    const isPassed = finalScore >= 90;

    try {
      // 2) Wait for all question stats calls
      await Promise.all(questionStatsPromises);

      // 3) Send final test data
      const resp = await fetch('http://localhost:4444/api/tests/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId,
          score: finalScore,
          timeTaken: totalDuration - timeLeft,
          isPassed,
        }),
      });
      const data = await resp.json();
      console.log('[finishTest] response:', data);

      // 4) Navigate to results
      navigate('/results', {
        state: {
          isPassed,
          score: finalScore,
          totalQuestions: questions.length,
          testDate: '2023-10-07',
          group: 'B',
          timeTaken: totalDuration - timeLeft,
          questions: questions.map((q, i) => ({
            ...q,
            userAnswer: userAnswers[i],
          })),
        },
      });
    } catch (err) {
      console.error('Error finishing test:', err);
      alert('Error finishing test');
      navigate('/');
    }
  };

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-lightGray text-main-darkBlue">
        <p className="p-4">
          No questions loaded. Please start a test from the landing page.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary-lightGray text-main-darkBlue px-4 py-8">
      {/* Timer + progress + question points */}
      <div className="mb-6 w-[70%] flex items-center justify-between gap-4">
        <div className="flex items-center w-2/3 gap-2">
          <Progress value={progressValue} className="h-2 w-full" />
          <span className="text-sm font-medium text-main-darkBlue">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
        <div className="text-sm font-medium text-right w-1/3">
          Points: {currentQuestion.points}
        </div>
      </div>

      <div className="w-[70%]">
        <div className="flex gap-6 items-start">
          {/* Categories */}
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
                  size="reactive"
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
            {/* Navigation row of question numbers */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {questions.map((_, i) => {
                const isActive = i === currentIndex;
                return (
                  <Button
                    key={i}
                    variant="secondary"
                    className={`
                      w-10 h-10
                      flex items-center justify-center
                      text-sm
                      ${isActive ? 'bg-main-green text-white' : 'bg-white'}
                    `}
                    onClick={() => jumpToQuestion(i)}
                  >
                    {i + 1}
                  </Button>
                );
              })}
            </div>

            {/* Question content */}
            <div className="relative bg-white rounded shadow p-6 flex-1 overflow-auto">
              {/* Report icon at the top right of question box */}
              <Button
                variant="outline"
                className="absolute top-4 right-6 h-8 px-2 flex items-center justify-center"
                onClick={() => openReportPopup(currentQuestion.id)}
                title="Report an issue with this question"
              >
                <FaFlag className="text-red-500" />
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

              <div className="flex justify-between">
                <Button onClick={prevQuestion} disabled={currentIndex === 0}>
                  Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                  <Button onClick={nextQuestion}>Next</Button>
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

      {/* Report Popup */}
      {showReportPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[300px] shadow">
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
              <Button
                variant="default"
                onClick={submitReport}
                className="bg-red-500 text-white"
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