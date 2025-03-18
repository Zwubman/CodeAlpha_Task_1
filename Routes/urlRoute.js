import mongoose from "mongoose";
import express from "express";
import { redirectToOriginalUrl, shortenUrl} from "../Controllers/urlController.js";

const router = express.Router();

router.post('/shorten', shortenUrl);
router.get('/:shortId', redirectToOriginalUrl);

export default router;