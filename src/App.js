import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landingpage from "./screens/Landingpage";
import UserManagement from "./screens/UserManagement";
import ContentManagement from "./screens/ContentManagement";


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
