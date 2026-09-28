import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const isRegister = location.pathname === "/register";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(
          formData.name,
          formData.email,
          formData.password
        );
      } else {
        await login(
          formData.email,
          formData.password
        );
      }

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="auth-kicker">
          CAMPUS PROPERTY DESK / 2026
        </div>

        <h1>
          {isRegister ? (
            <>
              Create your
              <br />
              <em>campus account.</em>
            </>
          ) : (
            <>
              Welcome
              <br />
              <em>back.</em>
            </>
          )}
        </h1>

        <p>
          {isRegister
            ? "Create an account to report lost belongings, post found items and follow recovery updates."
            : "Sign in to manage your reports, search campus records and connect with item owners."}
        </p>

        <div className="auth-process">
          <span>01 / REPORT</span>
          <span>02 / MATCH</span>
          <span>03 / RECOVER</span>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-box">
          <div className="auth-form-heading">
            <span>
              {isRegister ? "NEW ACCOUNT" : "MEMBER LOGIN"}
            </span>

            <h2>
              {isRegister
                ? "Join the campus desk"
                : "Sign in to continue"}
            </h2>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-field">
                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">
                College email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? (
              <>
                Already have an account?
                <Link to="/login">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to the campus desk?
                <Link to="/register">
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}