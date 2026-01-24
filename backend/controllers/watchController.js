import mongoose from "mongoose";
import Watch from "../models/watchModel";

const API_BASE = "http://localhost:4000";

// to create a watch
export async function createWatch(req, res) {
  try {
    const { name, description, price, category, brandName } = req.body;
    let image = req.body.image;

    if (req.file?.filename) image = `${API_BASE}/uploads/${req.file.filename}`;
    if (!name || !description || !price || !image) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const doc = new Watch({
      _id: new mongoose.Types.ObjectId(),
      name,
      description,
      price,
      category,
      brandName,
      image,
    });

    const saved = await doc.save();
    return res.status(201).json({
      success: true,
      message: "Watch created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("CreateWatch error", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// to fetch the watch
export async function getWatches(req, res) {
  try {
    const { category, sort = "-createdAt", page = 1, limit = 12 } = req.query;
    const filter = {};
    //to filter
    if (typeof category === "string") {
      const cat = category.trim().toLowerCase();
      if (cat === "men" || cat === "women") filter.category = cat;
    }

    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, parseInt(limit, 10) || 12);
    const skip = (pg - 1) * lim;

    const total = await Watch.countDocuments(filter);
    const items = await Watch.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lim)
      .lean();

    return res.json({
      success: true,
      total,
      page: pg,
      limit: lim,
      items,
    });
  } catch (error) {
    console.error("GetWatches error", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
