const { http } = require("lastejobb");

const url1 =
  "http://it-webadbtest01.it.ntnu.no:8181/databases/Databank1/streams/query/Raven/DocumentsByEntityName?format=excel&download=true&query=Tag%3ANodes&column=Title&column=Type&column=Languages&column=Created&column=Published&column=Changed&column=Fields&singleUseAuthToken=60032c12-6db1-41a1-b81b-6b2664822915";

const url =
  "http://it-webadbtest01.it.ntnu.no:8181/databases/Databank1/streams/query/Raven/DocumentsByEntityName?query=Tag%3ANodes&format=json"; //&download=true&query=Tag%3ANodes&column=@Id&column=Title&column=Type&column=Languages&column=Changed&column=Fields";

http.downloadBinary(url, "databank.json");
