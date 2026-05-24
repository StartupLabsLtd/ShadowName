# ShadowName

A Chrome extension that generates per-domain aliases using homoglyph substitution, helping you stay unlinkable across the web.

When you post a comment, sign up for a service, or fill out a form, your name gets published on that site. ShadowName makes your name look different on every domain — so activity on `site-a.com` can't be connected to the same person on `site-b.com`.

## How it works

1. Enter your real name (first + last) in the extension popup.
2. When you visit a site, ShadowName hashes the domain name to produce a deterministic seed.
3. For each character in your name, the seed selects a visually similar homoglyph from a mapping of Unicode lookalikes (Cyrillic, Greek, math symbols, etc.).
4. Your name is silently replaced with the alias in page text and form fields.
5. The same domain always produces the same alias. A different domain produces a different alias.

## Setup

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the extension directory
4. Click the extension icon, enter your name, and save

## Cross-device sync

ShadowName auto-generates a secret key (pepper) on first use. To generate matching aliases across multiple browser profiles or devices, open the **Advanced** section in the popup, copy the key, and set it on your other devices.

## Project structure

```
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js             # Content script for page replacement
├── homoglyphs.json        # Character → homoglyph variants mapping
├── lib/
│   ├── fingerprint.js     # Domain → seed hashing
│   └── alias.js           # Seed + name → alias generation
└── popup/
    ├── popup.html
    ├── popup.js
    └── popup.css
```

## License

MIT