import mongoose from "mongoose";
import { type } from "os";

const UrlsSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  shortUrl:{
    type: String,
    unique: true,
  },
  originalUrl: {
    type: String,
    required: true,
    allowNull: false,
  },
  clicks: {
    type: Number,
    default: 0,
  },
});

const Url = mongoose.model("Url", UrlsSchema);
export default Url;
