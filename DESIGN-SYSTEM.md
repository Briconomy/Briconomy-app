# Briconomy Design System Implementation

## Overview
This document outlines the standardized design system implemented for the Briconomy application. The system ensures consistency, maintainability, and a better user experience across all modules.

## File Structure

### Core Design Files
- **`src/styles/design-tokens.css`**: All CSS custom properties (variables) for spacing, typography, colors, shadows, etc.
- **`src/styles/components.css`**: Reusable component classes following BEM-like methodology
- **`src/styles/global.css`**: Global styles updated to use design tokens

## Design Tokens

### Spacing Scale (8px base)
```css
--space-xs: 4px      /* Tiny gaps */
--space-sm: 8px      /* Small gaps, tight padding */
--space-md: 16px     /* Default spacing */
--space-lg: 24px     /* Section spacing */
--space-xl: 32px     /* Large sections */
--space-2xl: 48px    /* Page sections */
--space-3xl: 64px    /* Major sections */
```

### Typography Scale
```css
Font Sizes:
--text-xs: 0.75rem (12px)    /* Labels, captions */
--text-sm: 0.875rem (14px)   /* Small text */
--text-base: 1rem (16px)     /* Body text */
--text-lg: 1.125rem (18px)   /* Emphasized text */
--text-xl: 1.25rem (20px)    /* Small headings */
--text-2xl: 1.5rem (24px)    /* H3 */
--text-3xl: 2rem (32px)      /* H2, stat values */
--text-4xl: 2.5rem (40px)    /* H1 */

Font Weights:
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700

Line Heights:
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

### Color Palette
```css
Primary Colors:
--primary: #2c3e50       /* Dark blue-gray */
--secondary: #3498db     /* Bright blue */
--success: #27ae60       /* Green */
--warning: #f39c12       /* Orange */
--danger: #e74c3c        /* Red */
--info: #16a085          /* Teal */

Brand Colors:
--brand-primary: #162F1B  /* Dark green */
--brand-accent: #FF894D   /* Orange */

Neutrals:
--background: #f8f9fa     /* Light gray backgrounds */
--surface: #ffffff        /* Card backgrounds */
--surface-hover: #f0f4ff  /* Hover state */
--text-primary: #2c3e50   /* Main text */
--text-secondary: #6c757d /* Secondary text */
--border: #e9ecef         /* Borders */
--border-focus: #3498db   /* Focus state */

Status Colors:
--status-active: #27ae60
--status-pending: #f39c12
--status-inactive: #95a5a6
--status-overdue: #e74c3c
--status-paid: #27ae60
```

### Border Radius
```css
--radius-sm: 4px          /* Small elements, inputs */
--radius-md: 8px          /* Default - buttons, cards */
--radius-lg: 12px         /* Large cards, modals */
--radius-full: 9999px     /* Pills, badges */
```

### Shadows (Elevation)
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 2px 8px rgba(0,0,0,0.1)
--shadow-lg: 0 4px 16px rgba(0,0,0,0.12)
--shadow-xl: 0 8px 24px rgba(0,0,0,0.15)
```

### Component Heights
```css
--height-input: 40px
--height-button-sm: 32px
--height-button-md: 40px
--height-button-lg: 48px
--height-nav: 64px
--height-header: 60px
```

### Icon Sizes
```css
--icon-xs: 16px    /* Inline with text */
--icon-sm: 20px    /* Small buttons */
--icon-md: 24px    /* Default - nav icons */
--icon-lg: 32px    /* Feature icons */
--icon-xl: 48px    /* Hero icons */
```

### Z-Index Scale
```css
--z-dropdown: 1000
--z-sticky: 1100
--z-fixed: 1200
--z-modal-backdrop: 1300
--z-modal: 1400
--z-popover: 1500
--z-tooltip: 1600
```

### Transitions
```css
--transition-fast: 150ms ease
--transition-base: 200ms ease
--transition-slow: 300ms ease
```

## Component Classes

### Buttons
```html
<!-- Size variants -->
<button class="button button-sm button-primary">Small</button>
<button class="button button-md button-primary">Medium</button>
<button class="button button-lg button-primary">Large</button>

<!-- Style variants -->
<button class="button button-md button-primary">Primary</button>
<button class="button button-md button-secondary">Secondary</button>
<button class="button button-md button-ghost">Ghost</button>
<button class="button button-md button-danger">Danger</button>
<button class="button button-md button-brand">Brand</button>
```

### Cards
```html
<!-- Size variants -->
<div class="card card-sm">Small padding (16px)</div>
<div class="card card-md">Medium padding (24px)</div>
<div class="card card-lg">Large padding (32px)</div>

<!-- With hover effect -->
<div class="card card-md card-hover">Hover to elevate</div>

<!-- Stat card (standardized) -->
<div class="stat-card">
  <div class="stat-value">42</div>
  <div class="stat-label">Total Properties</div>
</div>
```

### Forms
```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="input" placeholder="Enter email">
  <div class="form-helper">We'll never share your email</div>
</div>

<div class="form-group">
  <label class="form-label">Description</label>
  <textarea class="textarea"></textarea>
</div>

<div class="form-group">
  <label class="form-label">Select</label>
  <select class="select">
    <option>Option 1</option>
  </select>
</div>
```

### Badges
```html
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-secondary">Secondary</span>

<!-- Status badges -->
<span class="status-badge status-paid">Paid</span>
<span class="status-badge status-overdue">Overdue</span>
<span class="status-badge status-pending">Pending</span>
```

### Layout Utilities
```html
<!-- Grid -->
<div class="grid grid-cols-2 gap-md">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>

<!-- Flexbox -->
<div class="flex items-center justify-between gap-md">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Typography Utilities
```html
<h1 class="text-4xl font-bold">Heading 1</h1>
<h2 class="text-3xl font-bold">Heading 2</h2>
<h3 class="text-2xl font-semibold">Heading 3</h3>
<p class="text-base text-primary">Body text</p>
<p class="text-sm text-secondary">Small secondary text</p>
<p class="text-xs text-secondary">Caption text</p>
```

## Standardizations Applied

### 1. Bottom Navigation
- **Height**: 64px (both mobile and desktop)
- **Padding**: 8px vertical
- **Icon size**: 24px (--icon-md)
- **Label size**: 12px (--text-xs)
- **Gap**: 4px between icon and label

### 2. Stat Cards
- **Padding**: 24px (--space-lg)
- **Border radius**: 12px (--radius-lg)
- **Value size**: 32px (--text-3xl)
- **Label size**: 14px (--text-sm)
- **Min height**: 120px
- **Gap**: 8px between value and label
- **Border left**: 3px solid (alternating brand colors)

### 3. Form Elements
- **Input height**: 40px (--height-input)
- **Padding**: 0 16px
- **Border radius**: 4px (--radius-sm)
- **Border**: 1px solid --border
- **Focus**: 3px shadow with border color change

### 4. Buttons
- **Small**: 32px height, 8px/16px padding
- **Medium**: 40px height, 12px/24px padding
- **Large**: 48px height, 16px/32px padding
- **Border radius**: 8px (--radius-md)
- **Font weight**: 600 (--font-semibold)

### 5. Tables
- **Header height**: 48px
- **Row height**: 56px
- **Header font**: 14px (--text-sm), weight 600
- **Cell font**: 16px (--text-base), weight 400
- **Padding**: 16px/8px
- **Border**: 1px solid --border

### 6. Modals
- **Max width**: 400px
- **Border radius**: 12px (--radius-lg)
- **Shadow**: --shadow-xl
- **Padding**: 24px (--space-lg)
- **Z-index**: 1300 (backdrop), 1400 (modal)

## Usage Guidelines

### 1. Spacing
Always use design token variables for consistency:
```css
.my-element {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  gap: var(--space-sm);
}
```

### 2. Typography
Use token variables for font sizes and weights:
```css
.heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}
```

### 3. Colors
Reference color tokens instead of hex codes:
```css
.card {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

### 4. Component Classes
Prefer using pre-built component classes:
```html
<!-- Good -->
<button class="button button-md button-primary">Submit</button>

<!-- Avoid custom styling -->
<button style="padding: 12px 24px; background: #3498db;">Submit</button>
```

## Migration Path

### For Existing Components:
1. Replace hardcoded pixel values with spacing tokens
2. Replace hardcoded colors with color tokens
3. Use standardized component classes where possible
4. Update font sizes to use typography scale
5. Apply consistent border radius values

### Example Migration:
```css
/* Before */
.my-card {
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 14px;
  color: #6c757d;
}

/* After */
.my-card {
  padding: var(--space-lg);
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
```

## Benefits

1. **Consistency**: Unified look and feel across all modules
2. **Maintainability**: Change once in tokens, apply everywhere
3. **Scalability**: Easy to add new components following the system
4. **Performance**: Reduced CSS duplication
5. **Accessibility**: Standardized focus states and color contrasts
6. **Developer Experience**: Clear naming conventions and reusable classes

## Next Steps

1. ✅ Design tokens created
2. ✅ Component library created
3. ✅ Global styles updated
4. ✅ Bottom navigation standardized
5. ⏳ Audit remaining module-specific styles
6. ⏳ Update shared components (StatCard, ActionCard, etc.)
7. ⏳ Standardize forms across all pages
8. ⏳ Create component documentation/Storybook

## Notes

- All measurements follow an 8px grid system for spacing
- Typography follows a modular scale (1.25 ratio)
- Color palette provides semantic meaning (success, warning, danger)
- Z-index scale prevents overlap issues
- Transition timing creates consistent motion design
- Mobile-first approach with responsive utilities
