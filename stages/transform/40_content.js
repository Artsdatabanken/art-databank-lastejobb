const { io, json, text } = require("lastejobb");

let data = io.lesDatafil("30_arter");

const out = [];
const allkeys = {};

Object.keys(data).forEach(key => {
  const taxon = data[key];
  delete taxon.collection;
  json.moveKey(taxon, "intro", "beskrivelse.nob");
  taxon.artikkel = mapArtikkel(taxon.descriptioncontent);
  out.push(taxon);
});

function mapArtikkel(content) {
  const r = {};
  if (!Array.isArray(content)) content = [content];
  content.forEach(section => {
    if (!section) return;
    const prop = section.property;
    if (!prop) return;
    const tag = prop.tag;
    allkeys[tag] = (allkeys[tag] || 0) + 1;
    Object.keys(prop).forEach(key => {
      const v = prop[key];
      if (typeof v === "string") prop[key] = text.decode(v);
    });
  });
}
io.skrivBuildfil("type", out);
io.skrivDatafil("allkeys", allkeys);
