import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { api, API_URL } from "../utils/api";

import { useAuth } from "../context/AuthContext";

export default function ItemDetailsPage() {
  const { id } = useParams();

  const { user } = useAuth();

  const [item, setItem] = useState(null);

  const [matches, setMatches] = useState([]);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const [claimMessage, setClaimMessage] = useState("");

  const [claimError, setClaimError] = useState("");

  const [claimSuccess, setClaimSuccess] = useState("");

  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        setError("");

        const response = await api.get(`/items/${id}`);

        setItem(response.data);
      } catch (error) {
        console.error("LOAD ITEM ERROR:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load this item."
        );
      }
    }

    async function loadMatches() {
      try {
        const response = await api.get(
          `/items/${id}/matches`
        );

        setMatches(response.data);
      } catch (error) {
        console.error(
          "LOAD MATCHES ERROR:",
          error
        );
      }
    }

    loadItem();

    loadMatches();
  }, [id]);

  async function copyEmail() {
    const email = item?.reportedBy?.email;

    if (!email) {
      return;
    }

    try {
      await navigator.clipboard.writeText(email);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY EMAIL ERROR:",
        error
      );
    }
  }

  async function submitClaim(event) {
    event.preventDefault();

    setClaimError("");

    setClaimSuccess("");

    if (!claimMessage.trim()) {
      setClaimError(
        "Please explain why you believe this is your item."
      );

      return;
    }

    setClaiming(true);

    try {
      await api.post(`/items/${id}/claims`, {
        message: claimMessage.trim(),
      });

      setClaimMessage("");

      setClaimSuccess(
        "Your claim has been submitted. The reporter can now review it."
      );
    } catch (error) {
      console.error(
        "SUBMIT CLAIM ERROR:",
        error
      );

      setClaimError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit your claim."
      );
    } finally {
      setClaiming(false);
    }
  }

  if (error) {
    return (
      <main className="content">
        <div className="error-box">
          {error}
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="page-loading">
        Loading item…
      </main>
    );
  }

  const image = item.imageUrl
    ? `${API_URL.replace(
        /\/api$/,
        ""
      )}${item.imageUrl}`
    : null;

  const isReporter =
    user &&
    item.reportedBy?._id &&
    String(item.reportedBy._id) ===
      String(user.id);

  const canClaim =
    item.type === "found" &&
    item.status === "approved" &&
    !isReporter;

  return (
    <main className="content">
      <Link
        to="/browse"
        className="back-link"
      >
        ← Back to reports
      </Link>

      <div className="detail-layout">
        <div>
          {image ? (
            <img
              className="detail-image"
              src={image}
              alt={item.title}
            />
          ) : (
            <div className="detail-image image-placeholder">
              NO IMAGE
            </div>
          )}
        </div>

        <div className="detail-copy">
          <div
            className={`type-label ${item.type}`}
          >
            {item.type.toUpperCase()} REPORT
          </div>

          <h1>{item.title}</h1>

          <div className="detail-facts">
            <div>
              <span>Category</span>
              <b>{item.category}</b>
            </div>

            <div>
              <span>Location</span>
              <b>{item.location}</b>
            </div>

            <div>
              <span>Date</span>

              <b>
                {new Date(
                  item.date
                ).toLocaleDateString()}
              </b>
            </div>

            <div>
              <span>Status</span>

              <b
                className={`status ${item.status}`}
              >
                {item.status}
              </b>
            </div>
          </div>

          <p className="detail-description">
            {item.description}
          </p>

          {item.adminNote && (
            <div className="note">
              <b>Admin note</b>

              <span>
                {item.adminNote}
              </span>
            </div>
          )}

          {/* CLAIM SECTION */}

          {canClaim && (
            <div className="claim-box">
              <div className="claim-heading">
                <span>FOUND THIS ITEM?</span>

                <h3>
                  Think this belongs to you?
                </h3>

                <p>
                  Submit a claim with enough
                  identifying information for
                  the reporter to verify ownership.
                </p>
              </div>

              {claimError && (
                <div className="error-box">
                  {claimError}
                </div>
              )}

              {claimSuccess && (
                <div className="success-box">
                  {claimSuccess}
                </div>
              )}

              {!claimSuccess && (
                <form
                  className="claim-form"
                  onSubmit={submitClaim}
                >
                  <label>
                    Why is this your item?
                    <textarea
                      value={claimMessage}
                      onChange={(event) =>
                        setClaimMessage(
                          event.target.value
                        )
                      }
                      placeholder="Mention details only the real owner would know, such as stickers, marks, contents or identifying features."
                      rows="5"
                      maxLength="500"
                      required
                    />
                  </label>

                  <button
                    className="button primary"
                    type="submit"
                    disabled={claiming}
                  >
                    {claiming
                      ? "Submitting..."
                      : "Submit claim"}
                  </button>
                </form>
              )}
            </div>
          )}

          {item.status === "claimed" && (
            <div className="success-box">
              This item has already been claimed.
            </div>
          )}

          {isReporter && (
            <div className="note">
              <b>Your report</b>

              <span>
                You cannot submit a claim for
                your own item.
              </span>
            </div>
          )}

          {/* CONTACT REPORTER */}

          {item.status === "approved" &&
            item.reportedBy?.email && (
              <div className="contact-box">
                <div>
                  <span>
                    CONTACT REPORTER
                  </span>

                  <b>
                    {item.reportedBy.email}
                  </b>
                </div>

                <button
                  className="button primary"
                  type="button"
                  onClick={copyEmail}
                >
                  {copied
                    ? "Email copied"
                    : "Copy email"}
                </button>
              </div>
            )}

          <div className="reporter">
            <span>Reported by</span>

            <b>
              {item.reportedBy?.name}
            </b>
          </div>
        </div>
      </div>

      {/* SMART MATCH SECTION */}

      <section className="match-section">
        <div>
          <div className="eyebrow">
            POSSIBLE MATCHES
          </div>

          <h2>
            Could this be the same item?
          </h2>

          <p>
            Scores are calculated from
            category, location, date proximity
            and shared keywords.
          </p>
        </div>

        {matches.length > 0 ? (
          <div className="match-list">
            {matches.map((match) => (
              <Link
                to={`/items/${match.item._id}`}
                className="match-row"
                key={match.item._id}
              >
                <div>
                  <b>
                    {match.item.title}
                  </b>

                  <span>
                    {match.item.location} ·{" "}
                    {new Date(
                      match.item.date
                    ).toLocaleDateString()}
                  </span>

                  <small>
                    {match.reasons.join(
                      " · "
                    )}
                  </small>
                </div>

                <strong>
                  {match.score}%
                </strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state small">
            <b>
              No strong match yet.
            </b>

            <span>
              New approved reports can create
              a match later.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}