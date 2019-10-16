const { io, http } = require("lastejobb");

let images = io.lesBuildfil("coverphoto").items;

for (var i = 0; i < 3; i++) downloadNext();

async function downloadNext() {
  if (images.length <= 0) return;
  const { url, kode } = images.pop();
  await http.downloadBinary(url, "build/" + kode + ".jpg");
  downloadNext();
}
