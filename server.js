const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "The Try Backend is Running 🚀"
  });
});

app.post("/tryon", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "AI integration coming next.",
      data: req.body
    });
  } catch (err) {
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
