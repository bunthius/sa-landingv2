import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const siteConfigPath = path.join(repoRoot, 'site', 'site.config.json');
const pagesPath = path.join(repoRoot, 'site', 'pages.json');

function ensureTrailingSlash(p) {
  if (!p.endsWith('/')) return `${p}/`;
  return p;
}

function depthPrefix(pagePath) {
  const trimmed = ensureTrailingSlash(pagePath).replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed) return '';
  const depth = trimmed.split('/').length;
  return '../'.repeat(depth);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function absoluteUrl(siteUrl, pagePath) {
  const base = siteUrl.replace(/\/+$/, '');
  const p = String(pagePath).replace(/^\/+/, '');
  return `${base}/${p}`;
}

function renderFeatureCards(features, prefix) {
  if (!features || !features.length) return '';
  
  return `
    <div class="feature-grid">
      ${features.map(f => `
        <div class="feature-card">
          <h3>${escapeHtml(f.title)}</h3>
          <p>${escapeHtml(f.description)}</p>
          ${f.bullets && f.bullets.length ? `
            <ul>
              ${f.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderLoreBlock(lore) {
  if (!lore) return '';
  return `
    <div class="lore-block">
      <h3>${escapeHtml(lore.title)}</h3>
      <p>${escapeHtml(lore.text)}</p>
    </div>
  `;
}

function renderStats(stats) {
  if (!stats || !stats.length) return '';
  return `
    <div class="stats-grid">
      ${stats.map(s => `
        <div class="stat-item">
          <div class="stat-value">${escapeHtml(s.value)}</div>
          <div class="stat-label">${escapeHtml(s.label)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderGuide(guide) {
  if (!guide) return '';
  return `
    <div class="guide-block">
      <h3>${escapeHtml(guide.title)}</h3>
      <ol>
        ${guide.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
    </div>
  `;
}

function renderCta(cta, prefix) {
  if (!cta) return '';
  return `
    <div class="cta-block">
      <h3>${escapeHtml(cta.title)}</h3>
      <p>${escapeHtml(cta.text)}</p>
      <a href="https://play.staratlas.com" target="_blank" rel="noopener noreferrer" class="download-btn"><span>Play Now</span></a>
    </div>
  `;
}

function renderVideo(page, prefix) {
  if (!page.videoSrc || !page.poster) return '';
  return `
    <div class="video-container">
      <video controls playsinline preload="metadata" poster="${prefix}${page.poster}">
        <source src="${prefix}${page.videoSrc}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  `;
}

function pageHtml({ site, page, allPages }) {
  const pagePath = ensureTrailingSlash(page.path);
  const prefix = depthPrefix(pagePath);

  const title = page.title ? `${page.title} | ${site.siteName}` : site.defaultTitle;
  const description = page.description || site.defaultDescription;
  const canonical = absoluteUrl(site.siteUrl, ensureTrailingSlash(pagePath));
  const ogImage = absoluteUrl(site.siteUrl, site.defaultOgImagePath);

  const relHome = `${prefix}index.html`;
  const cssHref = `${prefix}styles.css`;
  const iconHref = `${prefix}Icon.png`;
  const logoHref = `${prefix}Logo.svg`;

  // Build related pages (exclude current page and the index)
  const related = allPages
    .filter(p => p.path !== page.path && p.path !== 'game/')
    .slice(0, 6)
    .map(p => ({
      href: `${prefix}${p.path}`,
      label: p.title
    }));

  const relatedLinks = related.length ? `
    <div class="related-section">
      <p class="section-subtitle" style="margin-top: 2rem;">Explore More Features</p>
      <div class="related-links">
        ${related.map(r => `<a class="secondary-btn" href="${r.href}">${escapeHtml(r.label)}</a>`).join('')}
      </div>
    </div>
  ` : '';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: site.siteName,
      url: site.siteUrl
    }
  };

  // Intro paragraph
  const introHtml = page.intro 
    ? `<p class="page-intro section-subtitle">${escapeHtml(page.intro)}</p>` 
    : `<p class="section-subtitle">${escapeHtml(description)}</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(site.keywords || '')}" />
  <meta name="robots" content="index,follow" />
  <meta name="theme-color" content="#000000" />
  <meta name="author" content="ATMTA, Inc." />
  <link rel="canonical" href="${escapeHtml(canonical)}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(site.siteName)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@staratlas" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <link rel="icon" type="image/png" href="${iconHref}">
  <link rel="apple-touch-icon" href="${iconHref}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${cssHref}">

  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body>
  <div class="loading-bar" id="loadingBar"></div>
  <div class="grid-container">
    <div class="grid-layer dots"></div>
    <div class="grid-layer grid"></div>
    <div class="grid-layer accent"></div>
  </div>
  <div class="mouse-spotlight"></div>
  <div class="glow-container">
    <div class="glow"></div>
    <div class="glow"></div>
    <div class="glow"></div>
  </div>

  <nav>
    <div class="nav-main">
      <div class="nav-container">
        <div class="logo">
          <a href="${relHome}" aria-label="Star Atlas Home">
            <img src="${logoHref}" alt="Star Atlas">
          </a>
        </div>
        <ul class="nav-links">
          <li><a href="${prefix}game/">Game</a></li>
          <li><a href="${relHome}#economy">Economy</a></li>
          <li><a href="${relHome}#community">Community</a></li>
        </ul>
        <div class="nav-cta">
          <a href="https://play.staratlas.com/market/" target="_blank" class="download-btn" rel="noopener noreferrer"><span>Galactic Marketplace</span></a>
        </div>
      </div>
    </div>
  </nav>

  <main class="feature-page">
    <section class="game-section">
      <div class="section-header" style="opacity:1;">
        <div style="display:flex; align-items:stretch;">
          <span class="section-number">${escapeHtml(page.sectionNumber || '0001.')}</span>
          <h1 class="section-title">${escapeHtml(page.h1 || page.title)}</h1>
        </div>
      </div>
      
      ${introHtml}
      
      ${renderVideo(page, prefix)}
      
      <div class="page-content">
        ${renderLoreBlock(page.lore)}
        
        ${renderStats(page.stats)}
        
        <div class="section-divider"></div>
        
        ${renderFeatureCards(page.features, prefix)}
        
        ${renderGuide(page.guide)}
        
        ${renderCta(page.cta, prefix)}
      </div>
      
      ${relatedLinks}
    </section>
  </main>

  <footer>
    <div class="footer-content">
      <div class="footer-bottom">
        <p class="footer-text">© 2625 Star Atlas. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="${prefix}src/main.js" defer></script>
</body>
</html>`;
}

async function main() {
  const [siteRaw, pagesRaw] = await Promise.all([
    fs.readFile(siteConfigPath, 'utf8'), 
    fs.readFile(pagesPath, 'utf8')
  ]);
  const site = JSON.parse(siteRaw);
  const pages = JSON.parse(pagesRaw);

  // Generate HTML pages
  for (const page of pages) {
    const pagePath = ensureTrailingSlash(page.path);
    const outDir = path.join(repoRoot, pagePath);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(
      path.join(outDir, 'index.html'), 
      pageHtml({ site, page, allPages: pages }), 
      'utf8'
    );
    console.log(`Generated: ${pagePath}index.html`);
  }

  // Generate sitemap.xml
  const urls = [
    absoluteUrl(site.siteUrl, ''),
    ...pages.map((p) => absoluteUrl(site.siteUrl, ensureTrailingSlash(p.path))),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u.endsWith('.com/') ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(repoRoot, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Generated: sitemap.xml');

  // Generate robots.txt
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${absoluteUrl(site.siteUrl, 'sitemap.xml')}
`;
  await fs.writeFile(path.join(repoRoot, 'robots.txt'), robots, 'utf8');
  console.log('Generated: robots.txt');
  
  console.log(`\n✓ Generated ${pages.length} pages, sitemap.xml, and robots.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
