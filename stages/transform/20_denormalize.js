const { io, log } = require("lastejobb");

let data = io.lesDatafil("10_clean");
let out = {};

Object.keys(data).forEach(key => {
  //  if (key === "Nodes/195319") debugger;
  //  if (key !== "Nodes/104311") return;
  const e = data[key];
  const r = unwrap(e);
  const x = e;
  if (r[0]) {
    debugger;
    console.log(x);
  }
  out[key] = r;
});

function unwrap(o) {
  if (!o.Fields) return {};
  const r = {};
  o.Fields.forEach(field => {
    var fm = unwrapField(field);
    if (!fm) return;
    if (typeof fm === "string") fm = { value: fm };

    Object.keys(fm).forEach(key => (r[key] = fm[key]));
  });
  if (Object.keys(r).length === 2 && r.tag && r.value) {
    return { [r.tag]: r.value };
  }
  if (Object.keys(r).length === 1 && r.tag) {
    return { [r.tag]: o.Title };
  }
  debugger;
  if (o.Title) r.title = o.Title;
  return r;
}

function unwrapField(f) {
  switch (f.Name) {
    case "fileuri":
      return { fileuri: decodeField(f) };
    case "mime":
      return { mime: decodeField(f) };
    case "intro":
      return { intro: decodeField(f) };
    case "annotation":
      return { annotation: decodeField(f) };
    case "label":
      return { label: decodeField(f) };
    case "lead":
      return { lead: decodeField(f) };
    case "value":
      return decodeField(f);
    case "cite":
      return { cite: decodeField(f) };
    case "body":
      return { body: decodeField(f) };
    case "group":
    case "groups":
      const v = decodeField(f);
      if (v === null || v === "default") return {};
      return { groups: v };
    case "svg":
      return { svg: decodeField(f) };
    case "heading":
      return { heading: decodeField(f) };
    case "headline":
      return { headline: decodeField(f) };
    case "literal":
      return { literal: decodeLiteral(f.Fields) };
    case "record":
      return { record: decodeLiteral(f.Fields) };
    case "tags":
      return { tag: decodeReferences(f.References) };
    case "license":
      return { licence: decodeReferences(f.References) };
    case "filereference":
      return { filereference: decodeReferences(f.References) };
    case "collection":
      return { collection: decodeReferences(f.References) };
    case "reference":
      return { reference: f.References };
    // TODO:      return { reference: decodeReferences(f.References) };
    case "tuple":
      return null; // Graphics and irrelevant stuff?
    //      return { tuple: decodeReferences(f.References) };
    case "metadata":
      return { metadata: unwrap(f) };
    case "descriptioncontent":
      return { descriptioncontent: decodeReferences(f.References) };
    case "file":
      return { file: decodeReferences(f.References) };
    case "articlecontent":
      return { template: decodeReferences(f.References) };
    case "template":
      return { template: decodeReferences(f.References) };
    case "propertycontent":
      return { propertycontent: decodeReferences(f.References) };
    case "sectioncontent":
      return { sectioncontent: decodeReferences(f.References) };
    case "bibliographycontent":
      return { bibliographycontent: decodeReferences(f.References) };
    case "import":
      return { import: decodeReferences(f.References) };
    case "content_wrapper":
      return { include: unwrap(f) };
    case "record_wrapper":
      return { record_wrapper: unwrap(f) };
    case "content":
      return { content: unwrap(f) };
    case "include":
      return { include: decodeReferences(f.References) };
    default:
      throw new Error("Uknown field name: " + f.Name);
  }
}

function decodeReference(ref) {
  const node = data[ref];
  if (!node) {
    log.warn("Mangler node " + ref);
    return { missingNode: ref };
  }
  switch (node.Type) {
    case "document":
    case "media":
      return ref;
    case "image":
      return ref;
    case "description":
      return { description: ref };
    case "collection":
    case "resource":
    case "term":
      return node.Title;
    case "tuple":
      return ref;
    default:
      break;
  }
  const e = {
    title: node.Title,
    ...unwrap(node)
  };

  if (e.tag === "Taxon" && e.literal) {
    return "AR-" + e.literal["Scientific Name ID"];
  }
  if (e.tag === "Organization") {
    return e.title;
  }
  return {
    [node.Type]: e
  };
}

function decodeReferences(references) {
  const values = references.map(ref => decodeReference(ref));
  return decodeValues(values);
}

function decodeField(field) {
  const values = field.Values;
  const v = values.length === 1 ? values[0] : values;
  const lang = field.Language;
  if (!lang) return v;
  return { [iso2To3Lang(lang)]: v };
}

function decodeValues(values) {
  const v = values.length === 1 ? values[0] : values;
  return v;
}

function iso2To3Lang(iso2) {
  switch (iso2) {
    case "en":
      return "eng";
    case "nb":
    case "und":
      return "nob";
    default:
      log.warn("Ukjent språk: " + iso2);
      return iso2;
  }
}

function decodeLiteral(fields) {
  const key = unwrapField(fields[0]);
  let value = "?";
  if (fields[1]) value = unwrapField(fields[1]);
  else log.warn("Mangler verdi for " + JSON.stringify(key));
  const r = { [key.tag]: value };
  return r;
}

io.skrivDatafil(__filename, out);
