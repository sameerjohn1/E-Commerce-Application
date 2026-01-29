import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import watchRouter from "./routes/watchRoutes.js";
import path from "path";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = 4000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// db
connectDB();

// routes
app.use("/api/auth", userRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/watches", watchRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("Api working");
});

app.listen(port, () => {
  console.log(`Server is started on http://localhost:${port}`);
});
