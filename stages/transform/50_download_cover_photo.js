const { image, io, http } = require("lastejobb");
const fs = require("fs");

let images = io.lesBuildfil("coverphoto").items;

for (var i = 0; i < 3; i++) downloadNext();

async function downloadNext() {
  if (images.length <= 0) return;
  const { kode, value } = images.pop();
  await downloadAndDetectFiletype(kode, value);
  downloadNext();
}

async function downloadAndDetectFiletype(kode, url) {
  const jpegFn = "build/" + kode + ".jpg";
  if (io.fileExists("temp/" + jpegFn)) return;
  const pngFn = "build/" + kode + ".png";
  if (io.fileExists("temp/" + pngFn)) return;
  const tempFn = "build/" + kode + ".tmp";
  await http.downloadBinary(url, tempFn);
  const type = image.getFileType("temp/" + tempFn);
  if (!type) log.warn("Unknown file type for " + tempFn);
  const targetFn = "temp/build/" + kode + "." + type;
  fs.renameSync("temp/" + tempFn, targetFn);
}
