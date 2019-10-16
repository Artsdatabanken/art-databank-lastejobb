const { io, log } = require("lastejobb");

let data = io.lesDatafil("20_denormalize");
let out = {};

Object.keys(data).forEach(key => {
  //  if (key !== "Nodes/180935") return;
  const e = data[key];
  const r = unwrap(e);
  if (!r.kode) return;
  if (r.tag === "Taxon description") out[key] = r;
});

function unwrap(o) {
  dereference(o);
  dereference(o.metadata);
  return o;
}

function dereference(src) {
  if (!src) return;
  if (!src.reference) return;
  src.reference.forEach(ref => {
    const refnode = data[ref];
    if (!refnode) return;
    switch (refnode.tag) {
      case "Taxon":
        src.kode = "AR-" + refnode.literal["Scientific Name ID"];
      case "Organization":
        src.reference = refnode;
      default:
        src.reference = refnode;
      //        debugger;
    }
  });
  delete src.reference;
}

io.skrivDatafil(__filename, out);
