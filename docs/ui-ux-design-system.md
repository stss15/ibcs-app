# UI/UX Design System - IBCS App

## Overview

This document describes the modernized UI/UX design system implemented for the IBCS learning platform. The system is specifically designed to engage students aged 11-18 while maintaining professional aesthetics for teachers.

## Design Philosophy

### Core Principles

1. **Gamification First** - Learning should feel rewarding and fun
2. **Visual Hierarchy** - Important information should stand out
3. **Micro-interactions** - Small animations provide feedback
4. **Progressive Disclosure** - Complexity is revealed gradually
5. **Consistency** - Patterns are reusable and predictable

### Inspiration

The design draws inspiration from:
- **Revision Dojo** - Gamified learning elements
- **Kognity** - Clean, modern educational interface
- **LeetCode** - Professional code presentation and progress tracking

## Design Tokens

### Color System

The design preserves the school's house colors while extending them with a modern palette:

```css
/* House Colors (Preserved) */
--cs-white: #ffffff
--cs-black: #050d31
--cs-blue: #0c297c (Primary brand color)
--cs-gold: #b28541
--cs-muted: #4c597c
--cs-surface: #f5f6fb

/* Extended Palette */
--cs-blue-light: #3275ff
--cs-blue-lighter: #63b5ff
--color-success: #10b981
--color-warning: #f59e0b
--color-error: #ef4444
--color-xp-gold: #fbbf24
--color-streak-fire: #f97316
```

### Spacing System

```css
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
--space-2xl: 3rem (48px)
```

### Border Radius

```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-full: 999px
```

### Shadows

```css
--shadow-sm: Subtle depth
--shadow-md: Standard elevation
--shadow-lg: Prominent cards
--shadow-xl: Hero elements
--shadow-2xl: Maximum emphasis
```

### Transitions

```css
--transition-fast: 150ms (Quick feedback)
--transition-base: 250ms (Standard interactions)
--transition-slow: 350ms (Dramatic reveals)
--transition-bounce: 500ms (Playful animations)
```

### 8. Modal Component

**Features:**
- Focus trap (keeps focus within modal)
- Escape key handling
- Backdrop click handling
- Body scroll lock when open
- ARIA attributes (role="dialog", aria-modal, aria-labelledby)
- Token-driven styling
- Smooth animations
- Multiple sizes (sm, md, lg, full)
- Backdrop rendered as an accessible button so pointer users can dismiss without impacting keyboard focus

**Usage:**
```jsx
import Modal from './components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
  closeOnBackdropClick={true}
  closeOnEscape={true}
>
  <p>Modal content goes here</p>
</Modal>
```

**Props:**
- `isOpen` (boolean) - Whether modal is open
- `onClose` (function) - Callback when modal should close
- `title` (string, optional) - Modal title (shown in header)
- `children` (React.ReactNode) - Modal content
- `size` (string) - 'sm' | 'md' | 'lg' | 'full' (default: 'md')
- `closeOnBackdropClick` (boolean) - Close on backdrop click (default: true)
- `closeOnEscape` (boolean) - Close on Escape key (default: true)

### 9. Accordion Component

**Features:**
- Single/multiple expand modes
- Keyboard navigation (Arrow keys, Enter, Space, Home, End)
- ARIA attributes (aria-expanded, aria-controls)
- Smooth expand/collapse animations
- Token-driven styling

**Usage:**
```jsx
import Accordion from './components/ui/Accordion';

<Accordion
  items={[
    { id: '1', title: 'Section 1', content: <p>Content 1</p> },
    { id: '2', title: 'Section 2', content: <p>Content 2</p> },
  ]}
  multiple={false}
  defaultExpanded={['1']}
/>
```

**Props:**
- `items` (Array) - Array of items: [{ id, title, content }]
- `multiple` (boolean) - Allow multiple items open (default: false)
- `defaultExpanded` (Array|string) - ID(s) of items to expand by default

### 10. FeedbackPanel Component

**Features:**
- Success/error/warning/info variants
- Token-driven styling with status colors
- ARIA attributes (role="status", aria-live="polite")
- Smooth slide-in animation on mount
- Icon indicators (✓ for success, ✗ for error, ⚠ for warning)
- Accessible status announcements

**Usage:**
```jsx
import FeedbackPanel from './components/ui/FeedbackPanel';

<FeedbackPanel tone="success">
  Great work!
</FeedbackPanel>

<FeedbackPanel tone="error">
  Please try again
</FeedbackPanel>

<FeedbackPanel tone="warning">
  Check your answers
</FeedbackPanel>

<FeedbackPanel tone="info">
  Useful information
</FeedbackPanel>
```

**Props:**
- `tone` (string) - 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `children` (React.ReactNode) - Feedback message content
- `animated` (boolean) - Enable animation on mount (default: true)
- `className` (string) - Additional CSS classes

### 11. ButtonGroup Component

**Features:**
- Horizontal/vertical layouts
- Token-driven spacing
- Flexible alignment options
- Responsive behavior (wraps on mobile)
- Accessible role="group" attribute
- Keyboard navigation support

**Usage:**
```jsx
import ButtonGroup from './components/ui/ButtonGroup';

<ButtonGroup align="start">
  <button>Cancel</button>
  <button>Submit</button>
</ButtonGroup>

<ButtonGroup align="end" layout="vertical">
  <button>Option 1</button>
  <button>Option 2</button>
</ButtonGroup>

<ButtonGroup align="space-between">
  <button>Back</button>
  <button>Next</button>
</ButtonGroup>
```

**Props:**
- `children` (React.ReactNode) - Button elements
- `layout` (string) - 'horizontal' | 'vertical' (default: 'horizontal')
- `align` (string) - 'start' | 'center' | 'end' | 'space-between' (default: 'start')
- `className` (string) - Additional CSS classes

## Key Components

### 1. Enhanced Tables

**Features:**
- Sticky headers for long scrolling
- Zebra striping for readability
- Hover effects for row highlighting
- Responsive horizontal scrolling
- Modern gradient headers

**Usage:**
```jsx
import { EnhancedTable } from './components/segments/EnhancedComponents';

<EnhancedTable
  caption="Python Data Types"
  columns={['Type', 'Description', 'Example']}
  rows={[
    ['int', 'Whole numbers', '42'],
    ['str', 'Text data', '"Hello"']
  ]}
/>
```

### 2. Keyword Definition Cards

**Features:**
- Side accent bar on hover
- Icon support
- Gradient backgrounds
- Smooth slide animations

**Visual Design:**
- Clean white/blue gradient background
- Bold term headings
- Left border appears on hover
- Horizontal slide on interaction

**Usage:**
```jsx
import { KeywordCard } from './components/segments/EnhancedComponents';

<KeywordCard
  term="Algorithm"
  definition="Step-by-step procedure for solving a problem"
  icon="🧮"
/>
```

### 3. Callouts / Info Boxes

**Types:**
- **Info** (ℹ️) - General information
- **Tip** (💡) - Helpful suggestions
- **Warning** (⚠️) - Cautions
- **Success** (✓) - Positive confirmations
- **Error** (⚠️) - Critical notices

**Usage:**
```jsx
import { Callout } from './components/segments/EnhancedComponents';

<Callout type="tip" title="Pro Tip">
  Use descriptive variable names to make your code more readable!
</Callout>
```

### 4. Progress Indicators

**Features:**
- Animated shimmer effect
- Gradient fill
- Smooth percentage transitions
- Clear numerical feedback

**Usage:**
```jsx
import { ProgressIndicator } from './components/segments/EnhancedComponents';

<ProgressIndicator
  current={7}
  total={10}
  label="Stage Progress"
/>
```

### 5. Achievement Badges

**Features:**
- Locked/unlocked states
- Icon animations
- Hover effects (unlocked only)
- Grayscale filter for locked badges

**Usage:**
```jsx
import { AchievementBadge } from './components/segments/EnhancedComponents';

<AchievementBadge
  icon="🏆"
  title="First Steps"
  description="Complete your first lesson"
  unlocked={true}
/>
```

### 6. XP Notifications

**Features:**
- Fixed position toast
- Slide-in animation
- Auto-dismiss option
- Celebratory styling

**Usage:**
```jsx
import { XPNotification } from './components/segments/EnhancedComponents';

<XPNotification
  xpGained={50}
  message="Great work!"
  onClose={() => setShowNotification(false)}
/>
```

### 7. Streak Indicators

**Features:**
- Dynamic fire emoji (1-3 🔥 based on streak)
- Gradient numbers
- Animated flame
- Encouraging design

**Usage:**
```jsx
import { StreakIndicator } from './components/segments/EnhancedComponents';

<StreakIndicator
  streak={7}
  label="Day Streak"
/>
```

## Animations

### Standard Animations

All animations are defined in `global.css` and can be applied via utility classes:

```html
<div class="animate-fade-in">Fades in smoothly</div>
<div class="animate-slide-in-right">Slides from right</div>
<div class="animate-bounce">Bounces once</div>
<div class="animate-pulse">Pulses continuously</div>
```

### Available Animations

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `fadeIn` | Smooth appearance | 250ms |
| `fadeInUp` | Upward fade | 350ms |
| `scaleIn` | Zoom in | 250ms |
| `slideInRight` | Horizontal entry | 250ms |
| `bounce` | Success feedback | 600ms |
| `pulse` | Attention grabber | 2s infinite |
| `wiggle` | Error indication | 500ms |
| `shimmer` | Loading state | 2s infinite |
| `glow` | Highlight effect | Infinite |

## Interactive States

### Hover Effects

```html
<div class="hover-lift">Lifts up on hover</div>
<div class="hover-glow">Glows on hover</div>
```

### Active States

All interactive elements scale slightly (0.98) on click for tactile feedback.

## Quiz & Activity Styling

### Micro-Quizzes

**Enhancements:**
- Top border indicator (blue when idle, green/red when answered)
- Larger, more clickable options
- Checkmark/X icons on correct/incorrect
- Pulse animation on success
- Wiggle animation on error
- Emoji celebration on perfect score

### Activities

**Ordering Activity:**
- Drag handle indicator (⋮⋮)
- Hover lift effect
- Grab/grabbing cursor states
- Bounce animation on correct placement
- Success checkmark overlay

**Classification Activity:**
- Gradient button backgrounds
- Selection state with color shift
- Category bins with visual feedback
- Smooth token movements

**Code Completion:**
- Dark code blocks with syntax highlighting
- Inline input fields with clear borders
- Success/error background colors
- Hint support

## XP & Gamification

### XP Card Redesign

**Features:**
- Gradient gold background
- Animated sparkle icon (✨)
- Large, gradient XP numbers
- Shimmer effect on progress bar
- Level badge with gold gradient

**Visual Hierarchy:**
1. Level badge (top left)
2. XP count (large, center)
3. Progress bar (middle)
4. Progress summary (bottom)

### Stage Navigation

**Enhanced States:**
- **Active**: Blue border, highlighted background
- **Complete**: Green accent, checkmark badge
- **Locked**: Grayscale, lock icon, reduced opacity
- **Hover**: Slide effect with left border reveal

## Dashboard Improvements

### Student Dashboard

**Enhancements:**
- Animated circular progress rings
- Gradient stroke on progress indicators
- Hover effects on metric cards
- Top accent bars on cards
- Larger, more readable numbers with gradients

### Year 7 Map

**Visual Learning Pathway:**
- Numbered lesson badges with gradients
- State-specific styling:
  - Complete: Green with checkmark
  - Current: Yellow with bounce animation
  - Ready: Blue with wiggle animation
  - Locked: Gray with lock icon
- Hover effects with slide animation
- Left border reveal on interaction

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

- Stacked layouts for dashboards
- Full-width XP notifications
- Single-column stage navigation
- Touch-friendly tap targets (min 44x44px)

## Accessibility

### Focus States

All interactive elements have visible focus indicators:
```css
*:focus-visible {
  outline: 2px solid var(--cs-blue-light);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### Semantic HTML

- Proper heading hierarchy
- ARIA labels on interactive elements
- Role attributes for custom components
- Alt text for images

### Color Contrast

All text meets WCAG AA standards:
- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear visual indicators

## Content Authoring Guidelines

### Tables

**Best Practices:**
- Keep tables under 6 columns for mobile
- Use clear, concise headers
- Include units in headers, not cells
- Use code blocks for technical terms

### Keyword Definitions

**Best Practices:**
- One concept per card
- Use icons to categorize (optional)
- Keep definitions under 2 sentences
- Link to detailed explanations if needed

### Callouts

**When to Use:**
- Tips: Helpful shortcuts or tricks
- Warnings: Common mistakes or pitfalls
- Info: Background context
- Success: Confirmation of correct understanding

## Future Enhancements

### Planned Features

1. **Confetti Animation** - For major achievements
2. **Level Up Modal** - Celebratory screen on level advancement
3. **Daily Challenges** - Rotating quick-fire quizzes
4. **Leaderboards** - Class-based rankings (opt-in)
5. **Custom Avatars** - Student profile personalization
6. **Dark Mode** - Alternative color scheme
7. **Sound Effects** - Optional audio feedback (toggle)

### Component Roadmap

- [x] Accordion component
- [x] FeedbackPanel component
- [x] ButtonGroup component
- [ ] Timeline component
- [ ] Comparison cards
- [ ] Code diff viewer
- [ ] Interactive diagrams
- [ ] Video embed wrapper
- [ ] Quiz timer component

## Maintenance

### Adding New Animations

1. Define keyframes in `global.css`
2. Create utility class (e.g., `.animate-new-animation`)
3. Document in this guide
4. Add to relevant components

### Creating New Components

1. Build in `EnhancedComponents.jsx`
2. Style in `EnhancedComponents.css`
3. Export from component file
4. Document usage in this guide
5. Update relevant content files

### Updating Design Tokens

1. Modify CSS variables in `global.css`
2. Test across all pages
3. Update this documentation
4. Notify content authors

## Testing Checklist

When updating UI components:

- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768-1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify keyboard navigation
- [ ] Check screen reader compatibility
- [ ] Validate color contrast
- [ ] Test animations in slow motion
- [ ] Verify with reduced motion preference
- [ ] Check in different browsers (Chrome, Firefox, Safari)

## Support

For questions or issues with the design system:
1. Check this documentation
2. Review component examples in `EnhancedComponents.jsx`
3. Examine existing content files (`b1ComputationalThinking.jsx`)
4. Consult the CSS in `global.css` and component CSS files

---

**Last Updated:** November 2025
**Version:** 2.0
