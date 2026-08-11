---
name: Quiet Workshop
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#554336'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#887364'
  outline-variant: '#dbc2b0'
  surface-tint: '#904d00'
  primary: '#8d4b00'
  on-primary: '#ffffff'
  primary-container: '#b15f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb77d'
  secondary: '#555f6d'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f1'
  on-secondary-container: '#596372'
  tertiary: '#974312'
  on-tertiary: '#ffffff'
  tertiary-container: '#b65b29'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#d9e3f4'
  secondary-fixed-dim: '#bdc7d8'
  on-secondary-fixed: '#121c28'
  on-secondary-fixed-variant: '#3e4755'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#341000'
  on-tertiary-fixed-variant: '#7a3000'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system embodies a "Quiet Workshop" aesthetic—a space designed for deep focus, clarity, and intentionality. It targets professionals who value a serene digital environment that stays out of the way while remaining distinctly elegant.

The style is a blend of **Soft Minimalism** and **Modern Editorial**. It prioritizes heavy whitespace, a sophisticated light-mode palette, and a refined typographic hierarchy. The emotional response should be one of calm productivity, reliability, and precision. Surfaces are airy and light, avoiding the harshness of pure white in favor of soft, tinted off-whites that reduce eye strain during long sessions.

## Colors
The palette is rooted in a light, monochromatic foundation of off-whites and cool grays to create an expansive, airy feel.
- **Primary (Amber):** Used sparingly for key actions, status indicators, and subtle accents to provide warmth without overwhelming the workspace.
- **Surface Strategy:** Use `#F8F9FA` for main page backgrounds and `#F1F3F4` for secondary containers or sidebars to create subtle tonal separation.
- **Contrast:** Typography is set in deep grays (`#1F2937`) rather than pure black to maintain a softer, high-end editorial look while ensuring AAA accessibility.

## Typography
This design system utilizes a "Serif-Display, Sans-Body" pairing. **Source Serif 4** provides an authoritative, literary feel for headlines, evoking the "Workshop" narrative of craftsmanship. **Hanken Grotesk** is used for body text and UI labels to provide modern clarity and technical precision.

- **Headlines:** Use tighter letter-spacing and substantial line-height to maintain an editorial rhythm.
- **Body:** Generous line-height (1.6) is mandatory to ensure readability against light surfaces.
- **Labels:** Small caps or increased letter spacing should be applied to `label-md` to differentiate functional UI text from content.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to create a centered, focused "canvas" area, while transitioning to a **Fluid Grid** on mobile.

- **Desktop:** 12-column grid, 1140px max-width, 24px gutters.
- **Tablet:** 8-column grid, 24px margins.
- **Mobile:** 4-column grid, 16px margins.

Spacing should be generous. Use `xl` (80px) padding for section vertical spacing to reinforce the "airy" brand promise. Elements should feel like they have "room to breathe," avoiding cramped clusters.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. Instead of heavy shadows, the design system uses "Light Diffusion."

- **Level 0 (Base):** `#FDFDFD` (The canvas).
- **Level 1 (Surface):** `#F1F3F4` (Sidebars, navigation bars). No shadow, just a subtle 1px border in `#E5E7EB`.
- **Level 2 (Cards/Popovers):** White background with a soft, multi-layered shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`.
- **Interaction:** On hover, cards should lift slightly using a more pronounced but still very soft shadow, rather than changing color.

## Shapes
The shape language is **Soft** and precise. A subtle 0.25rem (4px) corner radius is the standard for most UI components (buttons, inputs). Larger containers like cards use 0.5rem (8px).

This low-radius approach maintains a professional, structured feel that aligns with the "Workshop" concept, avoiding the overly "bubbly" look of high-radius systems while being more approachable than sharp 0px corners.

## Components
- **Buttons:** Primary buttons use the Amber (#D97706) background with white text. Secondary buttons use a transparent background with a 1px border of `#D1D5DB` and `#1F2937` text.
- **Input Fields:** Soft gray background (`#F1F3F4`) with no border in its rest state. On focus, a 1px Amber border and a soft Amber outer glow (2px).
- **Cards:** White background, Level 2 shadow, and 0.5rem roundedness. Use `headline-md` for card titles.
- **Chips:** Small, pill-shaped elements with `#F1F3F4` background and `label-sm` typography. No borders.
- **Lists:** Separated by thin `#E5E7EB` dividers. Use generous vertical padding (16px) for list items to maintain the airy aesthetic.
- **Selection Controls:** Checkboxes and radios use the Amber primary color for the checked state. Unchecked states should be a subtle gray outline.
