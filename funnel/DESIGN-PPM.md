---
name: Pro Pro Manager
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#574140'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8b7170'
  outline-variant: '#debfbe'
  surface-tint: '#a8363a'
  primary: '#5f000e'
  on-primary: '#ffffff'
  primary-container: '#801820'
  on-primary-container: '#ff8d8b'
  inverse-primary: '#ffb3b0'
  secondary: '#5d5f5e'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddc'
  on-secondary-container: '#5f6161'
  tertiary: '#2a2c2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#404242'
  on-tertiary-container: '#adaeae'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b0'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#871e25'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c7c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Poppins
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-md:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 80px
---

## Brand & Style

This design system captures the essence of high-end Roman hospitality: a sophisticated blend of historical gravitas and contemporary comfort. The brand personality is authoritative yet deeply welcoming, positioning itself as a knowledgeable local concierge for premium short-term rentals.

The visual style follows a **Modern Corporate** direction with **Minimalist** influences. It prioritizes clarity and high-quality imagery of Roman interiors, using white space to evoke the feeling of a spacious, sunlit apartment. The aesthetic avoids unnecessary flourishes, relying on a bold primary color and refined typography to communicate trust and professional property management. The goal is to make the user feel secure in their investment while excited about the "Eternal City" experience.

## Colors

The palette is anchored by "Vatican Red" (#801820), a deep, regal oxblood that evokes Roman history and luxury. This primary color is used for calls to action, logos, and critical brand moments. 

To balance the intensity of the red, we use a monochromatic and near-neutral secondary and tertiary palette to create a high-end, gallery-like atmosphere.
- **Primary:** #801820 is used for high-impact elements.
- **Secondary:** A bright, off-white "Travertine" (#F9F9F8) provides a sophisticated, warm-toned alternative to pure white for large sections.
- **Tertiary:** A clean "Tiber Gray" (#F7F7F7) is used for subtle UI layering and background distinctions.
- **Neutral:** A deep charcoal (#1A1A1A) is used for typography to ensure better readability than pure black, while the neutral backgrounds provide the crisp, clean canvas necessary for a professional hospitality service.

## Typography

This design system utilizes a modern pairing of geometric and humanist sans-serifs to evoke a "Contemporary Rome" aesthetic.

**Poppins** is used for headlines. Its clean, geometric forms provide a modern, architectural feel that suggests precision and premium service. It should be used for property titles, section headers, and high-level value propositions.

**Inter** serves as the functional workhorse for body copy and UI elements. Its neutrality ensures that the technical details of rental agreements and property features are highly legible and accessible. Labels and navigation items should use Inter in medium or semibold weights with slight tracking (letter spacing) for a polished, professional appearance.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to maintain a controlled, editorial feel, while transitioning to a fluid single-column layout on mobile.

A 12-column grid is used for desktop (1200px max width) with generous gutters (24px). Spacing is used to create "breathing room" between property listings and high-quality photography. Section vertical gaps are intentionally large (80px+) to distinguish different service tiers (management vs. booking). 

On mobile, margins are reduced to 16px to maximize the screen real estate for property images, which are the primary driver of engagement.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. This maintains a clean, professional "SaaS-meets-Luxury" look.

- **Level 0 (Base):** Off-white "Travertine" (#F9F9F8) for the main page background to provide warmth.
- **Level 1 (Cards):** Property cards use a subtle "Tiber Gray" (#F7F7F7) background or a very thin 1px border with no shadow.
- **Level 2 (Interactive):** Upon hover, elements may gain a soft, ambient shadow (10% opacity of the primary red) to indicate interactivity without breaking the flat aesthetic.
- **Overlays:** Navigation menus and modals use a backdrop blur (Glassmorphism) to keep the user grounded in the context of the property they were viewing.

## Shapes

The shape language is **Pill-shaped (1rem)**. This design system uses generous rounding to create an approachable, friendly, and modern hospitality experience that feels safe and contemporary.

- **Standard Elements:** Buttons, input fields, and small tags use a 1rem (16px) radius.
- **Large Containers:** Property thumbnails and cards use a 2rem (32px) radius to feel welcoming and soft.
- **Strictness:** Despite the roundness, icons and content should maintain a clear grid alignment to preserve the professional "Roman" structural integrity.

## Components

### Buttons
- **Primary:** Solid "Vatican Red" (#801820) with white Inter Semibold text. High contrast is essential for "Book Now" or "Contact Us" actions. These use a pill-shaped (1rem) radius.
- **Secondary:** Outlined 1px in #801820 with red text. Used for "View Details" or secondary navigation.

### Input Fields
- Use a light gray background (#F7F7F7) with a fully rounded pill-shape and a subtle border that turns primary red on focus. This mimics a minimalist, modern form style.

### Cards (Property Listings)
- Images should take up the top 60% of the card with generous 2rem corner rounding.
- The footer of the card should use Poppins for the price and Inter for the location and amenities.

### Chips & Tags
- Used for property features (e.g., "Air Conditioning", "Near Pantheon"). These should be fully rounded pill-shaped labels in Inter with a light "Tiber Gray" background.

### Navigation
- A "sticky" top bar with a transparent background that transitions to solid white on scroll. The logo should always be the focal point on the left.