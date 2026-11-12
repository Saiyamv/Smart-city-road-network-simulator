const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { execFile, execSync } = require('child_process');

const PORT = process.env.PORT || 3000;
const exeExt = process.platform === 'win32' ? '.exe' : '';
const SIMULATOR_PATH = path.resolve(__dirname, '..', 'cpp', `simulator${exeExt}`);

// MIME type mapping for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function ensureSimulatorBinary() {
  if (fs.existsSync(SIMULATOR_PATH)) {
    return true;
  }
  console.log(`Simulator binary not found at ${SIMULATOR_PATH}. Attempting automatic build...`);
  try {
    const cppDir = path.resolve(__dirname, '..', 'cpp');
    execSync(`g++ -std=c++17 main.cpp graph.cpp -o simulator${exeExt}`, { cwd: cppDir });
    console.log('Successfully built simulator binary.');
    return true;
  } catch (err) {
    console.error('Failed to automatically compile C++ simulator:', err.message);
    return false;
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function serveStatic(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

function runSimulator(source, destination, algorithm) {
  return new Promise((resolve, reject) => {
    execFile(SIMULATOR_PATH, [source, destination, algorithm], (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || err.message));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`Failed to parse C++ output as JSON: ${stdout}`));
      }
    });
  });
}

async function handleApiRoute(reqUrl, res) {
  setCorsHeaders(res);
  const { source, destination, algorithm } = reqUrl.query;

  if (!source || !destination || !algorithm) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Missing required query parameters: source, destination, and algorithm.'
    }));
    return;
  }

  if (!ensureSimulatorBinary()) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'C++ simulator binary is missing and could not be built automatically. Run `npm run build` or compile cpp/main.cpp manually.'
    }));
    return;
  }

  try {
    if (algorithm === 'compare') {
      const [dijkstraRes, astarRes] = await Promise.all([
        runSimulator(source, destination, 'dijkstra'),
        runSimulator(source, destination, 'astar')
      ]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        compare: true,
        source,
        destination,
        dijkstra: dijkstraRes,
        astar: astarRes
      }));
      return;
    }

    const result = await runSimulator(source, destination, algorithm);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'C++ execution failed', details: err.message }));
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (pathname === '/api/route') {
    handleApiRoute(parsed, res);
    return;
  }

  const frontendDir = path.resolve(__dirname, '..', 'frontend');

  // Serve index.html for root
  if (pathname === '/' || pathname === '/index.html') {
    serveStatic(path.join(frontendDir, 'index.html'), res);
    return;
  }

  // Safe static serving with directory traversal protection
  const safePath = path.normalize(path.join(frontendDir, pathname));
  if (!safePath.startsWith(frontendDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    serveStatic(safePath, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

ensureSimulatorBinary();

server.listen(PORT, () => {
  console.log(`Smart City Road Network Simulator server listening on http://localhost:${PORT}`);
});
