import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminAddQuestion from './components/AdminAddQuestion';
import QuestionDetails from './components/QuestionDetails';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import CrossroadSimulator from './pages/CrossroadSimulator';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/question/:id" element={<QuestionDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/simulator" element={<CrossroadSimulator />} />

        {/* Protected Routes */}
        <Route
          path="/admin/add-question"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAddQuestion />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
