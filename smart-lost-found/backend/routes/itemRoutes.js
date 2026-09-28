
import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import Item from "../models/Item.js";
import Claim from "../models/Claim.js";

import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const removeFile = (url) => {
  if (!url?.startsWith("/uploads/")) return;

  const file = path.resolve(".", url.replace(/^\//, ""));

  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
};

// GET ALL ITEMS
router.get("/", protect, async (req, res) => {
  try {
    const { q, type, category, status, location, mine } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { category: new RegExp(q, "i") },
        { location: new RegExp(q, "i") },
      ];
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (location) {
      filter.location = new RegExp(location, "i");
    }

    if (mine === "true") {
      filter.reportedBy = req.user._id;
    }

    const items = await Item.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error("GET ITEMS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// GET ONE ITEM
router.get("/:id", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      item.status === "rejected" &&
      String(item.reportedBy._id) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    console.error("GET ITEM ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE ITEM
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      description,
      location,
      date,
    } = req.body;

    if (
      !title ||
      !type ||
      !category ||
      !description ||
      !location ||
      !date
    ) {
      return res.status(400).json({
        message: "All item fields are required",
      });
    }

    const item = await Item.create({
      title,
      type,
      category,
      description,
      location,
      date,
      reportedBy: req.user._id,
      imageUrl: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    });

    const populatedItem = await item.populate(
      "reportedBy",
      "name email"
    );

    res.status(201).json(populatedItem);
  } catch (error) {
    console.error("CREATE ITEM ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE ITEM
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      String(item.reportedBy) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only edit your own report",
      });
    }

    const fields = [
      "title",
      "type",
      "category",
      "description",
      "location",
      "date",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.file) {
      removeFile(item.imageUrl);

      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (req.user.role !== "admin") {
      item.status = "pending";
      item.adminNote = "";
    }

    await item.save();

    const populatedItem = await item.populate(
      "reportedBy",
      "name email"
    );

    res.json(populatedItem);
  } catch (error) {
    console.error("UPDATE ITEM ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE ITEM
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      String(item.reportedBy) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only delete your own report",
      });
    }

    removeFile(item.imageUrl);

    await Claim.deleteMany({
      item: item._id,
    });

    await item.deleteOne();

    res.json({
      message: "Report deleted",
    });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// MARK ITEM AS CLAIMED / RECOVERED
router.patch("/:id/resolve", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (String(item.reportedBy) !== String(req.user._id)) {
      return res.status(403).json({
        message: "Only the reporter can resolve this item",
      });
    }

    item.status =
      item.type === "lost"
        ? "recovered"
        : "claimed";

    await item.save();

    res.json(item);
  } catch (error) {
    console.error("RESOLVE ITEM ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// SMART MATCHES
router.get("/:id/matches", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const opposite =
      item.type === "lost"
        ? "found"
        : "lost";

    const candidates = await Item.find({
      type: opposite,
      status: "approved",
    }).populate(
      "reportedBy",
      "name email"
    );

    const tokenize = (text) =>
      new Set(
        String(text)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length > 2)
      );

    const wordsA = tokenize(
      `${item.title} ${item.description}`
    );

    const matches = candidates
      .map((candidate) => {
        let score = 0;
        const reasons = [];

        if (
          candidate.category.toLowerCase() ===
          item.category.toLowerCase()
        ) {
          score += 35;
          reasons.push("same category");
        }

        if (
          candidate.location.toLowerCase() ===
          item.location.toLowerCase()
        ) {
          score += 25;
          reasons.push("same location");
        }

        const days =
          Math.abs(
            new Date(candidate.date) -
              new Date(item.date)
          ) / 86400000;

        if (days <= 1) {
          score += 20;
          reasons.push("date within 1 day");
        } else if (days <= 3) {
          score += 12;
          reasons.push("date within 3 days");
        } else if (days <= 7) {
          score += 6;
          reasons.push("date within 7 days");
        }

        const wordsB = tokenize(
          `${candidate.title} ${candidate.description}`
        );

        const overlap = [...wordsA].filter(
          (word) => wordsB.has(word)
        ).length;

        if (overlap > 0) {
          score += Math.min(
            20,
            overlap * 5
          );

          reasons.push(
            `${overlap} shared keyword${
              overlap > 1 ? "s" : ""
            }`
          );
        }

        return {
          item: candidate,
          score,
          reasons,
        };
      })
      .filter(
        (match) => match.score >= 25
      )
      .sort(
        (a, b) => b.score - a.score
      )
      .slice(0, 5);

    res.json(matches);
  } catch (error) {
    console.error("MATCH ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// SUBMIT A CLAIM
router.post("/:id/claims", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Claim message is required",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.type !== "found") {
      return res.status(400).json({
        message: "Only found items can be claimed",
      });
    }

    if (item.status !== "approved") {
      return res.status(400).json({
        message:
          "This item is not currently available for claiming",
      });
    }

    if (
      String(item.reportedBy) ===
      String(req.user._id)
    ) {
      return res.status(400).json({
        message: "You cannot claim your own report",
      });
    }

    const existingClaim = await Claim.findOne({
      item: item._id,
      claimant: req.user._id,
      status: "pending",
    });

    if (existingClaim) {
      return res.status(409).json({
        message:
          "You already have a pending claim for this item",
      });
    }

    const claim = await Claim.create({
      item: item._id,
      claimant: req.user._id,
      message: message.trim(),
    });

    const populatedClaim =
      await claim.populate([
        {
          path: "claimant",
          select: "name email",
        },
        {
          path: "item",
          select:
            "title type category location date status reportedBy",
          populate: {
            path: "reportedBy",
            select: "name email",
          },
        },
      ]);

    res.status(201).json(
      populatedClaim
    );
  } catch (error) {
    console.error(
      "CREATE CLAIM ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

// GET CLAIMS FOR AN ITEM
router.get("/:id/claims", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    const item = await Item.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const isReporter =
      String(item.reportedBy) ===
      String(req.user._id);

    const isAdmin =
      req.user.role === "admin";

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        message:
          "You are not allowed to view these claims",
      });
    }

    const claims = await Claim.find({
      item: item._id,
    })
      .populate(
        "claimant",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    res.json(claims);
  } catch (error) {
    console.error(
      "GET CLAIMS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

// APPROVE OR REJECT A CLAIM
router.patch(
  "/:id/claims/:claimId",
  protect,
  async (req, res) => {
    try {
      if (
        !isValidObjectId(req.params.id) ||
        !isValidObjectId(req.params.claimId)
      ) {
        return res.status(400).json({
          message:
            "Invalid item or claim id",
        });
      }

      const { status } = req.body;

      if (
        !["approved", "rejected"].includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Status must be approved or rejected",
        });
      }

      const item = await Item.findById(
        req.params.id
      );

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      const isReporter =
        String(item.reportedBy) ===
        String(req.user._id);

      const isAdmin =
        req.user.role === "admin";

      if (!isReporter && !isAdmin) {
        return res.status(403).json({
          message:
            "Only the reporter or admin can manage claims",
        });
      }

      const claim = await Claim.findOne({
        _id: req.params.claimId,
        item: item._id,
      });

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }

      if (claim.status !== "pending") {
        return res.status(400).json({
          message:
            "This claim has already been reviewed",
        });
      }

      claim.status = status;

      await claim.save();

      if (status === "approved") {
        item.status = "claimed";

        await item.save();

        await Claim.updateMany(
          {
            item: item._id,
            _id: {
              $ne: claim._id,
            },
            status: "pending",
          },
          {
            $set: {
              status: "rejected",
            },
          }
        );
      }

      const populatedClaim =
        await claim.populate([
          {
            path: "claimant",
            select: "name email",
          },
          {
            path: "item",
            select:
              "title type category location date status reportedBy",
            populate: {
              path: "reportedBy",
              select: "name email",
            },
          },
        ]);

      res.json(
        populatedClaim
      );
    } catch (error) {
      console.error(
        "UPDATE CLAIM ERROR:",
        error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

export default router;

