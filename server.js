const express = require("express");
const cors = require("cors");
const { fal } = require("@fal-ai/client");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

fal.config({
  credentials: process.env.FAL_KEY,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "The Try Backend is Running 🚀"
  });
});

app.post("/tryon", async (req, res) => {
  try {
    const { person_image_url, clothing_image_url } = req.body;

    const result = await fal.subscribe(
      "fal-ai/image-apps-v2/virtual-try-on",
      {
        input: {
          person_image_url,
          clothing_image_url
        },
        logs: true
      }
    );

    res.json({
      success: true,
      result: result.data
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
