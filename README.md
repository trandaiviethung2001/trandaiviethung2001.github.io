# Dai Viet Hung Tran — Portfolio

A clean, minimalist personal portfolio and research gallery for Dai Viet Hung Tran, AI Researcher & Engineer. Built with pure HTML, CSS, and JavaScript with zero external build dependencies, ready for deployment on GitHub Pages.

## Tech Stack
- **Structure**: Semantic HTML5 with OpenGraph & SEO tags
- **Styling**: Modern, responsive, minimalist CSS with Dark & Light theme support
- **Scripting**: Vanilla JavaScript (theme toggle, mobile navigation, search & modal viewer)
- **Deployment**: GitHub Actions (`.github/workflows/pages.yml`)

## Structure
```
├── index.html                    # Main portfolio page (About, Experience, Projects, Stack, Contact)
├── gallery.html                  # Visual Gallery page (Search, exhibits grid, lightbox modal)
├── styles.css                    # Shared minimalist stylesheet
├── script.js                     # Main portfolio logic (theme, navigation, scroll-spy)
├── gallery.js                    # Gallery dynamic logic (data loader, search filter, lightbox)
├── update_gallery.py             # Utility to auto-sync assets/gallery/ with gallery.json
├── assets/
│   ├── favicon.svg               # Site favicon
│   ├── images/                   # Project screenshots and organization logos
│   └── gallery/                  # Gallery exhibit photos & gallery.json manifest
└── Dai_Viet_Hung_Tran_AI_CV_2026_Final.pdf # Downloadable résumé
```

## Adding Images to Gallery
1. Drop image files (`.jpg`, `.png`, `.webp`) into `assets/gallery/`.
2. Run:
   ```bash
   python update_gallery.py
   ```
   *The script automatically detects new photos and updates `assets/gallery/gallery.json` while preserving all custom titles.*

## Local Preview
Run any static HTTP server from this directory:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.
