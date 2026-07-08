# Sats On The Road — Africa

Campaign site for **Sats On The Road Africa 2026**. Plain static site — no build step.

## Structure

```
index.html      # homepage (must stay at repo root)
styles.css      # styles
app.js          # nav + contact-form logic
assets/         # images, logo, gallery, partner logos
```

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Deploy

Hosted on **Vercel** (framework preset: *Other*, no build command). Every push to
`main` redeploys automatically.

## Contact form

Submits via AJAX to **Formspree** (`app.js`). To change the destination inbox,
update the form `action` endpoint in `index.html` and the fallback email in `app.js`.

## License

[MIT](LICENSE) © 2026 Sats On The Road Africa
