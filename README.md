# Srisun — React Website (Header · Hero · Rural→Global · Srisun One · Footer)

React + Vite. Run:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Layout system
- One shared 1240px content grid (`--content`) used by header, hero, philosophy card, Srisun One and footer, so all left/right edges line up at every screen size (24px gutter, 16px on phones).
- **Rural → Global card** sits in a band whose background is split exactly 50/50 (hero grey / Srisun One blue). The card therefore overlaps half of the hero area and half of Srisun One at any size, never covers content, and needs no magic negative margins.

## Breakpoints
| Width | Behaviour |
|---|---|
| > 1200 | Full desktop: language picker, 2-column hero, 6-column footer |
| ≤ 1200 | Compact: language hidden, wide menus anchor to header, 3-column footer |
| ≤ 1024 | Mobile navigation, hero + Srisun One stack |
| ≤ 860 | Philosophy card stacks (photo on top, copy below) |
| ≤ 600 | Phone: single-column featured list, full-width buttons, 2-column footer |
| ≤ 380 | Small phones: 1-column footer |

## Behaviour
Menus close on outside click / Esc; mobile menu resets on resize; dropdowns never leave the viewport; `prefers-reduced-motion` respected.
