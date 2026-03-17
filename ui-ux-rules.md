# UI/UX Design Rules

## 1. Use Signifiers to Show How the UI Works

Users should understand what something does **without instructions**.

**Rules** - Interactive elements must look interactive. - Use visual
cues like: - Hover states - Active states - Disabled styles - Tooltips -
Button press states - Group related items visually.

------------------------------------------------------------------------

## 2. Create Visual Hierarchy

Users should instantly see **what is most important**.

**Tools for hierarchy** - Size - Color - Position - Contrast

**Rules** - Most important information: - Larger - Higher on the page -
Higher contrast - Secondary information: - Smaller - Lower - Less
contrast

------------------------------------------------------------------------

## 3. Use Images When Possible

Images make scanning faster.

**Rules** - Images should support the main content. - Use them at the
top of cards or sections. - Avoid purely decorative images.

------------------------------------------------------------------------

## 4. Align Content Logically (But Don't Worship Grids)

**Rules** - Use grids mainly for: - Dashboards - Blogs - Galleries -
Repeating layouts - Landing pages can break grid rules. - Focus on
clarity and alignment.

------------------------------------------------------------------------

## 5. Use Whitespace Generously

**Rules** - Let elements breathe. - Add consistent spacing between
sections. - Group related elements closer together.

Example spacing:

    Element
    32px space
    Element
    32px space
    Element

------------------------------------------------------------------------

## 6. Use a Consistent Spacing System

Common system:

    4px
    8px
    16px
    24px
    32px
    48px
    64px

**Rule** Everything should be a **multiple of 4 or 8**.

------------------------------------------------------------------------

## 7. Keep Typography Simple

**Rules** - Use a clean sans-serif font. - Limit to **≤6 font sizes**. -
Maintain clear hierarchy.

Example structure:

    H1
    H2
    H3
    Body
    Small text
    Caption

------------------------------------------------------------------------

## 8. Improve Headlines with Typography Tweaks

**Rules** - Letter spacing: **-2% to -3%** - Line height: **110--120%**

------------------------------------------------------------------------

## 9. Use a Primary Color System

Start with **one primary brand color**.

Derive: - lighter shades → backgrounds - darker shades → text - medium
shades → buttons

------------------------------------------------------------------------

## 10. Use Semantic Colors

  Color    Meaning
  -------- ------------------------
  Blue     Trust / Primary action
  Green    Success
  Yellow   Warning
  Red      Error / Danger

------------------------------------------------------------------------

## 11. Dark Mode Rules

**Rules** - Use lighter cards on darker backgrounds - Reduce border
contrast - Lower color saturation - Avoid strong shadows

Depth comes from **color layers**, not shadows.

------------------------------------------------------------------------

## 12. Use Subtle Shadows in Light Mode

**Rules** - Low opacity - Large blur radius - Stronger shadows only for
overlays

If the shadow is the first thing you notice → it's too strong.

------------------------------------------------------------------------

## 13. Icons Should Match Text Size

**Rule**

    Icon size = text line height

Example:

    Text line height = 24px
    Icon = 24px

------------------------------------------------------------------------

## 14. Button Padding Rule

    Horizontal padding ≈ 2 × vertical padding

Example:

    12px vertical
    24px horizontal

------------------------------------------------------------------------

## 15. Every Interaction Needs Feedback

Buttons need these states:

1.  Default
2.  Hover
3.  Active
4.  Disabled

Optional: - Loading - Success

------------------------------------------------------------------------

## 16. Input States

Forms should support:

-   Default
-   Focus
-   Error
-   Warning
-   Disabled

Example: red border + message for errors.

------------------------------------------------------------------------

## 17. Use Micro‑Interactions

Examples: - Copy confirmation - Button ripple - Success animations -
Slide-in notifications

They improve **clarity and user satisfaction**.

------------------------------------------------------------------------

## 18. Use Overlays for Text on Images

Common solution:

-   Add a **gradient overlay**
-   Improve contrast for readability
-   Optionally add **progressive blur** for modern designs

------------------------------------------------------------------------

# Summary

Good UI design focuses on:

-   Clear hierarchy
-   Consistent spacing
-   Simple typography
-   Meaningful colors
-   Clear interaction feedback
-   Strong visual structure
