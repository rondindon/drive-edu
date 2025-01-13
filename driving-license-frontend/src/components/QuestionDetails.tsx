// src/pages/QuestionDetails.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Question {
  id: number;
  groups: string[];
  category: string;
  text: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
  difficulty: string;
  explanation: string;
  points: number;
}

const QuestionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Current question ID from the URL
  const navigate = useNavigate(); // Navigation for next/previous question

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the question data
  const fetchQuestion = async (questionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4444/api/question/${questionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch the question");
      }
      const data: Question = await response.json();
      setQuestion(data);
      setLoading(false);
    } catch (err) {
      setError("Could not fetch the question");
      setLoading(false);
    }
  };

  // Fetch question when component mounts or when ID changes
  useEffect(() => {
    fetchQuestion(id!);
  }, [id]);

  // Handler for moving to the next question
  const handleNextQuestion = () => {
    const nextId = Number(id) + 1;
    navigate(`/question/${nextId}`);
  };

  // Handler for moving to the previous question
  const handlePreviousQuestion = () => {
    const prevId = Number(id) - 1;
    if (prevId > 0) {
      navigate(`/question/${prevId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <p className="text-lg">Question not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-md shadow-lg p-6 space-y-4 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2">Question Details</h2>

        <div className="space-y-2">
          <p>
            <strong>ID:</strong> {question.id}
          </p>
          <p>
            <strong>Category:</strong> {question.category}
          </p>
          <p>
            <strong>Groups:</strong> {question.groups.join(", ")}
          </p>
          <p>
            <strong>Text:</strong> {question.text}
          </p>

          <p>
            <strong>Options:</strong>
          </p>
          <ul className="list-disc ml-5 space-y-1">
            {question.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>

          <p>
            <strong>Correct Answer:</strong> {question.correctAnswer}
          </p>

          {question.imageUrl && (
            <div className="mt-3">
              <strong>Image:</strong>
              <img
                src={question.imageUrl}
                alt="Question related"
                className="rounded shadow-sm mt-2 max-w-full h-auto"
              />
            </div>
          )}

          <p>
            <strong>Difficulty:</strong> {question.difficulty}
          </p>
          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>
          <p>
            <strong>Points:</strong> {question.points}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={Number(id) <= 1}
            className={`
              px-4 py-2 rounded-md shadow
              bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]
              hover:bg-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--background))]
              disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed
            `}
          >
            Previous
          </button>

          <button
            onClick={handleNextQuestion}
            className={`
              px-4 py-2 rounded-md shadow
              bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
              hover:bg-[hsl(var(--primary))]/90
            `}
          >
            Next Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;