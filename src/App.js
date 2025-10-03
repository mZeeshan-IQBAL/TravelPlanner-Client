import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Search from './pages/Search';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import Hotels from './pages/Hotels';
import MyTrips from './pages/MyTrips';
import TripDetails from './pages/TripDetails';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Planner from './pages/Planner';
import PublicTrip from './pages/PublicTrip';
import Admin from './pages/Admin';
import TripPlanner from './components/TripPlanner';
import ItineraryMapView from './components/ItineraryMapView';
import ItineraryDemo from './pages/ItineraryDemo';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// Admin-only route wrapper
const AdminOnly = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/landing" 
              element={<Home />} 
            />
            <Route 
              path="/guides" 
              element={<Guides />} 
            />
            <Route 
              path="/guides/:id" 
              element={<GuideDetail />} 
            />
            <Route 
              path="/hotels" 
              element={<Hotels />} 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />
            
            {/* Public shared trip route */}
            <Route path="/public/:token" element={<PublicTrip />} />

            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-trips" 
              element={
                <ProtectedRoute>
                  <MyTrips />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trip/:id" 
              element={
                <ProtectedRoute>
                  <TripDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/planner/:id" 
              element={
                <ProtectedRoute>
                  <Planner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trip-planner/:id" 
              element={
                <ProtectedRoute>
                  <TripPlanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/itinerary-map" 
              element={
                <ProtectedRoute>
                  <ItineraryMapView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/itinerary-demo" 
              element={<ItineraryDemo />} 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminOnly>
                    <Admin />
                  </AdminOnly>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
