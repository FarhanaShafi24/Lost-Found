import express from "express";
import bcrypt from "bcryptjs";
import Item from "../models/Item.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, adminOnly);

router.get("/stats", async (_req, res) => {
  const [total, pending, approved, resolved, users] = await Promise.all([
    Item.countDocuments(), Item.countDocuments({ status: "pending" }), Item.countDocuments({ status: "approved" }), Item.countDocuments({ status: { $in: ["claimed", "recovered"] } }), User.countDocuments()
  ]);
  res.json({ total, pending, approved, resolved, users });
});

router.get("/items", async (_req, res) => {
  const items = await Item.find().populate("reportedBy", "name email role").sort({ createdAt: -1 });
  res.json(items);
});

router.patch("/items/:id/verify", async (req, res) => {
  const { status, adminNote = "" } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be approved or rejected" });
  const item = await Item.findByIdAndUpdate(req.params.id, { status, adminNote }, { new: true }).populate("reportedBy", "name email");
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

router.get("/users", async (_req, res) => res.json(await User.find().select("-password").sort({ createdAt: -1 })));

router.patch("/users/:id/toggle", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin accounts cannot be disabled here" });
  user.isActive = !user.isActive; await user.save();
  res.json({ id: user._id, isActive: user.isActive });
});

export default router;
