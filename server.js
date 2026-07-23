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
      prompt: "Replace only the uploaded garment on the person with the uploaded garment image.

Preserve the person's face, identity, skin tone, hairstyle, facial features, expression, body shape, body proportions, pose, camera angle, perspective, hand position, leg position, footwear, accessories, background, lighting, shadows, image quality, and composition exactly as in the original image.

Do not alter the person's age, gender, ethnicity, body size, facial structure, or any other physical characteristics.

Keep the garment fit realistic, accurate, wrinkle-aware, and naturally aligned with the body. Preserve garment colors, logos, prints, embroidery, textures, stitching, fabric type, folds, sleeve length, neckline, buttons, zippers, pockets, and every visible design detail exactly as shown in the uploaded garment image.

Do not generate a new outfit. Do not redesign, restyle, reinterpret, or invent any clothing details. Apply only the uploaded garment.

Do not crop, zoom, rotate, distort, or reposition the person. Keep the entire scene identical except for replacing the garment.

Produce a photorealistic, high-resolution fashion try-on suitable for an e-commerce product preview.",
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
