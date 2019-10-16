const { io, http } = require("lastejobb");

let data = io.lesDatafil("30_arter");

const images = [];

Object.keys(data).forEach(key => {
  //  if (key !== "Nodes/180935") return;
  const taxon = data[key];
  var ref = taxon.filereference;
  if (Array.isArray(ref)) ref = ref[0];
  if (!ref) return;
  const url = ref.replace("Nodes", "https://artsdatabanken.no/Media");
  const kode = taxon.kode;
  images.push({ kode, url });
});

for (var i = 0; i < 3; i++) downloadNext();

async function downloadNext() {
  if (images.length <= 0) return;
  const { url, kode } = images.pop();
  await http.downloadBinary(url, "build/" + kode + ".jpg");
  downloadNext();
}
