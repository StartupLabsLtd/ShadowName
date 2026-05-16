# Privacy Policy for ShadowName

**Last updated:** May 16, 2026

## Data Collection

ShadowName does **not** collect, transmit, or share any personal data. All data is stored locally on your device using `chrome.storage.local` and never leaves your browser.

## Data Stored Locally

The extension stores the following data on your local device:

- **Your real name** — the name you enter in the popup, used solely to generate per-domain aliases via homoglyph substitution. This is stored in `chrome.storage.local` and is never sent to any server.

## Permissions Used

| Permission | Purpose |
|---|---|
| `storage` | Save your name locally so aliases persist across browser sessions |
| `activeTab` | Detect the current tab's domain to generate the correct alias |
| `tabs` | Re-apply aliases when you navigate to a new page |
| `<all_urls>` host permission | Inject the content script to replace your name with the alias on web pages |

## No Network Requests

The extension fetches `homoglyphs.json` from its own packaged resources. No network requests are made to any external server.

## Third Parties

ShadowName does not use any analytics, tracking, or third-party services.

## Changes

If this policy changes, the updated date at the top will reflect the revision.

## Contact

For questions, open an issue at the extension's repository.
