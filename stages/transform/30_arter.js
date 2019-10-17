const { io, log } = require("lastejobb");

let data = io.lesDatafil("20_denormalize");
let taxonDescription = {};
let taxon = {};

Object.keys(data).forEach(key => {
  //  if (key !== "Nodes/180935") return;
  //  if (key === "Nodes/206") debugger;
  const e = data[key];
  const r = unwrap(e);
  if (isEnglish(e)) return;
  if (!r.kode) return;
  if (r.tag === "Taxon description") taxonDescription[key] = r;
  if (r.tag === "Taxon") taxon[key] = r;
});

function isEnglish(e) {
  if (e.tag !== "Taxon description") return false;
  var ed = e.descriptioncontent;
  if (!Array.isArray(ed)) ed = [ed];
  for (var prop of ed) {
    if (!prop) return;
    if (!prop.property) continue;
    if (!prop.property.title) return;
    const v = prop.property.title.toLowerCase();
    if (v.indexOf("kjemi") >= 0) return false;
    if (v.indexOf("kommentar") >= 0) return false;
    if (v.indexOf("morfologi") >= 0) return false;
    if (v.indexOf("forveksling") >= 0) return false;
    if (v.indexOf("referanse") >= 0) return false;
    if (v.indexOf("biologi") >= 0) return false;
    if (v.indexOf("kjennetegn") >= 0) return false;
    if (v.indexOf("samling") >= 0) return false;
    if (v.indexOf("grid") >= 0) return false;
    if (v.indexOf("referanser") >= 0) return false;
    if (v.indexOf("samling") >= 0) return false;

    if (v.indexOf("distribution") >= 0) return true;
    if (v.indexOf("acknowledgements") >= 0) return true;
    if (v.indexOf("diagnosis") >= 0) return true;
    if (v.indexOf("description") >= 0) return true;
    if (v.indexOf("general") >= 0) return true;
    if (v.indexOf("facts") >= 0) return true;
    if (v.indexOf("ecology") >= 0) return true;
    if (v.indexOf("morphology") >= 0) return true;
    if (v.indexOf("chemistry") >= 0) return true;
    if (v.indexOf("biology") >= 0) return true;
    if (v.indexOf("look-alikes") >= 0) return true;
    if (v.indexOf("comment") >= 0) return true;
    if (v.indexOf("Information in Norwegian") >= 0) return true;
  }
  for (var prop of ed) {
    if (!prop) return;
    if (!prop.title) return;
    const v = prop.property.title.toLowerCase();
    if (!v) continue;
    log.warn(v);
  }
}

function unwrap(o) {
  dereference(o);
  dereference(o.metadata);
  return o;
}

function dereference(src) {
  if (!src) return;
  if (!src.reference) {
    if (src.tag === "Taxon" && src.literal && src.literal["Scientific Name ID"])
      src.kode = "AR-" + src.literal["Scientific Name ID"];
    return;
  }
  src.reference.forEach(ref => {
    const refnode = data[ref];
    if (!refnode) return;
    switch (refnode.tag) {
      case "Taxon":
        src.kode = "AR-" + refnode.literal["Scientific Name ID"];
      case "Organization":
        src.reference = refnode;
      default:
        //debugger;
        src.reference = refnode;
    }
  });
  delete src.reference;
}

io.skrivDatafil(__filename, taxonDescription);
io.skrivDatafil("30_arter_taxon", taxon);
