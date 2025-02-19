import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminAddQuestion from './components/AdminAddQuestion';
import QuestionDetails from './components/QuestionDetails';
import LandingPage from './pages/LandingPage';
import CrossroadSimulator from './pages/CrossroadSimulator';
import ProtectedRoute from './components/ProtectedRoute';
import { Slide, ToastContainer } from 'react-toastify';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminQuestions from './pages/admin/questions/AdminQuestions';
import AboutPage from './pages/AboutPage';
import TestPage from './pages/tests/TestPage';
import ResultsPage from './pages/tests/ResultsPage';
import AdminTests from './pages/admin/tests/AdminTests';
import AdminReports from './pages/admin/reports/AdminReports';
import Profile from './pages/Profile';
import SignsPage from './pages/SignsPage';

function App() {
  return (
    <>
  <ToastContainer
    position="top-right"
    autoClose={2000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    transition={Slide}
  />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/question/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><QuestionDetails /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/simulator" element={<CrossroadSimulator />} />

        <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                <Profile />
              </ProtectedRoute>
            }
          />
        <Route
            path="/about"
            element={
                <AboutPage />
            }
          />
        <Route
           path="/signs"
           element={
               <SignsPage />
           }
         />
          <Route
              path="/test/:testId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                  <TestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="add-question" element={<AdminAddQuestion />} />
      </Route>

    </Routes>
    </>
  );
}

export default App;