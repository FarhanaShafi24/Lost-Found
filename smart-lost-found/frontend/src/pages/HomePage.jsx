import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-kicker">
          CAMPUS PROPERTY DESK / 2026
        </div>

        <div className="hero-copy">
          <h1>
            Lost on campus.
            <br />
            <em>Found on campus.</em>
            <br />
            Connected here.
          </h1>

          <p>
            A single record system for belongings left in lecture halls,
            labs, libraries, hostels and campus grounds. Report an item,
            verify a lead and close the loop.
          </p>

          <div className="hero-actions">
            <Link
              className="button primary"
              to={user ? "/report" : "/register"}
            >
              {user ? "Report an item" : "Start with an account"}
            </Link>

            <Link
              className="button outline light"
              to={user ? "/browse" : "/login"}
            >
              {user ? "Search reports" : "I already have an account"}
            </Link>
          </div>
        </div>

        <div className="hero-note">
          <strong>01</strong>
          <span>Report</span>

          <strong>02</strong>
          <span>Match</span>

          <strong>03</strong>
          <span>Recover</span>
        </div>
      </section>

      {/* Project Overview */}
      <section className="home-grid">
        <div className="section-index">
          WHY THIS PROJECT
        </div>

        <div>
          <h2>
            One campus, two sides of the same item.
          </h2>

          <p className="large-copy">
            A lost report and a found report become useful when their
            details can be searched together. Foundry keeps those records
            structured: category, location, date, description, image and
            verification status.
          </p>
        </div>

        {/* Technology / Feature Stats */}
        <div className="stats-band">
          <div>
            <b>CRUD</b>
            <span>
              Create, view, edit and delete reports
            </span>
          </div>

          <div>
            <b>JWT</b>
            <span>
              Student and admin access control
            </span>
          </div>

          <div>
            <b>MATCH</b>
            <span>
              Rule-based similarity score
            </span>
          </div>

          <div>
            <b>ATLAS</b>
            <span>
              Persistent MongoDB records
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}