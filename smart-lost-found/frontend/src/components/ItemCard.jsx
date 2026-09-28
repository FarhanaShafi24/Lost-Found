
import React from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../utils/api";

export default function ItemCard({ item, onDelete }) {
  const image = item.imageUrl
    ? `${API_URL.replace(/\/api$/, "")}${item.imageUrl}`
    : null;

  return (
    <article className="campus-item-card">
      {/* TOP LINE */}
      <div className="campus-card-top">
        <span className={`campus-type ${item.type}`}>
          {item.type.toUpperCase()}
        </span>

        <span className="campus-date">
          {new Date(item.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* IMAGE */}
      <div className="campus-card-image">
        {image ? (
          <img src={image} alt={item.title} />
        ) : (
          <div className="campus-no-image">
            <span>NO IMAGE</span>
            <b>{item.type === "lost" ? "LOST ITEM" : "FOUND ITEM"}</b>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="campus-card-content">
        <div className="campus-category">
          {item.category}
        </div>

        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <div className="campus-location">
          <span>LOCATION</span>
          <b>{item.location}</b>
        </div>

        {/* BOTTOM */}
        <div className="campus-card-bottom">
          <span className={`campus-status ${item.status}`}>
            {item.status}
          </span>

          <div className="campus-card-actions">
            <Link
              className="campus-view"
              to={`/items/${item._id}`}
            >
              View details
              <span>→</span>
            </Link>

            {onDelete && (
              <button
                className="campus-delete"
                type="button"
                onClick={() => onDelete(item._id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

