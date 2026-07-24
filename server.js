const express = require("express");
const cors = require("cors");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const { fal } = require("@fal-ai/client");

const app = express();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage()
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

fal.config({
  credentials: process.env.FAL_KEY
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "The Try Backend is Running 🚀"
  });
});

function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "the-try"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);

  });
}
app.post(
  "/tryon",
  upload.fields([
    { name: "person", maxCount: 1 },
    { name: "clothing", maxCount: 1 }
  ]),
  async (req, res) => {

    try {

      const personFile = req.files.person[0];
      const clothingFile = req.files.clothing[0];

      const personUrl = await uploadToCloudinary(personFile.buffer);
      const clothingUrl = await uploadToCloudinary(clothingFile.buffer);

      const result = await fal.subscribe(
  "fal-ai/flux-pro/v1/vto",
  {
    input: {
      human_image_url: personUrl,
      garment_image_url: clothingUrl,
      output_format: "png"
    },
    logs: true
  }
);

      res.json({
        success: true,
        image: result.data.images[0].url
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        error: err.message
      });

    }

  }
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
