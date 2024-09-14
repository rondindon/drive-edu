import React, { useState } from 'react';

const AdminAddQuestion: React.FC = () => {
  const [group, setGroup] = useState<string>('A');
  const [category, setCategory] = useState<string>('Road Signs');
  const [text, setText] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group,
          category,
          text,
          options,
          correctAnswer,
          role: 'ADMIN', // Pass the role (should ideally come from logged-in user's data)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Question added successfully!');
        setText('');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
      } else {
        setMessage(data.message || 'Error adding question');
      }
    } catch (err) {
      setMessage('Failed to add question');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Question</h2>
      {message && <p>{message}</p>}
      <div>
        <label>Group: </label>
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="BE">BE</option>
          {/* Add more groups as needed */}
        </select>
      </div>

      <div>
        <label>Category: </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g., Road Signs)"
          required
        />
      </div>

      <div>
        <label>Question Text: </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the question"
          required
        />
      </div>

      <div>
        <label>Options: </label>
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => {
              const updatedOptions = [...options];
              updatedOptions[index] = e.target.value;
              setOptions(updatedOptions);
            }}
            placeholder={`Option ${index + 1}`}
            required
          />
        ))}
      </div>

      <div>
        <label>Correct Answer: </label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter the correct answer"
          required
        />
      </div>

      <button type="submit">Add Question</button>
    </form>
  );
};

export default AdminAddQuestion;