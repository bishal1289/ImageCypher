const fs = require("fs");
const Jimp = require("jimp"); // ✅ Works with version 0.16.1
const path = require("path");

const encrypt = async (inputPath, outputImageFile, outputKeyFile) => {
    const image = await Jimp.read(inputPath);
    const rgba = image.bitmap.data;
    const length = rgba.length;


    const key = Array.from({ length }, () => Math.floor(Math.random() * 256));
    for (let i = 0; i < length; i++) rgba[i] ^= key[i];

    image.bitmap.data = rgba;
    await image.writeAsync(outputImageFile);
    fs.writeFileSync(outputKeyFile, Buffer.from(key).toString("base64"));

    return { outputImageFile, outputKeyFile };
};

module.exports = encrypt;
