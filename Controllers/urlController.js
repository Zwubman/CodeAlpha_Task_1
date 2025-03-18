import mongoose from "mongoose";
import Url from "../Models/urlModel.js";
import { nanoid } from "nanoid";
import { URL } from "url";
import validUrl from "valid-url";

export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Validate the provided URL
    if (!originalUrl || !validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: "Invalid original URL" });
    }

    // Parse the URL to extract the domain name and top-level domain (TLD)
    const parsedUrl = new URL(originalUrl);
    let domainParts = parsedUrl.hostname.replace("www.", "").split(".");

    // Extract the main domain and top-level domain (TLD)
    let domainName = domainParts[0]; // e.g., 'wikipedia'
    let tld = domainParts[domainParts.length - 1]; // e.g., 'org' or 'com'

    // Construct the short URL with the correct TLD
    const shortUrl = `http://${domainName}.${tld}`;

    // Check if the URL already exists in the database
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({ shortUrl });
    }

    // Create a new URL entry in the database
    const newUrl = new Url({ shortId: `${domainName}.${tld}`, originalUrl });
    await newUrl.save();

    // Return the shortened URL to the client
    res.status(201).json({ shortUrl });
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//function use the short url to access the original url
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

    console.log("Redirecting to:", urlData.originalUrl); // Already confirmed
    console.log("Short URL ID:", shortId); // Ensure shortId is correctly extracted
    console.log("Redirecting user...");

    // Redirect to the original URL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
