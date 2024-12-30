import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Destructure data from the location state
  const { score, totalQuestions, isPassed } = state || {
    score: 0,
    totalQuestions: 0,
    isPassed: false,
  };

  function handleGoHome() {
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-lightGray text-main-darkBlue">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Test Results</h1>
        <p className="mb-2">Score: {score} / {100}</p>
        <p className={`mb-4 ${isPassed ? 'text-main-green' : 'text-secondary-red'}`}>
          {isPassed ? 'You Passed!' : 'You Failed!'}
        </p>
        <Button variant="default" className="bg-main-green hover:bg-secondary-red" onClick={handleGoHome}>
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default ResultsPage;