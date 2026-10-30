# CUI Portal+ · v0.3.3

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

- A redesigned login: a two-column welcome area and focused sign-in card on desktop, stacked layout on phones, light/dark modes, original university heading and seal, and no login top navbar.
- Original session/program selectors, roll-number input, password input, validators, submit button, form, and portal handlers are reused. They are not cloned or replaced with a new authentication implementation.
- A fresh application shell: original university logo and name, compact greeting/action buttons, icon navigation, and a workspace header. The decorative welcome banner has been removed.
- Personal/enrollment details are grouped inside an expandable academic-profile section instead of dominating every page. It opens automatically for printing and returns to its previous state afterward.
- Restyled content cards and data tables, better selected-menu contrast, and cleaner notices and popup chrome.
- Announcement text and links follow the theme, including more readable dark-mode emphasis colors.
- Six accent options, four font stacks, text sizing, density, roundness, wide layout, reduced motion, reset, and instant restore.
- Space Grotesk and IBM Plex Sans are bundled locally with their SIL Open Font Licenses. No remote font requests.

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

## v0.3.3 requested corrections

University identity is retained. The sidebar reuses the original logo element; login moves the original university heading without cloning it and shows the bundled university seal. Extension credit appears only as “Powered by ComsatsHub” in the portal footer. The login navbar and workspace welcome banner are removed. Original greeting and action links are moved into compact sections while preserving their nodes and handlers. Announcement contrast overrides work even when Colorbox moves the notice outside cboxLoadedContent, and beat legacy important heading/link colors. Theme selection for login is available from the extension popup.

## v0.3.3 dark-surface coverage

A scoped computed-style adapter fixes legacy light backgrounds in forms, filters, notice cards, unclassified layout tables and result strips inside SIS content/dialogs. It also lifts low-contrast blue, red and neutral text. Only presentation properties are inspected; no text or field values are read. A mutation observer handles newly rendered panels. Saturated grade swatches keep their colors. Marks are removed when switching to light mode or disabling the makeover, and the rules are screen-only. Existing image/canvas pixels and styles inside cross-origin frames are not modified.

## v0.3.3

Normalized the original Dashboard heading and removed direct spacer breaks only in its card. Preserved explicit cell/row background colors so attendance progress fills remain visible. Improved notification close-icon contrast and missing-document popup typography, alignment, spacing and separators. Local browser regression checks passed for Dashboard heading/spacing and green progress cells in light and dark mode; existing checks also passed. Live installed-extension validation remains pending.

## v0.3.5 login seal fix

The login seal is now a real image with an explicit chrome.runtime.getURL resource path in the extension and a script-relative URL in the local preview. CSS only controls sizing. Local browser checks confirm successful image decoding and the expected asset URL. Light, dark, mobile and restoration tests passed; live installed-extension verification is still pending.

## v0.3.6 icons

Replaced custom SVG artwork with selected Lucide Static 1.61.0 icons, bundled locally with ISC license. Sidebar entries now use specific icons for identity card, attendance/courses, timetable, results, projects, fees, library and settings. Theme controls, profile disclosure and shield use the same library. Local rendering/interaction checks passed; live installation remains pending.


## v0.3.7 chart themes

A bundled document-start MAIN-world adapter captures new CanvasJS Chart instances, themes presentation options using the same CSS tokens as the portal, and rerenders when light/dark mode or fonts change. It supports multiple charts and array axes. Disabling the extension or printing restores the original presentation options; destroyed charts are released. It makes no requests and reads no series or student values. No additional permissions or remote code.

Reload the extension in chrome://extensions and reload existing SIS tabs after upgrading. The adapter must run before the portal creates charts. Supported integration: the global CanvasJS.Chart constructor; privately bundled or already-created instances cannot be captured. Actual signed-in SIS integration still needs confirmation because extension installation was blocked in the cloud browser. Real CanvasJS was tested locally, separately from the portal.

Chart regression command (supply an official CanvasJS JS build locally; it is not redistributed):
`CANVASJS_PATH=/absolute/path/canvasjs.min.js CHROMIUM_PATH=/absolute/path/headless_shell node tests/charts.test.cjs`


## v0.3.8 ECharts correction
The screenshot toolbar matches ECharts, which v0.3.7 did not support. Added ECharts init interception (including empty-object UMD startup) plus getInstanceByDom lookup for existing instances. Theme patches cover background, titles, legends, axes, labels, tooltip and toolbox icons. Only presentation fields are retained from getOption; series values are neither copied into snapshots nor stored/transmitted. Course colors, chart types, zoom, formatters, exports and tooltip content are preserved. Original presentation restores on disable/print. Actual SIS testing remains unverified; both official chart libraries passed local browser tests.

For ECharts regression: `ECHARTS_PATH=/absolute/path/echarts.min.js CHROMIUM_PATH=/absolute/path/headless_shell node tests/echarts.test.cjs`.


## v0.3.9 reload startup fix
Fixed an exception when the theme is already enabled at page load: ECharts getOption returns undefined before its first setOption. The adapter now waits for an existing model and never creates it early. Optional presentation failures cannot propagate through the portal's init/setOption calls. Added startup-light, startup-dark and initially-disabled regressions plus real browser parser/reload tests with four chart containers and the portal's canvas/useDirtyRect init flags. Three consecutive loads per mode preserve all canvases. Supplied portal source was inspected; no uploaded student data or source is included in this package.


## v0.3.10 workspace header
Removed the added workspace top bar and its inline theme toggle. Use the extension popup for theme controls. University identity remains in the sidebar.


## v0.4.0 Appearance studio

Open **CUI Portal+** at the end of the student sidebar after Settings. It renders an appearance page inside the existing content area; Back to portal or any portal navigation restores the original content. Original forms and academic data are not replaced.

- Light, dark and system themes; typography, text size, spacing, corner radius and content width.
- Separate overrides for page background, cards, headers, form fields, sidebar, sidebar text, main/secondary text, button/accent, button text and borders. Each color has an automatic-theme reset.
- Local PNG/JPEG/WebP/GIF or MP4/WebM backgrounds, up to 100 MB; fill/fit, dimming and a muted looping video. Video pauses with reduced motion or hidden tab.
- Glass surfaces with blur and opacity controls. Sample live style preview and button-text contrast feedback.
- Automatic local persistence, remove-file action and confirmed reset of the complete appearance/background.

Media is saved as a Blob in extension-origin IndexedDB and rendered through a bundled background frame with a temporary object URL. No upload, remote media/CDN, background worker or additional permission. The frame/customization resources are available only to the SIS HTTPS origin. Invalid/unsupported files are rejected before replacement. Available disk space and browser storage policies can limit large files; save errors are reported. GIF animation follows the file; reduced-motion pauses video, not GIF frames.

Custom colors override automatic theme colors in both modes until individually reset. The compact extension popup still controls the original quick settings; selecting an accent there clears the custom button/accent override. Resetting there disables the selected background but does not erase its stored file; the studio's full reset/removal deletes it.

Validation: seven Node tests, full legacy UI browser suite, plus a synthetic-data local studio suite (navigation, live styling, image/GIF/WebM, persistence, pause/remove/reject/reset). Installed extension on authenticated SIS is still not verified because cloud extension installation was blocked. No user-uploaded source, private screenshots or media are included.


## v0.4.1 portal consistency fixes
- Unified native button actions (including unclassed Print/Download/Submit and account shortcuts): filled/outline/soft, button radius and padding, text/background/hover/border colors.
- Sidebar selected leaf and parent derive from the exact current route/query, including ASP.NET PostBackOptions links, with known postback routes and native-current fallback. Stale Dashboard styling is suppressed. Studio has its own selected state and restores the previous page state on return.
- Replaced the collapsible profile with an always-expanded profile card. Retains original photo, cells and handlers; responsive label/value layout on small screens. No records copied.
- Additional palette controls for active navigation, table rows/alternates/headers, notices and dialogs. Data grids use light separators, readable spacing and controlled fills; saturated explicit progress/grade cells retain their meaning. Gray legacy panels now adapt in dark mode.
- Consistent notices, close buttons, popup content and heading spacing; reduces repeated BR spacers. A raster grade legend remains the original image, with no alteration to its grade colors.

Verified with fictional local fixtures, including a stale Dashboard current class on an E-card route, native action handlers, hover/outline styling, profile/mobile behavior and semantic swatches. Authenticated SIS with the installed extension remains unverified in the cloud environment.


Component transparency: individual 0–100% background opacity for cards, sidebar, buttons, form fields, tables, headers, notices, dialogs and academic profile. Text/icons are never faded with element opacity. Component sliders override glass defaults only for that component when reduced below 100%; other surfaces keep their existing glass settings. Sliders persist with all other preferences. Nested translucent layers naturally composite over their parent surfaces.


## v0.4.2 sidebar shortcut sizing
Notifications, Sign Out and User Manual use compact wrapping account-action sizing. Global large button padding/font settings no longer inflate the sidebar shortcuts; their colors, button style, hover and transparency still apply. Verified at maximum font/padding/radius settings.


## v0.4.3 profile photo and drop zones
- Background and profile upload zones accept drag-and-drop as well as the keyboard-accessible file picker. File drops outside the editor zones cannot navigate away; multi-file drops are rejected.
- Local custom profile photo: PNG/JPEG/WebP/GIF up to 10 MB, decoded before saving. Separate IndexedDB entry from background media, independent remove/reset and preview. Backgrounds retain the existing image/video formats and 100 MB limit.
- Decorative replacement for the academic profile photo only. The original photo element, URL and handlers remain; the replacement becomes visible only after the local image loads successfully. Missing/unreadable media falls back to the original. Disabling or resetting restores it, and print uses the original university photo. Does not change the university record or E-card image.
- Full appearance reset removes both saved files. All files remain local; no extra permissions or network upload.

Verified locally: picker/drop for both zones, profile persistence after reload, invalid profile-file rejection without losing previous photo, unchanged original node, print, disable/re-enable, restore university photo and full reset. Live installed extension on SIS still requires verification.


## v0.4.4 profile photo border
The Profile picture section now includes independent border color (with automatic-theme reset), thickness 0–12 px, solid/dashed/dotted/double/none styles and corner radius 0–60 px. The same controls style custom and university profile photos on screen; print retains the original presentation. A thickness of zero or style None removes the border. Changes save automatically and the editor photo preview reflects them.


## v0.4.5 sidebar navigation controls
The studio has a dedicated Sidebar navigation buttons section: normal background/text, hover background/text, active background/text, border color/thickness, corner radius, padding, and independent 0–100% normal/hover/active background opacity. Applies to top-level and nested navigation entries including Student E-Card. Foreground text/icons are not faded. Changes persist and the style preview shows normal/selected menu samples.


## v0.5.0 page adapters and theme collection

- Native E-card color isolation: on StudentECard.aspx, the detected Student Card subtree is excluded from every extension content stylesheet. Original photo/QR and native styles are retained. An idempotent authoring helper (scripts/protect-ecard.py; tinycss2 dependency only for authors) keeps exclusions in sync with future CSS additions.
- Quiz/assignment section headers and tables use the header/table palette. Detected nested score-bar tracks have adjustable track/fill, height and radius. Original grade fill colors stay unchanged unless the explicit override checkbox is enabled.
- Native assignment file inputs keep their IDs/names, selected FileList and change handlers. Drop zones support original accept rules, filename/size metadata, raster-image thumbnails and an Open PDF preview link. Nothing is automatically submitted; the original Upload button is retained.
- Local theme collection: up to 24 named looks, save/apply/rename/delete and JSON import/export. Export includes the saved background file (up to 100 MB; import JSON up to 145 MB). Profile pictures are excluded; applying a theme keeps the current custom profile photo. Settings are normalized and imported media is decoded before saving. Theme names are rendered as text.
- Timetable: preserved time/day matrix and original links, horizontal scroll, sticky day column, clear class blocks and consistent spacing.
- Exam notices/datesheets: consistent headings, notice cards, table surfaces and readable spacing. Existing university notices and schedule values are not edited.
- Result CGPA/status summary: a new card frame replaces legacy white outlines, with independent border color/thickness and background opacity controls.
- Contact/profile settings: original form controls are grouped into responsive label/control rows, retaining values/IDs/validation handlers.
- Approved Projects: client-side cards, description excerpts, View more, search, 9/18/36 entries per page and Previous/Next. Supports recognized title/description table grids and repeated title/description label-value tables. Original nodes/links return when the extension is disabled. Print expands all project descriptions. No extra project data is fetched.

The adapters inspect rendered headings/table labels and project text locally to restructure presentation. They do not collect credentials, transmit portal data or write academic records. Unsupported markup remains original rather than being guessed destructively.

Validation used fictional local structures for all new pages and real browser theme export/import/download. Actual authenticated page DOM was not available: the Approved Projects URL redirected the cloud browser to login. In particular, production project-card detection and other route-specific adapters need confirmation on the signed-in portal. A different project markup may require an additional parser after receiving that page's HTML. Installed MV3/extension-origin behavior still cannot be tested in this cloud browser.

## v0.5.6 clean weekly timetable
The weekly grid uses flat cells and subtle dividers instead of nested cards. Adjacent sessions with identical displayed content and link targets merge into one wider cell; empty days show a compact message. Original nodes and column spans are restored when styling is disabled. Colors and table transparency follow Appearance Studio. Wide timetables scroll inside their own region.
