import { Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminAddQuestion from './components/ui/AdminAddQuestion';
import QuestionDetails from './components/ui/QuestionDetails';
import LandingPage from './pages/LandingPage';
import Navbar from './components/ui/Navbar';

function App() {
  
  return (
      <>

      <Navbar />

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
    </>
  );
}

export default App;
