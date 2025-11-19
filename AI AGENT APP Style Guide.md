# **St. George’s British International School \- App Design System**

**Document Purpose:** This guide defines the atomic design elements for the St. George's App. It is intended for UI/UX designers and developers to ensure strict visual consistency with the physical campus branding and the Düsseldorf web presence.

Visual Identity: Premium, Heritage, Academic.  
Core Principle: High contrast between Deep Navy and White, using Muted Gold as the exclusive accent for elegance.

## **1\. Color Palette**

The palette is strictly defined by the "Navy & Gold" aesthetic. All design elements must adhere to these codes without deviation.

### **Primary Brand Colors**

| Color Name | Hex Code | Role | Application Rules |
| :---- | :---- | :---- | :---- |
| **St. George's Navy** | \#0E1C3C | **Dominant Brand Color** | Use for main headers, sticky footers, primary text on light backgrounds, and primary button backgrounds. |
| **Heritage Gold** | \#C1A06E | **Primary Accent** | Use strictly for H1/H2 typography, active navigation states, and the signature "thick underline" element. |
| **Pale Gold** | \#E5DCC5 | **Functional Accent** | **Exclusive Use:** Background color for the "arrow icon container" in the split-button component. Do not use for text. |
| **Pure White** | \#FFFFFF | **Canvas & Text** | Main background color; Text color when placed on Navy backgrounds. |

### **Secondary & Neutral Colors**

| Color Name | Hex Code | Role | Application Rules |
| :---- | :---- | :---- | :---- |
| **Off-White / Mist** | \#F2F2F2 | **Secondary Background** | Use for contact strips, utility banners, or alternating content sections to create depth. |
| **Dark Grey** | \#333333 | **Body Text** | Standard paragraph text color. Never use pure black (\#000000). |
| **Soft Grey** | \#DDDDDD | **Dividers** | Subtle borders for inputs or list separators. |

## **2\. Typography**

The typographic system relies on a classic pairing: **Serif** for brand voice/storytelling and **Sans-Serif** for utility/interface.

### **Font Families**

* **Display & Headings (Serif):** **Playfair Display**  
  * *Role:* Emotional and editorial headings.  
  * *Characteristics:* Elegant, high-contrast strokes.  
* **Interface & Body (Sans-Serif):** **Montserrat** & **Open Sans**  
  * *Role:* Navigation, buttons, labels (**Montserrat**) and long-form reading (**Open Sans**).

### **Type Scale & Component Hierarchy**

| Component | Font Family | Weight/Style | Color | Usage Guidelines |
| :---- | :---- | :---- | :---- | :---- |
| **Hero Title (H1)** | Playfair Display | **Bold** (700) | Heritage Gold | Main page identifiers. Use sentence case. |
| **Section Header (H2)** | Playfair Display | **Bold** (700) | St. George's Navy | **Mandatory Decoration:** Must include the "Heritage Underline" (see Section 4). |
| **UI Label / Nav (H3)** | Montserrat | **Bold** (700) | Navy (Light BG) or White (Dark BG) | Navigation links, footer headers, form labels. **Always Uppercase.** |
| **Body Copy (P)** | Open Sans | Regular (400) | Dark Grey | Standard readability. Line-height must be at least 1.6. |
| **Button Text** | Montserrat | **SemiBold** (600) | White | **Always Uppercase.** Wide letter-spacing (1px). |

## **3\. UI Components**

### **Primary Call-to-Action: The "Split" Button**

This is the primary interactive element. It must **always** follow this specific construction to match the house style.

* **Component Layout:** Flexbox Row (No gap).  
* **Segment A (Left \- Icon):**  
  * **Content:** Right Arrow (→).  
  * **Background:** Pale Gold (\#E5DCC5).  
  * **Icon Color:** St. George's Navy (\#0E1C3C).  
  * **Aspect:** Square or near-square (approx 50px width).  
* **Segment B (Right \- Label):**  
  * **Content:** Action Verb (e.g., "ENQUIRE NOW", "READ MORE").  
  * **Background:** St. George's Navy (\#0E1C3C).  
  * **Text Color:** White (\#FFFFFF).  
  * **Typography:** Montserrat, Uppercase, Spaced.

**CSS Reference for Developers:**

.sg-button {  
  display: inline-flex;  
  align-items: stretch;  
  border: none;  
  padding: 0;  
  cursor: pointer;  
}  
.sg-btn-icon {  
  background-color: \#E5DCC5; /\* Pale Gold \*/  
  color: \#0E1C3C; /\* Navy \*/  
  padding: 12px 16px;  
}  
.sg-btn-text {  
  background-color: \#0E1C3C; /\* Navy \*/  
  color: \#FFFFFF;  
  font-family: 'Montserrat', sans-serif;  
  text-transform: uppercase;  
  font-weight: 600;  
  padding: 12px 24px;  
  letter-spacing: 1px;  
}

### **Global Footer System**

* **Background:** Full-width St. George's Navy.  
* **Headings:** Playfair Display, Italicized, Heritage Gold.  
* **Links:** Stacked vertically, Open Sans/Montserrat, White, no underline (underline on hover only).

## **4\. Layout & Decorative Atoms**

### **The Heritage Underline**

* **Definition:** A decorative visual anchor used strictly under **H2 Section Headers**.  
* **Appearance:** A short, thick horizontal bar.  
* **Dimensions:** \~50px width, 3px height.  
* **Color:** Heritage Gold (\#C1A06E).  
* **Alignment:** Left-aligned, positioned immediately below the H2 text with \~16px padding.

### **Imagery & Containers**

* **Corner Radius:** **0px (Sharp).** Do not use rounded corners for images or content boxes. The brand aesthetic is structured and traditional.  
* **Shadows:** Minimal to none. Prefer flat, high-contrast layers.  
* **Spacing:** Use generous whitespace. The "Premium" feel comes from lack of clutter.

## **5\. Developer Handout: CSS Variables**

Copy this block to the project's root stylesheet to ensure token consistency.

:root {  
  /\* Brand Colors \*/  
  \--sg-navy: \#0E1C3C;  
  \--sg-gold: \#C1A06E;  
  \--sg-gold-pale: \#E5DCC5; /\* Icon Background Only \*/  
  \--sg-white: \#FFFFFF;  
  \--sg-grey-bg: \#F2F2F2;  
  \--sg-text-dark: \#333333;
  \--sg-grey-soft: \#DDDDDD;

  /\* Fonts \*/  
  \--font-display: 'Playfair Display', serif;  
  \--font-ui: 'Montserrat', sans-serif;  
  \--font-body: 'Open Sans', sans-serif;

  /\* Spacing & Layout \*/  
  \--radius-none: 0px;  
  \--spacing-unit: 8px;  
  \--underline-thick: 3px solid var(--sg-gold);
  \--max-content-width: 1240px;
  
  /\* Spacing scale (8px grid) \*/
  \--space-1: calc(var(--spacing-unit) * 0.5); /\* 4px \*/
  \--space-2: var(--spacing-unit); /\* 8px \*/
  \--space-3: calc(var(--spacing-unit) * 1.5); /\* 12px \*/
  \--space-4: calc(var(--spacing-unit) * 2); /\* 16px \*/
  \--space-5: calc(var(--spacing-unit) * 3); /\* 24px \*/
  \--space-6: calc(var(--spacing-unit) * 4); /\* 32px \*/
  \--space-8: calc(var(--spacing-unit) * 6); /\* 48px \*/
  \--space-10: calc(var(--spacing-unit) * 8); /\* 64px \*/
}  

## **6\. Implementation Notes**

### **Current Implementation Status**

The St. George's design system has been fully implemented across the IBCS App as of the latest UI/UX overhaul. Key implementation details:

#### **Layout System**
- **Header:** Full-width Navy background (`--sg-navy`) with white text
- **Main Content:** Centered with max-width of 1240px, generous padding
- **Footer:** Full-width Navy background with white text, centered content
- **No Sidebars:** Modern, clean navigation without collapsible sidebars

#### **Component Implementation**
- **Split Buttons:** Fully implemented with `.sg-button`, `.sg-btn-icon`, and `.sg-btn-text` classes
- **Forms:** All inputs use sharp corners (0px border-radius), consistent spacing
- **Tables:** Clean, minimal design with hover states, no rounded corners
- **Feedback Panels:** Updated to use Navy & Gold color scheme with appropriate contrast

#### **Typography Implementation**
- **H1:** Playfair Display, Bold (700), Heritage Gold color - used on login page
- **H2:** Playfair Display, Bold (700), Navy color with automatic Heritage Underline (via `::after` pseudo-element)
- **H3:** Montserrat, Bold (700), Uppercase, Navy color - used for section headers
- **Body Text:** Open Sans, Regular (400), Dark Grey
- **Labels:** Montserrat, Bold (700), Uppercase, Navy color

#### **Color Usage**
- **Navy (`--sg-navy`):** Headers, buttons, primary text, borders
- **Gold (`--sg-gold`):** H1 headings, Heritage Underline, avatar backgrounds
- **Pale Gold (`--sg-gold-pale`):** Split button icon containers only
- **White (`--sg-white`):** Backgrounds, text on Navy
- **Grey Background (`--sg-grey-bg`):** Secondary sections, stats cards, empty states
- **Soft Grey (`--sg-grey-soft`):** Borders, dividers

#### **Spacing System**
- All spacing follows the 8px grid system
- Generous whitespace between sections (48px-64px gaps)
- Consistent padding within components (16px-32px)

#### **Removed Elements**
- All card-based layouts replaced with clean section-based design
- Rounded corners removed (0px border-radius throughout)
- Excessive shadows removed (minimal, flat design)
- Collapsible sidebar removed (modern top navigation only)

#### **Responsive Design**
- Mobile-first approach with breakpoints at 768px and 1024px
- Tables stack vertically on mobile with label prefixes
- Forms adapt to single column on smaller screens
- Navigation adapts to vertical layout on mobile
