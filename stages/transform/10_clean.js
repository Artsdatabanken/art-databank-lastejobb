const { io } = require("lastejobb");

let data = io.lesDatafil("databank").Results;

ignoreKeys = ["Created", "Published"];
//@metadata @id
const ignoredKeys = {};
ignoreKeys.forEach(key => (ignoredKeys[key] = 1));

clean(data);
data = arrayToObject(data);

function arrayToObject(data) {
  const r = {};
  data.forEach(e => {
    const nodeId = e["@metadata"]["@id"];
    delete e["@metadata"];
    r[nodeId] = e;
  });
  return r;
}

function clean(o) {
  if (typeof o === "undefined") return;
  if (typeof o === "string") return;
  Object.keys(o).forEach(key => {
    const value = o[key];
    if (value === "" || value === null || ignoredKeys[key]) {
      delete o[key];
      return;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        delete o[key];
        return;
      }
      for (var sub of value) clean(sub);
    }
    if (typeof value === "object") clean(value);
  });
}

io.skrivDatafil(__filename, data);
