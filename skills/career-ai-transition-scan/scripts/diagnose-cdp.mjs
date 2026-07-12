#!/usr/bin/env node
// Diagnose whether the BOSS adapter can reach Chrome's DevTools endpoint.

import http from 'node:http';

const PORT = process.argv[2] || '9222';

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path, timeout: 5000 }, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('timeout', () => req.destroy(new Error(`连接 127.0.0.1:${PORT} 超时`)));
    req.on('error', reject);
    req.end();
  });
}

try {
  const version = await get('/json/version');
  const parsedVersion = JSON.parse(version.body);
  const targets = await get('/json');
  const parsedTargets = JSON.parse(targets.body);
  const pages = Array.isArray(parsedTargets) ? parsedTargets.filter(t => t.type === 'page') : [];

  console.log(JSON.stringify({
    ok: true,
    port: PORT,
    browser: parsedVersion.Browser || null,
    protocolVersion: parsedVersion['Protocol-Version'] || null,
    pageTargets: pages.length,
    firstPageUrl: pages[0]?.url || null
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    port: PORT,
    error: error.message || String(error),
    nextSteps: [
      `Run ./launch-chrome.sh ${PORT} and keep that Chrome window open.`,
      'Look for "DevTools listening on ws://127.0.0.1:<port>/..." in the launch output.',
      'If this works in a normal terminal but fails in Codex/Claude, rerun read-boss with non-sandbox permission.'
    ]
  }, null, 2));
  process.exit(1);
}
