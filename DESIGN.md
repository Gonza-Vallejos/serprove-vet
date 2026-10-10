# Design Identity: Serprove Vet

## The Visual World
A clean, premium, and highly utilitarian design system that balances B2B professionalism with a modern, dynamic web presence. The design is deliberately kept stable and predictable to ensure maximum usability for veterinary professionals who use the platform as an operational tool.

## Core Directives
1. **Preserve the Identity:** The current visual identity (colors, fonts, shadows) is locked in. Do not redesign, rewrite, or alter the core aesthetics without explicit instruction. 
2. **Predictable Operations:** The admin panel (Operate mode) prioritizes scanability, high contrast, and dense information layout over flashy expression.
3. **Persuasive Landing:** The public-facing site (Persuade mode) uses the established brand colors and typography to build trust quickly.

## Design Tokens (Locked)
- **Primary Color:** Vibrant Magenta (`#E91E63`) / Hover: `#C2185B`
- **Secondary Color:** Dark Navy/Purple (`#1A1A2E`)
- **Backgrounds:** Soft Gray (`#F8F9FA`) for the body, White (`#FFFFFF`) for surfaces/cards.
- **Text:** Dark Gray (`#333333`) for primary text, Light Gray (`#666666`) for secondary text.
- **Typography:**
  - Headings: `Outfit`, sans-serif (Weights: 300, 400, 600, 800)
  - Body: `Inter`, sans-serif (Weights: 400, 500, 700)
- **Shapes:**
  - Border Radii: `8px` (sm), `12px` (md), `20px` (lg), `9999px` (pill for buttons)
  - Shadows: Subtle dropshadows for cards (`0 2px 4px rgba(0,0,0,0.05)`), distinct elevation on hover (`0 15px 25px rgba(233, 30, 99, 0.2)`).
- **Motion:** Standardized cubic-bezier transitions (`all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`). Hover states elevate cards and buttons smoothly.

## Constraints
- **Icons:** Use `lucide-react`. Ensure names exactly match the library's exports.
- **Layout:** Standard 1200px container width. Responsive behavior must prioritize readability on mobile devices.
- **No Tailwind:** Rely exclusively on the vanilla CSS variables and utility classes defined in `index.css`.
