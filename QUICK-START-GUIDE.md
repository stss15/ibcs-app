# Quick Start Guide - New UI/UX System

## 🚀 Getting Started in 5 Minutes

### 1. See the Changes
```bash
cd frontend
npm run dev
```
Then visit: http://localhost:5173

**Check these pages:**
- `/curriculum/ib/b1` - B1 module with enhanced tables and cards
- `/curriculum/ib/b2` - B2 module with modern activities  
- `/student` - Student dashboard (login as a student)
- `/curriculum/year7` - Year 7 map with learning pathway

---

## 🎨 Using the New Components

### Quick Import
```jsx
import {
  KeywordCard,
  Callout,
  EnhancedTable,
  ProgressIndicator,
  AchievementBadge,
  XPNotification,
  StreakIndicator
} from './components/segments/EnhancedComponents';
```

### 1. Keyword Definitions
```jsx
<KeywordCard
  term="Variable"
  definition="A named storage location in memory"
  icon="📦"
/>
```

### 2. Info Callouts
```jsx
<Callout type="tip" title="Pro Tip">
  Use meaningful variable names for better readability!
</Callout>
```
**Types:** `info`, `tip`, `warning`, `success`, `error`

### 3. Enhanced Tables
```jsx
<EnhancedTable
  caption="Python Data Types"
  columns={['Type', 'Description', 'Example']}
  rows={[
    ['int', 'Whole numbers', '42'],
    ['str', 'Text strings', '"Hello"'],
    ['bool', 'True or False', 'True']
  ]}
/>
```

### 4. Progress Bars
```jsx
<ProgressIndicator
  current={7}
  total={10}
  label="Module Progress"
/>
```

---

## 🎯 Animation Classes

Add to any element:
```html
<!-- Fade in on load -->
<div class="animate-fade-in">Content</div>

<!-- Slide from right -->
<div class="animate-slide-in-right">Content</div>

<!-- Bounce once -->
<div class="animate-bounce">Success!</div>

<!-- Pulse continuously -->
<div class="animate-pulse">Important</div>

<!-- Lift on hover -->
<button class="hover-lift">Click me</button>
```

---

## 🎨 Design Tokens

### Colors
```css
var(--cs-blue)          /* Primary brand */
var(--cs-blue-light)    /* Interactive states */
var(--color-success)    /* ✓ Correct answers */
var(--color-warning)    /* ⚠️ Cautions */
var(--color-error)      /* ✗ Errors */
var(--color-xp-gold)    /* 🎖️ XP and rewards */
```

### Spacing
```css
var(--space-xs)   /* 4px */
var(--space-sm)   /* 8px */
var(--space-md)   /* 16px */
var(--space-lg)   /* 24px */
var(--space-xl)   /* 32px */
```

### Radius
```css
var(--radius-sm)    /* 8px - small buttons */
var(--radius-md)    /* 12px - inputs */
var(--radius-lg)    /* 16px - cards */
var(--radius-xl)    /* 20px - large cards */
var(--radius-full)  /* 999px - pills */
```

### Shadows
```css
var(--shadow-sm)    /* Subtle */
var(--shadow-md)    /* Standard */
var(--shadow-lg)    /* Prominent */
var(--shadow-xl)    /* Hero elements */
```

### Transitions
```css
var(--transition-fast)   /* 150ms - instant feedback */
var(--transition-base)   /* 250ms - standard */
var(--transition-slow)   /* 350ms - dramatic */
```

---

## 📝 Updating Existing Content

### Before (Old Way)
```jsx
{
  type: 'list',
  heading: 'Key Terms',
  items: [
    { title: 'Algorithm', body: 'A step-by-step procedure' },
    { title: 'Variable', body: 'A named storage location' }
  ]
}
```

### After (New Way)
```jsx
{
  type: 'content',
  heading: 'Key Terms',
  body: (
    <>
      <KeywordCard 
        term="Algorithm"
        definition="A step-by-step procedure"
        icon="🔄"
      />
      <KeywordCard 
        term="Variable"
        definition="A named storage location"
        icon="📦"
      />
    </>
  )
}
```

---

## 🎮 Quiz Enhancements (Automatic!)

All existing quizzes now have:
- ✅ Success checkmarks
- ❌ Error X marks
- 🎉 Celebration emoji on perfect score
- Bounce animation on success
- Wiggle animation on errors
- Colored top borders (green/red)

**No code changes needed!** The styles are applied automatically.

---

## 🏆 XP & Gamification (Automatic!)

Enhanced automatically:
- Animated sparkle icon (✨)
- Shimmer effect on progress bar
- Gradient XP numbers
- Gold level badge
- Smooth progress transitions

**No code changes needed!** The enhancements apply to existing XP systems.

---

## 📱 Responsive Design

All components work on:
- 📱 Mobile (< 768px)
- 📟 Tablet (768-1024px)
- 💻 Desktop (> 1024px)

**Auto-adjusts:** Layout, spacing, touch targets

---

## 🎨 Badge System

Quick status indicators:
```html
<span class="badge badge--success">✓ Complete</span>
<span class="badge badge--warning">⚠️ Caution</span>
<span class="badge badge--error">✗ Error</span>
<span class="badge badge--info">ℹ️ Info</span>
<span class="badge badge--xp">+50 XP</span>
```

---

## 🔧 Common Tasks

### Change Global Border Radius
`frontend/src/styles/global.css`
```css
--radius-xl: 20px;  /* Change to 16px for sharper corners */
```

### Adjust Animation Speed
```css
--transition-base: 250ms;  /* Make faster: 150ms */
```

### Update Primary Color
```css
--cs-blue: #0c297c;  /* Your school color - don't change! */
--cs-blue-light: #3275ff;  /* Adjust this for lighter variant */
```

---

## 📚 Full Documentation

**Complete Guide:** `docs/ui-ux-design-system.md`
- All components with examples
- Design principles
- Animation library
- Accessibility guidelines
- Testing checklist

**Component Code:** `frontend/src/components/segments/EnhancedComponents.jsx`

**Component Styles:** `frontend/src/components/segments/EnhancedComponents.css`

---

## ✅ Testing Checklist

Before deploying changes:
- [ ] Test on mobile (resize browser to < 768px)
- [ ] Test all interactive elements (hover, click)
- [ ] Check keyboard navigation (Tab key)
- [ ] Verify animations don't cause motion sickness
- [ ] Confirm school colors are preserved
- [ ] Test in Chrome, Firefox, and Safari

---

## 🆘 Troubleshooting

### Styles Not Showing?
1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
2. Check that CSS imports are correct
3. Restart dev server

### Animations Too Fast/Slow?
Adjust in `global.css`:
```css
--transition-base: 250ms;  /* Adjust this value */
```

### Component Not Found?
Check import path:
```jsx
import { KeywordCard } from './components/segments/EnhancedComponents';
```

---

## 🎯 Pro Tips

1. **Use utility classes** instead of inline styles
2. **Leverage design tokens** for consistency
3. **Reuse components** instead of recreating
4. **Check documentation** before creating new styles
5. **Test responsively** at different screen sizes

---

## 📞 Quick Reference

| Need | File | Line Range |
|------|------|------------|
| Design tokens | `global.css` | Lines 1-66 |
| Animations | `global.css` | Lines 237-341 |
| Tables | `Segments.css` | Lines 81-142 |
| Keyword cards | `Segments.css` | Lines 26-79 |
| Quizzes | `Segments.css` | Lines 260-399 |
| XP card | `GamifiedModulePage.css` | Lines 40-165 |
| Components | `EnhancedComponents.jsx` | All |

---

## 🚀 Quick Wins

**Want to make a page feel modern instantly?**

Add this to any container:
```jsx
<div className="animate-fade-in">
  {/* Your content */}
</div>
```

**Want hover effects?**
```jsx
<div className="hover-lift">
  {/* Lifts up on hover */}
</div>
```

**Want a success message?**
```jsx
<div className="badge badge--success">
  ✓ Well done!
</div>
```

---

**That's it!** You're ready to use the new UI/UX system. For detailed information, see `docs/ui-ux-design-system.md`.

Happy coding! 🎉

