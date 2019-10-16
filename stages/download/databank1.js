const { http } = require("lastejobb");

const url =
  "http://it-webadbtest01.it.ntnu.no:8181/databases/Databank1/streams/query/Raven/DocumentsByEntityName?query=Tag%3ANodes&format=json";

http.downloadBinary(url, "databank.json");
