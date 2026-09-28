
import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { api } from "../utils/api";

export default function BrowsePage() {
  const [items, setItems] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    type: "all",
    category: "all",
    status: "approved",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/items?${params.toString()}`);
      setItems(response.data);
    } catch (error) {
      console.error("LOAD BROWSE ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.type, filters.category, filters.status]);

  function handleSubmit(event) {
    event.preventDefault();
    load();
  }

  function handleChange(event) {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  }

  return (
    <main className="browse-page">
      {/* INTRODUCTION */}
      <section className="browse-intro">
        <div className="browse-index">
          <span>02</span>
          <small>PUBLIC CAMPUS BOARD</small>
        </div>

        <div className="browse-heading">
          <div className="eyebrow">SEARCH / DISCOVER / CONNECT</div>

          <h1>
            Search the
            <br />
            <em>reports.</em>
          </h1>

          <p>
            Browse belongings reported across campus. Search by item,
            location or description, then narrow the results by type,
            category and verification status.
          </p>
        </div>

        <div className="browse-count">
          <strong>{items.length}</strong>
          <span>VISIBLE<br />RECORDS</span>
        </div>
      </section>

      {/* SEARCH AREA */}
      <section className="browse-search-section">
        <div className="section-label">
          <span>01</span>
          <b>FIND A RECORD</b>
        </div>

        <form className="browse-search" onSubmit={handleSubmit}>
          <div className="search-main">
            <label htmlFor="q">SEARCH</label>

            <input
              id="q"
              type="text"
              name="q"
              value={filters.q}
              onChange={handleChange}
              placeholder="Laptop, wallet, library..."
            />

            <button className="search-button" type="submit">
              Search
            </button>
          </div>

          <div className="search-filters">
            <label>
              <span>TYPE</span>

              <select
                name="type"
                value={filters.type}
                onChange={handleChange}
              >
                <option value="all">Lost + Found</option>
                <option value="lost">Lost only</option>
                <option value="found">Found only</option>
              </select>
            </label>

            <label>
              <span>CATEGORY</span>

              <select
                name="category"
                value={filters.category}
                onChange={handleChange}
              >
                <option value="all">All categories</option>

                {[
                  "Electronics",
                  "ID / Cards",
                  "Keys",
                  "Books",
                  "Clothing",
                  "Accessories",
                  "Wallet / Money",
                  "Documents",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>STATUS</span>

              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="claimed">Claimed</option>
                <option value="recovered">Recovered</option>
                <option value="pending">Pending</option>
              </select>
            </label>
          </div>
        </form>
      </section>

      {/* ERROR */}
      {error && <div className="error-box">{error}</div>}

      {/* RESULTS */}
      <section className="browse-results">
        <div className="results-heading">
          <div>
            <span>02 / RECORDS</span>

            <h2>
              Campus
              <br />
              <em>reports.</em>
            </h2>
          </div>

          <p>
            Verified reports appear here. Open a record to see its
            complete details and possible matches.
          </p>
        </div>

        {loading ? (
          <div className="browse-loading">
            <span>LOADING RECORDS</span>
            <b>...</b>
          </div>
        ) : items.length > 0 ? (
          <div className="item-grid browse-grid">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="browse-empty">
            <div className="empty-number">00</div>

            <div>
              <b>No reports matched these filters.</b>

              <span>
                Try a broader search or create a new report.
              </span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

