import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const robotsPath = path.join(rootDir, 'public', 'robots.txt');
const canonicalHost = 'https://www.contatrabalhista.com.br';

const sitemap = await fs.readFile(sitemapPath, 'utf8');
const robots = await fs.readFile(robotsPath, 'utf8');

const locMatches = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (locMatches.length === 0) {
  throw new Error('Sitemap vazio: nenhuma URL encontrada em <loc>.');
}

const nonCanonicalUrls = locMatches.filter((url) => !url.startsWith(canonicalHost));
if (nonCanonicalUrls.length > 0) {
  throw new Error(`Sitemap contém URLs fora do host canônico: ${nonCanonicalUrls.join(', ')}`);
}

if (!robots.includes(`${canonicalHost}/sitemap.xml`)) {
  throw new Error('robots.txt não aponta para o sitemap canônico.');
}

console.log(`Validação SEO OK: ${locMatches.length} URLs canônicas + robots.txt correto.`);

