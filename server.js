const express = require("express");
const multer = require("multer");
const path = require("path");
const encrypt = require("./encrypt");
const decrypt = require("./decrypt");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
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

  const encryptedImageName = `${name}_encrypted_${timestamp}${ext}`;
  const keyFileName = `${name}_key_${timestamp}.txt`;

  const outputImg = path.join("uploads", encryptedImageName);
  const outputKey = path.join("uploads", keyFileName);

  try {
    await encrypt(uploadedPath, outputImg, outputKey);
    fs.unlink(uploadedPath, () => {});

    const zipPath = `uploads/${name}_cypher_${timestamp}.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      res.download(zipPath, () => {
        fs.unlink(zipPath, () => {});
        fs.unlink(outputImg, () => {});
        fs.unlink(outputKey, () => {});
      });
    });

    archive.pipe(output);
    archive.file(outputImg, { name: encryptedImageName });
    archive.file(outputKey, { name: keyFileName });
    archive.finalize();
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

    const decryptedImageName = `${baseName}_decrypted_${timestamp}${ext}`;
    const outputImg = path.join("uploads", decryptedImageName);

    try {
      await decrypt(imgPath, keyPath, outputImg);
      fs.unlink(imgPath, () => {});
      fs.unlink(keyPath, () => {});
      res.download(outputImg, () => {
        fs.unlink(outputImg, () => {});
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.listen(3000, () =>
  console.log("🚀 Server running at http://localhost:3000")
);
