const { io } = require("lastejobb");

let data = io.lesTempJson("30_arter");

const images = {};

Object.keys(data).forEach(key => {
  //  if (key !== "Nodes/180935") return;
  const taxon = data[key];
  var ref = taxon.filereference;
  if (Array.isArray(ref)) ref = ref[0];
  if (!ref) return;
  const url = ref.replace("Nodes", "https://artsdatabanken.no/Media");
  const kode = taxon.kode;
  images[kode] = url;
});

io.skrivBuildfil("coverphoto", images);
