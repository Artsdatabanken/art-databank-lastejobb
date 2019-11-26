const { io, http } = require("lastejobb");

let images = io.lesBuildfil("coverphoto").items;

for (var i = 0; i < 3; i++) downloadNext();

async function downloadNext() {
  if (images.length <= 0) return;
  const { kode, value } = images.pop();
  const fn = "build/" + kode + ".jpg";
  if (!io.fileExists("temp/" + fn)) await http.downloadBinary(value, fn);
  downloadNext();
}
