# JetBrains Mono Font Implementation Plan

## Overview
Replace all fonts in the Briconomy application with JetBrains Mono, a modern monospace typeface designed for developers.

## Current Font Usage Analysis

### Files Using Fonts:
1. **`public/index.html`** - Line 28: `font-family: monospace` (inline error message)
2. **`src/styles/global.css`** - Line 113: `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;` (body)
3. **`src/styles/global.css`** - Line 539: `font-family: system-ui, -apple-system, sans-serif;` (landing container)
4. **`src/styles/components.css`** - Lines 10, 158, 186, 207: `font-family: inherit;` (buttons, inputs, textareas, selects)
5. **`src/components/AccessLogs.tsx`** - Line 430: `fontFamily: 'monospace'` (inline style)
6. **`src/components/AnnouncementSystem.tsx`** - Line 1062: `fontFamily: 'inherit'` (inline style)

## Implementation Strategy

### Phase 1: Font Integration
**Objective:** Add JetBrains Mono font to the application

**Option A: Google Fonts CDN (Recommended)**
- Add Google Fonts link to `public/index.html`
- Fast loading, cached by browsers
- No local file management
- Supports variable weights

**Option B: Self-Hosted**
- Download font files from JetBrains
- Add to `public/fonts/` directory
- Define @font-face in CSS
- Better for offline PWA functionality

**Decision:** Use Option A (Google Fonts) for simplicity and performance

### Phase 2: Design Token Update
**Objective:** Add font family to design tokens

**File:** `src/styles/design-tokens.css`

**Add:**
```css
:root {
  /* Font Families */
  --font-family-primary: 'JetBrains Mono', monospace;
  --font-family-mono: 'JetBrains Mono', monospace;
  --font-family-fallback: monospace;
  
  /* Existing tokens remain... */
}
```

### Phase 3: Global CSS Updates
**Objective:** Replace all font-family declarations with design tokens

**Files to Update:**
1. **`src/styles/global.css`**
   - Line 113: `body { font-family: var(--font-family-primary); }`
   - Line 539: `.landing-container { font-family: var(--font-family-primary); }`

2. **`src/styles/components.css`**
   - Lines 10, 158, 186, 207: Keep `font-family: inherit;` (will inherit from body)

### Phase 4: Component Inline Style Updates
**Objective:** Remove inline font-family declarations or update to use JetBrains Mono

**Files to Update:**
1. **`src/components/AccessLogs.tsx`**
   - Line 430: Change `fontFamily: 'monospace'` to `fontFamily: 'JetBrains Mono, monospace'`
   - Better: Remove inline style and use CSS class

2. **`src/components/AnnouncementSystem.tsx`**
   - Line 1062: `fontFamily: 'inherit'` is fine (will inherit JetBrains Mono from body)

3. **`public/index.html`**
   - Line 28: Update error message style to use JetBrains Mono

### Phase 5: Typography Adjustments
**Objective:** Fine-tune spacing and sizes for monospace font

**Considerations:**
- Monospace fonts are typically wider than sans-serif
- May need to adjust:
  - Letter spacing (reduce slightly)
  - Line heights (may need slight increase)
  - Container widths (if text overflows)
  - Button padding (to accommodate wider characters)

**Potential Adjustments:**
```css
:root {
  /* Letter spacing adjustments */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
}

body {
  font-family: var(--font-family-primary);
  letter-spacing: var(--letter-spacing-normal);
}

.stat-label {
  letter-spacing: 0.3px; /* Reduced from 0.5px */
}
```

### Phase 6: Testing & Validation
**Objective:** Ensure font renders correctly across all pages

**Test Cases:**
1. ✅ Landing page - titles, buttons, text
2. ✅ Login page - form inputs, labels
3. ✅ Admin Dashboard - stats, tables, buttons
4. ✅ Manager Dashboard - property cards, data tables
5. ✅ Caretaker Dashboard - task lists, schedules
6. ✅ Tenant Dashboard - payments, lease info
7. ✅ Forms - all input fields, selects, textareas
8. ✅ Modals - confirmation dialogs, image viewers
9. ✅ Navigation - top nav, bottom nav
10. ✅ Tables - data tables, payment history
11. ✅ Charts - labels, legends, tooltips
12. ✅ Mobile view - responsive text sizing
13. ✅ Error messages - inline validation
14. ✅ Loading states - skeleton screens

## Implementation Steps (Execution Order)

### Step 1: Add Google Fonts Link
**File:** `public/index.html`
**Location:** Inside `<head>` tag, before stylesheet links
**Code:**
```html
<!-- JetBrains Mono Font -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
```

### Step 2: Update Design Tokens
**File:** `src/styles/design-tokens.css`
**Location:** Top of :root, before spacing tokens
**Code:**
```css
:root {
  --font-family-primary: 'JetBrains Mono', monospace;
  --font-family-mono: 'JetBrains Mono', monospace;
  
  /* Existing tokens... */
}
```

### Step 3: Update Body Font
**File:** `src/styles/global.css`
**Line:** 113
**Change:** 
```css
/* From */
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* To */
font-family: var(--font-family-primary);
```

### Step 4: Update Landing Container Font
**File:** `src/styles/global.css`
**Line:** 539
**Change:**
```css
/* From */
font-family: system-ui, -apple-system, sans-serif;

/* To */
font-family: var(--font-family-primary);
```

### Step 5: Update AccessLogs Component
**File:** `src/components/AccessLogs.tsx`
**Line:** 430
**Change:**
```tsx
/* From */
fontFamily: 'monospace'

/* To */
fontFamily: 'JetBrains Mono, monospace'
```

### Step 6: Update Error Message Font (index.html)
**File:** `public/index.html`
**Line:** 28
**Change:**
```html
/* From */
font-family: monospace;

/* To */
font-family: 'JetBrains Mono', monospace;
```

### Step 7: Adjust Letter Spacing (if needed)
**File:** `src/styles/global.css`
**Add after letter-spacing properties:**
```css
.stat-label {
  letter-spacing: 0.3px; /* Reduced from 0.5px for monospace */
}
```

## Potential Issues & Solutions

### Issue 1: Text Overflow
**Problem:** Monospace fonts are wider, text may overflow containers
**Solution:** 
- Adjust container widths
- Use `word-break: break-word` where needed
- Reduce font sizes slightly if necessary

### Issue 2: Button Text Too Wide
**Problem:** Button text may not fit with monospace font
**Solution:**
- Increase button padding
- Reduce font size by 1-2px
- Use shorter button labels where appropriate

### Issue 3: Table Column Alignment
**Problem:** Table columns may misalign with monospace
**Solution:**
- Adjust column widths
- Use fixed-width columns for numbers
- Test with sample data

### Issue 4: Mobile Responsiveness
**Problem:** Wider text may break mobile layouts
**Solution:**
- Test all responsive breakpoints
- Adjust mobile font sizes if needed
- Use ellipsis for overflow text

### Issue 5: Loading Performance
**Problem:** Additional font file increases page load time
**Solution:**
- Use `font-display: swap` (included in Google Fonts URL)
- Preconnect to fonts.googleapis.com
- Consider font subsetting if needed

## Rollback Plan

If JetBrains Mono causes issues:

1. **Quick Rollback:**
   - Remove Google Fonts link from `index.html`
   - Change design token back to: `--font-family-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`
   
2. **Alternative Font:**
   - Try 'Roboto Mono' or 'Fira Code' as alternatives
   - Both are monospace fonts with good readability

## Success Criteria

✅ Font loads successfully across all browsers
✅ No text overflow issues on desktop
✅ No text overflow issues on mobile
✅ All forms remain usable and readable
✅ Tables display correctly with data
✅ Navigation menus fit properly
✅ Buttons display text without wrapping
✅ Performance remains acceptable (<100ms font load)
✅ Accessibility maintained (contrast ratios, readability)
✅ PWA offline functionality works

## Estimated Time

- **Phase 1-2:** 10 minutes (Font integration + design tokens)
- **Phase 3-4:** 15 minutes (CSS updates + component updates)
- **Phase 5:** 20 minutes (Typography adjustments)
- **Phase 6:** 30 minutes (Testing all pages)

**Total:** ~75 minutes (1.25 hours)

## Notes

- JetBrains Mono is optimized for code but works well for UI
- It has excellent readability and character distinction
- The font includes ligatures (can be disabled if needed)
- Supports multiple weights: 400, 500, 600, 700
- Includes italic variants
- Licensed under OFL (free for all uses)

## Benefits

✅ **Consistency:** Single font across entire application
✅ **Readability:** Excellent character distinction (0 vs O, 1 vs l vs I)
✅ **Modern:** Contemporary monospace aesthetic
✅ **Developer-friendly:** Designed for code/data viewing
✅ **Professional:** Clean, technical appearance
✅ **Performance:** Well-optimized font files
