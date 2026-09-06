// Génère public/sitemap.xml à partir de src/data/projects.js — lancé
// automatiquement avant chaque build (voir package.json "prebuild").
import { writeFileSync } from 'node:fs';
import { projects, sectors } from '../src/data/projects.js';
import { SITE_URL } from '../src/data/company.js';

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: '/', priority: 1.0 },
  { loc: '/interfaces', priority: 0.9 },
  { loc: '/pourquoi-ch5', priority: 0.9 },
  { loc: '/contact', priority: 0.8 },
  ...sectors.map((s) => ({ loc: `/interfaces/${s.id}`, priority: 0.7 })),
  ...projects.map((p) => ({ loc: `/interfaces/${p.sectors[0]}/${p.id}`, priority: 0.8 })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml : ${urls.length} URLs`);
