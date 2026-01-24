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
