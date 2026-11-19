# DESIGN.md — Apex Athletics Design System

This document captures the extracted design tokens, typography, layout grid system, visual elevation levels, and UI component architecture from the Stitch project **Apex Athletics** (`Indoor Sports Booking` / `7026270274486667019`).

---

## 🎨 1. Brand Identity & Style Overview

- **Brand Name**: Apex Athletics
- **Tagline**: Indoor Sports Ecosystem
- **Personality**: Professional, energetic, high-performance, organized.
- **Design Philosophy**: **Minimalist with Subtle Tactility**. Flat structural foundations elevated by ambient soft shadows, subtle glassmorphism backdrop blurs, and vibrant high-contrast Athletic Blue accents.

---

## 🌈 2. Color Tokens

### Primary & Brand Accents
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `primary` | `#0052ff` | Main CTA buttons, active tab indicators, brand highlights |
| `primary-dark` | `#003ec7` | Hover states and primary brand accents |
| `primary-container` | `#0052ff` | High-emphasis containers and highlighted badges |
| `on-primary` | `#ffffff` | Text/icons rendered on top of primary colors |
| `accent-cyan` | `#00c6ff` | Gradient accents and stadium status indicators |

### Neutral & Surface Colors
| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `background` | `#faf8ff` | `#0b0f19` | Main page body background |
| `surface` | `#ffffff` | `#131b2e` | Elevated cards and panel containers |
| `surface-container-low` | `#f2f3ff` | `#0f172a` | Secondary container backgrounds |
| `surface-container-high` | `#e2e7ff` | `#1e293b` | Interactive hover states and chip backgrounds |
| `on-surface` | `#131b2e` | `#f8fafc` | Primary body text and headings |
| `on-surface-variant` | `#434656` | `#94a3b8` | Secondary metadata and supporting captions |
| `outline` | `#737688` | `rgba(255,255,255,0.08)` | Dividers, card borders, and input strokes |

---

## 🔤 3. Typography System

- **Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`

| Scale Token | Font Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| `headline-lg` | 32px | 700 (Bold) | 40px | -0.02em |
| `headline-lg-mobile` | 28px | 700 (Bold) | 36px | -0.01em |
| `headline-md` | 24px | 600 (SemiBold) | 32px | Normal |
| `headline-sm` | 20px | 600 (SemiBold) | 28px | Normal |
| `body-lg` | 16px | 400 (Regular) | 24px | Normal |
| `body-md` | 14px | 400 (Regular) | 20px | Normal |
| `label-md` | 12px | 600 (SemiBold) | 16px | 0.05em (Uppercase) |
| `label-sm` | 11px | 500 (Medium) | 14px | Normal |

---

## 📐 4. Layout & Spacing Grid System

- **Fluid Grid**: Mobile-first responsive layout (390px mobile viewport base up to 1400px desktop max-width).
- **8pt Vertical Rhythm**:
  - `base`: 4px
  - `stack-sm`: 8px (element spacing)
  - `gutter-mobile`: 12px (card grid gap)
  - `stack-md`: 16px (card inner padding)
  - `margin-mobile`: 20px (page side margins)
  - `stack-lg`: 24px (component stack gap)
  - `section-gap`: 32px (major layout section separation)

---

## 🏔️ 5. Elevation & Elevation Layers

1. **Level 0 (Base)**: `#faf8ff` (Light) / `#0b0f19` (Dark) background.
2. **Level 1 (Cards)**: Surface containers with `0px 4px 12px rgba(15, 23, 42, 0.05)` subtle ambient shadow.
3. **Level 2 (Floating Action Items)**: Sticky filters and primary CTAs with `0px 8px 20px rgba(0, 82, 255, 0.25)` Athletic Blue glow shadow.
4. **Level 3 (Modal / Overlays)**: Backdrop blurs (`backdrop-filter: blur(20px)`).

---

## 🧱 6. UI Component Scaffolding Architecture

1. **`StitchNavbar`**: Top bar with brand emblem, search trigger, and user profile avatar.
2. **`StitchVenueCard`**: 16:9 image ratio thumbnail, rating badge, price tag (`/hr`), distance label, and sport category pills.
3. **`StitchTimeSlotChip`**: Interactive slot selection pill (Default: outline stroke, Selected: Athletic Blue filled).
4. **`StitchBookingDrawer`**: Bottom sheet / checkout drawer with summary and QR ticket code.
