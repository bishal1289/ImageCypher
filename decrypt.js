const fs = require("fs");
const Jimp = require("jimp"); // ✅ Works with version 0.16.1

const decrypt = async (inputImagePath, keyPath, outputImagePath) => {
  const image = await Jimp.read(inputImagePath);
  const rgba = image.bitmap.data;
  const length = rgba.length;

  const key = Buffer.from(fs.readFileSync(keyPath, "utf8"), "base64");
  if (key.length !== length) throw new Error("Invalid key length.");

  for (let i = 0; i < length; i++) rgba[i] ^= key[i];
  image.bitmap.data = rgba;

  await image.writeAsync(outputImagePath);

  return outputImagePath;
};

module.exports = decrypt;
