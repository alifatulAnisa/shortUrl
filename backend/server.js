// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { nanoid } from "nanoid";
import e from "express";
import mongoose from "mongoose";

const app = e();
app.use(e.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected!"))
    .catch(err => console.log(err));

// URL Schema
const UrlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String
});

const Url = mongoose.model("Url", UrlSchema);

// API to shorten URL
app.post("/shorten", async (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = nanoid(7);

    const url = new Url({ originalUrl, shortUrl });
    await url.save();

    res.json({ shortUrl });
})

// API to redirect
app.get("/:shortUrl", async (req, res) => {
    try {
        const shortUrl = req.params.shortUrl;
        const urlEntry = await Url.findOne({ shortUrl });

        if (!urlEntry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        res.redirect(urlEntry.originalUrl);
    } catch (error) {
        console.error("Error redirecting:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));