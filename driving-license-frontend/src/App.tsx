import { Navigate, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminAddQuestion from './components/AdminAddQuestion';
import QuestionDetails from './components/QuestionDetails';
import LandingPage from './pages/LandingPage';

function App() {
  
  return (
    <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/question/:id" element={<QuestionDetails />} />
    <Route path="/login" element={<Login />} />
    <Route
          path="/admin/add-question"
          element={localStorage.getItem('role') === 'ADMIN' ? <AdminAddQuestion /> : <Navigate to="/login" />}
    />

    {/* <Route path="/login" element={<Login />} />
    <Route path="/test" element={<Test />} /> */}
  </Routes>
  );
}

export default App;
