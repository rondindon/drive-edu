import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate(); // Navigation for next question
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
        throw new Error('Failed to fetch the question');
      }
      const data: Question = await response.json();
      setQuestion(data);
      setLoading(false);
    } catch (err) {
      setError('Could not fetch the question');
      setLoading(false);
    }
  };

  // Fetch question when component mounts or when ID changes
  useEffect(() => {
    fetchQuestion(id!);
  }, [id]);

  // Handler for moving to the next question
  const handleNextQuestion = () => {
    const nextId = Number(id) + 1; // Increment ID to get the next question
    navigate(`/question/${nextId}`); // Navigate to the next question
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!question) {
    return <p>Question not found</p>;
  }

  return (
    <div>
      <h2>Question Details</h2>
      <p><strong>ID:</strong> {question.id}</p>
      <p><strong>Category:</strong> {question.category}</p>
      <p><strong>Groups:</strong> {question.groups.join(', ')}</p>
      <p><strong>Text:</strong> {question.text}</p>
      <p><strong>Options:</strong></p>
      <ul>
        {question.options.map((option, index) => (
          <li key={index}>{option}</li>
        ))}
      </ul>
      <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
      {question.imageUrl && (
        <div>
          <strong>Image:</strong>
          <img src={question.imageUrl} alt="Question related" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }} />
        </div>
      )}
      <p><strong>Difficulty:</strong> {question.difficulty}</p>
      <p><strong>Explanation:</strong> {question.explanation}</p>
      <p><strong>Points:</strong> {question.points}</p>

      {/* Next Question Button */}
      <button
        onClick={handleNextQuestion}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          marginTop: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Next Question
      </button>
    </div>
  );
};

export default QuestionDetails;