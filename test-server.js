const http = require("http");

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("serveur ok");
}).listen(3001, "127.0.0.1", () => {
  console.log("http://127.0.0.1:3001");
});