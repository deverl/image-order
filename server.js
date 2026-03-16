const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 9080;
const IMG_DIR = path.join(__dirname, 'img');

const MIMES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function listImages() {
  if (!fs.existsSync(IMG_DIR)) return [];
  return fs.readdirSync(IMG_DIR)
    .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
    .sort();
}

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;

  if (url === '/api/images') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listImages()));
    return;
  }

  if (url === '/api/title') {
    const titlePath = path.join(__dirname, 'assets', 'title.txt');
    let body = '';
    if (fs.existsSync(titlePath)) {
      body = fs.readFileSync(titlePath, 'utf8').trim();
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end(body);
    return;
  }

  if (url.startsWith('/img/')) {
    const filename = path.join(IMG_DIR, path.basename(url));
    if (!filename.startsWith(IMG_DIR) || !fs.existsSync(filename)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const ext = path.extname(filename);
    res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
    fs.createReadStream(filename).pipe(res);
    return;
  }

  const file = path.join(__dirname, url.split('?')[0]);
  if (!file.startsWith(__dirname) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    res.end();
    return;
  }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Image order app: http://localhost:${PORT}`);
});
