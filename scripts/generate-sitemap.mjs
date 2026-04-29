import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appPath = path.join(rootDir, 'App.tsx');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const siteUrl = 'https://www.contatrabalhista.com.br';

const routePriority = new Map([
  ['/', '1.0'],
  ['/seguro-desemprego', '0.9'],
  ['/ferias', '0.9'],
  ['/salario-liquido', '0.9'],
  ['/tabelas', '0.9'],
  ['/hora-extra', '0.8'],
  ['/adicional-noturno', '0.8'],
  ['/fgts', '0.8'],
  ['/domestico', '0.8'],
  ['/clt-pj', '0.8'],
  ['/mei-monitor', '0.8'],
  ['/curriculo', '0.8'],
  ['/carta-demissao', '0.8'],
  ['/gerador-recibo', '0.8'],
  ['/comprovante-renda', '0.8'],
  ['/assistente', '0.7'],
  ['/melhor-data', '0.7'],
  ['/sobrevivencia', '0.7'],
  ['/investimentos', '0.7'],
  ['/linkedin', '0.7'],
  ['/ponto', '0.7'],
  ['/quiz-direitos', '0.6'],
  ['/checklist-homologacao', '0.6'],
  ['/glossario', '0.6'],
  ['/sobre', '0.5'],
  ['/privacidade', '0.5'],
  ['/termos', '0.5'],
  ['/mapa-do-site', '0.5'],
]);

const routeChangefreq = new Map([
  ['/', 'weekly'],
  ['/seguro-desemprego', 'monthly'],
  ['/ferias', 'monthly'],
  ['/salario-liquido', 'monthly'],
  ['/tabelas', 'monthly'],
  ['/hora-extra', 'monthly'],
  ['/adicional-noturno', 'monthly'],
  ['/fgts', 'yearly'],
  ['/domestico', 'monthly'],
  ['/clt-pj', 'yearly'],
  ['/mei-monitor', 'monthly'],
  ['/curriculo', 'yearly'],
  ['/carta-demissao', 'yearly'],
  ['/gerador-recibo', 'monthly'],
  ['/comprovante-renda', 'monthly'],
  ['/assistente', 'monthly'],
  ['/melhor-data', 'yearly'],
  ['/sobrevivencia', 'yearly'],
  ['/investimentos', 'yearly'],
  ['/linkedin', 'yearly'],
  ['/ponto', 'yearly'],
  ['/quiz-direitos', 'yearly'],
  ['/checklist-homologacao', 'yearly'],
  ['/glossario', 'monthly'],
  ['/sobre', 'yearly'],
  ['/privacidade', 'yearly'],
  ['/termos', 'yearly'],
  ['/mapa-do-site', 'monthly'],
]);

const routeRegex = /<Route\s+path="([^"]+)"/g;

const appSource = await fs.readFile(appPath, 'utf8');
const routes = new Set();

for (const match of appSource.matchAll(routeRegex)) {
  const route = match[1];
  if (route && route !== '*') {
    routes.add(route);
  }
}

const routeList = Array.from(routes).sort((a, b) => {
  if (a === '/') return -1;
  if (b === '/') return 1;
  return a.localeCompare(b);
});

const today = new Date().toISOString().slice(0, 10);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routeList.map((route) => {
    const loc = route === '/' ? `${siteUrl}/` : `${siteUrl}${route}`;
    const changefreq = routeChangefreq.get(route) ?? 'monthly';
    const priority = routePriority.get(route) ?? '0.7';
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  }),
  '</urlset>',
  '',
].join('\n');

await fs.writeFile(sitemapPath, xml, 'utf8');
console.log(`Sitemap gerado com ${routeList.length} URLs em public/sitemap.xml`);

