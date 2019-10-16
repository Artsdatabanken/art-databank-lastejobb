const { io, http } = require("lastejobb");

let data = io.lesDatafil("30_arter");

const images = [];

Object.keys(data).forEach(key => {
  const taxon = data[key];
});
