import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landingpage from "./screens/Landingpage";
import UserManagement from "./screens/UserManagement";
import ContentManagement from "./screens/ContentManagement";
import Scheduler from "./screens/SchedulerScreen";
import LoginScreen from "./screens/LoginPage";
import LiveAgent from "./screens/LiveAgent";
import ProtectedRoute from "./components/ProtectedRoutes";
import UnauthorizedPage from "./components/UnauthorizedPage";
import { OpenProvider } from "./contexts/OpenContext"; // ← import your context

export default function App() {
  return (
    <OpenProvider> {/* ← Wrap everything inside the context provider */}
      <Router>
        <Routes>
          {/* Public Route for the Login page */}
          <Route path="/" element={<LoginScreen />} />

          {/* Unauthorized access page */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes with role-based access control */}
          <Route 
            path="/landing-page" 
            element={
              <ProtectedRoute>
                <Landingpage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/content-management" 
            element={
              <ProtectedRoute allowedRoles={["Guidance Counselor", "Guidance Staff", "Admin"]}>
                <ContentManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/user-management" 
            element={
              <ProtectedRoute allowedRoles={["Guidance Counselor", "Guidance Staff", "Admin", "Adviser"]}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/scheduler" 
            element={
              <ProtectedRoute allowedRoles={["Guidance Counselor", "Guidance Staff", "Admin"]}>
                <Scheduler />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/Chat" 
            element={
              <ProtectedRoute allowedRoles={["Guidance Counselor", "Guidance Staff", "Admin"]}>
                <LiveAgent />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/landing-page" replace />} />
        </Routes>
      </Router>
    </OpenProvider>
  );
}
