# DESIGN.md — Base360 "Night Shift" landing

## Color strategy
Full palette with a narrative arc (night → dawn → morning). The page background is the timeline.

### Tokens (OKLCH)
- `--night`        oklch(0.14 0.02 235)  deep ink, hero and chapters background
- `--night-raise`  oklch(0.19 0.025 240) raised surfaces on night (chat cards)
- `--night-line`   oklch(0.32 0.03 240)  hairlines on night
- `--dawn`         oklch(0.66 0.13 45)   horizon coral, transition band only
- `--morning`      oklch(0.955 0.02 85)  warm cream, daylight sections
- `--morning-raise` oklch(0.985 0.012 85) raised surfaces on cream
- `--ink`          oklch(0.23 0.02 260)  text on cream
- `--amber`        oklch(0.82 0.14 75)   the signal color, "the light that stays on"; CTAs, timestamps, live markers
- `--amber-deep`   oklch(0.52 0.12 60)   amber for text on light backgrounds
- Text on night: oklch(0.93 0.01 85) warm off-white, never #fff

## Typography
- Display + body: **Bricolage Grotesque** (Google Fonts), weights 300/400/600/800. Single family, committed contrast.
- Timestamps, labels, log lines: **Spline Sans Mono** 400/500. Mono is literal here: machine time, receipts, logs.
- Fluid display scale via clamp(); ratio ≥ 1.3 between steps. Body 17px, line-height 1.6 on light, 1.7 on dark.

## Layout
- Long scroll, one idea per fold. Left-aligned asymmetric compositions.
- Chapters: sticky mono clock rail on the left (desktop), story vignettes on the right. Stacks on mobile.
- Night report as a printed receipt, not a stat grid.
- Features in daylight: alternating asymmetric rows with product vignettes, never identical cards.

## Motion
- Scroll-triggered reveals (IntersectionObserver), ease-out-quint, 500–700ms, small translate + fade.
- The clock rail ticks forward as chapters pass.
- Progressive enhancement: everything visible without JS.

## Bans honored
No gradient text, no side-stripe borders, no glassmorphism, no icon-card grids, no hero-metric template (receipt instead), no em dashes in copy.
