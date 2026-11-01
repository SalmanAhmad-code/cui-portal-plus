# CUI Portal+ · v0.5.8

A complete visual makeover for the COMSATS Abbottabad student portal at https://sis.cuiatd.edu.pk/ . This version follows the public ComsatsHub design direction: soft lavender surfaces, royal blue actions, Space Grotesk headings, IBM Plex Sans body text, clean white cards, and generous spacing.

## Install or update

1. Extract the ZIP to a folder you will keep on your computer.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select this project's **extension** folder, containing `manifest.json`.
4. For an existing installation, replace its files and click **Reload** on its extension card.
5. Refresh the SIS tab after installation or updates.
6. Open the CUI Portal+ popup and choose **Reset defaults** to get the new ComsatsHub palette and typography. Existing saved preferences otherwise remain in effect.

Keep the extracted folder; Chrome loads the extension files from it. No build step, backend, API key, or separate account is needed.

## What's new

- Appearance studio accordion (Quick start, Look & feel, Identity, Components, Colors, Danger zone); live preview removed; ready-made color palettes.
- Course contents multi-select and bulk ZIP download (files by Title; archive by selected course).
- Cleaner login (marketing copy removed).
- Redesigned shell, profile, tables, dark surfaces, chart theming, and appearance controls as in prior releases.

The portal still draws its own CanvasJS or ECharts charts. Their canvas backgrounds, axis labels, legends, grid, tooltip and toolbar follow the extension theme. Course colors, series, values, formatters and interactions remain original.

## Original functionality and restoration

The visual layout module adds decorative elements and moves existing visual wrappers within their existing form ancestry. It never creates a replacement login form. Changes use reversible markers so turning off **Portal makeover** removes the added layout and returns the original wrappers to their previous positions. Existing field identity, values, validation messages, and form handlers are retained.

Hidden navigation links and role-specific items stay controlled by the university portal. The extension does not set visibility on navigation links or intercept postbacks. It does not change accounts, records, grades, attendance, fees, credentials, security checks, or authentication behavior. After uninstalling, refresh the portal to return to a fresh original document.

Verification pages are excluded by known titles/selectors. CAPTCHA and reCAPTCHA elements are untouched.

## Privacy and permissions

The only API permission is `storage`. Static content scripts match only `https://sis.cuiatd.edu.pk/*`, including matching same-origin frames. Bundled font resources are exposed only to this site. Chrome may describe site access as reading and changing the site because visual DOM work requires a content script.

The extension stores normalized appearance preferences in `chrome.storage.local`. It does not read input values, passwords, cookies, tokens, academic records, or network responses. It includes no analytics, remote scripts, backend, telemetry, or remote API calls. Existing portal links and forms continue to make their normal requests directly to their original destinations.

Only static branding text is inspected to recognize the old login heading. Structural DOM selectors identify the existing controls. Student details are neither copied into new components nor saved. The profile disclosure wraps the original details element.

## Interactive previews

Run from this project's directory:

```sh
python -m http.server 4173
```

On Windows, `py -m http.server 4173` also works. Open:

- http://localhost:4173/demo/login.html — redesigned login using the inspected public login IDs and hierarchy.
- http://localhost:4173/demo/sis.html — application shell with fictional profile, courses, notice, and form.
- http://localhost:4173/demo/ — appearance controls beside a generic legacy sample.

In the standalone previews, preferences use localStorage. In the installed extension they use `chrome.storage.local`; these are separate. Open `extension/popup.html` in another localhost tab to change all preview pages together. Use fictional input only: the login fixture is not connected to authentication and prevents submission requests.

Images in `previews/` are renders of these fictional local fixtures, not screenshots of a signed-in student account or proof of live extension installation.

## Validation and practical limits

The public ComsatsHub design was inspected in the cloud browser on 26 October 2026. The actual SIS login hierarchy and field IDs were also inspected after its verification page cleared. The dashboard, summary, attendance navigation, Colorbox structure, and legacy CSS conflicts were inspected during earlier iterations.

Six Node tests passed. Local Chromium rendering tests passed for theme changes, persistence, restore, forms, selected-menu contrast, mobile layout, popup scroll/close behavior, and login redesign. Login tests verify native required-field validation, the original submit handler, identical input/form objects across disable/re-enable, preserved selection, visible error messages, dark mode, and no horizontal overflow on a phone viewport.

**The installed extension has not been tested against live SIS authentication.** The cloud browser explicitly blocks `chrome://extensions`, so it cannot load this unpacked extension. Local browser rendering uses fictional fixtures and is reported separately from the live original-portal inspections. The installed MV3 smoke test is included but was skipped in the Headless Shell run. Results/fee/settings pages and future portal DOM changes may need additional adapters.

## Development

Runtime: plain JavaScript, CSS, and Manifest V3. No runtime dependencies.

```sh
npm install
npx playwright install chromium
npm test
npm run test:browser
```

The browser test runner starts and stops its own local HTTP server. To run only rendering checks using a custom Headless Shell binary:

```sh
CHROMIUM_PATH=/path/to/headless_shell SKIP_EXTENSION_TEST=1 npm run test:browser
```

Project files:

- `extension/settings.js`: validated local preferences.
- `extension/content.js`: appearance tokens and theme application.
- `extension/layout.js`: reversible login and workspace structure.
- `extension/portal.css`, `sis.css`, `redesign.css`: generic, legacy-adapter, and ComsatsHub-inspired design layers.
- `extension/popup.*`, `fonts.css`: appearance controls.
- `extension/fonts/`: bundled fonts and licenses.
- `demo/`, `tests/`, `previews/`: fictional local previews, checks, and rendered samples.

Unofficial student extension. Not affiliated with or endorsed by COMSATS University. Inspired by ComsatsHub's public design; no ComsatsHub service integration or account access is added.

## v0.5.8

Appearance studio redesign:

- Single-column accordion: Quick start, Look & feel, Identity, Components, Colors, Danger zone
- Live preview removed
- Ready-made color palettes: Default, Midnight, Ocean, Rose, Sand, Slate
- Non-midnight palettes: button text matches main text; Midnight keeps white button text

## v0.5.7

- Login: marketing/slop copy removed (logo + form only)
- Course contents: multi-select artifacts and bulk download as ZIP
- ZIP entry names use each file's Title; archive name uses the selected course

## v0.3.3 requested corrections

University identity is retained. The sidebar reuses the original logo element; login moves the original university heading without cloning it and shows the bundled university seal. Extension credit appears only as “Powered by ComsatsHub” in the portal footer. The login navbar and workspace welcome banner are removed. Original greeting and action links are moved into compact sections while preserving their nodes and handlers. Announcement contrast overrides work even when Colorbox moves the notice outside cboxLoadedContent, and beat legacy important heading/link colors. Theme selection for login is available from the extension popup.
