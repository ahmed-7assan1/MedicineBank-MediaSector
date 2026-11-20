# MedicineBank — Media Sector

The Media sector site for [MedicineBank Initiative](https://mansnu.medicinebank.org/) (Mansoura National University branch): films, series, podcasts and galleries for medical students.

Built as a fully static site — plain HTML, CSS and vanilla JavaScript, no build step — ready for **GitHub Pages**.

## Pages
- `index.html` — home: fading hero carousel, Netflix-style media rows (Trending / Series & Films / Podcasts), textured gallery preview
- `gallery.html` — the full gallery

## Structure
```
index.html          home page
gallery.html        full gallery page
css/style.css       shared MedicineBank template base + media components
js/data.js          catalogue + generated placeholder artwork (data URIs)
js/main.js          rendering, carousel, rows, search, theme, bloom background
the MedicineBank logo is inlined in js/data.js (no binary assets needed)
```

## Notes
- The header (top bar + sectors nav) and footer mirror the shared MedicineBank template so the sector sites stay visually integrated.
- All artwork in `js/data.js` is generated placeholder art (abstract SVG); titles and descriptions are placeholders. Swap the data URIs for real thumbnail URLs and edit the text when content is ready.
- Search runs client-side over the catalogue in `js/main.js` (`MEDIA_ITEMS`).

## Running locally
Open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```

## GitHub Pages
Settings → Pages → Source: `main` branch, `/ (root)`.
