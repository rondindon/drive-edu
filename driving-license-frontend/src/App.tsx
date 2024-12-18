import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminAddQuestion from './components/AdminAddQuestion';
import QuestionDetails from './components/QuestionDetails';
import LandingPage from './pages/LandingPage';
import CrossroadSimulator from './pages/CrossroadSimulator';
import ProtectedRoute from './components/ProtectedRoute';
import { Slide, ToastContainer } from 'react-toastify';

// Import Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Import Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminQuestions from './pages/admin/questions/AdminQuestions';
import Profile from './pages/Profile';
import AboutPage from './pages/AboutPage';

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
    transition={Slide} // Choose from Slide, Zoom, Flip, Bounce, etc.
  />
    <Routes>
      {/* Public Routes with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/question/:id" element={<QuestionDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/simulator" element={<CrossroadSimulator />} />

      {/* Profile Route */}
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
              <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                <AboutPage />
              </ProtectedRoute>
            }
          />
      </Route>

      {/* Admin Routes with AdminLayout */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Nested Routes */}
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="add-question" element={<AdminAddQuestion />} />
        {/* Add other admin routes here */}
      </Route>

      {/* Catch-All Route (Optional) */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
    </>
  );
}

export default App;