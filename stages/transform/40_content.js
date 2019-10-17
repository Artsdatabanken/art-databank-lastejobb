const { io, json, text } = require("lastejobb");
const databank2egenskap = require("./databank2egenskap");

let data = io.lesDatafil("30_arter");
let taxonSrc = io.lesDatafil("30_arter_taxon");
let nomatch = [];

const out = [];
const allkeys = {};

Object.keys(data).forEach(key => {
  const taxon = data[key];
  //if (taxon.kode !== "AR-104") return;
  decodeStrings(taxon);
  delete taxon.collection;
  json.moveKey(taxon, "intro", "beskrivelse.nob");
  taxon.artikkel = mapArtikkel(taxon, taxon.descriptioncontent);
  if (taxon.beskrivelse && taxon.beskrivelse.nob)
    taxon.beskrivelse.nob = text.decode(taxon.beskrivelse.nob);
  delete taxon.heading;
  delete taxon.descriptioncontent;
  delete taxon.tag;
  delete taxon.filereference;
  delete taxon.artikkel;
  delete taxon.licence;
  delete taxon.value;
  delete taxon.metadata; // TODO
  out.push(taxon);
});

function mapArtikkel(taxon, content) {
  if (!Array.isArray(content)) content = [content];
  const r = [];
  //  if (taxon.kode === "AR-102785") debugger;
  content.forEach(section => {
    if (!section) return;
    var property = section.property;
    if (!property) return;
    const tag = property.tag;
    allkeys[tag] = (allkeys[tag] || 0) + 1;
    decodeStrings(property);
    composePropertyContent(property);
    if (property.title.toLowerCase().indexOf("blomstringstid") >= 0) {
      taxon.blomstringstid = property.body
        .toLowerCase()
        .replace(".", "")
        .split("–");
      return;
    }

    if (property.heading === "Diett") {
      const fv = diett(property.reference);
      taxon.diett = taxon.diett || {};
      if (fv.length > 0) taxon.diett.art = fv;
      return;
    }
    if (
      property.heading === "Forvekslingsarter" ||
      property.heading === "Forvekslingarter" ||
      property.heading === "Forvekslingssrter" ||
      property.heading === "Forvekslingsarter (på svalbard)" ||
      property.heading === "Forvekslingsarter (på fastlandet)"
    ) {
      const fv = referertArtTilKode(property.reference);
      if (fv.length > 0) {
        taxon.systematikk = taxon.systematikk || {};
        taxon.systematikk.forveksling = taxon.systematikk.forveksling || {};
        taxon.systematikk.forveksling.art = fv;
      }
      return;
    }

    if (property.heading === "Vertsforhold") {
      const fv = referertArtTilKode(property.reference);
      if (fv.length > 0) {
        taxon.vert = fv;
      }
      return;
    }

    for (var heading of Object.keys(databank2egenskap))
      if (moveTo(property, heading, taxon, databank2egenskap[heading])) return;

    nomatch.push(property);
  });
  return r;
}

function moveTo(subnode, heading, o, destKey) {
  if (!subnode.heading) return true;
  heading = heading.toLowerCase();
  const snh = subnode.heading.toLowerCase();
  if (snh !== heading) return false;
  //  if (snh === "utbredelse i midt-norge") debugger;
  const src = subnode;
  const value = src.body;
  const path = destKey.split(".");
  while (path.length > 1) {
    const seg = path.shift();
    if (!o[seg]) o[seg] = {};
    o = o[seg];
  }
  const key = path.pop();
  o[key] = value;
  return true;
}

function decodeStrings(o) {
  Object.keys(o).forEach(key => {
    const v = o[key];
    if (typeof v === "string") o[key] = text.decode(v);
    else if (typeof v === "object") decodeStrings(v);
  });
}

function composePropertyContent(property) {
  if (!property.propertycontent) return;
  var all = property.body;
  const pc = property.propertycontent;
  for (var piece in pc) {
    if (typeof piece === "string") continue;
    if (piece.heading) all += "\n\n## " + piece.heading + "\n\n";
    all += piece.body;
  }
  property.body = all;
  delete property.propertycontent;
}

function diett(refs) {
  if (!refs) return [];
  const r = [];
  refs.forEach(ref => {
    const mat = taxonSrc[ref];
    if (!mat) {
      console.warn("Finner ikke diett " + ref);
      return;
    }
    r.push(mat.kode);
  });
  return r;
}

function referertArtTilKode(refs) {
  if (!refs) return [];
  const r = [];
  refs.forEach(ref => {
    const art = data[ref];
    if (!art) {
      console.warn("Finner ikke art " + ref);
      return;
    }
    r.push(art.kode);
  });
  return r;
}

io.skrivBuildfil("type", out);
io.skrivDatafil("40_allkeys", allkeys);
io.skrivDatafil("40_nomatch", nomatch);
