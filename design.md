# Design — Atlas CMMS

A locked design system for the Bay Baby Produce maintenance application. Every
screen should feel like part of one calm, dependable operations console.

## Genre

Modern-minimal with a distinctive field-equipment character: operational,
agricultural, tactile, and unmistakably Bay Baby without becoming decorative.

## Macrostructure family

- Marketing and sign-in pages: restrained brand frame with one photographic moment.
- App pages: compact Workbench shell with an evergreen chassis, orange datum line,
  title/action instrument panel, faint field grid, and full-width work surface.
- Content pages: structured long-form layout with strong typographic hierarchy.

## Theme

- `--color-paper`: warm white work surface.
- `--color-paper-2`: pale cool-green application background.
- `--color-ink`: deep evergreen text.
- `--color-ink-2`: muted olive-grey secondary text.
- `--color-rule`: quiet neutral-green dividers.
- `--color-accent`: existing Atlas leaf green `#4a7c2f`.
- `--color-accent-dark`: existing Atlas evergreen `#1e4d0f`.
- `--color-seasonal`: Bay Baby pumpkin orange `#e27039`, used sparingly.
- `--color-focus`: dark leaf green with a clearly visible outer ring.
- `--color-chassis`: very deep evergreen used consistently for navigation and title panels.

## Typography

- Display: Georgia/system serif, weight 600, roman; reserved for major page titles.
- Body/UI: Inter-compatible system sans-serif, weight 400–700.
- Mono: system monospace, for identifiers only.
- Data-heavy controls and tables always use the body/UI face.
- Headings are never italic.

## Spacing

Use the named 4-point scale in `tokens.css`. Dense operational controls use the
compact end of the scale; page gutters and section separation use the larger end.

## Motion

- Transition only opacity and transform.
- Use the named ease and duration tokens.
- No decorative entrance animation inside application screens.
- Reduced motion collapses transitions to an opacity change of 150ms or less.

## Microinteractions stance

- Clear hover, active, focus-visible, disabled, loading, error, and success states.
- Silent success where the saved state is already visible.
- Tooltips appear without delay for keyboard focus.
- Controls have at least a 44px touch target where space permits.

## CTA voice

- Primary: solid leaf-green, compact rectangle, 6–8px corner radius, direct verb label.
- Secondary: white or transparent surface with a quiet green-grey border.

## Per-page allowances

- Sign-in and dashboard pages may use Bay Baby farm imagery.
- Application pages use no decorative imagery; function carries the page.
- Pumpkin orange is limited to warnings, priority, or a small seasonal brand moment.

## What pages MUST share

- Existing Atlas green palette and brand identity.
- Evergreen chassis, orange datum line, compact header, navigation rhythm, surface treatment,
  typography, and CTA voice.
- Consistent list toolbar, grid, form, drawer, empty, loading, and focus states.
- Warm paper surfaces, green-tinted field grid, restrained borders, deliberate shadows,
  and 8–12px corners.

## What pages MAY differ on

- Information density appropriate to the workflow.
- Grid, card, calendar, analytics, or form composition.
- Page-specific status and priority treatments.

## Exports

### tokens.css

The canonical CSS export lives at `tokens.css` in the project root.

### Tailwind v4 mapping

```css
@theme {
  --color-paper: oklch(99% 0.006 95);
  --color-paper-2: oklch(97% 0.012 135);
  --color-ink: oklch(28% 0.055 135);
  --color-accent: oklch(53% 0.115 135);
  --color-seasonal: oklch(66% 0.16 48);
  --font-display: Georgia, serif;
  --font-body: Inter, system-ui, sans-serif;
  --spacing-md: 1.5rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG mapping

```json
{
  "color": {
    "paper": { "$value": "oklch(99% 0.006 95)", "$type": "color" },
    "ink": { "$value": "oklch(28% 0.055 135)", "$type": "color" },
    "accent": { "$value": "oklch(53% 0.115 135)", "$type": "color" },
    "seasonal": { "$value": "oklch(66% 0.16 48)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Georgia", "$type": "fontFamily" },
    "body": { "$value": "Inter, system-ui, sans-serif", "$type": "fontFamily" }
  },
  "space": { "md": { "$value": "1.5rem", "$type": "dimension" } }
}
```

### shadcn/ui mapping

```css
:root {
  --background: 0.99 0.006 95;
  --foreground: 0.28 0.055 135;
  --primary: 0.53 0.115 135;
  --primary-foreground: 0.99 0.006 95;
  --muted: 0.97 0.012 135;
  --muted-foreground: 0.48 0.03 135;
  --border: 0.89 0.018 135;
  --input: 0.89 0.018 135;
  --ring: 0.42 0.11 135;
  --radius: 0.5rem;
}
```
