import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landingpage from "./components/Landingpage";
import UserManagement from "./components/UserManagement";
import ContentManagement from "./components/ContentManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/content-management" element={<ContentManagement />} />
        <Route path="/user-management" element={<UserManagement />} />

        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
