const { io, log } = require("lastejobb");

let data = io.lesDatafil("10_clean");
let out = {};

Object.keys(data).forEach(key => {
  // if (key !== "Nodes/194453") return;
  const e = data[key];
  const r = unwrap(e);
  out[key] = r;
  //  Object.keys(r).forEach(key => (e[key] = r[key]));
  //if (e.Fields)
});

function unwrap(o) {
  // console.log(o.Title);
  // if (o.Title && o.Title.indexOf("Kalkfattig helofyttsump L4-C-1") >= 0)
  // debugger;
  if (!o.Fields) return {};
  const r = {};
  o.Fields.forEach(field => {
    var fm = unwrapField(field);
    if (typeof fm === "string") fm = { value: fm };

    Object.keys(fm).forEach(key => (r[key] = fm[key]));
  });
  if (Object.keys(r).length === 2 && r.tag && r.value) {
    return { [r.tag]: r.value };
  }
  if (Object.keys(r).length === 1 && r.tag) {
    return { [r.tag]: o.Title };
  }
  //  if (o.Title) r.title = o.Title;
  return r;
}

function unwrapField(f) {
  switch (f.Name) {
    case "fileuri":
      return { fileuri: decodeValues(f.Values) };
    case "mime":
      return { mime: decodeValues(f.Values) };
    case "intro":
      return { intro: decodeValues(f.Values) };
    case "annotation":
      return { annotation: decodeValues(f.Values) };
    case "label":
      return { label: decodeValues(f.Values) };
    case "lead":
      return { lead: decodeValues(f.Values) };
    case "value":
      return decodeValues(f.Values);
    case "cite":
      return { cite: decodeValues(f.Values) };
    case "body":
      return { body: decodeValues(f.Values) };
    case "group":
    case "groups":
      const v = decodeValues(f.Values);
      if (v === null || v === "default") return {};
      return { groups: v };
    case "svg":
      return { svg: decodeValues(f.Values) };
    case "heading":
      return { heading: decodeValues(f.Values) };
    case "headline":
      return { headline: decodeValues(f.Values) };
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
      return decodeReferences(f.References);
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
  //  if (node)
  //  if (node.Type !== "media" && node.Type !== "image" && ref.indexOf("/F" < 0))
  //  return ref;
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
  //  if (node.Type === "resource") debugger;
  const e = {
    title: node.Title,
    ...unwrap(node)
  };
  //    url: ref.replace("Nodes", "https://artsdatabanken.no/Media")

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

function decodeValues(values) {
  if (values.length === 1) return values[0];
  return values;
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
