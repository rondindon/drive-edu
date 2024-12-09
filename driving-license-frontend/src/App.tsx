import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminAddQuestion from './components/AdminAddQuestion';
import QuestionDetails from './components/QuestionDetails';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import CrossroadSimulator from './pages/CrossroadSimulator';
import ProtectedRoute from './components/ProtectedRoute';

// Import Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminUsers from './pages/admin/AdminUsers'; 
// import AdminTests from './pages/admin/AdminTests';
// import AdminRequests from './pages/admin/AdminRequests';
// import AdminReports from './pages/admin/AdminReports';
import AdminQuestions from './pages/admin/questions/AdminQuestions';
import AdminUsers from './pages/admin/users/AdminUsers';

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

        {/* Protected Routes for Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        {/* 
        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTests />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminQuestions />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminReports />
            </ProtectedRoute>
          }
        /> */}

        {/* Existing Protected Route for Adding a Question */}
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