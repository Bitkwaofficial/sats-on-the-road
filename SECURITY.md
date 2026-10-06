# Security policy

## Reporting a vulnerability

If you find a security problem in this repository or on satsontheroad.africa,
please report it privately. Do not open a public issue for it.

- Email: **bitkwaofficial@gmail.com** with "SECURITY" in the subject.

We will acknowledge within a few days and keep you updated while we fix it.

## What belongs in this repo

Public by design: the site HTML, CSS, JS, images, logos, the Formspree form
endpoint, the Google site-verification file, `sitemap.xml`, `robots.txt`, and the
public Lightning and on-chain addresses on the Fuel page.

Never commit: API keys, tokens, passwords, Vercel environment values, Upstash/KV
tokens, the `ADMIN_TOKEN`, the Google Sheet ID, Geyser keys, or any wallet seed or
xpub. All of these live in Vercel environment variables (see `.env.example`) or in
the deployed Apps Script project, not in the code.

Never commit personal data: names, phone numbers, emails or photos of ambassadors,
merchants, activists, journalists or partner contacts, in files or commit messages.

## Related

See the field data policy for what we collect and publish on the road:
[sats-on-the-road-curriculum/safety/data-policy.md](https://github.com/Bitkwaofficial/sats-on-the-road-curriculum/blob/main/safety/data-policy.md).
