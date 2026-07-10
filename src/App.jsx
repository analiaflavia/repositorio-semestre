import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'

import Login       from './pages/Login'
import Register    from './pages/Register'
import Dashboard   from './pages/Dashboard'
import SemesterPage from './pages/SemesterPage'
import SubjectPage  from './pages/SubjectPage'
import UploadFile  from './pages/UploadFile'
import AddLink     from './pages/AddLink'
import AddJoseo    from './pages/AddJoseo'
import Recents     from './pages/Recents'
import Profile     from './pages/Profile'
import NotFound    from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="/semester/:semester"
            element={<ProtectedRoute><SemesterPage /></ProtectedRoute>} />
          <Route path="/semester/:semester/subject/:subjectId"
            element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />

          <Route path="/upload"    element={<ProtectedRoute><UploadFile /></ProtectedRoute>} />
          <Route path="/add-link"  element={<ProtectedRoute><AddLink /></ProtectedRoute>} />
          <Route path="/add-joseo" element={<ProtectedRoute><AddJoseo /></ProtectedRoute>} />

          <Route path="/recents" element={<ProtectedRoute><Recents /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*"          element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
