// src/pages/ResultsPage.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { Progress } from 'src/components/ui/progress';
import { FaPercent, FaQuestionCircle, FaClock } from 'react-icons/fa';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string; // user’s selected letter
  points: number;
  imageUrl?: string;
}

interface ResultsState {
  isPassed: boolean;
  score: number; // out of 100
  totalQuestions: number;
  testDate: string;
  group: string;
  timeTaken: number; // in seconds
  questions: Question[];
}

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    isPassed = false,
    score = 0,
    totalQuestions = 0,
    testDate = '',
    group = '',
    timeTaken = 0,
    questions = [],
  } = (state || {}) as ResultsState;

  const headingText = isPassed ? 'You Passed!' : 'You Failed';

  // Score-based success rate (score out of 100)
  const successRate = Math.round(score);

  // Count how many questions the user got correct
  let correctCount = 0;
  questions.forEach((q) => {
    if (q.userAnswer === q.correctAnswer) correctCount++;
  });

  // For the progress bar, clamp at 100
  const progressValue = Math.min(score, 100);

  // Convert timeTaken (seconds) to mm:ss
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

  // By default, open the first question if it exists
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<number | null>(
    questions.length > 0 ? questions[0].id : null
  );
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  const handleQuestionClick = (qId: number) => {
    setSelectedQuestionId(qId === selectedQuestionId ? null : qId);
  };

  // Bottom Buttons
  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Pass/Fail + Basic Info */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold mb-4">
            {headingText}
          </h1>
          <div className="space-y-1 text-base text-[hsl(var(--muted-foreground))]">
            <p>
              <span className="font-semibold">Date:</span> {testDate}
            </p>
            <p>
              <span className="font-semibold">Group:</span> {group}
            </p>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-md shadow p-6 mb-8 max-w-xl mx-auto">
          <h2 className="text-lg font-semibold mb-3 text-center">Overall Score</h2>
          <Progress
            value={progressValue}
            className="
              h-4 w-full
              bg-[hsl(var(--muted))]
              data-[state=fill]:bg-[hsl(var(--primary))]
            "
          />
          <p className="text-center text-base mt-2">{score}/100 Points</p>
        </div>

        {/* Icons Row (3 icons), now more colorful with purple #8884d8 */}
        <div className="flex flex-row gap-12 items-center justify-center mb-10">
          {/* Icon 1: Success Rate */}
          <div className="flex flex-col items-center justify-center">
            <FaPercent className="text-4xl text-[hsl(var(--foreground))] mb-2" />
            <p className="text-lg text-[hsl(var(--foreground))] font-semibold">Success Rate</p>
            <p className="text-xl bg-[#8884d8]/20 text-[#8884d8] px-3 py-1 mt-1 rounded">
              {successRate}%
            </p>
          </div>

          {/* Icon 2: Total Questions */}
          <div className="flex flex-col items-center justify-center">
            <FaQuestionCircle className="text-4xl text-[hsl(var(--foreground))] mb-2" />
            <p className="text-lg text-[hsl(var(--foreground))] font-semibold">Total Questions</p>
            <p className="text-xl bg-[#8884d8]/20 text-[#8884d8] px-3 py-1 mt-1 rounded">
              {correctCount}/{totalQuestions}
            </p>
          </div>

          {/* Icon 3: Time */}
          <div className="flex flex-col items-center justify-center">
            <FaClock className="text-4xl text-[hsl(var(--foreground))] mb-2" />
            <p className="text-lg text-[hsl(var(--foreground))] font-semibold">Time Taken</p>
            <p className="text-xl bg-[#8884d8]/20 text-[#8884d8] px-3 py-1 mt-1 rounded">
              {timeDisplay}
            </p>
          </div>
        </div>

        {/* Navigation for final question review */}
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-md shadow p-6 mb-8 border-solid border-2 border-[#8884d8]/20">
          <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
            Question Review
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {questions.map((q, index) => {
              const isCorrect = q.userAnswer === q.correctAnswer;
              return (
                <Button
                  key={q.id}
                  variant="secondary"
                  className={`
                    w-10 h-10 flex items-center justify-center text-sm
                    ${isCorrect ? 'bg-main-green/90' : 'bg-[hsl(var(--destructive))]/80'}
                  `}
                  onClick={() => handleQuestionClick(q.id)}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>

          {/* If a question is selected, show user’s selected vs correct */}
          {selectedQuestion && (
            <div className="p-4 rounded-md border border-[hsl(var(--muted))]">
              <h3 className="font-bold mb-2 text-base">
                {selectedQuestion.text}
              </h3>
              {selectedQuestion.imageUrl && (
                <div className="mb-2">
                  <img
                    src={selectedQuestion.imageUrl}
                    alt="question"
                    className="max-w-full h-auto rounded shadow-sm"
                  />
                </div>
              )}
              <div className="space-y-2">
                {selectedQuestion.options.map((option, idx) => {
                  const letter = ['A', 'B', 'C'][idx];
                  const isCorrectAnswer = letter === selectedQuestion.correctAnswer;
                  const isUserSelected = letter === selectedQuestion.userAnswer;

                  let bgClass = 'bg-[hsl(var(--card))]';
                  if (selectedQuestion.userAnswer === selectedQuestion.correctAnswer) {
                    // correct
                    if (isCorrectAnswer) bgClass = 'bg-main-green/80';
                  } else {
                    // incorrect
                    if (isUserSelected) bgClass = 'bg-[hsl(var(--destructive))]/80';
                    if (isCorrectAnswer) bgClass = 'bg-main-green/80';
                  }

                  return (
                    <div key={option} className={`p-2 rounded text-sm ${bgClass}`}>
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Buttons: Home and Start Another Test */}
        <div className="flex justify-center gap-6">
          <Button
            onClick={goHome}
            variant="outline"
            className="
              px-6 py-3 text-base font-medium
              cursor-pointer
              hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]
            "
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;