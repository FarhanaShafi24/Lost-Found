import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ["lost", "found"], required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  imageUrl: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected", "claimed", "recovered"], default: "pending" },
  adminNote: { type: String, default: "" },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

itemSchema.index({ title: "text", description: "text", location: "text", category: "text" });

export default mongoose.model("Item", itemSchema);
