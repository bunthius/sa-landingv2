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
  const depth = trimmed.split('/').length; // e.g. game/galia => 2
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

function pageHtml({ site, page }) {
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

  const videoBlock =
    page.videoSrc && page.poster
      ? `
        <div class="video-carousel">
          <div class="carousel-container">
            <div class="carousel-track">
              <div class="carousel-slide active" style="display: block; opacity: 1;">
                <video class="carousel-video" controls playsinline preload="metadata" poster="${prefix}${page.poster}">
                  <source src="${prefix}${page.videoSrc}" type="video/mp4">
                </video>
                <div class="slide-caption">
                  <h3 class="slide-title">${escapeHtml(page.h1 || page.title)}</h3>
                  <p class="slide-description">${escapeHtml(description)}</p>
                  <a href="${relHome}" class="slide-link">Back to Home</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      : '';

  const related = [
    { href: `${prefix}game/galia/`, label: 'Galia' },
    { href: `${prefix}game/game-modes/`, label: 'Game Modes' },
    { href: `${prefix}game/your-fleet-your-way/`, label: 'Your Fleet, Your Way' },
    { href: `${prefix}game/life-in-galia/`, label: 'Life in Galia' },
    { href: `${prefix}game/fleet-command/`, label: 'Fleet Command' },
    { href: `${prefix}game/holosim/`, label: 'Holosim' },
    { href: `${prefix}game/sage-labs/`, label: 'SAGE Labs' }
  ].filter((x) => !pagePath.startsWith(x.href.replace(prefix, '')));

  const relatedLinks = `
    <div class="seo-related">
      <p class="section-subtitle" style="margin-top: 2rem;">Explore more:</p>
      <div class="seo-related-links">
        ${related
          .map(
            (r) =>
              `<a class="secondary-btn" href="${r.href}" style="margin: 0.25rem 0.5rem;">${escapeHtml(r.label)}</a>`
          )
          .join('\n')}
      </div>
    </div>
  `;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    description
  };

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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
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
          <a href="https://play.staratlas.com/market/" target="_blank" class="download-btn" rel="noopener"><span>Galactic Marketplace</span></a>
        </div>
      </div>
    </div>
  </nav>

  <section class="game-section seo-page">
    <div class="section-header" style="opacity:1; animation:none;">
      <div style="display:flex; align-items:stretch;">
        <span class="section-number">${escapeHtml(page.sectionNumber || '0001.')}</span>
        <h2 class="section-title">${escapeHtml(page.h1 || page.title)}</h2>
      </div>
    </div>
    <p class="section-subtitle">${escapeHtml(description)}</p>
    ${videoBlock}
    ${relatedLinks}
  </section>

  <footer>
    <div class="footer-content">
      <div class="footer-bottom">
        <p class="footer-text">© 2625 Star Atlas. All rights reserved. | <a href="${relHome}">Home</a></p>
      </div>
    </div>
  </footer>

  <script src="${prefix}src/main.js" defer></script>
</body>
</html>`;
}

async function main() {
  const [siteRaw, pagesRaw] = await Promise.all([fs.readFile(siteConfigPath, 'utf8'), fs.readFile(pagesPath, 'utf8')]);
  const site = JSON.parse(siteRaw);
  const pages = JSON.parse(pagesRaw);

  // Generate HTML pages
  for (const page of pages) {
    const pagePath = ensureTrailingSlash(page.path);
    const outDir = path.join(repoRoot, pagePath);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), pageHtml({ site, page }), 'utf8');
  }

  // Generate sitemap.xml + robots.txt
  const urls = [
    // homepage
    absoluteUrl(site.siteUrl, ''),
    ...pages.map((p) => absoluteUrl(site.siteUrl, ensureTrailingSlash(p.path))),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`;
  await fs.writeFile(path.join(repoRoot, 'sitemap.xml'), sitemap, 'utf8');

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(site.siteUrl, 'sitemap.xml')}\n`;
  await fs.writeFile(path.join(repoRoot, 'robots.txt'), robots, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


