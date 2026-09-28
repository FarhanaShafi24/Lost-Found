import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ItemForm from "../components/ItemForm";
import { api } from "../utils/api";

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
            "Failed to load the report."
        );
      }
    }

    loadItem();
  }, [id]);

  async function submit(data) {
    setBusy(true);
    setError("");

    try {
      await api.put(`/items/${id}`, data);

      navigate("/dashboard");
    } catch (error) {
      console.error("UPDATE ITEM ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update the report."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="content narrow">
      <div className="page-heading">
        <div className="eyebrow">EDIT RECORD</div>

        <h1>Update report details.</h1>

        <p>
          Change the information below and save your updated
          report.
        </p>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {item && (
        <ItemForm
          initialItem={item}
          onSubmit={submit}
          submitting={busy}
        />
      )}
    </main>
  );
}