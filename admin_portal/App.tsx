"use client"

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import Dashboard from './components/Dashboard';

function App() {

  // 🔥 NO AUTH, NO TOKEN, NO ALERT

  const handleLogout = () => {
    // optional (can remove completely)
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="App">

      {/* NAVBAR */}
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        <a className="navbar-brand" href="/">IGRS Admin Portal</a>

        <div className="ml-auto d-flex align-items-center gap-3">
          {/* OPTIONAL logout (can remove) */}
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* DASHBOARD */}
      <div className="container-fluid">
        <Dashboard />
      </div>

    </div>
  );
}

export default App;