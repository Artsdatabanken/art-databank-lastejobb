const { io, json, log, text } = require("lastejobb");

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

    const map = {
      "Utbredelse i Midt-Norge": "utbredelse.midt-norge",
      "Utbredelse i Midt-Norge": "utbredelse.midt-norge",
      Anatomi: "morfologi.anatomi",
      "Antall og utbredelse": "utbredelse.norge",
      Dialektnavn: "tittel.dialekt",
      Taksonomi: "systematikk.taksonomi",
      Inndeling: "systematikk.inndeling",
      Underarter: "systematikk.underart.beskrivelse",
      "Karakteristiske og vanlige arter i Norge":
        "systematikk.underart.karakteristisk",
      Artsbestemmelse: "systematikk.artsbestemmelse",
      Forveksling: "systematikk.forveksling.beskrivelse",
      Hybridisering: "reproduksjon.hybridisering",
      Utseende: "morfologi.utseende",
      Kommentar: "kommentar",
      Kommentarer: "kommentar",
      Formering: "reproduksjon.beskrivelse",
      Sporefarge: "morfologi.sporefarge",
      "Egg og larve": "reproduksjon.egg",
      Kjennetegn: "morfologi.kjennetegn",
      Klassekjennetegn: "morfologi.kjennetegn",
      Skall: "morfologi.kroppsdel.skall",
      Kropp: "morfologi.kroppsdel.kropp",
      "Næring/byttedyr": "diett.tekst",
      Nøkkelkarakterer: "morfologi.kjennetegn",
      Livssyklus: "reproduksjon.livssyklus",
      Antall: "systematikk.antall",
      "Flygetid og livslengde": "reproduksjon.flyvetid",
      Flygetid: "reproduksjon.flyvetid",
      Flyvetid: "reproduksjon.flyvetid",
      Reproduksjon: "reproduksjon.beskrivelse",
      "Fiender, sykdommer, parasitter": "sykdom",
      "Fiender, parasitter, sykdommer": "sykdom",
      "Fiender, parasitter og sykdommer": "sykdom",
      "Fiender og sykdommer": "sykdom",
      "Parasitter og predatorer": "predator",
      Vingespenn: "morfologi.vingespenn",
      "Unge stadier": "morfologi.unge_stadier",
      "Forekomster nær Norge": "utbredelse.nær_norge",
      "Utbredelse i Norge og Norden": "utbredelse.nær_norge",
      "Utbredelse i verden forøvrig": "utbredelse.globalt",
      "Utbredelse i verden for øvrig": "utbredelse.globalt",
      Kroppsbygning: "morfologi.kroppsbygning",
      Beskrivelse: "morfologi.beskrivelse",
      "Ytre bygning": "morfologi.ytre_bygning",
      "Mikroskopiske kjennetegn": "morfologi.kjennetegn.mikroskopisk",
      Størrelse: "morfologi.størrelse",
      "Beskrivelse, kjennetegn": "morfologi.kjennetegn.beskrivelse",
      Kromosomtall: "morfologi.kromosomtall",
      "Morfologisk variasjon": "morfologi.variasjon",
      "Økologi og livssyklus": "utbredelse.økologi_livssyklus",
      "Økologi og Utbredelse": "utbredelse.økologi_utbredelse",
      Økologi: "økologi",
      "Farger og mimikry": "morfologi.farge",
      Klekking: "morfologi.klekking",
      Larve: "morfologi.larve",
      Samarbeidspartnere: "samarbeidspartnere",
      Sang: "sang",
      Kjemi: "morfologi.kjemi",
      Livsutvikling: "reproduksjon.livssyklus",
      Morfologi: "morfologi.beskrivelse",
      Forekomststatus: "utbredelse.forekomststatus",
      Habitat: "habitat.levesett",
      "Habitat og utbredelse": "habitat.levesett",
      "Habitatvalg og blomsterpreferanse": "habitat.levesett",
      Bestandsstatus: "utbredelse.forekomststatus",
      Tannformler: "morfologi.tannformel",
      Giftig: "morfologi.gift",
      "Indre organer": "fysiologi.indre organer",
      Silke: "fysiologi.silke",
      Vepsegift: "morfologi.gift",
      "Innsamling og bestemmelse": "systematikk.artsbestemmelse",
      "Arter i Norden": "systematikk.geografi.norden",
      Levesett: "habitat.levesett",
      Levevis: "habitat.levesett",
      Ordenskjennetegn: "morfologi.kjennetegn",
      Referanser: "referanse",
      Biologi: "habitat.biologi",
      "Levested og økologi": "habitat.levested",
      "Struktur og oppbygning": "morfologi.struktur_oppbygging",
      Systematikk: "systematikk",
      "Systematikk og navngivning": "systematikk.navngivning",
      "Artsbestemmelse, litteratur og nettsteder":
        "systematikk.videre_bestemmelse",
      "Videre bestemmelse": "systematikk.videre_bestemmelse",
      "Tradisjonell bruk": "tradisjonell_bruk",
      "Global utbredelse": "utbredelse.global",
      Totalutbredelse: "utbredelse.global",
      "Norsk utbredelse": "utbredelse.norge",
      "Utbredelse i Norge": "utbredelse.norge",
      Utbredelse: "utbredelse.beskrivelse",
      "Spredning og forekomst": "utbredelse.beskrivelse",
      Voksested: "habitat.voksested"
    };

    for (var heading of Object.keys(map))
      if (moveTo(property, heading, taxon, map[heading])) return;

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
  path.push("nob"); // TODO andre språk
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
