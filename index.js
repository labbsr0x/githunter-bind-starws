const { Ambassador } = require("node-ambassador");

const TARGET = process.env["target_port"] || 443;
const PORT = process.env["port"] || 8080;

const HTTP404 = `...`;

class Stats {
  readRequest(header) {
    this.method = header.HTTPMethod;
    this.endpoint = header.HTTPResource;
    console.log(header);

    return this;
  }
  readResponse(response) {
    this.response = response;
    return this;
  }
}

let stats = new Stats();

function check_token(header, rawHTTP) {
  console.log(header);
  console.log(rawHTTP);
}

function override_404({ service, server }) {
  service.on("http:404", () => server.respond(HTTP404));
}

function telemetry({ service, server }) {
  server.on("http:data", (header) => {
    stats.readRequest(header);
  });
  service.on("http:data", (header) => stats.readResponse(header));
}

function Auth({ service }) {
  service.on("http:data", (header, rawHTTP) => check_token(header, rawHTTP));
}

new Ambassador({
  port: PORT,
  target: TARGET,
  targetServer: "https://agrows-data-api.labbs.com.br",
}).tunnel({
  override_404,
  telemetry,
  Auth,
});

console.log(`listening for request in ${PORT} and targeting ${TARGET}`);
