# Design Guidelines: Evomi Proxy Analysis System

## Design Approach

**Selected Approach**: Design System (Utility-Focused)

**Primary Reference**: Linear + Material Design
- Linear's clean technical aesthetic and typography
- Material Design's data table patterns and real-time feedback systems
- Focus on information density, clarity, and operational efficiency

**Justification**: This is a technical analysis tool requiring efficient data display, real-time status updates, and complex filtering. Visual appeal serves functionality, not brand expression.

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (default):
- Background: 217 20% 12% (deep blue-grey)
- Surface: 217 18% 16% (elevated panels)
- Surface Elevated: 217 16% 20% (cards, tables)
- Border: 217 12% 28% (subtle separation)

**Accent Colors**:
- Primary: 217 91% 60% (bright blue for actions)
- Success: 142 76% 45% (green for passed tests)
- Warning: 38 92% 50% (amber for slow connections)
- Error: 0 84% 60% (red for failed tests)
- Info: 199 89% 48% (cyan for informational)

**Text Colors**:
- Primary: 217 10% 95% (main content)
- Secondary: 217 8% 70% (supporting text)
- Tertiary: 217 6% 50% (metadata)

### B. Typography

**Font Family**: 
- Primary: 'Inter' (Google Fonts) - clean, technical readability
- Monospace: 'JetBrains Mono' (metrics, IPs, technical data)

**Scale**:
- Display: text-4xl font-bold (page titles)
- Heading: text-2xl font-semibold (section headers)
- Subheading: text-lg font-medium (subsections)
- Body: text-sm (default UI text)
- Caption: text-xs (metadata, labels)
- Code/Data: text-sm font-mono (IPs, metrics)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: mb-8, mb-12
- Card spacing: gap-4, gap-6
- Dense data tables: p-2, gap-2

**Grid System**:
- Main container: max-w-[1600px] (wider for data tables)
- Sidebar: w-64 (filters, navigation)
- Content area: flex-1 with overflow handling

### D. Component Library

**Navigation**:
- Top bar: Full-width, h-16, sticky with API status indicator
- Action buttons in top-right (Start Test, Export Results)
- Breadcrumb navigation for multi-step workflows

**Data Display**:
- Tables: Striped rows, sortable columns, sticky headers
- Status badges: Pill-shaped with colored dots (Testing, Success, Failed)
- Metrics cards: Large numbers with trend indicators
- Progress bars: Linear with percentage and estimated time

**Forms & Controls**:
- Multi-select with checkboxes: "Select All", filter chips
- Search input with real-time filtering
- Dropdown filters: Country, State, City, ASN
- Range sliders for metric thresholds

**Cards**:
- Elevated surfaces with border: border border-[hsl(217,12%,28%)]
- Header with title and action buttons
- Content area with consistent p-6 padding
- Footer for metadata or actions

**Interactive Elements**:
- Primary buttons: Solid blue fill
- Secondary buttons: Ghost with border
- Icon buttons: Minimal, hover state only
- Checkbox groups: Compact with labels

**Real-time Feedback**:
- Loading skeletons for data fetching
- Pulse animations on active tests (very subtle)
- Toast notifications: Top-right, auto-dismiss
- Live updating counters and timers

### E. Specific Feature Patterns

**ISP Selection Interface**:
- Left panel: Hierarchical tree view (Country > State > City > ISPs)
- Right panel: Selected ISPs table with remove option
- Bulk actions toolbar: "Select All Visible", "Clear Selection", count badge
- Quick filters: Popular ISPs, Fastest regions, Recently tested

**Test Results Dashboard**:
- Top metrics row: Total Tested, Success Rate, Avg Latency, Best ISP
- Sortable results table: Rank, ISP Name, Location, Ping, HTTP Time, Status
- Color-coded performance: Green (<100ms), Yellow (100-300ms), Red (>300ms)
- Expandable rows for detailed DB-IP enrichment data

**Progress Tracking**:
- Linear progress bar showing overall completion
- Individual test status icons in table rows
- Concurrent test counter: "Testing 10 of 250 ISPs"
- Estimated time remaining

**Data Export**:
- Format selector: JSON, CSV
- Filter options: Top N results, Failed only, By region
- Download button with file size indicator

## Layout Structure

**Main Application Layout**:
```
┌─────────────────────────────────────────┐
│  Top Bar (Settings, Start Test, Export) │
├──────────┬──────────────────────────────┤
│          │  Metrics Summary Cards       │
│  Filters │  (4 cards in grid)           │
│  Sidebar ├──────────────────────────────┤
│          │  Results Table               │
│  - API   │  (Full-width, scrollable)    │
│  - Region│                              │
│  - ISP   │  Pagination / Load More      │
└──────────┴──────────────────────────────┘
```

## Animation & Interaction

**Minimal Animations**:
- Table row hover: Subtle background change
- Button states: Standard transitions
- Loading states: Skeleton screens, no spinners
- Progress updates: Smooth value transitions (not stepped)

**NO animations for**: Page transitions, decorative effects, scroll reveals

## Accessibility

- Maintain dark mode throughout (including inputs, tables)
- High contrast for data visualization (AAA rated)
- Keyboard navigation for all controls
- Clear focus indicators on interactive elements
- Screen reader labels for status indicators

## Images

**No hero images required**. This is a utility application.

**Optional Icons**: Use Heroicons (outline variant) via CDN for:
- Status indicators (check, x, clock)
- Actions (play, download, refresh)
- Navigation (chevrons, arrows)
- Filters (funnel, search)

All icons should be 20px (w-5 h-5) for consistency, neutral color by default, inherit parent color on hover.