# ShadowName

A Chrome extension that generates per-domain aliases using homoglyph substitution, helping cloak your real name from search engine indexing and cross-site tracking.

## How It Works

1. **User registers their real name** (e.g., "John Smith") in the extension.
2. **Domain fingerprinting** — when visiting a site, the extension hashes the domain name (e.g., `example.com`) to produce a deterministic seed.
3. **Homoglyph selection** — for each character in the user's name, the seed is used to consistently pick one of the available homoglyph variants from `homoglyphs.json`.
4. **Alias injection** — the extension replaces occurrences of the user's name with the generated alias on the page (form fields, visible text, etc.).
5. **Deterministic per domain** — `example.com` always produces the same alias. `other-site.com` produces a different alias. This prevents correlating the user's identity across sites while maintaining a consistent identity within each site.

## Key Properties

- **Consistency**: Same domain → same alias every time (deterministic hashing).
- **Diversity**: Different domains → different aliases (domain is part of the seed).
- **Unlinkability**: Aliases across domains look like different people, preventing search engines from linking them.
- **Reversibility defense**: The original name cannot be trivially derived from the alias without knowing the domain seed.

## Project Structure

```
shadowname/
├── homoglyphs.json        # Character → homoglyph variants mapping
├── manifest.json         # Chrome extension manifest
├── background.js         # Service worker / background script
├── content.js            # Content script for page replacement
├── popup/                # Extension popup UI
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── lib/
    ├── fingerprint.js    # Domain → seed hashing
    └── alias.js          # Seed + name → alias generation
```

## Homoglyph Mapping

Each base character maps to a set of visually similar Unicode characters from various scripts (Cyrillic, Greek, Mathematical Alphanumeric Symbols, etc.). For example:

- `A` → Α (Greek Alpha), А (Cyrillic), Ꭺ (Cherokee), ꓮ (Lisu), etc.
- `a` → а (Cyrillic), α (Greek), ɑ (Latin IPA), ⍺ (APL)

## Alias Generation Algorithm

```
alias_char = base_name[i] -> homoglyph_map[base_name[i]]
selected_homoglyph = homoglyphs[ hash(domain + char_index + salt) % len(homoglyphs) ]
```

The hash function takes the domain, the character position, and a fixed salt to ensure each character selection is independently randomized, preventing pattern reconstruction.
