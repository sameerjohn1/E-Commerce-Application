import mongoose from "mongoose";

const watchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ["men", "women", "brand"], default: "men" },
    brandName: { type: String, trim: true, default: null },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

const Watch = mongoose.model.watch || mongoose.model("Watch", watchSchema);

export default Watch;
