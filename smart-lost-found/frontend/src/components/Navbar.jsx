import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-mark">LF</span>

        <span className="brand-text">
          Lost & Found
          <small>Campus Property Desk</small>
        </span>
      </Link>

      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link>

        {user && <Link to="/report">Report Item</Link>}

        {user && <Link to="/dashboard">Dashboard</Link>}

        {user?.role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}
      </nav>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">
              {user.name}
            </span>

            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-login">
              Login
            </Link>

            <Link to="/register" className="navbar-register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}