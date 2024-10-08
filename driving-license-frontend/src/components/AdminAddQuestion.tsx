import React, { useState, useEffect } from 'react';

const AdminAddQuestion: React.FC = () => {
  const allGroups = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'T']; // List of available groups
  const categories = [
    // { name: 'Pravidlá cestnej premávky', points: 3 },
    // { name: 'Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia', points: 3 },
    { name: 'Dopravné značky a dopravné zariadenia', points: 2 },
    { name: 'Dopravné situácie na križovatkách', points: 4 },
    { name: 'Všeobecné pravidlá správania sa v prípade dopravnej nehody', points: 2 },
    { name: 'Teória vedenia vozidla', points: 2 },
    { name: 'Predpisy týkajúce sa dokladov požadovaných v prípade používania vozidla a organizácia času v doprave', points: 1 },
    { name: 'Podmienky prevádzky vozidiel v premávke na pozemných komunikáciách', points: 1 },
    { name: 'Zásady bezpečnej jazdy', points: 3 },
    { name: 'Konštrukcia vozidiel a ich údržba', points: 1 },
  ];

  const [groups, setGroups] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [points, setPoints] = useState<number>(0); // Points for the selected category
  const [text, setText] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [explanation, setExplanation] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  // Function to toggle the group selection
  const toggleGroupSelection = (group: string) => {
    setGroups((prevGroups) =>
      prevGroups.includes(group)
        ? prevGroups.filter((g) => g !== group) // If already selected, deselect
        : [...prevGroups, group] // Otherwise, add to the selection
    );
  };

  // Function to select all groups
  const selectAllGroups = () => {
    setGroups(allGroups); // Select all groups
  };

  // Function to deselect all groups
  const deselectAllGroups = () => {
    setGroups([]); // Clear all selections
  };

  // Update points when category changes
  useEffect(() => {
    const selectedCategory = categories.find((cat) => cat.name === category);
    if (selectedCategory) {
      setPoints(selectedCategory.points);
    } else {
      setPoints(0);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:4444/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groups,
          category,
          points, // Include points based on the selected category
          text,
          options,
          correctAnswer,
          imageUrl: imageUrl || null,
          difficulty,
          explanation,
          role: 'ADMIN', // Role should come from authentication context in production
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Question added successfully!');
        // Reset form fields
        setGroups([]);
        setCategory('');
        setText('');
        setOptions(['', '', '']);
        setCorrectAnswer('A');
        setImageUrl('');
        setDifficulty('medium');
        setExplanation('');
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

      {/* Group Selection via Buttons */}
      <div>
        <label>Groups: </label>
        <div>
          {allGroups.map((group) => (
            <button
              type="button"
              key={group}
              className={groups.includes(group) ? 'selected' : ''}
              onClick={() => toggleGroupSelection(group)}
              style={{
                backgroundColor: groups.includes(group) ? 'lightgreen' : 'lightgray',
                marginRight: '10px',
                padding: '10px',
              }}
            >
              {group}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '10px' }}>
          <button type="button" onClick={selectAllGroups}>
            Select All Groups
          </button>
          <button type="button" onClick={deselectAllGroups} style={{ marginLeft: '10px' }}>
            Deselect All Groups
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Display points for the selected category */}
      <div>
        <label>Points: </label>
        <input type="number" value={points} readOnly />
      </div>

      {/* Question Text Input */}
      <div>
        <label>Question Text: </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the question"
          required
        />
      </div>

      {/* Options Inputs (A, B, C) */}
      <div>
        <label>Options (A, B, C): </label>
        {['A', 'B', 'C'].map((label, index) => (
          <div key={label}>
            <input
              type="text"
              value={options[index]}
              onChange={(e) => {
                const updatedOptions = [...options];
                updatedOptions[index] = e.target.value;
                setOptions(updatedOptions);
              }}
              placeholder={`Option ${label}`}
              required
            />
          </div>
        ))}
      </div>

      {/* Correct Answer Selection */}
      <div>
        <label>Correct Answer: </label>
        <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      {/* Image URL Input */}
      <div>
        <label>Image URL (optional): </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
        />
      </div>

      {/* Difficulty Selection */}
      <div>
        <label>Difficulty: </label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Explanation Input */}
      <div>
        <label>Explanation: </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Enter explanation for the correct answer"
        />
      </div>

      <button type="submit">Add Question</button>
    </form>
  );
};

export default AdminAddQuestion;