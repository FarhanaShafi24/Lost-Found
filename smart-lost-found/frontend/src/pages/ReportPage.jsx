import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ItemForm from "../components/ItemForm";
import { api } from "../utils/api";

export default function ReportPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const type = params.get("type");

  async function submit(data) {
    setBusy(true);
    setError("");

    try {
      if (type) {
        data.set("type", type);
      }

      await api.post("/items", data);

      navigate("/dashboard");
    } catch (error) {
      console.error("REPORT ITEM ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create the item report."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="content narrow">
      <div className="page-heading">
        <div className="eyebrow">NEW RECORD</div>

        <h1>Report a lost or found item.</h1>

        <p>
          Use specific details. “Black Dell laptop, silver sticker,
          Library 2nd floor” is more useful than “laptop”.
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <ItemForm
        onSubmit={submit}
        submitting={busy}
      />
    </main>
  );
}