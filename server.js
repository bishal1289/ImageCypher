const express = require("express");
const multer = require("multer");
const path = require("path");
const encrypt = require("./encrypt");
const decrypt = require("./decrypt");
const app = express();
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/encrypt", upload.single("image"), async (req, res) => {
  const uploadedPath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName);
  const name = path.parse(originalName).name;
  const timestamp = Date.now();
  const tempPath = req.file.path;

  const encryptedImageName = `${name}_encrypted_${timestamp}${ext}`;
  const keyFileName = `${name}_key_${timestamp}.txt`;

  const outputImg = path.join("uploads", encryptedImageName);
  const outputKey = path.join("uploads", keyFileName);

  try {
    
      const result = await encrypt(uploadedPath, outputImg, outputKey,tempPath);
      fs.unlink(tempPath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/decrypt",
  upload.fields([{ name: "image" }, { name: "key" }]),
  async (req, res) => {
    const imageFile = req.files["image"][0];
    const keyFile = req.files["key"][0];

    const imgPath = imageFile.path;
    const keyPath = keyFile.path;

    const ext = path.extname(imageFile.originalname);
    const baseName = path.parse(imageFile.originalname).name;
    const timestamp = Date.now();
    const tempPath = imageFile.path;

    const decryptedImageName = `${baseName}_decrypted_${timestamp}${ext}`;
    const outputImg = path.join("uploads", decryptedImageName);

    try {
      const result = await decrypt(imgPath, keyPath, outputImg, tempPath);
      fs.unlink(imgPath, (err) => {
        if (err) console.error("Error deleting image temp file:", err);
      });
      fs.unlink(keyPath, (err) => {
        if (err) console.error("Error deleting key temp file:", err);
      });
      res.json({ outputImageFile: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.listen(3000, () =>
  console.log("🚀 Server running at http://localhost:3000")
);
