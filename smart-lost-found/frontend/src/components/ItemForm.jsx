import React, { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  type: "lost",
  category: "Electronics",
  description: "",
  location: "",
  date: "",
  image: null,
};

const categories = [
  "Electronics",
  "ID / Cards",
  "Keys",
  "Books",
  "Clothing",
  "Accessories",
  "Wallet / Money",
  "Documents",
  "Other",
];

export default function ItemForm({
  initialItem,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialItem) {
      setForm({
        title: initialItem.title || "",
        type: initialItem.type || "lost",
        category: initialItem.category || "Electronics",
        description: initialItem.description || "",
        location: initialItem.location || "",
        date: initialItem.date
          ? new Date(initialItem.date).toISOString().slice(0, 10)
          : "",
        image: null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialItem]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: files ? files[0] : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    onSubmit(data);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Report type

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="lost">I lost an item</option>
            <option value="found">I found an item</option>
          </select>
        </label>

        <label>
          Category

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="span-2">
          Item name

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. black Lenovo laptop"
            required
          />
        </label>

        <label>
          Campus location

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Library 2nd floor"
            required
          />
        </label>

        <label>
          Date

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        <label className="span-2">
          Description

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mention colour, model, stickers, marks or other identifying details"
            required
            rows="5"
          />
        </label>

        <label className="span-2 file-label">
          Item image

          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
          />

          <small>
            Optional · JPG, PNG or WEBP · maximum 5 MB
          </small>
        </label>
      </div>

      <button
        className="button primary"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Saving..."
          : initialItem
          ? "Update report"
          : "Submit report"}
      </button>
    </form>
  );
}