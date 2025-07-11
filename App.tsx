import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppNavigation from "./navigation/AppNavigation.js";

const App = () => {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

export default App;
