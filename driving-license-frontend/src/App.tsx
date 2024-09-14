import React, { useEffect, useState } from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminAddQuestion from './components/AdminAddQuestion';

function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role'); // This should be set upon login
    setUserRole(role);
  }, []);
  
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
    <Route
          path="/admin/add-question"
          element={userRole === 'ADMIN' ? <AdminAddQuestion /> : <Navigate to="/login" />}
    />
    <Route path="/login" element={<Login />} />
    {/* <Route path="/login" element={<Login />} />
    <Route path="/test" element={<Test />} /> */}
  </Routes>
  );
}

export default App;
