import React from "react";

import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";

import AuthPage from "./pages/AuthPage";

import BrowsePage from "./pages/BrowsePage";

import ReportPage from "./pages/ReportPage";

import DashboardPage from "./pages/DashboardPage";

import EditItemPage from "./pages/EditItemPage";

import ItemDetailsPage from "./pages/ItemDetailsPage";

import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<HomePage />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<AuthPage />}
        />

        <Route
          path="/register"
          element={<AuthPage />}
        />

        {/* Student protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/browse"
            element={<BrowsePage />}
          />

          <Route
            path="/report"
            element={<ReportPage />}
          />

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/items/:id"
            element={<ItemDetailsPage />}
          />

          <Route
            path="/items/:id/edit"
            element={<EditItemPage />}
          />
        </Route>

        {/* Admin protected route */}
        <Route element={<ProtectedRoute admin />}>
          <Route
            path="/admin"
            element={<AdminPage />}
          />
        </Route>

        {/* Unknown URL */}
        <Route
          path="*"
          element={<HomePage />}
        />
      </Routes>
    </>
  );
}