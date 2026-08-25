#!/usr/bin/env node
// Zero-dependency local dev server. Rebuilds the site once at startup and again
// whenever a request comes in for an HTML page, so edits to content/ or assets/
// show up on refresh without a separate watch process.
//
// Usage: node tools/serve.mjs [port]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const BUILD_SCRIPT = path.join(ROOT, 'tools', 'build.mjs');
const PORT = Number(process.argv[2]) || 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function rebuild() {
  try {
    await execFileAsync(process.execPath, [BUILD_SCRIPT]);
  } catch (err) {
    console.error(err.stdout || err.message);
  }
}

async function serveFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath);
  const data = await readFile(filePath);
  res.writeHead(statusCode, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(data);
}

const server = createServer(async (req, res) => {
  await rebuild();

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(DIST_DIR, urlPath);

  try {
    const s = await stat(filePath);
    if (s.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    await serveFile(res, filePath);
  } catch {
    try {
      await serveFile(res, path.join(DIST_DIR, '404.html'), 404);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log('Content is rebuilt on every request - edit files in content/ or assets/ and refresh.');
});
