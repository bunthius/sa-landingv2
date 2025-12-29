# Star Atlas Landing Page

AAA Space Exploration MMO landing page optimized for SEO and performance.

## Features

- **SEO Optimized**: Full meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- **Programmatic SEO**: Auto-generated game feature pages with unique metadata
- **Performance**: Deferred scripts, lazy loading, preconnect hints
- **Accessibility**: Semantic HTML, ARIA labels, screen reader support
- **GitHub Pages Ready**: CNAME, 404 page, relative asset paths

## Structure

```
├── index.html          # Homepage
├── 404.html            # Custom 404 page
├── styles.css          # Main stylesheet
├── src/main.js         # Main JavaScript (deferred)
├── game/               # Generated SEO pages
│   ├── index.html
│   ├── galia/
│   ├── game-modes/
│   ├── fleet-command/
│   └── ...
├── sitemap.xml         # Auto-generated sitemap
├── robots.txt          # Search engine directives
├── CNAME               # GitHub Pages custom domain
└── site/               # Page generator
    ├── site.config.json
    ├── pages.json
    └── generate.mjs
```

## Development

### Local Preview
```bash
# Start a local server (Python)
python3 -m http.server 8080

# Or use any static file server
npx serve .
```

### Regenerate SEO Pages
After modifying `site/pages.json` or `site/site.config.json`:
```bash
npm run generate
```

## Production Deployment (GitHub Pages)

1. Push to your GitHub repository
2. Go to **Settings → Pages**
3. Select source branch (e.g., `main`)
4. Custom domain is set via `CNAME` file (`staratlas.com`)
5. Enable **Enforce HTTPS**

### DNS Configuration
Point your domain to GitHub Pages:
- **A Records** (for apex domain):
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- **CNAME** (for www): `<username>.github.io`

## SEO Checklist

- [x] Unique title & description per page
- [x] Canonical URLs
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] JSON-LD structured data (Organization, WebSite, VideoGame)
- [x] XML Sitemap
- [x] robots.txt
- [x] Mobile-friendly viewport
- [x] Semantic HTML (h1, nav, main, footer)
- [x] Image alt attributes
- [x] Internal linking between pages
- [x] Keywords: "AAA Space Exploration MMO"

## License

© 2625 Star Atlas. All rights reserved.
