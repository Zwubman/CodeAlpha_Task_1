import mongoose from "mongoose";
import Url from "../Models/urlModel.js";
import { nanoid } from "nanoid";
import validUrl from "valid-url";


// Function to shorten a given URL
export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;


    // Validate the provided URL
    if (!originalUrl || !validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: "Invalid original URL" });
    }


    // Check if the URL already exists in the database
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        shortUrl: `${req.protocol}://${req.get("host")}/${existingUrl.shortId}`,
      });
    }


    // Generate a unique 6-character short ID
    const shortId = nanoid(6);

    // Create a new URL entry in the database
    const newUrl = new Url({ shortId, originalUrl });
    await newUrl.save();


    // Return the shortened URL to the client
    res.status(201).json({
      shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`,
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortId } = req.params; // Get the shortId from the URL

    // Find the URL in the database
    const urlData = await Url.findOne({ shortId });

    // If the short URL does not exist
    if (!urlData) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    // Increment the click counter
    urlData.clicks += 1;
    await urlData.save();

    // Redirect to the original URL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
