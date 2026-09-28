import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("reports");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");

      const statsResponse = await api.get("/admin/stats");
      const itemsResponse = await api.get("/admin/items");
      const usersResponse = await api.get("/admin/users");

      setStats(statsResponse.data);
      setItems(itemsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("LOAD ADMIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load admin data."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id, status) {
    try {
      setError("");

      await api.patch("/admin/items/" + id + "/verify", {
        status: status,
      });

      await load();
    } catch (error) {
      console.error("VERIFY ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update report status."
      );
    }
  }

  async function toggle(id) {
    try {
      setError("");

      await api.patch("/admin/users/" + id + "/toggle");

      await load();
    } catch (error) {
      console.error("TOGGLE USER ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update user status."
      );
    }
  }

  return (
    <main className="content">
      <div className="page-heading">
        <div className="eyebrow">ADMIN CONSOLE</div>

        <h1>Campus reports, one control desk.</h1>

        <p>
          Verify submissions before they become part of the public
          board. Manage accounts separately from item records.
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      {stats && (
        <div className="admin-stats">
          <div>
            <span>All reports</span>
            <b>{stats.total}</b>
          </div>

          <div>
            <span>Pending</span>
            <b>{stats.pending}</b>
          </div>

          <div>
            <span>Approved</span>
            <b>{stats.approved}</b>
          </div>

          <div>
            <span>Resolved</span>
            <b>{stats.resolved}</b>
          </div>

          <div>
            <span>Users</span>
            <b>{stats.users}</b>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={tab === "reports" ? "active" : ""}
          onClick={() => setTab("reports")}
          type="button"
        >
          Reports
        </button>

        <button
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
          type="button"
        >
          Users
        </button>
      </div>

      {tab === "reports" ? (
        <div className="admin-table">
          {items.length > 0 ? (
            items.map((item) => (
              <div className="admin-row" key={item._id}>
                <div>
                  <span className={"type-label " + item.type}>
                    {item.type}
                  </span>

                  <b>{item.title}</b>

                  <small>
                    {item.category} · {item.location} · by{" "}
                    {item.reportedBy?.name || "Unknown user"}
                  </small>
                </div>

                <span className={"status " + item.status}>
                  {item.status}
                </span>

                <div className="row-actions">
                  {(item.status === "pending" ||
                    item.status === "approved" ||
                    item.status === "rejected") && (
                    <>
                      <button
                        type="button"
                        onClick={() => verify(item._id, "approved")}
                      >
                        Approve
                      </button>

                      <button
                        className="reject"
                        type="button"
                        onClick={() => verify(item._id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <b>No reports found.</b>

              <span>
                Student reports will appear here.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-table">
          {users.length > 0 ? (
            users.map((user) => (
              <div className="admin-row" key={user._id}>
                <div>
                  <b>{user.name}</b>

                  <small>
                    {user.email} · {user.role}
                  </small>
                </div>

                <span
                  className={
                    "status " +
                    (user.isActive ? "approved" : "rejected")
                  }
                >
                  {user.isActive ? "active" : "disabled"}
                </span>

                <div className="row-actions">
                  {user.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() => toggle(user._id)}
                    >
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <b>No users found.</b>

              <span>
                Registered student accounts will appear here.
              </span>
            </div>
          )}
        </div>
      )}
    </main>
  );
}