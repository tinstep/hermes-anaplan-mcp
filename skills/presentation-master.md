---
name: presentation-master
description: "Comprehensive guide for creating professional consulting-grade PowerPoint presentations. Covers storyline frameworks (SCR, SCQA, Pyramid Principle, hypothesis-driven), multiple design system variations with exact specifications, slide architecture patterns, data visualization best practices, presentation-type blueprints, ghost-deck methodology, quality gates, and PptxGenJS implementation. Production-ready precision on measurements, typography, and layout."
license: MIT
---

# Consulting Presentation Master Skill

## Overview

This skill is the comprehensive reference for building consulting-grade PowerPoint presentations. It synthesizes best practices from top-tier strategy consulting firms and combines them with academic data visualization principles from **Edward Tufte** and **Cole Nussbaumer Knaflic**. Every measurement, font size, spacing value, and color code is specified at production-ready precision.

## When to Use This Skill

**Use for:** Any PowerPoint creation task — from a 5-slide board update to a 100-slide strategy deck. This skill provides the framework selection logic, design systems, and quality gates to produce professional consulting-grade output.

**How to use:** Start with Part 1 (Framework Selection) to choose the right storyline. Then use Part 2 (Design Systems) for the visual identity. Use Part 3 (Slide Architecture) for layout patterns. Use Part 4 (Data Visualization) for charts. Finish with Part 7 (Quality Gates).

---
## Pre-Build Requirements Gathering

**CRITICAL:** Before creating any presentation, ask the user 3-5 questions to select the optimal framework and design system. Never start building slides without understanding requirements.

### Required Questions Process

Ask these questions in order to determine the best approach:

#### Question 1: Audience & Purpose
"Who is the primary audience and what is the presentation's purpose?"

**Listen for:**
- Executive/Board → Use SCR, keep concise (15-25 slides)
- Strategy team → Use Hypothesis-driven or Issue-driven
- Sales/investors → Use AIDA or BAB
- Mixed audience → Use SCQA

**Example answers:**
- "Board of directors, quarterly update" → SCR framework
- "Investment committee, funding pitch" → AIDA framework
- "Strategy team, market analysis" → Hypothesis-driven

---

#### Question 2: Key Message & Complexity
"What is your main recommendation or conclusion? Is this straightforward or controversial?"

**Listen for:**
- Clear recommendation, audience will agree → SCR (lead with answer)
- Controversial or needs buy-in → SCQA (build to question)
- Multiple hypotheses to test → Hypothesis-driven
- No clear answer yet → Issue-driven (explore exhaustively)

**Example answers:**
- "We should expand to APAC, pretty clear decision" → SCR
- "We might need to exit a business unit, sensitive topic" → SCQA
- "Need to figure out why margins are declining" → Issue-driven

---

#### Question 3: Design System Preference
"Which design aesthetic do you prefer?"

Present options:
- **System A (Modern Professional)**: Green accent, bumper statements, tight margins, data-intensive
- **System B (Classic Executive)**: Navy blue, serif titles, traditional elegance
- **System C (Clean & Approachable)**: Green dot motif, balanced and accessible
- **System D (High Impact)**: Red accent for critical data points, bold focus

**Listen for:**
- "Modern", "data-heavy", "efficient" → System A
- "Traditional", "executive", "formal" → System B
- "Clean", "friendly", "approachable" → System C
- "Bold", "impactful", "focused" → System D

If unsure, ask: "Do you prefer modern/tight (A), classic/traditional (B), clean/balanced (C), or bold/focused (D)?"

---

#### Question 4: Slide Count & Depth
"How many slides do you need and how detailed should the content be?"

**Listen for:**
- 5-15 slides → Executive summary style
- 15-30 slides → Standard board/strategy deck
- 30-50 slides → Detailed analysis with backup
- 50+ slides → Comprehensive with appendix

**Adjust approach:**
- Short deck → One chart per slide, minimal text
- Long deck → More detailed exhibits, comprehensive appendix

---

#### Question 5: Specific Requirements (Optional)
"Are there any specific requirements or constraints?"

**Listen for:**
- Data source: "Use data from Anaplan/Excel/Database"
- Timeline: "Need by end of week" → simpler design
- Brand guidelines: "Must use company colors" → customize design system
- Special elements: "Need implementation roadmap table"
- Constraints: "No firm branding", "Keep it simple"

---

### Decision Matrix

Based on answers, select:

| If User Says... | Framework | Design System | Slide Count |
|----------------|-----------|---------------|-------------|
| "Board update on Q3 performance" | SCR | B (Classic) | 15-20 |
| "Pitch deck for Series A investors" | AIDA | A (Modern) | 10-15 |
| "Strategy analysis on market entry" | Hypothesis | A or B | 30-50 |
| "Monthly team update" | SCR | C (Clean) | 5-10 |
| "Crisis communication to execs" | SCQA | B (Classic) | 8-12 |

---

### Example Question Flow

**AI:** "I'll help you create a professional presentation. Let me ask a few questions to ensure I use the right approach:

1. **Who is your audience and what's the purpose?**"

**User:** "Board of directors, quarterly business review"

**AI:** "2. **What's your main message? Is it straightforward or might it be controversial?**"

**User:** "Revenue is up but margins are down, we need to cut costs. Could be sensitive."

**AI:** "3. **Which design style do you prefer?**
   - A: Modern with green accents and data focus
   - B: Classic navy with traditional serif titles  
   - C: Clean and approachable with green dot
   - D: Bold with red accent on key data"

**User:** "B, traditional"

**AI:** "4. **How many slides?** Board decks typically run 15-25 slides."

**User:** "About 20 slides with some backup"

**AI:** "Perfect! I'll create a **20-slide presentation** using:
- **SCQA framework** (since cost-cutting is sensitive, I'll build the case carefully)
- **Design System B** (classic navy, serif titles, traditional executive style)
- **Consulting standard dimensions** (13.333" x 7.5")
- **Action titles < 15 words** on every slide

I'll structure it as:
- Situation: Q3 performance (revenue up, margins down)
- Complication: Margin pressure requires action
- Question: How do we restore margins sustainably?
- Answer: Strategic cost reduction program

Should I proceed with this approach?"

---

### When to Skip Questions

**Skip detailed questions if:**
- User provides complete brief upfront
- User references existing template/style
- Simple, well-defined request (e.g., "5-slide pitch deck, modern style")

**Example of complete brief:**
"Create a 15-slide board presentation using modern design, SCR framework, showing our FY26 sales forecast from Anaplan. Board likes data-heavy slides."

**AI Response:** "Got it! I'll create a 15-slide board presentation with:
- Design System A (modern, data-intensive)
- SCR framework
- Anaplan sales forecast data
- Full charts using complete body height

Proceeding now..."

---

### Critical Rules

1. **Always confirm approach before building** - show user the framework + design system choice
2. **Ask minimum questions needed** - don't over-question if brief is clear
3. **Present design systems visually** - use bullet points to describe A/B/C/D
4. **Adapt to user's expertise** - if user says "SCQA with System A", skip questions
5. **Default to asking** - when in doubt, ask rather than assume

---

# PART 1: UNIVERSAL STORYLINE FRAMEWORKS

## 1.1 The Pyramid Principle

The foundational logic structure for ALL consulting communication. Created by Barbara Minto in the 1960s, universally adopted across top consulting firms.

**Core axiom:** You think bottom-up (data → insight), but you communicate top-down (insight → evidence).

```
Level 0 (Apex):   GOVERNING THOUGHT — the single recommendation/conclusion
                        |
Level 1:          KEY ARGUMENT 1    KEY ARGUMENT 2    KEY ARGUMENT 3
                     |                   |                   |
Level 2:          Evidence A          Evidence D          Evidence G
                  Evidence B          Evidence E          Evidence H
                  Evidence C          Evidence F          Evidence I
```

**Rules:**
- The governing thought is a single, complete sentence stating the recommendation
- Level 1 arguments support the governing thought (2-4 arguments, ideally 3)
- Level 2 evidence supports each Level 1 argument
- All arguments at every level must be MECE (Mutually Exclusive, Collectively Exhaustive)
- Vertical logic: each level answers "why?" or "how?" from the level above
- Horizontal logic: arguments at the same level relate deductively or inductively

**Deductive (general → specific):**
- Statement: "Revenue is declining"
- Cause: "Costs are rising faster than revenue"
- Conclusion: "Therefore, margins are shrinking"

**Inductive (specific → general):**
- Observation: "Product A sales fell 12%"
- Observation: "Product B sales fell 8%"
- Observation: "Product C sales fell 15%"
- Conclusion: "Our entire product portfolio is declining"

**MECE Decomposition Lenses:**
- Stakeholder: customer, supplier, competitor, regulator
- Process: acquire, serve, retain, expand
- Segment: geography, product line, customer type
- Mathematical: Revenue = Price × Volume; Profit = Revenue − Costs
- Temporal: short-term, medium-term, long-term
- Internal vs. External

**Application to slides:**
- Executive summary slide = the apex (governing thought)
- Each deck section = a Level 1 argument
- Each slide within a section = Level 2 evidence
- Reading only slide titles in sequence reconstructs the entire pyramid

---

## 1.2 SCR (Situation-Complication-Resolution)

Primary storytelling structure used across consulting. Mirrors how humans process problems.

| Component | Purpose | Length | Example |
|-----------|---------|--------|---------|
| **Situation** | Context the audience already knows and accepts | 1-3 slides | "Our company has been market leader for 10 years with 35% share" |
| **Complication** | What changed — the problem creating urgency | 1-3 slides | "Three new competitors entered; share declined to 28% in 18 months" |
| **Resolution** | Your recommendation — the bulk of the deck | 60-70% of slides | "Three-pronged strategy: accelerate innovation, expand adjacencies, invest in retention" |

**Variants:**

| Variant | Structure | Best Used When |
|---------|-----------|----------------|
| **SCR** | Situation → Complication → Resolution | Standard — audience needs context before solution |
| **RSC** | Resolution → Situation → Complication | Audience is likely to agree; lead with the answer |
| **SCQA** | Situation → Complication → Question → Answer | Audience hasn't agreed there's a problem; need to align on the question first |
| **SCQR** | Situation → Complication → Question → Resolution | Makes the implied question explicit before resolving |

**When to use SCQA over SCR:**
- Audience hasn't agreed there is a problem
- Multiple possible questions exist — you need to focus on one
- Mixed audience with different context levels
- Controversial recommendation requiring audience "discovery"

---

## 1.3 Hypothesis-Driven Storyline

The dominant problem-solving approach at top-tier consulting firms. Favored for complex strategic questions.

**Process:**
1. **Define the problem statement** — specific, measurable, time-bound
2. **Formulate initial hypothesis** — a testable, falsifiable answer
3. **Build hypothesis tree** — decompose into sub-hypotheses (MECE)
4. **Design analyses** — one workstream per branch
5. **Present findings** — organized around confirmed/refuted hypotheses
6. **Synthesize** — revised or confirmed recommendation

**Example:**
```
Master hypothesis: "Margin gap is driven by channel mix shift, not pricing"
  ├── H1: Wholesale margin is 800bps below DTC ← CONFIRMED
  ├── H2: Wholesale volume grew 3x faster than DTC in 2 years ← CONFIRMED
  └── H3: Shifting 20% wholesale to DTC closes 60% of gap ← CONFIRMED
```

**When to use:**
- Complex strategic questions with multiple possible answers
- Time-constrained engagements (8-12 week projects)
- Client needs to see analytical rigor
- Large team needing parallelized work

---

## 1.4 Issue-Driven Storyline

Structures the presentation around an exhaustive issue tree.

**Two main types:**
- **WHY trees (diagnostic):** "Why is profitability declining?" → Revenue issues vs. Cost issues → further decomposition
- **HOW trees (prescriptive):** "How can we grow revenue?" → New customers vs. Existing expansion vs. Pricing

**Difference from hypothesis-driven:**
- Hypothesis-driven starts with an answer and tests it (faster, risks confirmation bias)
- Issue-driven starts with a question and explores exhaustively (more thorough, takes longer)
- In practice, most engagements use a hybrid

---

## 1.5 Action-Oriented Slide Titles

Every slide title must be a declarative action statement, not a topic label.

| Topic Label (WRONG) | Action Title (RIGHT) |
|---------------------|---------------------|
| "Market Analysis" | "Addressable market will grow 12% annually, driven by SMB in Southeast Asia" |
| "Competitive Landscape" | "Three digital-native competitors captured 18% share in 24 months" |
| "Financial Overview" | "Current trajectory yields 400bps margin shortfall against 2027 plan" |
| "Recommendations" | "Three-pronged digital acceleration can close the margin gap in 18 months" |

**Rules for action titles (universal consulting standard):**
- Must be a complete sentence with subject and verb
- Must state the insight/implication, not the topic
- **Fewer than 15 words, maximum 2 lines** ← CRITICAL!
- Include numbers, timeframes, directional language
- No weasel words ("may," "could," "might") — be assertive
- Reading all titles in sequence tells the full story

---

## 1.6 Narrative Arc Structures

**Five-act structure for business:**
1. **Exposition:** Set the business context
2. **Rising Action:** Challenge, threats, competitive pressure
3. **Climax:** The pivotal finding or "aha moment"
4. **Falling Action:** How the solution resolves the tension
5. **Resolution:** Call to action, next steps, what success looks like

**Additional frameworks:**

| Framework | Structure | Best For |
|-----------|-----------|----------|
| **AIDA** | Attention → Interest → Desire → Action | Sales/pitch decks (ratio ~1:5:3:1 across slides) |
| **BAB** | Before (pain) → After (vision) → Bridge (your solution) | Audience doesn't realize the magnitude of the problem |
| **PAS** | Problem → Agitate → Solve | More aggressive persuasion contexts |
| **Hero's Journey** | Client = hero; consultant = mentor | Transformation and change management |

---

## 1.7 Framework Selection Decision Tree

```
START
  │
  ├── Is the audience executive/board-level?
  │     YES → Use Pyramid Principle (top-down) + SCR
  │     │     Lead with the answer. Max 15-25 slides in main deck.
  │     │
  │     └── Is the recommendation controversial?
  │           YES → Use SCQA (make them discover the question)
  │           NO  → Use SCR (get to the answer fast)
  │
  ├── Is this a strategy/analysis engagement?
  │     YES → Hypothesis-driven or Issue-driven
  │     │
  │     └── Do you have an initial hypothesis?
  │           YES → Hypothesis-driven (test it)
  │           NO  → Issue-driven (explore exhaustively)
  │
  └── Is this a pitch/sales deck?
        YES → AIDA or BAB
        │
        └── Does the audience realize they have a problem?
              YES → BAB (show the solution)
              NO  → PAS (agitate the problem first)
```

---

# PART 2: PROFESSIONAL DESIGN SYSTEMS

This section provides four distinct design system variations (A, B, C, D), each with complete specifications. All are production-tested and professional-grade.

## 2.1 Design System A (Modern Professional - Tighter Margins)

**Visual Philosophy:** Modern, clean, efficient use of space with bold color accents. Emphasizes data clarity and visual impact.

### Color Palette
```javascript
const DESIGN_A = {
  // Primary Colors
  primaryDark: "006B3F",      // Deep Green (primary brand)
  primaryLight: "00A651",     // Light Green (accent)
  accentYellow: "FFD700",     // Sharp Yellow (data emphasis - signature!)
  accentRed: "E04040",        // Soft Red (alerts/warnings)
  accentBlue: "0077C8",       // Electric Blue (information)
  
  // Neutrals
  charcoal: "2D2D2D",         // Dark Gray (body text)
  mediumGray: "808080",       // Medium Gray (subtle text)
  white: "FFFFFF",            // Background
  cardFill: "F2F2F2",         // Light Gray (card backgrounds)
  greenTint: "E8F5D6"         // 10% tint of primary green
};
```

### Layout Specifications
```javascript
const DESIGN_A_LAYOUT = {
  // Margins (tighter for more content)
  MARGIN_LEFT: 0.8,           // inches
  MARGIN_RIGHT: 0.8,
  CONTENT_WIDTH: 11.7,        // 13.333 - 0.8 - 0.8
  
  // Vertical Positioning
  TITLE_Y: 0.4,               // Top margin 0.4"
  TITLE_HEIGHT: 0.8,          // 0.7-0.9" range
  
  // No subheading - go straight to body
  BODY_Y: 1.4,                // Content starts at 1.4"
  BODY_HEIGHT: 5.0,           // 4.8-5.0" (maximize space)
  
  // Bottom Elements
  BUMPER_Y: 6.5,              // Takeaway box position
  FOOTER_Y: 7.1               // Footer citation
};
```

### Typography
```javascript
const DESIGN_A_FONTS = {
  PRIMARY_FONT: "Trebuchet MS",  // Exclusive font (fallback: Verdana, Arial)
  
  // Font Sizes
  FONT_ACTION_TITLE: 24,      // 22-26pt Bold
  FONT_BODY_LARGE: 17,        // 16-18pt Regular
  FONT_BODY_STANDARD: 13,     // 13-15pt Regular
  FONT_CHART_LABELS: 11,      // 11-13pt
  FONT_BUMPER: 13,            // 12-14pt Bold
  FONT_FOOTNOTES: 9,          // 9-10pt
  FONT_SOURCE: 9              // 9pt
};
```

### Signature Elements

#### Bumper Statement (REQUIRED on every content slide)
A takeaway box at the bottom that reinforces the key insight.

```javascript
// Bumper background
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 6.5, w: 11.7, h: 0.45,
  fill: { color: "F2F2F2" }
});

// Left accent bar (signature element)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 6.5, w: 0.08, h: 0.45,
  fill: { color: "006B3F" }
});

slide.addText("Your key takeaway message here", {
  x: 1.0, y: 6.6, w: 11.3, h: 0.25,
  fontSize: 13, bold: true,
  color: "2D2D2D",
  fontFace: "Trebuchet MS"
});
```

#### Yellow Highlighting (for critical slides)
Use sharp yellow (#FFD700) for THE most important data point.

```javascript
// Yellow bumper for critical insights
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 6.5, w: 11.7, h: 0.45,
  fill: { color: "FFD700" }  // ← Yellow, not gray
});
```

#### Left/Right Organization Pattern
Frequently uses left (data/chart) + right (insights) layout.

```javascript
// LEFT: Chart (60%)
slide.addChart(pres.charts.BAR, data, {
  x: 0.8, y: 1.4, w: 6.5, h: 5.0,
  chartColors: ["006B3F"]
  // ... chart config
});

// RIGHT: Context box (40%)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 7.5, y: 1.4, w: 4.8, h: 5.0,
  fill: { color: "F2F2F2" },
  line: { color: "006B3F", width: 1 }
});
```

---

## 2.2 Design System B (Classic Professional - Serif Titles)

**Visual Philosophy:** Traditional elegance with modern data presentation. Serif titles for gravitas, sans-serif body for readability.

### Color Palette
```javascript
const DESIGN_B = {
  // Primary Colors
  deepNavy: "003A70",         // Deep Navy Blue (primary)
  accentBlue: "005DAA",       // Bright Blue (accent)
  teal: "00857C",             // Teal (secondary)
  
  // Neutrals
  charcoal: "333333",         // Body text
  mediumGray: "999999",       // Subtle text
  white: "FFFFFF",            // Background
  lightGray: "F5F5F5",        // Light fill
  chartGray: "C0C5C9"         // Chart gray (slight blue tint)
};
```

### Layout Specifications
```javascript
const DESIGN_B_LAYOUT = {
  // Margins (standard 1.0")
  MARGIN_LEFT: 1.0,
  MARGIN_RIGHT: 1.0,
  CONTENT_WIDTH: 11.333,      // 13.333 - 1.0 - 1.0
  
  // Vertical Positioning
  TITLE_Y: 0.5,               // Top margin 0.5"
  TITLE_HEIGHT: 0.8,          // 0.8-1.0"
  
  SUBTITLE_Y: 1.5,            // Includes subheading
  SUBTITLE_HEIGHT: 0.4,
  
  BODY_Y: 2.0,                // Content starts at 2.0"
  BODY_HEIGHT: 4.5,           // 4.5-4.8"
  
  FOOTER_Y: 6.9               // Footer
};
```

### Typography
```javascript
const DESIGN_B_FONTS = {
  TITLE_FONT: "Georgia",      // Serif for action titles (2020 redesign)
  BODY_FONT: "Arial",         // Sans-serif for body
  // Fallbacks: Helvetica, Calibri
  
  // Font Sizes
  FONT_ACTION_TITLE: 26,      // 24-28pt Bold (Georgia)
  FONT_SUBTITLE: 15,          // 18-20pt Regular (Arial)
  FONT_BODY_LARGE: 17,        // 16-18pt Regular
  FONT_BODY_STANDARD: 14,     // 14-16pt Regular
  FONT_CHART_LABELS: 12,      // 12-14pt
  FONT_FOOTNOTES: 9,          // 9-10pt
  FONT_SOURCE: 9              // 9-10pt
};
```

### Signature Elements

#### Serif Action Titles
Uses Georgia serif font for gravitas and executive appeal.

```javascript
slide.addText("Market consolidation creates $2B acquisition opportunity", {
  x: 1.0, y: 0.5, w: 11.333, h: 0.8,
  fontSize: 26, bold: true,
  color: "003A70",            // Deep navy
  fontFace: "Georgia"         // ← Serif!
});
```

#### Waterfall Charts
This system favors waterfall charts for financial analysis.

---

## 2.3 Design System C (Brand Accent - Green)

**Visual Philosophy:** Clean, approachable, with distinctive green accent. Balance of professional and accessible.

### Color Palette
```javascript
const DESIGN_C = {
  // Primary Colors
  brandGreen: "86BC24",       // PANTONE PMS 368 C
  black: "000000",            // PANTONE PMS Black 6 C
  
  // Neutrals
  charcoal: "333333",         // Dark Gray
  mediumGray: "808080",       // Medium Gray
  white: "FFFFFF",            // Background
  lightGray: "F5F5F5",        // Light fill
  greenTint: "E8F5D6"         // 10% tint of brand green
};
```

### Layout Specifications
```javascript
const DESIGN_C_LAYOUT = {
  // Margins (standard 1.0")
  MARGIN_LEFT: 1.0,
  MARGIN_RIGHT: 1.0,
  CONTENT_WIDTH: 11.333,
  
  // Vertical Positioning
  TITLE_Y: 0.5,
  TITLE_HEIGHT: 0.8,
  
  SUBTITLE_Y: 1.5,
  SUBTITLE_HEIGHT: 0.4,
  
  BODY_Y: 2.0,
  BODY_HEIGHT: 4.5,
  
  FOOTER_Y: 6.9
};
```

### Typography
```javascript
const DESIGN_C_FONTS = {
  PRIMARY_FONT: "Open Sans",  // Primary (fallback: Calibri, Arial)
  
  // Font Sizes
  FONT_ACTION_TITLE: 24,      // 24-28pt Bold
  FONT_BODY_STANDARD: 13,     // 13-15pt Regular
  FONT_CHART_LABELS: 11,      // 11-13pt
  FONT_FOOTNOTES: 9           // 9-10pt
};
```

### Signature Elements

#### Green Dot Motif
Small green circle as visual focal point.

```javascript
slide.addShape(pres.shapes.OVAL, {
  x: 1.0, y: 0.6, w: 0.12, h: 0.12,
  fill: { color: "86BC24" }
});

// Title positioned after dot
slide.addText("Action title here", {
  x: 1.22, y: 0.5, w: 11.113, h: 0.8,
  fontSize: 24, bold: true,
  color: "000000",
  fontFace: "Calibri",
  margin: 0
});
```

---

## 2.4 Design System D (Impact Focus - Red Accent)

**Visual Philosophy:** Bold, data-focused, uses red sparingly for maximum impact on THE key data point.

### Color Palette
```javascript
const DESIGN_D = {
  // Primary Colors
  scarlet: "CC0000",          // Primary Red
  lightRed: "E04040",         // Lighter Red
  
  // Neutrals
  black: "000000",            // Black
  charcoal: "333333",         // Dark Gray (body text)
  mediumGray: "808080",       // Medium Gray
  mutedGray: "CCCCCC",        // Muted Gray (non-key data)
  white: "FFFFFF",            // Background
  lightGray: "F5F5F5"         // Light fill
};
```

### Layout Specifications
```javascript
const DESIGN_D_LAYOUT = {
  // Margins (tighter)
  MARGIN_LEFT: 0.8,
  MARGIN_RIGHT: 0.8,
  CONTENT_WIDTH: 11.7,
  
  // Vertical Positioning
  TITLE_Y: 0.4,
  TITLE_HEIGHT: 0.8,
  
  BODY_Y: 1.3,                // No subheading
  BODY_HEIGHT: 5.0,
  
  FOOTER_Y: 7.0
};
```

### Typography
```javascript
const DESIGN_D_FONTS = {
  PRIMARY_FONT: "Arial",      // Practical sans-serif
  // Alternative: Futura (if available)
  
  // Font Sizes
  FONT_ACTION_TITLE: 24,      // 22-26pt Bold
  FONT_BODY_STANDARD: 13,     // 13-15pt Regular
  FONT_CHART_LABELS: 11,      // 11-13pt
  FONT_FOOTNOTES: 9           // 9-10pt
};
```

### Signature Elements

#### Standout Color Strategy
**Red for THE key data point, gray for everything else.**

```javascript
// Chart: One bar red, rest gray
const data = [{
  name: "Revenue",
  labels: ["Product A", "Product B", "Product C"],
  values: [100, 250, 80]  // Product B is key
}];

slide.addChart(pres.charts.BAR, data, {
  chartColors: ["CCCCCC"],  // Default: muted gray
  // Manual highlight needed for key bar (red)
});

// In text: Highlight ONE number
slide.addText([
  { text: "Revenue grew ", options: { color: "333333" } },
  { text: "250%", options: { bold: true, color: "CC0000" } },  // ← Red!
  { text: " year-over-year", options: { color: "333333" } }
]);
```

---

## 2.5 Design System Comparison Matrix

| Element | System A | System B | System C | System D |
|---------|----------|----------|----------|----------|
| **Primary Color** | #006B3F Green | #003A70 Navy | #86BC24 Green | #CC0000 Red |
| **Font** | Trebuchet MS | Georgia + Arial | Open Sans | Arial |
| **Left Margin** | 0.8" | 1.0" | 1.0" | 0.8" |
| **Title Y** | 0.4" | 0.5" | 0.5" | 0.4" |
| **Body Y** | 1.4" | 2.0" | 2.0" | 1.3" |
| **Subheading** | No | Yes | Yes | Varies |
| **Special Element** | Bumper box | Serif titles | Green dot | Red standout |
| **Accent Feature** | Yellow highlight | Waterfall charts | Approachable | Single focus |
| **Body Height** | 5.0" | 4.5" | 4.5" | 5.0" |

---

# PART 3: SLIDE ARCHITECTURE PATTERNS

## 3.1 Universal Slide Structure (3-Zone Layout)

All professional consulting slides follow a three-zone structure:

```
┌─────────────────────────────────────────────┐
│ ZONE 1: ACTION TITLE                        │ 0.5-0.8" height
│ (+ optional subtitle)                       │
├─────────────────────────────────────────────┤
│                                             │
│ ZONE 2: BODY CONTENT                        │ 4.5-5.0" height
│ (charts, text, tables, diagrams)            │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ ZONE 3: SOURCE LINE + PAGE NUMBER          │ 0.3-0.5" height
│ (+ optional bumper statement)               │
└─────────────────────────────────────────────┘
```

**Zone 1 Requirements:**
- Action title: < 15 words, complete sentence, states the insight
- Font: 22-28pt bold
- Optional subtitle: Context/metric labels, 14-18pt regular

**Zone 2 Best Practices:**
- Use FULL height available (4.5-5.0")
- Never crowd multiple unrelated visuals
- One primary message per slide
- Direct labels preferred over legends

**Zone 3 Requirements:**
- Source citation on every data slide
- Page number aligned right
- Optional bumper statement (Design System A)

---

## 3.2 Slide Architecture Patterns

### Executive Summary
```
Zone 1: "Our recommendation is X based on three findings"
Zone 2: 
  - Finding 1 with key number (30% of space)
  - Finding 2 with key number (30%)
  - Finding 3 with key number (30%)
  - Implementation timeline or next steps (10%)
Zone 3: Source line
```

### Data Slide (Full-Width Chart)
```
Zone 1: "Metric grew 23% driven by segment Y"
Zone 2: Single chart occupying full width and height
Zone 3: Source + page number
```

### Data Slide (Left/Right Split)
```
Zone 1: Action title
Zone 2:
  LEFT (55-65%): Chart or core data
  RIGHT (35-45%): Insights box with bullet points
Zone 3: Source + page number (+ optional bumper if Design System A)
```

### Issue Tree Slide
```
Zone 1: "Master question decomposes into three sub-questions"
Zone 2: Tree diagram (MECE decomposition)
Zone 3: Source
```

### Implementation Roadmap
```
Zone 1: "Seven actions deliver results in 90 days"
Zone 2: Table with columns: # | Action | Owner | Target Date
Zone 3: Source + page number
```

---

(Due to character limits, I'll continue this in the next file. This is Part 1 of the reorganized skill.)

Would you like me to:
1. Continue creating the rest of the comprehensive clean skill file?
2. Or would you prefer I provide a shorter summary document?

Let me know and I'll complete the full reorganization!

# PART 4: DATA VISUALIZATION PRINCIPLES

## 4.1 Chart Selection Framework (Universal)

Choose charts based on the relationship you're showing:

| Relationship | Chart Types | When to Use |
|--------------|-------------|-------------|
| **Comparison** | Bar (horizontal/vertical), Column, Dot plot | Comparing values across categories |
| **Composition** | Stacked bar, Pie (avoid!), Treemap, Waterfall | Part-to-whole relationships |
| **Distribution** | Histogram, Box plot, Violin plot | Show spread and frequency |
| **Trend** | Line chart, Area chart, Slope chart | Changes over time |
| **Correlation** | Scatter plot, Bubble chart | Relationship between two variables |
| **Geographic** | Choropleth map, Symbol map | Location-based data |

**Golden Rules:**
- **Bar > Pie** — always. Human eye reads length better than area/angle
- **Direct labels > Legends** — reduces eye travel
- **One message per chart** — don't try to show too much
- **Remove chartjunk** — no 3D, shadows, gradients on charts
- **Order matters** — sort bars by value unless there's inherent order

---

## 4.2 Edward Tufte Principles

### Data-Ink Ratio
Maximize the proportion of ink devoted to data vs. decoration.

**Data ink:** The marks that represent data (bars, lines, points)
**Non-data ink:** Gridlines, borders, backgrounds, labels

**Formula:** Data-Ink Ratio = (Data-Ink / Total Ink)

**Target:** Aim for > 0.5 (at least half the ink should be data)

**How to improve:**
- Remove background fills
- Lighten gridlines to 10-20% opacity
- Remove chart borders
- Remove redundant labels
- Use direct labels instead of legends

### Chartjunk
Visual elements that do NOT represent data and impair comprehension.

**Common chartjunk to eliminate:**
- 3D effects on 2D charts
- Drop shadows
- Gradient fills
- Decorative fonts
- Unnecessary icons
- Busy backgrounds
- Extra tick marks

### Lie Factor
How much the graphic distorts the underlying data.

**Formula:** Lie Factor = (Size of effect shown in graphic / Size of effect in data)

**Target:** Lie Factor should be 1.0 (perfect representation)

**Common violations:**
- Truncated y-axis making small changes look huge (Lie Factor > 5)
- Area charts where both dimensions scale with value (Lie Factor = value²)
- Inconsistent scales between comparable charts

---

## 4.3 Cole Nussbaumer Knaflic's Six Lessons

### Lesson 1: Understand the Context
- Who is your audience?
- What do they need to know?
- What action should they take?

### Lesson 2: Choose an Appropriate Visual Display
- Simple text when you have 1-2 numbers
- Table when you need to reference specific values
- Chart when you need to show patterns/relationships

### Lesson 3: Eliminate Clutter
- Every element should have a purpose
- Remove:
  - Chart borders
  - Gridlines (or make them very light)
  - Data markers (unless needed for emphasis)
  - Legends (use direct labels)

### Lesson 4: Focus Attention Where You Want It
- Use color strategically (one accent color for key data)
- Use size (bigger = more important)
- Use position (top left = viewed first)
- Use preattentive attributes sparingly

### Lesson 5: Think Like a Designer
- Alignment: everything should line up with something
- White space: give elements room to breathe
- Contrast: make important things stand out
- Repetition: consistent fonts, colors, styles

### Lesson 6: Tell a Story
- Beginning: set context
- Middle: build tension
- End: resolution and call to action

---

## 4.4 Consulting-Specific Chart Guidelines

### Bar Charts
```
GOOD:
- Horizontal bars for long category labels
- Sorted by value (unless inherent order like time)
- Direct labels at end of bars
- No gridlines or minimal gridlines
- One accent color for key category

AVOID:
- 3D bars
- Vertical bars with rotated labels
- Legends when < 5 categories
```

### Line Charts
```
GOOD:
- Clear trend direction
- Direct labels at end of lines
- Limited colors (max 5 lines)
- Key line emphasized

AVOID:
- Too many lines (> 5)
- Dual y-axes (confusing)
- Area fills unless showing composition
```

### Waterfall Charts
**Best for:** Showing cumulative effect of sequential values

```
[Starting Value] → +Increase → -Decrease → +Increase → [Ending Value]

Use Cases:
- Revenue bridge (FY24 → FY25)
- Cost decomposition
- Margin analysis
```

### Tables
**When to use:**
- Audience needs specific lookup values
- Multiple units of measurement
- Both categorical and quantitative data

**Best practices:**
- Left-align text, right-align numbers
- Use light horizontal rules between rows
- Bold totals/key rows
- Limit decimal places (0-2 max)
- Use heatmap shading sparingly

---

# PART 5: PRESENTATION TYPE BLUEPRINTS

## 5.1 Board Update (15-20 slides)

**Audience:** Board of directors, C-suite executives  
**Duration:** 30-45 minutes  
**Tone:** Executive summary style, data-driven, action-oriented

**Structure:**
1. Cover slide
2. Executive summary (1-2 slides max) — governing thought + 3 key points
3. Performance vs. plan (2-3 slides) — actual vs. budget/forecast
4. Key initiatives update (3-5 slides) — status, milestones, issues
5. Risk & opportunity dashboard (1-2 slides)
6. Financial outlook (2-3 slides) — forecast, scenario analysis
7. Decisions needed (1-2 slides) — explicit asks
8. Appendix (backup slides)

**Key characteristics:**
- Lead with the answer (RSC variant)
- Heavy use of dashboards and KPI tracking
- Red/yellow/green status indicators
- Comparison to prior periods
- Clear decision points

---

## 5.2 Strategy Recommendation (40-80 slides)

**Audience:** Senior leadership team  
**Duration:** 90-120 minutes  
**Tone:** Analytical, hypothesis-driven, comprehensive

**Structure:**
1. Cover slide
2. Executive summary (2-3 slides) — SCR format
3. Situation (5-10 slides) — market, competition, internal capabilities
4. Complication (3-5 slides) — the strategic challenge
5. Analysis (20-40 slides) — hypothesis testing, data deep-dives
6. Resolution (10-15 slides) — recommended strategy, initiatives
7. Implementation roadmap (5-8 slides) — timeline, resources, governance
8. Risk mitigation (2-3 slides)
9. Appendix (20-40 slides)

**Key characteristics:**
- MECE decomposition throughout
- Heavy analytical rigor
- Options analysis (2-3 scenarios)
- Financial modeling (NPV, IRR, payback)
- Change management considerations

---

## 5.3 Investor Pitch (10-15 slides)

**Audience:** Venture capital, private equity, public markets  
**Duration:** 20-30 minutes  
**Tone:** Visionary, data-backed, growth-oriented

**Structure:**
1. Cover slide
2. Problem (1-2 slides) — market pain point, size of opportunity
3. Solution (2-3 slides) — your product/service, differentiation
4. Market opportunity (1-2 slides) — TAM/SAM/SOM, growth rate
5. Business model (1-2 slides) — unit economics, revenue model
6. Traction (2-3 slides) — customers, revenue, key metrics
7. Competition (1 slide) — 2×2 positioning map
8. Team (1 slide) — founder backgrounds, advisors
9. Financials (1-2 slides) — 3-5 year projection, key assumptions
10. Ask (1 slide) — funding amount, use of proceeds, valuation

**Key characteristics:**
- AIDA framework (Attention-Interest-Desire-Action)
- Compelling visuals (product screenshots, customer logos)
- Bold projections with credible backing
- Narrative of inevitability

---

## 5.4 Due Diligence Summary (60-120 slides)

**Audience:** Investment committee, transaction team  
**Duration:** Multiple sessions  
**Tone:** Comprehensive, risk-focused, fact-dense

**Structure:**
1. Cover + executive summary (3-5 slides)
2. Transaction overview (3-5 slides) — structure, terms, timeline
3. Market assessment (10-15 slides) — size, growth, dynamics, positioning
4. Business model deep-dive (15-25 slides) — revenue streams, cost structure, unit economics
5. Financial analysis (15-25 slides) — historical performance, quality of earnings, normalized EBITDA, working capital
6. Operational assessment (10-15 slides) — processes, systems, scalability
7. Management & organization (5-10 slides) — team, culture, retention risk
8. Technology & IP (5-10 slides) — proprietary assets, tech debt, cybersecurity
9. Commercial diligence (10-15 slides) — customer interviews, competitive position, vendor relationships
10. Risks & mitigations (5-8 slides) — red flags, areas requiring attention
11. Valuation & returns (10-15 slides) — scenarios, sensitivity analysis, exit options
12. Appendix (30-60 slides)

**Key characteristics:**
- Red flag sections clearly marked
- Issue-driven organization
- Detailed exhibits in appendix
- Explicit areas requiring further investigation

---

## 5.5 Transformation Roadmap (30-50 slides)

**Audience:** CEO, transformation office, operational leaders  
**Duration:** 60-90 minutes  
**Tone:** Inspiring but realistic, change-focused

**Structure:**
1. Cover + executive summary (2-3 slides)
2. Case for change (3-5 slides) — burning platform, aspiration
3. Current state assessment (5-8 slides) — capability gaps, performance baseline
4. Future state vision (3-5 slides) — target operating model, KPIs
5. Transformation initiatives (15-25 slides) — 5-10 initiatives, each with:
   - Objective & success metrics
   - Key activities & timeline
   - Resources required
   - Risks & dependencies
6. Integrated roadmap (2-3 slides) — Gantt chart, wave plan
7. Governance & enablers (3-5 slides) — decision rights, communication, training
8. Benefits case (2-3 slides) — financial impact, risk-adjusted returns

**Key characteristics:**
- Hero's journey narrative
- Clear before/after comparisons
- Realistic timelines (12-36 months)
- Explicit change management plan

---

# PART 6: GHOST DECK METHODOLOGY

## 6.1 What is a Ghost Deck?

A **ghost deck** is a storyline document created BEFORE building slides. It consists only of:
- Slide titles (action-oriented, < 15 words)
- Optional 1-line subtitle per slide
- No content, no visuals

**Purpose:** Validate the logical flow and narrative arc before investing time in design and data visualization.

**Origin:** Standard practice at top consulting firms. Ensures pyramid principle compliance and prevents "random walk" presentations.

---

## 6.2 Ghost Deck Process

### Step 1: Write the Governing Thought
One sentence stating your recommendation or conclusion.

Example: *"Acme should pursue digital-first strategy to capture $500M market opportunity and achieve 20% EBITDA margin by 2027"*

### Step 2: Decompose into 3-4 Level 1 Arguments (MECE)
Each argument supports the governing thought.

Example:
1. *"Digital channel delivers 2× customer lifetime value vs. traditional"*
2. *"Competitors are under-investing in digital, creating 18-month window"*
3. *"Required capabilities can be built for $50M with 12-month payback"*

### Step 3: Build Level 2 Evidence Slides
Each Level 1 argument gets 3-7 supporting slides.

Example for Argument 1:
- *"Digital customers spend 60% more annually ($450 vs. $280)"*
- *"Digital churn rate is half traditional (12% vs. 24% annually)"*
- *"Digital acquisition cost fell 40% in past 2 years to $85"*

### Step 4: Write All Titles as Complete Sentences
No topic labels. Every title states a conclusion.

WRONG: *"Market Size Analysis"*  
RIGHT: *"Addressable market will grow 12% annually to reach $8B by 2027"*

### Step 5: Read Title Sequence Aloud
Reading only the titles should tell the complete story in 2-3 minutes.

### Step 6: Validate MECE
- Are Level 1 arguments mutually exclusive? (No overlap)
- Are they collectively exhaustive? (Cover everything needed to prove governing thought)
- Do Level 2 slides fully support their Level 1 parent?

### Step 7: Get Stakeholder Alignment
Review ghost deck with client/leadership before building slides.

**Benefits:**
- Validates logic before design work
- Much faster to revise (titles only)
- Ensures executive summary writes itself (it's the pyramid apex)

---

## 6.3 Ghost Deck Example

```
SLIDE 1 (COVER)
[Project Title]

SLIDE 2 (EXEC SUMMARY - GOVERNING THOUGHT)
Acme should pursue digital-first strategy to capture $500M opportunity and achieve 20% EBITDA by 2027

SECTION 1: DIGITAL CHANNEL DELIVERS 2× CUSTOMER VALUE
SLIDE 3
Digital customers spend 60% more annually ($450 vs. $280 average)

SLIDE 4
Digital churn rate is half traditional (12% vs. 24% annually)

SLIDE 5
Digital acquisition cost fell 40% to $85, lowest in industry

SLIDE 6
Customer lifetime value: digital $3,200 vs. traditional $1,600

SECTION 2: COMPETITIVE WINDOW EXISTS FOR 18 MONTHS
SLIDE 7
Three main competitors are under-investing in digital (avg. 8% of revenue vs. industry 15%)

SLIDE 8
Market share opportunity: 12% of $500M market currently underserved digitally

SLIDE 9
First-mover advantage compounds: 18-month head start yields 3× customer base

SECTION 3: CAPABILITIES BUILDABLE FOR $50M WITH 12-MONTH PAYBACK
SLIDE 10
Required capabilities: e-commerce platform, CRM integration, digital marketing

SLIDE 11
Build vs. buy analysis: hybrid approach minimizes risk and time to market

SLIDE 12
Investment: $50M over 18 months (30% build, 70% buy/partner)

SLIDE 13
Payback analysis: $60M incremental EBITDA in Year 2, breakeven at Month 12

SLIDE 14 (IMPLEMENTATION ROADMAP)
Seven actions deliver results in 90 days: platform selection, partner onboarding, pilot launch

SLIDE 15 (NEXT STEPS)
Immediate actions: secure $15M Phase 1 budget, hire digital lead, launch vendor RFP
```

---

# PART 7: QUALITY GATES & VALIDATION

## 7.1 Pre-Build Quality Checklist

Run this checklist BEFORE creating any slides:

**Storyline:**
- [ ] Ghost deck completed and reviewed?
- [ ] Governing thought is a single, clear recommendation?
- [ ] Level 1 arguments are MECE?
- [ ] All slide titles are action-oriented (< 15 words, complete sentences)?
- [ ] Title sequence tells complete story when read aloud?
- [ ] Appropriate framework selected (SCR, SCQA, hypothesis-driven, etc.)?

**Scope:**
- [ ] Main deck under 25 slides for executives, under 50 for detailed analysis?
- [ ] Appendix slides clearly separated?
- [ ] Each slide has ONE primary message?

**Audience Alignment:**
- [ ] Decision-makers and influencers identified?
- [ ] Content matches audience's context level?
- [ ] Avoiding jargon or acronyms unfamiliar to audience?

---

## 7.2 Design Quality Checklist

Run this during slide creation:

**Visual Design:**
- [ ] Consistent design system applied (A, B, C, or D)?
- [ ] All slides use correct margins (0.8" or 1.0" based on system)?
- [ ] Charts use full body height (4.5-5.0")?
- [ ] Fonts are correct (Trebuchet, Georgia, Open Sans, or Arial)?
- [ ] Colors are exact hex codes (not approximate)?
- [ ] No chartjunk (3D, shadows, gradients on charts)?

**Layout:**
- [ ] 3-zone structure followed on every slide?
- [ ] Action titles fit in 2 lines maximum?
- [ ] White space used effectively (not cramped)?
- [ ] Alignment consistent (everything lines up)?

**Data Visualization:**
- [ ] Right chart type for the data relationship?
- [ ] Data-ink ratio > 0.5?
- [ ] Direct labels used instead of legends?
- [ ] Bars sorted by value (unless time series)?
- [ ] Y-axis starts at zero (or truncation clearly noted)?
- [ ] Color used strategically (1-2 accent colors max)?

**Typography:**
- [ ] Action titles: 22-28pt bold?
- [ ] Body text: 13-15pt regular?
- [ ] Chart labels: 10-13pt?
- [ ] Source notes: 9-10pt?
- [ ] No more than 2 fonts used?

---

## 7.3 Post-Build Quality Checklist

Run this on completed deck:

**Content:**
- [ ] Every data slide has a source citation?
- [ ] All numbers are accurate and current?
- [ ] No orphan slides (slides that don't support a Level 1 argument)?
- [ ] Consistent terminology throughout?
- [ ] Acronyms defined on first use?

**Flow:**
- [ ] Logical progression from slide to slide?
- [ ] Transitions between sections smooth?
- [ ] Executive summary is complete standalone (could be sent alone)?
- [ ] Next steps / call to action is clear?

**Polish:**
- [ ] No typos or grammatical errors?
- [ ] Page numbers present on all slides except cover?
- [ ] Appendix clearly marked (different footer)?
- [ ] File named appropriately (ClientName_Topic_Date_vX.pptx)?
- [ ] All slides render correctly in PowerPoint (not just preview)?

**Presentation Ready:**
- [ ] Deck tested in presentation mode?
- [ ] All animations intentional and smooth?
- [ ] Transitions consistent (or none)?
- [ ] Backup slides anticipate Q&A?
- [ ] Print version tested (if physical handouts needed)?

---

## 7.4 Red Flags to Fix Immediately

| Red Flag | Why It's Bad | How to Fix |
|----------|-------------|------------|
| **Topic labels as titles** | Doesn't tell the story | Rewrite as action titles |
| **> 15 words in title** | Title wraps to 3+ lines, unreadable | Shorten, remove filler |
| **No source citation** | Undermines credibility | Add source to every data slide |
| **Inconsistent margins** | Looks amateur | Lock down layout constants |
| **Pie charts** | Humans read length better than angle | Use bar chart |
| **Legends on 3-bar chart** | Forces eye travel | Use direct labels |
| **3D charts** | Distorts data, looks dated | Use flat 2D |
| **Truncated y-axis without note** | Lie factor > 2 | Start at zero or label clearly |
| **Too many colors** | Lacks focus | 1-2 accent colors max |
| **Walls of text** | Audience zones out | Convert to visual or bullet points |

---


# PART 8: PPTXGENJS IMPLEMENTATION GUIDE

## 8.1 Critical Setup — Slide Dimensions (THE #1 MISTAKE)

### ❌ WRONG (Default PptxGenJS)
```javascript
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';  // ❌ This is 10" x 5.625" — WRONG!
```

**Problem:** Built-in `LAYOUT_16x9` creates slides that are **10" x 5.625"**, not consulting standard 13.333" x 7.5".

**What happens when you use wrong dimensions:**
- All margins/positions calculated for 13.333" width
- Content overflows right edge (trying to fit 11.7" into 8.4" space)
- Charts overflow bottom (trying to fit 5.0" into 4.2" space)
- Fonts look huge (sized for larger slide, compressed into smaller one)

### ✅ CORRECT (Consulting Standard)
```javascript
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();

// ALWAYS define custom consulting layout first
pres.defineLayout({ name: 'CONSULTING_16x9', width: 13.333, height: 7.5 });
pres.layout = 'CONSULTING_16x9';

pres.author = 'Your Company';
pres.title = 'Your Presentation Title';
```

**Consulting Standard Dimensions:**
- Width: 13.333 inches (12,192,000 EMU)
- Height: 7.5 inches (6,858,000 EMU)
- Aspect Ratio: 16:9 widescreen

---

## 8.2 Design System Constants (JavaScript)

Use these constants for pixel-perfect implementation:

### Design System A
```javascript
const SYSTEM_A = {
  // Colors
  primaryDark: "006B3F",
  primaryLight: "00A651",
  accentYellow: "FFD700",
  accentRed: "E04040",
  accentBlue: "0077C8",
  charcoal: "2D2D2D",
  mediumGray: "808080",
  white: "FFFFFF",
  cardFill: "F2F2F2",
  
  // Layout
  MARGIN_LEFT: 0.8,
  MARGIN_RIGHT: 0.8,
  CONTENT_WIDTH: 11.7,
  TITLE_Y: 0.4,
  TITLE_HEIGHT: 0.8,
  BODY_Y: 1.4,
  BODY_HEIGHT: 5.0,
  BUMPER_Y: 6.5,
  FOOTER_Y: 7.1,
  
  // Typography
  FONT: "Trebuchet MS",
  FONT_ACTION_TITLE: 24,
  FONT_BODY: 13,
  FONT_CHART: 11,
  FONT_BUMPER: 13,
  FONT_FOOTER: 9
};
```

### Design System B
```javascript
const SYSTEM_B = {
  // Colors
  deepNavy: "003A70",
  accentBlue: "005DAA",
  teal: "00857C",
  charcoal: "333333",
  mediumGray: "999999",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  chartGray: "C0C5C9",
  
  // Layout
  MARGIN_LEFT: 1.0,
  MARGIN_RIGHT: 1.0,
  CONTENT_WIDTH: 11.333,
  TITLE_Y: 0.5,
  TITLE_HEIGHT: 0.8,
  SUBTITLE_Y: 1.5,
  SUBTITLE_HEIGHT: 0.4,
  BODY_Y: 2.0,
  BODY_HEIGHT: 4.5,
  FOOTER_Y: 6.9,
  
  // Typography
  FONT_TITLE: "Georgia",
  FONT_BODY: "Arial",
  FONT_ACTION_TITLE: 26,
  FONT_SUBTITLE: 15,
  FONT_BODY: 14,
  FONT_CHART: 12,
  FONT_FOOTER: 9
};
```

### Design System C
```javascript
const SYSTEM_C = {
  // Colors
  brandGreen: "86BC24",
  black: "000000",
  charcoal: "333333",
  mediumGray: "808080",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  greenTint: "E8F5D6",
  
  // Layout (same as System B)
  MARGIN_LEFT: 1.0,
  MARGIN_RIGHT: 1.0,
  CONTENT_WIDTH: 11.333,
  TITLE_Y: 0.5,
  TITLE_HEIGHT: 0.8,
  SUBTITLE_Y: 1.5,
  SUBTITLE_HEIGHT: 0.4,
  BODY_Y: 2.0,
  BODY_HEIGHT: 4.5,
  FOOTER_Y: 6.9,
  
  // Typography
  FONT: "Open Sans",
  FONT_ACTION_TITLE: 24,
  FONT_BODY: 13,
  FONT_CHART: 11,
  FONT_FOOTER: 9
};
```

### Design System D
```javascript
const SYSTEM_D = {
  // Colors
  scarlet: "CC0000",
  lightRed: "E04040",
  black: "000000",
  charcoal: "333333",
  mediumGray: "808080",
  mutedGray: "CCCCCC",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  
  // Layout (same as System A)
  MARGIN_LEFT: 0.8,
  MARGIN_RIGHT: 0.8,
  CONTENT_WIDTH: 11.7,
  TITLE_Y: 0.4,
  TITLE_HEIGHT: 0.8,
  BODY_Y: 1.3,
  BODY_HEIGHT: 5.0,
  FOOTER_Y: 7.0,
  
  // Typography
  FONT: "Arial",
  FONT_ACTION_TITLE: 24,
  FONT_BODY: 13,
  FONT_CHART: 11,
  FONT_FOOTER: 9
};
```

---

## 8.3 Design System A - Bumper Statement Implementation

Design System A requires a bumper statement on every content slide.

```javascript
// Bumper background
slide.addShape(pres.shapes.RECTANGLE, {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.BUMPER_Y,
  w: SYSTEM_A.CONTENT_WIDTH,
  h: 0.45,
  fill: { color: SYSTEM_A.cardFill }
});

// Left green accent bar (signature element)
slide.addShape(pres.shapes.RECTANGLE, {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.BUMPER_Y,
  w: 0.08,
  h: 0.45,
  fill: { color: SYSTEM_A.primaryDark }
});

slide.addText("Your key takeaway reinforcing the action title", {
  x: SYSTEM_A.MARGIN_LEFT + 0.2,
  y: SYSTEM_A.BUMPER_Y + 0.1,
  w: SYSTEM_A.CONTENT_WIDTH - 0.2,
  h: 0.25,
  fontSize: SYSTEM_A.FONT_BUMPER,
  bold: true,
  color: SYSTEM_A.charcoal,
  fontFace: SYSTEM_A.FONT
});
```

**Yellow Bumper (for critical insights):**
```javascript
// Use yellow background for THE most important slide
slide.addShape(pres.shapes.RECTANGLE, {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.BUMPER_Y,
  w: SYSTEM_A.CONTENT_WIDTH,
  h: 0.45,
  fill: { color: SYSTEM_A.accentYellow }  // ← Yellow
});
```

---

## 8.4 Chart Implementation

### Chart Configuration Template
```javascript
const chartData = [{
  name: "Series Name",
  labels: ["Q1", "Q2", "Q3", "Q4"],
  values: [100, 150, 120, 180]
}];

slide.addChart(pres.charts.BAR, chartData, {
  x: MARGIN_LEFT,
  y: BODY_Y,
  w: CONTENT_WIDTH,      // Full width or split
  h: BODY_HEIGHT,        // CRITICAL: Use full body height
  
  barDir: "col",         // Column chart (vertical bars)
  chartColors: ["006B3F"],  // Primary color (hex!)
  
  chartArea: { fill: { color: "FFFFFF" } },
  
  catAxisLabelColor: "2D2D2D",
  valAxisLabelColor: "2D2D2D",
  catAxisLabelFontSize: 10,
  valAxisLabelFontSize: 10,
  
  valGridLine: { color: "E0E0E0", size: 0.5 },
  catGridLine: { style: "none" },
  
  showValue: false,
  showLegend: false
});
```

---

## 8.5 Implementation Roadmap Table

```javascript
const actionItems = [
  ["#", "Action", "Owner/POC", "Target Date"],
  ["1", "Finalize Q1 demand plan", "Supply Chain Director", "15-Mar-26"],
  ["2", "Align capacity with forecast", "Operations VP", "22-Mar-26"],
  ["3", "Launch marketing campaigns", "Marketing Director", "01-Apr-26"],
  ["4", "Deepen partnerships", "Channel Manager", "15-Apr-26"],
  ["5", "Establish review cadence", "Finance Director", "01-May-26"],
  ["6", "Implement dashboard", "Analytics Manager", "15-May-26"],
  ["7", "Conduct variance analysis", "Planning Manager", "Quarterly"]
];

slide.addTable(actionItems, {
  x: MARGIN_LEFT,
  y: BODY_Y,
  w: CONTENT_WIDTH,
  h: BODY_HEIGHT,
  
  border: { type: "solid", pt: 1, color: "808080" },
  fill: { color: "FFFFFF" },
  
  fontFace: "Trebuchet MS",
  fontSize: 11,
  color: "2D2D2D",
  align: "left",
  valign: "middle",
  
  rowH: 0.64,
  colW: [0.5, 5.5, 3.2, 2.5],  // Must sum to CONTENT_WIDTH!
  
  rowProps: [
    // Header: Primary color, white text, bold
    { fill: { color: "006B3F" }, color: "FFFFFF", bold: true, fontSize: 12, align: "center" }, "center" },
    // Data rows: Alternating white/gray
    { fill: { color: "FFFFFF" } },
    { fill: { color: "F2F2F2" } },
    { fill: { color: "FFFFFF" } },
    { fill: { color: "F2F2F2" } },
    { fill: { color: "FFFFFF" } },
    { fill: { color: "F2F2F2" } },
    { fill: { color: "FFFFFF" } }
  ]
});
```

---

## 8.6 Shadow Effects

```javascript
// Helper function — ALWAYS create fresh shadow objects!
const makeShadow = () => ({ 
  type: "outer", 
  blur: 6, 
  offset: 2, 
  angle: 135, 
  color: "000000", 
  opacity: 0.08 
});

// Apply to shapes
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1.0, y: 2.0, w: 5.0, h: 4.0,
  fill: { color: "F2F2F2" },
  line: { color: "006B3F", width: 1.5 },
  shadow: makeShadow()  // ← Fresh object each call!
});
```

**CRITICAL:** Never reuse the same shadow object or you'll get corruption.

---

## 8.7 Complete Slide Template (Design System A)

```javascript
let slide = pres.addSlide();
slide.background = { color: SYSTEM_A.white };

// Action title (< 15 words!)
slide.addText("Revenue grew 23% YoY driven by enterprise expansion", {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.TITLE_Y,
  w: SYSTEM_A.CONTENT_WIDTH,
  h: SYSTEM_A.TITLE_HEIGHT,
  fontSize: SYSTEM_A.FONT_ACTION_TITLE,
  bold: true,
  color: SYSTEM_A.charcoal,
  fontFace: SYSTEM_A.FONT
});

// Body content (chart example)
slide.addChart(pres.charts.BAR, chartData, {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.BODY_Y,
  w: SYSTEM_A.CONTENT_WIDTH,
  h: SYSTEM_A.BODY_HEIGHT,
  barDir: "col",
  chartColors: [SYSTEM_A.primaryDark]
  // ... rest of chart config
});

// BUMPER STATEMENT (required for System A!)
slide.addShape(pres.shapes.RECTANGLE, {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.BUMPER_Y,
  w: SYSTEM_A.CONTENT_WIDTH,
  h: 0.45,
  fill: { color: SYSTEM_A.cardFill }
});

slide.addShape(pres.shapes.RECTANGLE, {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.BUMPER_Y,
  w: 0.08,
  h: 0.45,
  fill: { color: SYSTEM_A.primaryDark }
});

slide.addText("Enterprise growth positions company for market leadership", {
  x: SYSTEM_A.MARGIN_LEFT + 0.2,
  y: SYSTEM_A.BUMPER_Y + 0.1,
  w: SYSTEM_A.CONTENT_WIDTH - 0.2,
  h: 0.25,
  fontSize: SYSTEM_A.FONT_BUMPER,
  bold: true,
  color: SYSTEM_A.charcoal,
  fontFace: SYSTEM_A.FONT
});

// Footer
slide.addText("Source: Company data", {
  x: SYSTEM_A.MARGIN_LEFT,
  y: SYSTEM_A.FOOTER_Y,
  w: 10,
  h: 0.3,
  fontSize: SYSTEM_A.FONT_FOOTER,
  color: SYSTEM_A.mediumGray,
  fontFace: SYSTEM_A.FONT
});

slide.addText("5", {  // Slide number
  x: SYSTEM_A.MARGIN_LEFT + SYSTEM_A.CONTENT_WIDTH - 0.5,
  y: SYSTEM_A.FOOTER_Y,
  w: 0.5,
  h: 0.3,
  fontSize: SYSTEM_A.FONT_FOOTER,
  color: SYSTEM_A.mediumGray,
  fontFace: SYSTEM_A.FONT,
  align: "right"
});
```

---

## 8.8 Common Pitfalls & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| **Content overflows right** | Wrong slide width (10" vs 13.333") | Use `pres.defineLayout()` with 13.333" width |
| **Charts too tall** | Using fixed height instead of variable | Use `BODY_HEIGHT` constant (4.5-5.0") |
| **Fonts look huge** | Sizing for 13.333" but rendering in 10" | Fix slide dimensions first |
| **Shadow corruption** | Reusing same shadow object | Create fresh object: `shadow: makeShadow()` |
| **Colors don't match** | Using color names instead of hex | Always use hex codes ("006B3F") |
| **Action title overflows** | > 15 words or > 2 lines | Shorten title, remove filler words |
| **Table columns don't fit** | Column widths don't sum to CONTENT_WIDTH | Recalculate: total must equal 11.333" or 11.7" |
| **Chart labels unreadable** | Font size too small | Use 9-11pt for axis, 10-12pt for data labels |

---

## 8.9 Quality Checklist

**Before Generation:**
- [ ] Slide dimensions set to 13.333" x 7.5"?
- [ ] Action title < 15 words and states conclusion?
- [ ] Correct margins for design system? (A/D: 0.8", B/C: 1.0")
- [ ] Chart uses full BODY_HEIGHT (4.5-5.0")?
- [ ] Colors are hex codes, not names?
- [ ] Correct font for design system?

**After Generation:**
- [ ] Open in PowerPoint — all elements within slide boundaries?
- [ ] No overflow on right or bottom edges?
- [ ] Fonts render correctly?
- [ ] Action titles max 2 lines?
- [ ] Every data slide has source citation?
- [ ] System A slides have bumper statements?
- [ ] Slide numbers present and positioned correctly?

---

## 8.10 Grammar & Language Quality

**CRITICAL:** All presentation text must be grammatically correct and professionally written.

### Pre-Generation Grammar Rules

**Action Titles:**
- ✅ Complete sentences with subject + verb
- ✅ Consistent verb tense (present or future, not mixed)
- ✅ No sentence fragments
- ✅ Correct article usage (a/an/the)
- ✅ Proper subject-verb agreement
- ❌ No typos or spelling errors

**Body Content:**
- ✅ Parallel structure in bullet lists
- ✅ Consistent capitalization
- ✅ Proper punctuation
- ✅ No run-on sentences
- ✅ Clear pronoun references

**Common Grammar Mistakes to Avoid:**

| Mistake | Wrong | Right |
|---------|-------|-------|
| Missing articles | "Revenue grew driven by expansion" | "Revenue grew, driven by expansion" |
| Subject-verb disagreement | "The team are meeting" | "The team is meeting" |
| Inconsistent tense | "Sales grew 20% and will decline next year" | "Sales grew 20% and are projected to decline" |
| Missing commas | "In Q1 revenue increased" | "In Q1, revenue increased" |
| Pronoun confusion | "The company and their strategy" | "The company and its strategy" |
| Fragment titles | "Revenue growth" | "Revenue grew 23% in FY26" |

### Grammar Checking Process

**Before finalizing presentation:**

1. **Read all action titles aloud** - they should sound natural and complete
2. **Check parallel structure** - all bullet points in a list should use same grammatical form
3. **Verify numbers match text** - "three actions" and table shows 3 rows
4. **Spell check** - run automated spell checker
5. **Read bumper statements** - should be concise and grammatically complete

### Grammar Quality Checklist

Run this on ALL text before generating presentation:

- [ ] All action titles are complete sentences?
- [ ] Consistent verb tense throughout?
- [ ] No typos or spelling errors?
- [ ] Bullet points use parallel structure?
- [ ] Numbers and text match (e.g., "three actions" = 3 rows)?
- [ ] Proper punctuation (commas, periods, colons)?
- [ ] Correct article usage (a, an, the)?
- [ ] Subject-verb agreement correct?
- [ ] No sentence fragments?
- [ ] Professional tone throughout?

### Professional Language Standards

**Use:**
- Active voice: "The team achieved 120% of target"
- Specific numbers: "Revenue grew 23%" not "Revenue grew significantly"  
- Strong verbs: "captured", "achieved", "delivered" not "got", "made", "did"
- Present tense for current state: "Market share is 35%"
- Future tense for projections: "Revenue will reach $5M"

**Avoid:**
- Passive voice: "Target was achieved by the team"
- Vague language: "approximately", "about", "around" (unless truly uncertain)
- Weak verbs: "got", "went", "made"
- Mixed tenses: "Sales grew and are declining" 
- Clichés: "game-changer", "move the needle", "low-hanging fruit"

---

## 8.11 Troubleshooting & Debugging

**Common PptxGenJS errors and solutions:**

### Error 1: "Cannot read property 'addSlide' of undefined"
**Cause:** Presentation object not initialized  
**Fix:**
```javascript
// Wrong
let pres;
pres.addSlide();

// Right
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
```

### Error 2: Chart data not displaying
**Cause:** Incorrect data format or missing values  
**Fix:**
```javascript
// Wrong - values as strings
values: ["100", "150", "200"]

// Right - values as numbers
values: [100, 150, 200]

// Wrong - empty values
values: [100, null, 200]

// Right - use 0 for missing data
values: [100, 0, 200]
```

### Error 3: Text overflow outside slide boundaries
**Cause:** Using default 10" width instead of 13.333"  
**Debug steps:**
1. Check `pres.defineLayout()` was called
2. Verify `CONTENT_WIDTH = 13.333 - MARGIN_LEFT - MARGIN_RIGHT`
3. Check all x + w values don't exceed 13.333

### Error 4: Fonts not rendering correctly
**Cause:** Font not available on system  
**Fix:**
```javascript
// Provide fallback fonts
fontFace: "Trebuchet MS, Verdana, Arial"

// Or check font availability first
const FONT = "Open Sans"; // Use Arial if Open Sans unavailable
```

### Error 5: Table columns don't fit
**Cause:** Column widths don't sum to CONTENT_WIDTH  
**Fix:**
```javascript
// Calculate and verify
const colWidths = [0.5, 5.5, 3.2, 2.5];
const total = colWidths.reduce((a, b) => a + b, 0);
console.log(`Total: ${total}, Should be: ${CONTENT_WIDTH}`);

// Adjust proportionally if needed
const scaleFactor = CONTENT_WIDTH / total;
const adjustedWidths = colWidths.map(w => w * scaleFactor);
```

---

## 8.12 Presenter Notes Best Practices

**Use presenter notes for:**
- Talking points (what to say, not what's on slide)
- Transition phrases to next slide
- Anticipated questions and answers
- Time estimates per slide
- Supporting data not on slide

**Format:**
```javascript
slide.addNotes(
`TALKING POINTS:
- Start with the main insight: "As you can see..."
- Highlight the 23% growth number
- Mention competitive context if asked

TRANSITION:
"This leads us to our quarterly breakdown..."

Q&A PREP:
Q: Why Q2 so low?
A: Seasonal pattern, consistent with prior years

TIME: 2 minutes`
);
```

**Best practices:**
- Keep notes brief (bullet points, not paragraphs)
- Include slide number reference
- Add phonetic spellings for difficult names/terms
- Flag slides that typically generate questions
- Note any live demo or animation cues

---

## 8.13 Export & Delivery Formats

### PDF Export
**When to use:** Email distribution, printing, archival

**Best practices:**
```javascript
// After creating presentation
await pres.writeFile({ fileName: "output.pptx" });

// Then open in PowerPoint and:
// File → Save As → PDF
// Options: 
// ✅ Include hidden slides (for backup)
// ✅ High quality (300 DPI for print)
// ❌ Don't include notes (unless handout)
```

### Print Handouts
**Considerations:**
- Use Design System B or C (better for B&W printing)
- Avoid dark backgrounds (waste ink)
- Ensure 12pt minimum font size
- Test color blindness compatibility
- Add page numbers on every slide

**Handout-specific adjustments:**
```javascript
// For print version, use higher contrast
const PRINT_COLORS = {
  primaryDark: "000000",  // Black instead of green
  chartColors: ["333333", "666666", "999999"],  // Grayscale
  background: "FFFFFF"    // White only
};
```

### Email Distribution
**File naming convention:**
```
[Client]_[Topic]_[Date]_[Version].pptx

Examples:
Acme_Sales_Forecast_2026-02-12_v1.pptx
Acme_Sales_Forecast_2026-02-12_v2_FINAL.pptx
Acme_Sales_Forecast_2026-02-12_BOARD_READY.pptx
```

**Version control:**
- v1, v2, v3 = Working drafts
- DRAFT = Not ready for distribution
- FINAL = Ready for presentation
- BOARD_READY = Final with all approvals

---

## 8.14 Advanced Chart Types

### Waterfall Chart (Revenue Bridge)
**Use for:** Showing cumulative effect of sequential changes
```javascript
const waterfallData = [
  { name: "FY24 Revenue", value: 12200 },
  { name: "Price Increase", value: 2000 },
  { name: "Volume Growth", value: 4500 },
  { name: "Product Mix", value: -400 },
  { name: "FY26 Revenue", value: 18300 }
];

// Note: PptxGenJS doesn't have native waterfall
// Alternative: Use stacked bar chart with hidden base
```

### Combo Charts (Bar + Line)
**Use for:** Showing two related metrics with different scales
```javascript
slide.addChart([pres.charts.BAR, pres.charts.LINE], [
  { name: "Revenue", values: [100, 150, 180], chartType: pres.charts.BAR },
  { name: "Margin %", values: [15, 18, 20], chartType: pres.charts.LINE, options: { secondaryValAxis: true } }
], {
  x: MARGIN_LEFT, y: BODY_Y, w: CONTENT_WIDTH, h: BODY_HEIGHT
});
```

### Marimekko Chart (Market Share by Segment)
**Use for:** Showing market size AND share simultaneously

**Note:** Not natively supported - create in Excel then import as image

### Small Multiples (Sparklines)
**Use for:** Showing trends for multiple categories compactly
```javascript
// Create multiple small line charts in grid
const sparklineData = [
  { product: "Product A", trend: [10, 12, 15, 14, 18] },
  { product: "Product B", trend: [20, 19, 22, 25, 24] },
  { product: "Product C", trend: [15, 14, 16, 15, 17] }
];

let yPos = BODY_Y;
sparklineData.forEach(item => {
  slide.addChart(pres.charts.LINE, [{
    name: item.product,
    values: item.trend
  }], {
    x: MARGIN_LEFT, y: yPos, w: 3, h: 1,
    showLegend: false, showTitle: true, title: item.product
  });
  yPos += 1.2;
});
```

---

## 8.15 Common Revision Patterns

**Typical feedback and how to address:**

### "Make it more concise"
**What they mean:** Too many slides or too much text per slide  
**Fix:**
- Combine related slides
- Move detail to appendix
- Use more charts, less text
- Shorten action titles to < 10 words

### "Add more data"
**What they mean:** Claims need evidence  
**Fix:**
- Add source citations
- Include comparison benchmarks
- Add trend data (not just snapshot)
- Provide context (vs. plan, vs. prior year)

### "Can you make it pop more?"
**What they mean:** Visually boring  
**Fix:**
- Use accent colors strategically (yellow highlights in System A)
- Add charts instead of bullet points
- Use left/right split layouts
- Add bumper statements with key takeaways

### "This doesn't flow"
**What they mean:** Story logic is broken  
**Fix:**
- Create ghost deck (titles only) and read aloud
- Check pyramid principle compliance
- Add transition slides between sections
- Ensure each slide answers "so what?"

### "Too technical for this audience"
**What they mean:** Assuming too much knowledge  
**Fix:**
- Add context slides upfront
- Define acronyms on first use
- Use analogies and metaphors
- Simplify chart labels

---

## 8.16 Accessibility Considerations

### Color Contrast
**Ensure text is readable:**
```javascript
// Good contrast ratios (WCAG AA standard)
✅ Dark text on white: #2D2D2D on #FFFFFF (15:1 ratio)
✅ White text on dark green: #FFFFFF on #006B3F (4.8:1 ratio)
❌ Light gray on white: #CCCCCC on #FFFFFF (1.6:1 ratio - fails)

// Test at: https://webaim.org/resources/contrastchecker/
```

### Alt Text for Charts
**Add descriptions for screen readers:**
```javascript
slide.addChart(pres.charts.BAR, data, {
  // ... chart config
  altText: "Bar chart showing quarterly sales from Q1 to Q4 FY26. Q1 and Q4 are highest at 5,400 units each, Q2 lowest at 3,300 units."
});
```

### Font Size Minimums
- **Body text:** Never below 11pt
- **Chart labels:** Never below 9pt  
- **Action titles:** 22-28pt (already spec'd)

### Color Blindness
**Test your color palette:**
```javascript
// Avoid red-green combinations for critical distinctions
❌ Bad: Red for decline, green for growth
✅ Good: Blue for historical, orange for forecast

// Use patterns in addition to colors
✅ Solid bars for actual, striped for forecast
```

---

## 8.17 Animation & Transition Guidelines

**General rule:** Less is more in professional presentations

### When to Use Animations
✅ **Good uses:**
- Build complex charts step-by-step
- Reveal bullet points sequentially (for suspense)
- Emphasize key data point

❌ **Avoid:**
- Slide transitions (use "None" or simple "Fade")
- Flying text or spinning elements
- Sound effects
- Multiple animations per slide

### Implementation
```javascript
// PptxGenJS doesn't support animations
// If needed, add manually in PowerPoint after export
// Or note in presenter notes: "Build bullets one-by-one"
```

### Professional Standards
- **Board presentations:** No animations
- **Sales presentations:** Minimal (data builds only)
- **Webinars:** Light animations acceptable
- **Training:** More animation okay for engagement

---


# PART 9: QUICK REFERENCE CARDS

## 9.1 Framework Selection Card

| Situation | Framework | Structure |
|-----------|-----------|-----------|
| Executive audience, clear recommendation | SCR | Situation → Complication → Resolution |
| Executive audience, controversial | SCQA | Add Question before Answer |
| Complex strategy project | Hypothesis-driven | Master hypothesis → Sub-hypotheses → Evidence |
| Exhaustive analysis | Issue-driven | WHY/HOW tree decomposition |
| Sales/pitch | AIDA | Attention → Interest → Desire → Action |

---

## 9.2 Chart Selection Card

| Data Relationship | Chart Type | Example |
|-------------------|------------|---------|
| Compare categories | Bar chart | Revenue by product line |
| Show trend over time | Line chart | Monthly sales growth |
| Show composition | Stacked bar | Market share breakdown |
| Show distribution | Histogram | Customer age distribution |
| Show correlation | Scatter plot | Price vs. demand |
| Show cumulative effect | Waterfall | Revenue bridge YoY |

---

## 9.3 Design System Selection Card

| System | Best For | Key Feature |
|--------|----------|-------------|
| **A** | Modern, data-intensive | Bumper statements, yellow highlights, tighter margins |
| **B** | Traditional, executive | Serif titles, classic navy, standard margins |
| **C** | Approachable, brand-focused | Green dot motif, clean design |
| **D** | High-impact, focused | Red standout on THE key data point |

---

## 9.4 Action Title Formula Card

```
[SUBJECT] + [VERB] + [OBJECT] + [NUMBER/TIMEFRAME]

Examples:
✓ "Revenue grew 23% YoY driven by enterprise expansion"
✓ "Three digital competitors captured 18% share in 24 months"
✓ "Operating margin will improve 400bps by 2027 with cost program"

Avoid:
✗ "Revenue Analysis" (topic label)
✗ "Our revenue might grow" (weasel words)
✗ "Revenue grew due to many factors including market conditions and..." (>15 words)
```

---

# PART 10: DARK THEME VARIANT (KIMI DESIGN SYSTEM)

This section documents production-verified dark theme measurements extracted from professional presentation templates.

## 10.1 Dark Theme Color Palette

```javascript
const DARK_THEME = {
  // Backgrounds
  darkBg: "1A1A1A",           // Primary dark background
  cardBg: "2D2D2D",           // Card/panel background
  
  // Accents
  accentPurple: "8B5CF6",     // Violet accent
  accentCyan: "06B6D4",       // Cyan accent
  accentOrange: "F97316",     // Orange accent
  
  // Text
  textPrimary: "FFFFFF",      // White text
  textSecondary: "A3A3A3",    // Gray text (neutral-400)
  
  // Data Colors
  chartBlue: "3B82F6",        // Blue-500
  chartGreen: "10B981",       // Emerald-500
  chartYellow: "F59E0B",      // Amber-500
  chartRed: "EF4444"          // Red-500
};
```

## 10.2 Dark Theme Typography

```javascript
const DARK_FONTS = {
  PRIMARY_FONT: "Inter",      // Sans-serif for all text
  MONO_FONT: "JetBrains Mono", // Code/data
  
  // Font Sizes
  HERO_TITLE: 48,             // 48pt Bold
  SECTION_TITLE: 32,          // 32pt Bold
  ACTION_TITLE: 24,           // 24pt Bold
  BODY_LARGE: 16,             // 16pt Regular
  BODY_STANDARD: 14,          // 14pt Regular
  CAPTION: 12,                // 12pt Regular
  CODE: 14                    // 14pt Mono
};
```

## 10.3 Dark Theme Layout (48×48px Grid)

All measurements based on 48px base unit:

```javascript
const DARK_LAYOUT = {
  GRID_UNIT: 48,              // Base 48px grid
  
  MARGIN_OUTER: 96,           // 2 grid units (96px = 1")
  MARGIN_INNER: 48,           // 1 grid unit
  
  CARD_PADDING: 24,           // 0.5 grid units
  CARD_RADIUS: 12,            // Rounded corners
  
  SPACING_XS: 12,             // 0.25 grid units
  SPACING_SM: 24,             // 0.5 grid units
  SPACING_MD: 48,             // 1 grid unit
  SPACING_LG: 96,             // 2 grid units
  SPACING_XL: 144             // 3 grid units
};
```

---

# METADATA

## Skill Information

- **Skill Version:** 3.0 (Rebranded)
- **Created:** 2026-02-12
- **Updated:** 2026-02-12 (Removed firm branding, consolidated frameworks)
- **Sources:** Universal consulting best practices, Barbara Minto (Pyramid Principle), Edward Tufte (Data Visualization), Cole Nussbaumer Knaflic (Storytelling with Data), production-verified design systems
- **Compatibility:** PptxGenJS 3.x+, PowerPoint 2016+, Google Slides (partial)
- **License:** MIT

## Installation

```bash
npm install pptxgenjs
```

## Basic Usage

```javascript
const pptxgen = require("pptxgenjs");

let pres = new pptxgen();

// CRITICAL: Set correct dimensions first!
pres.defineLayout({ name: 'CONSULTING_16x9', width: 13.333, height: 7.5 });
pres.layout = 'CONSULTING_16x9';

pres.author = 'Your Company';
pres.title = 'Your Presentation Title';

// Add slides using templates from this skill...

// Save
await pres.writeFile({ fileName: "output.pptx" });
```

---

## End of Consulting Presentation Master Skill

