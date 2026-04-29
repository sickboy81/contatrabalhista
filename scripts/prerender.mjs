import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appPath = path.join(rootDir, 'App.tsx');
const distDir = path.join(rootDir, 'dist');

const routeRegex = /<Route\s+path="([^"]+)"/g;
const prerenderBaseUrl = 'http://127.0.0.1:4173';

const appSource = await fs.readFile(appPath, 'utf8');
const routes = [];

for (const match of appSource.matchAll(routeRegex)) {
  const route = match[1];
  if (!route || route === '*') continue;
  routes.push(route);
}

const uniqueRoutes = [...new Set(routes)];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async (url, maxAttempts = 40) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }
    await wait(500);
  }
  throw new Error('Timeout ao aguardar vite preview iniciar.');
};

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: rootDir,
  stdio: 'ignore',
  shell: true,
});

try {
  await waitForServer(prerenderBaseUrl);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const route of uniqueRoutes) {
    const targetUrl = route === '/' ? prerenderBaseUrl : `${prerenderBaseUrl}${route}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const html = await page.content();
    const routeDir = route === '/' ? distDir : path.join(distDir, route.replace(/^\//, ''));
    await fs.mkdir(routeDir, { recursive: true });
    await fs.writeFile(path.join(routeDir, 'index.html'), html, 'utf8');
    console.log(`Prerender OK: ${route}`);
  }

  await browser.close();
} finally {
  preview.kill();
}

