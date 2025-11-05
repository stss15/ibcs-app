# P2-001: Hotspot Activity Audit

**Date:** 2025-11-05  
**Task:** P2-001 — Refactor Diagram/Image Hotspot Engines

## Current Implementation Analysis

### ImageHotspotActivity.jsx

**Inline Style Usage:**
- Lines 77-81: Uses inline styles for positioning
  ```jsx
  style={{
    left: `${hotspot.x}%`,
    top: `${hotspot.y}%`,
    transform: "translate(-50%, -50%)",
  }}
  ```

**Coordinate Source:**
- Coordinates come from `hotspot.x` and `hotspot.y` properties in segment data
- Values are percentages (0-100%)
- Coordinates are static (from segment definition, not calculated)

**Current CSS:**
- `.activity-hotspot__point` already has `position: absolute` (line 349 in Activities.css)
- Element is ready for CSS variable positioning

**Interactions:**
- Click to toggle selection
- Visual feedback via `is-selected` and `is-incorrect` classes
- No coordinate calculations needed

### DiagramLabelActivity.jsx

**Inline Style Usage:**
- Line 154: Uses inline styles for positioning
  ```jsx
  style={{ left: `${target.x}%`, top: `${target.y}%` }}
  ```

**Coordinate Source:**
- Coordinates come from `target.x` and `target.y` properties in segment data
- Values are percentages (0-100%)
- Coordinates are static (from segment definition, not calculated)

**Current CSS:**
- `.activity-diagram__target` already has `position: absolute` and `transform: translate(-50%, -50%)` (lines 647-648 in Activities.css)
- Element is ready for CSS variable positioning

**Interactions:**
- Click to assign labels
- Drag-and-drop support
- Visual feedback via `is-correct` and `is-incorrect` classes
- No coordinate calculations needed

## Refactoring Strategy

### CSS Variable Pattern

Replace inline `left` and `top` with CSS variables:
- `--hotspot-x: 50%` (or `--target-x` for diagram labels)
- `--hotspot-y: 30%` (or `--target-y` for diagram labels)

### Implementation Steps

1. **Update CSS** to use CSS variables for positioning
2. **Update ImageHotspotActivity.jsx** to set CSS variables instead of inline styles
3. **Update DiagramLabelActivity.jsx** to set CSS variables instead of inline styles
4. **Test** all interactions still work correctly

### Risk Assessment

**Low Risk:**
- Coordinates are static (from data, not calculated)
- No dynamic coordinate calculations
- CSS already supports absolute positioning
- Transform is already in CSS (not inline)

**Compatibility:**
- CSS variables are well-supported (all modern browsers)
- Percentage values work the same way
- CSP-compliant (CSS variables are allowed)

## Files to Modify

1. `frontend/src/components/segments/activities/Activities.css` — Add CSS variable support
2. `frontend/src/components/segments/activities/ImageHotspotActivity.jsx` — Replace inline styles
3. `frontend/src/components/segments/activities/DiagramLabelActivity.jsx` — Replace inline styles

## Expected Outcome

- No inline `style` attributes for positioning
- All positioning handled via CSS variables
- CSP-compliant implementation
- No functional changes (same user experience)

