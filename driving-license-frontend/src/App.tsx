import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
    <Route path="/" element={    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>} />
    <Route path="/register" element={<Register />} />
    {/* <Route path="/login" element={<Login />} />
    <Route path="/test" element={<Test />} /> */}
  </Routes>
  );
}

export default App;
