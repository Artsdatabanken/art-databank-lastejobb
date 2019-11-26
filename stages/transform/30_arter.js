const { io, log } = require("lastejobb");

let data = io.lesDatafil("20_denormalize");
let taxonDescription = {};
let taxon = {};

Object.keys(data).forEach(key => {
  //if (key !== "Nodes/104311") return;
  //  if (key === "Nodes/206") debugger;
  const e = data[key];
  const r = unwrap(e);
  if (!r.kode) return;
  if (r.tag === "Taxon description") {
    if (taxonDescription[key]) debugger;
    taxonDescription[key] = r;
  }
  if (r.tag === "Taxon") {
    if (r[0]) debugger;
    if (taxon[key]) debugger;
    taxon[key] = r;
  }
});

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
  if (!Array.isArray(src.reference))
    src.reference = Object.values(src.reference);
  Object.values(src.reference).forEach(ref => {
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
