import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminAddQuestion from './components/AdminAddQuestion';
import QuestionDetails from './components/QuestionDetails';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import CrossroadSimulator from './pages/CrossroadSimulator';

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
        <Route path="/simulator" element={<CrossroadSimulator />} />
      
        {/* <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />} /> */}
      </Routes>

    </>
  );
}

export default App;
