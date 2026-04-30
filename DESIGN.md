# Design System - Re-pxl

## Current Figma Design
- **Link:** [Simple Canvas UI Design](https://figma.com/make/A0qpfzKL4iRcDnAw8BS9kc/Simple-Canvas-UI-Design?t=xL9xyAlvppBKns8z-20&fullscreen=1)
- **Status:** Active - Implementation In Progress
- **Last Updated:** 2026-04-30
- **Branch:** `figma-ui-redesign`

---

## Color Palette (From Figma)

### Primary Colors
- **Canvas Background:** `#FFFFFF` (Pure White)
- **Toolbar Background:** `#F9FAFB` (Light Gray)
- **Primary Accent:** `#2563EB` (Blue-600)
- **Primary Hover:** `#1D4ED8` (Blue-700)
- **Success:** `#22C55E` (Green-500)
- **Error:** `#EF4444` (Red-500)
- **Border:** `#E5E7EB` (Cool Gray 200)
- **Icon/Inactive:** `#6B7280` (Gray-500)

### Text Colors
- **Heading/Text:** `#111827` (Gray-900)
- **Label/Text-Secondary:** `#4B5563` (Gray-700)
- **Disabled:** `#9CA3AF` (Gray-400)

---

## Component Specifications

### 1. Toolbar
- **Height:** 56px
- **Padding:** 16px horizontal
- **Background:** `#F9FAFB`
- **Shadow:** 0 1px 3px 0 rgba(16, 24, 40, 0.04)
- **Border bottom:** 1px solid #E5E7EB

### 2. Toolbar Button
- **Size:** 40x40px
- **Border radius:** 8px
- **Default State:**
  - Background: Transparent
  - Icon Color: `#6B7280`
- **Hover State:**
  - Background: `#E0E7FF`
  - Icon Color: `#2563EB`
- **Active State:**
  - Background: `#2563EB`
  - Icon Color: `#FFFFFF`

### 3. Canvas Area
- **Background:** `#FFFFFF`
- **Border:** None (edge-to-edge design)
- **Flexibility:** Full window

### 4. Sidebar (Optional)
- **Width:** 260px
- **Background:** `#F9FAFB`
- **Divider line:** `#E5E7EB`, 1px

---

## Spacing System
All spacing uses multiples of 4px:
- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **lg:** 16px
- **xl:** 24px
- **2xl:** 32px

---

## Implementation Checklist

### Phase 1: Project Structure ✓
- [x] Create `figma-ui-redesign` branch
- [x] Create `DESIGN.md` documentation
- [ ] Extract CSS to modular files
- [ ] Extract JavaScript to modular files
- [ ] Create design tokens (colors, spacing)

### Phase 2: Component Refactoring
- [ ] Refactor toolbar component
- [ ] Refactor palette component
- [ ] Refactor timeline component
- [ ] Refactor modals/popovers
- [ ] Update icons and assets

### Phase 3: Integration
- [ ] Update index.html with new structure
- [ ] Test all functionality
- [ ] Create PR for review

### Phase 4: Deployment
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Update README.md

---

## Figma Best Practices
- Use **Auto Layout** for toolbars and menus
- Create **Color Styles** for all palette colors
- Use **Variants** for button states (Default, Hover, Active, Disabled)
- Utilize **Components** for repeated elements
- Keep spacing consistent (4px grid)

---

## Notes
- Current app uses dark theme (#0f0f12, #1a1a20)
- Figma design uses light theme (#FFFFFF, #F9FAFB)
- Will need to decide: migrate to light theme or create theme-aware CSS

---

## Migration Path
1. Export components from Figma as SVG
2. Store in `assets/figma-exports/`
3. Update CSS variables to match Figma tokens
4. Gradually refactor HTML/CSS sections
5. Test and iterate

---

*Last Updated: 2026-04-30*
