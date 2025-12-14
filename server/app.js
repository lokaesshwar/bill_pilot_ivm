import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import fileRoutes from "./routes/fileRoutes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", fileRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;
