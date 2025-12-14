import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { handleFileExtraction } from "../controllers/fileExtraction.js";

const router = express.Router();

router.post("/extract", upload.array("files"), handleFileExtraction);

export default router;
