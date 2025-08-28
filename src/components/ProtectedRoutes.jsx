import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * ===========================================
 * Component: ProtectedRoute
 * Author: [Original Author + Modified]
 * Last Updated: 2025-05-07
 * 
 * Description:
 * - A wrapper component that protects routes from unauthorized access
 * - Checks both authentication status AND user role permissions
 * 
 * Purpose:
 * - To ensure that only authenticated users can access protected routes
 * - To restrict access to specific pages based on user roles
 * - Prevents direct URL access to restricted pages
 * 
 * Props:
 * - children: The components/routes to render if authorized
 * - allowedRoles: Array of roles allowed to access this route
 * 
 * State Variables:
 * - None
 * 
 * Notes:
 * - If no allowedRoles are specified, any authenticated user can access the route
 * - If allowedRoles are specified, only users with those roles can access the route
 * ===========================================
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("authToken");
  
  // Check if user is authenticated first
  if (!isAuthenticated) {
    // Redirect to login page and store the intended destination
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }
  
  // If no role restrictions, allow access to any authenticated user
  if (allowedRoles.length === 0) {
    return children;
  }
  
  // Check if user has the required role to access this route
  const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
  const userRole = staffData.position;
  const hasRequiredRole = allowedRoles.includes(userRole);
  
  if (!hasRequiredRole) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has the required role
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};