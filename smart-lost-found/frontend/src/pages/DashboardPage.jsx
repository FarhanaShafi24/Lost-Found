import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ItemCard from "../components/ItemCard";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState({});
  const [error, setError] = useState("");
  const [claimLoading, setClaimLoading] = useState({});

  async function loadItems() {
    try {
      setError("");

      const response = await api.get(
        "/items?mine=true&status=all"
      );

      setItems(response.data);

      // Load claims for found items
      const foundItems = response.data.filter(
        (item) => item.type === "found"
      );

      const claimResults = {};

      await Promise.all(
        foundItems.map(async (item) => {
          try {
            const response = await api.get(
              `/items/${item._id}/claims`
            );

            claimResults[item._id] = response.data;
          } catch (error) {
            console.error(
              `LOAD CLAIMS ERROR FOR ${item._id}:`,
              error
            );

            claimResults[item._id] = [];
          }
        })
      );

      setClaims(claimResults);
    } catch (error) {
      console.error(
        "LOAD DASHBOARD ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load your reports."
      );
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function deleteItem(id) {
    if (!window.confirm("Delete this report?")) {
      return;
    }

    try {
      setError("");

      await api.delete(`/items/${id}`);

      loadItems();
    } catch (error) {
      console.error("DELETE ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete the report."
      );
    }
  }

  async function resolveItem(id) {
    try {
      setError("");

      await api.patch(`/items/${id}/resolve`);

      loadItems();
    } catch (error) {
      console.error("RESOLVE ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update the report."
      );
    }
  }

  async function reviewClaim(
    itemId,
    claimId,
    status
  ) {
    const action =
      status === "approved"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this claim?`
    );

    if (!confirmed) {
      return;
    }

    setClaimLoading((current) => ({
      ...current,
      [claimId]: true,
    }));

    try {
      setError("");

      await api.patch(
        `/items/${itemId}/claims/${claimId}`,
        {
          status,
        }
      );

      await loadItems();
    } catch (error) {
      console.error(
        "REVIEW CLAIM ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to review the claim."
      );
    } finally {
      setClaimLoading((current) => ({
        ...current,
        [claimId]: false,
      }));
    }
  }

  return (
    <main className="content">
      <div className="dashboard-head">
        <div>
          <div className="eyebrow">
            STUDENT DASHBOARD
          </div>

          <h1>{user?.name}'s reports</h1>

          <p>
            Track verification, review claims,
            edit your details and close a report
            when the item returns home.
          </p>
        </div>

        <Link
          className="button primary"
          to="/report"
        >
          + New report
        </Link>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="dashboard-summary">
        <div>
          <span>Total reports</span>
          <b>{items.length}</b>
        </div>

        <div>
          <span>Awaiting verification</span>

          <b>
            {
              items.filter(
                (item) =>
                  item.status === "pending"
              ).length
            }
          </b>
        </div>

        <div>
          <span>Resolved</span>

          <b>
            {
              items.filter((item) =>
                [
                  "claimed",
                  "recovered",
                ].includes(item.status)
              ).length
            }
          </b>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="item-grid">
          {items.map((item) => {
            const itemClaims =
              claims[item._id] || [];

            const pendingClaims =
              itemClaims.filter(
                (claim) =>
                  claim.status === "pending"
              );

            return (
              <div key={item._id}>
                <ItemCard
                  item={item}
                  onDelete={deleteItem}
                />

                {["approved", "pending"].includes(
                  item.status
                ) && (
                  <div className="resolve-row">
                    <Link
                      to={`/items/${item._id}/edit`}
                    >
                      Edit report
                    </Link>

                    <button
                      onClick={() =>
                        resolveItem(item._id)
                      }
                    >
                      {item.type === "lost"
                        ? "Mark recovered"
                        : "Mark claimed"}
                    </button>
                  </div>
                )}

                {/* CLAIM REVIEW */}

                {item.type === "found" &&
                  itemClaims.length > 0 && (
                    <div className="claim-review">
                      <div className="claim-review-heading">
                        <div>
                          <span>
                            CLAIMS
                          </span>

                          <h3>
                            People claiming this item
                          </h3>
                        </div>

                        <strong>
                          {pendingClaims.length} pending
                        </strong>
                      </div>

                      <div className="claim-list">
                        {itemClaims.map(
                          (claim) => (
                            <div
                              className="claim-row"
                              key={claim._id}
                            >
                              <div className="claim-person">
                                <b>
                                  {
                                    claim
                                      .claimant
                                      ?.name
                                  }
                                </b>

                                <span>
                                  {
                                    claim
                                      .claimant
                                      ?.email
                                  }
                                </span>
                              </div>

                              <p>
                                {claim.message}
                              </p>

                              <div className="claim-row-bottom">
                                <span
                                  className={`claim-status ${claim.status}`}
                                >
                                  {claim.status}
                                </span>

                                {claim.status ===
                                  "pending" && (
                                  <div className="claim-actions">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        reviewClaim(
                                          item._id,
                                          claim._id,
                                          "approved"
                                        )
                                      }
                                      disabled={
                                        claimLoading[
                                          claim._id
                                        ]
                                      }
                                    >
                                      {claimLoading[
                                        claim._id
                                      ]
                                        ? "..."
                                        : "Approve"}
                                    </button>

                                    <button
                                      type="button"
                                      className="reject"
                                      onClick={() =>
                                        reviewClaim(
                                          item._id,
                                          claim._id,
                                          "rejected"
                                        )
                                      }
                                      disabled={
                                        claimLoading[
                                          claim._id
                                        ]
                                      }
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <b>
            Your report list is empty.
          </b>

          <span>
            Submit a lost or found report to
            start tracking it.
          </span>
        </div>
      )}
    </main>
  );
}