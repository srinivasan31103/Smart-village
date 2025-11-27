import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Complaints from './pages/Complaints'
import ComplaintDetails from './pages/ComplaintDetails'
import CreateComplaint from './pages/CreateComplaint'
import Resources from './pages/Resources'
import ResourceDetails from './pages/ResourceDetails'
import CreateResource from './pages/CreateResource'
import Users from './pages/Users'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Complaints */}
          <Route path="complaints" element={<Complaints />} />
          <Route path="complaints/new" element={<CreateComplaint />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />

          {/* Resources */}
          <Route path="resources" element={<Resources />} />
          <Route path="resources/new" element={
            <ProtectedRoute roles={['admin', 'officer']}>
              <CreateResource />
            </ProtectedRoute>
          } />
          <Route path="resources/:id" element={<ResourceDetails />} />

          {/* Users (Admin only) */}
          <Route path="users" element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App
