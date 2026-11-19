# Looseleaf — Design Language & Color System

> The **Looseleaf** skin (`looseleaf`) is the default visual theme of the whistle Web UI.
> It is a *paper-and-pencil* interpretation of the [Looseleaf](https://kevintngo.github.io/looseleaf/) note-taking aesthetic: a sage-green desk, warm paper sheets, pencil-grey outlines, marker-orange ink, lemon-highlighted rows, tight 3px corners and a hand-written UI face.
>
> Canonical source: `biz/webui/htdocs/src/css/skins/looseleaf.css`.
> Selected via `data-ui-skin="looseleaf"` on `<html>` (default in `biz/webui/htdocs/src/js/ui-skin.js`, overridable with `?uiSkin=looseleaf`).

---

## 1. Design metaphor

| Surface | Role | Analogy |
| --- | --- | --- |
| `--morandi-bg` / `--morandi-canvas` | app shell / work area | the sage desk |
| `--morandi-surface` / `--morandi-surface-muted` | panels, text panes, tab bars | warm paper sheets |
| `--morandi-sand` / `--morandi-sand-deep` | secondary fills, heavy buttons | folded / stacked paper |
| `--morandi-border` / `--morandi-border-strong` | panel & control outlines | pencil lines |
| `--morandi-green` | active marker, primary action, network bars | orange marker ink |
| `--morandi-sage-soft` / `--morandi-sage` | soft sage accent | highlighter green |
| `--b-active` / `--b-list-mark` | selected / marked rows | lemon highlighter |

Rules of thumb:
- **No pure white.** Paper is always warm (`#fbf6e9`, `#f8f5ee`); text panes use `--morandi-surface-muted`, never `#fff`.
- **One marker, not a stack.** A selected item gets a single marker cue (a 3px orange rule), not text color + fill + chip + bar all at once (see the left-rail selected state).
- **Pencil outlines, not shadows.** Panels use a 1px pencil border; buttons a 1px border with a hair of lift (`0 1px 0 rgba(58,44,30,.12)`).
- **Paper grain.** The desk carries a faint linen weave via `repeating-linear-gradient` — never a flat fill.

---

## 2. Light theme tokens

Selectors: `html[data-ui-skin="looseleaf"]`.

### Core palette
| Token | Hex | Meaning |
| --- | --- | --- |
| `--morandi-bg` | `#a8c8bb` | sage desk (outer background) |
| `--morandi-canvas` | `#b3d0c4` | work-area canvas |
| `--morandi-surface` | `#fbf6e9` | paper panel |
| `--morandi-surface-muted` | `#f8f5ee` | muted paper (tab bars, text panes) |
| `--morandi-sand` | `#ece6da` | sand fill (heavy buttons) |
| `--morandi-sand-deep` | `#ded5c2` | deeper sand (pressed / active heavy) |
| `--morandi-sage-soft` | `#dfe9d8` | soft sage accent |
| `--morandi-sage` | `#7fa37c` | sage accent |
| `--morandi-green` | `#df6b3c` | marker orange (primary/active) |
| `--morandi-green-deep` | `#b34f24` | deep orange (primary border) |
| `--morandi-green-hover` | `#c9562b` | orange hover |
| `--morandi-text` | `#2a2420` | primary ink |
| `--morandi-text-soft` | `#4a423b` | secondary ink |
| `--morandi-muted` | `#6b6259` | muted ink |
| `--morandi-subtle` | `#8e887f` | faint ink |
| `--morandi-border` | `#8e887f` | pencil border |
| `--morandi-border-strong` | `#6b6660` | strong pencil border |
| `--morandi-danger` | `#c2412d` | danger |
| `--morandi-danger-soft` | `#f7e0d9` | danger background |
| `--morandi-warning` | `#a4502a` | warning |
| `--morandi-success` | `#3b7a4b` | success |

### Legacy semantic tokens (remapped to the palette)
| Group | Tokens → Hex |
| --- | --- |
| Text | `--c-default` `#2a2420` · `--c-active` `#fbf6e9` · `--c-heavy` `#2a2420` · `--c-thin` `#4a423b` · `--c-disabled` `#a9a294` |
| Links | `--c-link` `#2c4f9e` · `--c-link-hover` `#1f3b7a` |
| Status | `--c-error` `--c-risk` `--c-danger` `#c2412d` · `--c-ok` `--c-success` `#3b7a4b` · `--c-has` `#df6b3c` · `--c-warn` `#a4502a` · `--c-info` `#2c4f9e` |
| Borders | `--c-border` `#8e887f` |
| Backgrounds | `--b-default` `#fbf6e9` · `--b-title` `#f8f5ee` · `--b-bar` `#fbf8f1` · `--b-hover` `--b-list-hover` `--b-btn-hover` `#f2ecdf` · `--b-active` `--b-list-mark` `#f7ecc4` · `--b-btn-active` `#eadfc6` · `--b-heavy` `#ece6da` · `--b-heavy-active` `#ded5c2` · `--b-disabled` `#f1ece1` |
| Intent bgs | `--b-success` `#e6f0e0` · `--b-success-hover` `#d8e8cf` · `--b-error` `#f7e0d9` · `--b-error-hover` `--b-list-danger-hover` `#f0cdc3` · `--b-warn` `--b-list-warn` `#fbf0d5` · `--b-alert-info` `--b-list-info` `#e3edf7` |
| Timeline bars | `--b-tl-dns` `#dfe9d8` · `--b-tl-req` `#f7ecc4` · `--b-tl-res` `#fbe6d8` · `--b-tl-load` `#e3edf7` |

### Typography, radius, overlay
| Token | Value |
| --- | --- |
| `--morandi-font` | `"Avenir Next", "Avenir", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif` |
| `--morandi-mono` | `"IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace` |
| `--morandi-radius-sm` | `3px` |
| `--morandi-radius-md` | `4px` |
| `--morandi-radius-lg` | `6px` |
| `--ui-overlay` | `rgba(58, 44, 30, 0.32)` |

> `--ui-hover`, `--ui-hover`-family and other shared shell tokens come from `visual-refresh.css` (`--ui-hover: #f2eee7` in light, `#343932` in dark); the looseleaf skin overrides where it needs paper-specific values.

---

## 3. Dark theme tokens

Selector: `html[data-ui-skin="looseleaf"][data-theme="dark"]`.
The desk darkens to a deep olive-charcoal; ink inverts to warm paper-white; the marker orange lifts for contrast.

### Core palette (dark)
| Token | Hex | Meaning |
| --- | --- | --- |
| `--morandi-bg` | `#232821` | dark desk |
| `--morandi-canvas` | `#262c25` | dark work area |
| `--morandi-surface` | `#2f2b24` | dark paper panel |
| `--morandi-surface-muted` | `#33302a` | muted dark paper |
| `--morandi-sand` | `#3a352d` | dark sand |
| `--morandi-sand-deep` | `#464036` | deeper dark sand |
| `--morandi-sage-soft` | `#2f3a33` | soft dark sage |
| `--morandi-sage` | `#6f8f74` | dark sage accent |
| `--morandi-green` | `#e2834f` | marker orange (lifted) |
| `--morandi-green-deep` | `#f0a077` | deep/highlight orange |
| `--morandi-green-hover` | `#d1713f` | orange hover |
| `--morandi-text` | `#ece6d9` | primary ink (paper-white) |
| `--morandi-text-soft` | `#c9c3b6` | secondary ink |
| `--morandi-muted` | `#a9a294` | muted ink |
| `--morandi-subtle` | `#8e887f` | faint ink |
| `--morandi-border` | `#5c574f` | pencil border |
| `--morandi-border-strong` | `#7d766b` | strong border |
| `--morandi-danger` | `#e07a5f` | danger |
| `--morandi-danger-soft` | `#3a2622` | danger background |
| `--morandi-warning` | `#d9a15e` | warning |
| `--morandi-success` | `#7fb08a` | success |
| `--ui-overlay` | `rgba(12, 10, 6, 0.62)` | overlay |

### Legacy semantic tokens (dark)
| Group | Tokens → Hex |
| --- | --- |
| Text | `--c-default` `#ece6d9` · `--c-active` `#2f2b24` · `--c-heavy` `#ece6d9` · `--c-thin` `#c9c3b6` · `--c-disabled` `#7d766b` |
| Links | `--c-link` `#8fb6e8` · `--c-link-hover` `#b4cdf0` |
| Status | `--c-error` `--c-risk` `--c-danger` `#e07a5f` · `--c-ok` `--c-success` `#7fb08a` · `--c-has` `#e2834f` · `--c-warn` `#d9a15e` · `--c-info` `#8fb6e8` |
| Borders | `--c-border` `#5c574f` |
| Backgrounds | `--b-default` `#2f2b24` · `--b-title` `#33302a` · `--b-bar` `#37332c` · `--b-hover` `--b-list-hover` `--b-btn-hover` `#3a352d` · `--b-active` `--b-list-mark` `#4a4030` · `--b-btn-active` `#464036` · `--b-heavy` `#3a352d` · `--b-heavy-active` `#464036` · `--b-disabled` `#2b2822` |
| Intent bgs | `--b-success` `#26332a` · `--b-success-hover` `#2d3d31` · `--b-error` `#38251f` · `--b-error-hover` `--b-list-danger-hover` `#452e26` · `--b-warn` `--b-list-warn` `#38301f` · `--b-alert-info` `--b-list-info` `#22303f` |
| Timeline bars | `--b-tl-dns` `#2a3730` · `--b-tl-req` `#3d3728` · `--b-tl-res` `#3c2f26` · `--b-tl-load` `#24313f` |

Typography, radii and mono face are unchanged from light except the overlay token.

---

## 4. Visual recipes (how the tokens are applied)

These rules live in `looseleaf.css` and define the *feel*; use them when extending the skin.

- **Desk grain** (`.w-ui-refresh`, `#container.main`, `.w-container`): a radial highlight (`rgba(255,253,246,.22–.3)`) + two crossed `repeating-linear-gradient` weaves over `--morandi-bg` / `--morandi-canvas`.
- **Paper panels** (`.w-menu`, `.w-list`, `.w-detail`, `.w-com`, `.w-tools`): pencil border `--morandi-border`, no heavy shadow.
- **Tab bars** (`.w-tabs-sm`, `.w-detail-tabs`, `.w-com-tabs`): `--morandi-surface-muted` fill, 1px `--morandi-border` bottom, 3px top corners.
- **Buttons**: 1px `--morandi-border-strong` border, `0 1px 0 rgba(58,44,30,.12)` lift; `:active` insets `0 1px 2px rgba(58,44,30,.18)` and `translateY(.5px)`; primary border `--morandi-green-deep`.
- **Active tab** (`.nav-link.active`, `.w-tab-btn.w-active`, `.btn.active`): `--morandi-text` ink on `--morandi-surface`, with a single `inset 0 -3px 0 var(--morandi-green)` marker.
- **Left rail selected** (`.w-left-menu a.w-menu-selected`): ink text `--morandi-text`, transparent background, the icon keeps its normal marker ink (`--morandi-green` on `--morandi-sage-soft`), and the sole selection cue is the existing `::after` marker bar. Only the `:hover` background uses `--ui-hover`.
- **Text panes** (`.w-textarea > .fill`, `.CodeMirror`, gutters): `--morandi-surface-muted` paper; CodeMirror ink `--morandi-text`, no filter.
- **Empty states**: `--morandi-muted` ink.

---

## 5. Extending the system

- Always override the **`--morandi-*` custom properties** rather than hardcoding hex values, so light/dark and future skins stay consistent.
- Add new semantics as a `--morandi-*` token in **both** the light block (`:7`) and dark block (`:79`) of `looseleaf.css`, then map any legacy `--c-*`/`--b-*` alias to it.
- Keep selection to **one marker cue**. Prefer an `inset` rule or the `::after` bar over stacking color + fill + chip.
- If a token comes from `visual-refresh.css` (e.g. `--ui-hover`), don't re-declare a paper hex unless the shared value breaks the look — reference it so theme switching keeps working.
- Rebuild the bundle after editing CSS (`npm run build:web`); the produced `biz/webui/htdocs/js/*.js` files are gitignored — `looseleaf.css` is the source of truth.

---

## 6. Quick swatch reference (light)

```
desk      ██ #a8c8bb   paper     ██ #fbf6e9   muted paper ██ #f8f5ee
sand      ██ #ece6da   sage soft ██ #dfe9d8   sage        ██ #7fa37c
marker    ██ #df6b3c   deep      ██ #b34f24   hover       ██ #c9562b
ink       ██ #2a2420   soft ink  ██ #4a423b   muted ink   ██ #6b6259
border    ██ #8e887f   strong    ██ #6b6660   highlight   ██ #f7ecc4
danger    ██ #c2412d   warning   ██ #a4502a   success     ██ #3b7a4b
```
