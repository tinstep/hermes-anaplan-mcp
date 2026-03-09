---
name: consulting-powerpoint-master
description: "The definitive AI skill for creating consulting-grade PowerPoint presentations at McKinsey, BCG, Bain, and Deloitte standards. Covers every dimension: storyline frameworks (SCR, SCQA, Pyramid Principle, hypothesis-driven, issue-driven, narrative arc), firm-specific design systems with exact fonts/colors/spacing, slide architecture patterns, data visualization taxonomy, presentation-type blueprints (board, strategy, pitch, due diligence, transformation, workshop), ghost-deck methodology, quality gates, and python-pptx implementation. Human-level precision on measurements, typography, and layout."
license: MIT
---

# Consulting PowerPoint Master Skill

## Overview

This skill is the single comprehensive reference for building consulting-grade PowerPoint presentations. It synthesizes best practices from **McKinsey & Company**, **Boston Consulting Group (BCG)**, **Bain & Company**, **Deloitte**, and the broader Big 4, combined with academic data visualization principles from **Edward Tufte** and **Cole Nussbaumer Knaflic**. Every measurement, font size, spacing value, and color code is specified at production-ready precision.

## When to Use This Skill

**Use for:** Any PowerPoint creation task — from a 5-slide board update to a 100-slide strategy deck. This skill provides the framework selection logic, design system, and quality gates to produce work indistinguishable from a top-tier consulting firm's output.

**How to use:** Start with Part 1 (Framework Selection) to choose the right storyline. Then use Part 2 (Firm Design Systems) for the visual identity. Use Part 3 (Slide Architecture) for layout patterns. Use Part 4 (Data Visualization) for charts. Finish with Part 5 (Quality Gates).

---

# PART 1: STORYLINE FRAMEWORKS — WHAT TO USE WHEN

## 1.1 The Pyramid Principle (Barbara Minto / McKinsey)

The foundational logic structure for ALL consulting communication. Created by Barbara Minto at McKinsey in the 1960s. Adopted universally across MBB and Big 4.

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

McKinsey's primary storytelling structure. Mirrors how humans process problems.

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

The dominant problem-solving approach at all MBB firms. Particularly favored by BCG.

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

## 1.5 Action-Oriented Storyline

Every element is a declarative action statement, not a topic label.

| Topic Label (WRONG) | Action Title (RIGHT) |
|---------------------|---------------------|
| "Market Analysis" | "Addressable market will grow 12% annually, driven by SMB in Southeast Asia" |
| "Competitive Landscape" | "Three digital-native competitors captured 18% share in 24 months" |
| "Financial Overview" | "Current trajectory yields 400bps margin shortfall against 2027 plan" |
| "Recommendations" | "Three-pronged digital acceleration can close the margin gap in 18 months" |

**Rules for action titles (McKinsey standard):**
- Must be a complete sentence with subject and verb
- Must state the insight/implication, not the topic
- Fewer than 15 words, maximum 2 lines
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
  ├── Is this a pitch or sales context?
  │     YES → AIDA or BAB
  │
  ├── Is this a project update?
  │     YES → Action-oriented with traffic-light status
  │
  └── Is this a transformation roadmap?
        YES → SCR + Action-oriented
              Current state → Target state → How to get there
```

---

# PART 2: FIRM-SPECIFIC DESIGN SYSTEMS

## 2.1 McKinsey & Company

### Brand Identity
```yaml
Primary Color:    Deep Navy Blue — #003A70, RGB(0, 58, 112)
Accent Color:     McKinsey Blue — #005DAA, RGB(0, 93, 170)
Secondary:        Teal — #00857C, RGB(0, 133, 124)
Body Text:        Charcoal — #333333, RGB(51, 51, 51)
Subtle Text:      Medium Gray — #999999, RGB(153, 153, 153)
Background:       White — #FFFFFF
Light Fill:       Light Gray — #F5F5F5, RGB(245, 245, 245)
Chart Gray:       Silvery Gray — #C0C5C9, RGB(192, 197, 201)  # More blue than pure gray
```

### Typography
```yaml
Title Font:       Georgia (serif) — used for action titles since 2020 redesign
Body Font:        Arial (sans-serif) — all body text, labels, footnotes
Fallback:         Helvetica, Calibri

Font Sizes:
  Action Title:   24-28pt, Bold, Georgia
  Subtitle:       18-20pt, Regular, Arial
  Body Large:     16-18pt, Regular, Arial
  Body Standard:  14-16pt, Regular, Arial
  Chart Labels:   12-14pt, Regular, Arial
  Footnotes:      9-10pt, Regular, Arial
  Source Line:     9-10pt, Regular, Arial

Line Spacing:     1.5 for body text
Alignment:        Left-aligned body text (easier to scan)
Emphasis:         Bold only — never italic, never underline, never multiple font families
ALL CAPS:         Only for small labels, metadata, source headers (never sentences)
```

### Slide Dimensions & Spacing
```yaml
Width:            13.333 inches (standard widescreen)
Height:           7.5 inches
Aspect Ratio:     16:9

Margins:
  Left:           1.0 inch
  Right:          1.0 inch
  Top:            0.5 inch (above action title)
  Bottom:         0.6 inch (above footer)

Action Title:
  Position:       x=1.0", y=0.5"
  Width:          11.333" (full width minus margins)
  Height:         0.8-1.0" (fits 2 lines max)
  Font:           24-28pt Georgia Bold
  Color:          #003A70 (Deep Navy) or #333333 (Charcoal)

Subtitle / Exhibit Header:
  Position:       x=1.0", y=1.5"
  Width:          11.333"
  Height:         0.4"
  Font:           14-16pt Arial Regular
  Color:          #666666

Body / Chart Area:
  Position:       x=1.0", y=2.0"
  Width:          11.333"
  Height:         4.5-4.8"

Footer Zone:
  Position:       y=6.9"
  Source Line:    x=1.0", 9pt Arial, #999999
  Slide Number:   x=12.0", right-aligned, 9pt Arial, #999999
  Separator Line: 0.5pt, #CCCCCC, full width at y=6.85"

Spacing Between Elements:
  Title to Subtitle:      0.2-0.3"
  Subtitle to Body:       0.3-0.5"
  Between bullet items:   0.15-0.2" (paragraph spacing)
  Between cards/sections: 0.2-0.3"
  Chart to source line:   0.3"
```

### Slide Anatomy
```
┌──────────────────────────────────────────────────────────────┐
│  ACTION TITLE: Complete sentence stating the "so what"       │ ← 24-28pt Georgia Bold
│  Maximum 2 lines. Every slide has this.                      │    y=0.5"
├──────────────────────────────────────────────────────────────┤
│  Subtitle: Revenue by segment, $M, 2020-2025                 │ ← 14-16pt Arial
│                                                              │    y=1.5"
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                   BODY / EXHIBIT AREA                        │
│                                                              │ ← y=2.0" to y=6.5"
│    Chart, table, framework, or structured text               │
│    that PROVES the action title                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Source: Company data, 2025                    │  Slide 5/20 │ ← 9pt Arial, y=6.9"
└──────────────────────────────────────────────────────────────┘
```

### McKinsey Signature Elements
- **Ghost deck methodology:** Titles only → validate storyline → build exhibits
- **Waterfall/bridge charts:** McKinsey popularized this chart type
- **Harvey balls:** Semi-quantitative scoring in capability assessments
- **Mekko charts:** Two-dimensional market composition
- **Exhaustive footnotes:** Every data point cited with date, source, methodology
- **Bold-bullet format** for executive summaries (see Section 2.5)

---

## 2.2 Boston Consulting Group (BCG)

### Brand Identity
```yaml
Primary Color:    BCG Green (Dark) — #006B3F, RGB(0, 107, 63)
Accent Green:     BCG Green (Light) — #00A651, RGB(0, 166, 81)
Highlight:        Sharp Yellow — #FFD700 (for data emphasis)
Alert:            Soft Red — #E04040
Info:             Electric Blue — #0077C8
Body Text:        Dark Charcoal — #2D2D2D, RGB(45, 45, 45)
Subtle Text:      Medium Gray — #808080
Background:       White — #FFFFFF
Card Fill:        Light Gray — #F2F2F2
```

### Typography
```yaml
Primary Font:     Trebuchet MS — EXCLUSIVE font across all slides
Fallback:         Verdana, Arial

Font Sizes:
  Action Title:   22-26pt, Bold, Trebuchet MS
  Body Large:     16-18pt, Regular, Trebuchet MS
  Body Standard:  13-15pt, Regular, Trebuchet MS
  Chart Labels:   11-13pt, Regular, Trebuchet MS
  Bumper Text:    12-14pt, Bold, Trebuchet MS
  Footnotes:      9-10pt, Regular, Trebuchet MS
  Source Line:     9pt, Regular, Trebuchet MS

Line Spacing:     1.4-1.5 for body text
Emphasis:         Bold for key phrases; yellow highlight for critical data points
```

### Slide Dimensions & Spacing
```yaml
Width:            13.333 inches
Height:           7.5 inches
Aspect Ratio:     16:9

Margins:
  Left:           0.8-1.0 inch
  Right:          0.8-1.0 inch
  Top:            0.4 inch
  Bottom:         0.5 inch

Action Title:
  Position:       x=0.8", y=0.4"
  Width:          11.7"
  Height:         0.7-0.9"
  Font:           22-26pt Trebuchet MS Bold
  Color:          #2D2D2D
  NOTE:           BCG eliminated subheadings in newer templates to maximize action title impact

Body Area:
  Position:       x=0.8", y=1.4"
  Width:          11.7"
  Height:         4.8-5.0"
  Organization:   Frequently split into left/right sections (context left, argument right)

Bumper Statement:
  Position:       x=0.8", y=6.5"
  Width:          11.7"
  Height:         0.5"
  Background:     #F2F2F2 or light green tint
  Border:         2pt left border in BCG Green
  Font:           12-14pt Trebuchet MS Bold
  Purpose:        Reinforces the "so what" at the bottom of the slide

Footer:
  Source Line:    x=0.8", y=7.1", 9pt, #808080
  Slide Number:   Right-aligned, 9pt

No-Fly Zones:     BCG templates include designated blank areas that MUST remain empty
Guide Rails:      All content must snap to PowerPoint guide rails
```

### BCG Three-Part Slide Anatomy
```
┌──────────────────────────────────────────────────────────────┐
│  ACTION TITLE: The key takeaway as a complete sentence       │ ← 22-26pt Trebuchet Bold
│                                                              │    y=0.4"
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐        ┌─────────────────────────┐      │
│  │  Left Section   │        │  Right Section          │      │
│  │  (Context or    │        │  (Core data or          │      │ ← y=1.4" to y=6.3"
│  │   framing)      │        │   argument)             │      │
│  └─────────────────┘        └─────────────────────────┘      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ ▌ BUMPER: Reinforcement of the key insight in bold           │ ← 12-14pt Bold, y=6.5"
├──────────────────────────────────────────────────────────────┤
│  Source: [citation]                              Slide X/Y   │ ← 9pt, y=7.1"
└──────────────────────────────────────────────────────────────┘
```

### BCG Signature Elements
- **Bumper statement:** Formal part of BCG design — a takeaway box at slide bottom
- **Left/right organization:** Context (left) + core argument (right)
- **Yellow highlighting:** Draws attention to the single most important data point
- **No subheading:** Newer templates removed subheadings entirely
- **BCG Growth-Share Matrix:** The firm's most famous framework
- **Formal data visualization design system** (developed with Rare Volume agency)
- **Sequential comparison:** Data presented in overlay layers for progressive absorption

---

## 2.3 Bain & Company

### Brand Identity
```yaml
Primary Color:    Bain Scarlet Red — #CC0000, RGB(204, 0, 0)
Accent Red:       Lighter Red — #E04040
Body Text:        Black — #000000 or Dark Gray #333333
Subtle Text:      Medium Gray — #808080
Background:       White — #FFFFFF
Neutral Fill:     Light Gray — #F5F5F5
Chart Muted:      Gray — #CCCCCC (everything except the key data point)
```

### Typography
```yaml
Primary Font:     Sans-serif — closest to Futura or Lapidia
                  Practical fallback: Arial or Calibri (sans-serif, clean)
Fallback:         Helvetica, Arial

Font Sizes:
  Action Title:   22-26pt, Bold
  Body Large:     16-18pt, Regular
  Body Standard:  13-15pt, Regular
  Chart Labels:   11-13pt, Regular
  Footnotes:      9-10pt, Regular

Style:            Modern sans-serif, uppercase lettering for headers
Line Spacing:     1.4-1.5
Emphasis:         Bold for key claims; red for the ONE most important number
```

### Slide Dimensions & Spacing
```yaml
Width:            13.333 inches
Height:           7.5 inches

Margins:
  Left:           0.8-1.0 inch
  Right:          0.8-1.0 inch
  Top:            0.4 inch
  Bottom:         0.5 inch

Action Title:     x=0.8", y=0.4", 22-26pt Bold
Body Area:        x=0.8", y=1.3", height=5.0"
Footer:           y=7.0", 9pt

Design Philosophy: Deliberately simpler than BCG or McKinsey.
                   Clean layouts, concise data, no visual embellishment.
                   "Results, not reports."
```

### Bain Two-Dimensional Slide Flow
```
VERTICAL FLOW (within each slide):
  ┌──────────────────┐
  │  KEY MESSAGE     │  ← Top: the "so what" (action title)
  │  (Action Title)  │
  ├──────────────────┤
  │  ARGUMENTS       │  ← Middle: supporting logic
  │  (Body Content)  │
  ├──────────────────┤
  │  EVIDENCE        │  ← Base: data and proof
  │  (Charts/Data)   │
  └──────────────────┘

HORIZONTAL FLOW (between slides):
  Slide 1 → Slide 2 → Slide 3 → Slide 4
  Each transition should feel INEVITABLE, not jarring.
```

### Bain Signature Elements
- **Standout color strategy:** Red for THE key data point; gray for everything else
- **Tables vs. charts decision:** Explicitly trained to evaluate whether a table communicates better
- **Marimekko/Mekko charts:** Bain is particularly known for these
- **Practical, action-oriented tone:** Jargon-free, direct, implementation-focused
- **Fewer, more impactful slides** than BCG or McKinsey
- **"Results, not reports"** philosophy shapes every design decision

---

## 2.4 Deloitte

### Brand Identity
```yaml
Primary Color:    Deloitte Green — #86BC24, RGB(134, 188, 36), PANTONE PMS 368 C
Secondary:        Black — #000000, PANTONE PMS Black 6 C
Neutral:          Dark Gray — #333333
Subtle:           Medium Gray — #808080
Background:       White — #FFFFFF
Light Fill:       Off-White — #F5F5F5
Card Fill:        Light Green Tint — #E8F5D6 (10% of brand green)
Signature:        The Green Dot — used as a focal design element throughout
```

### Typography
```yaml
Primary Font:     Open Sans (all content)
Logo Font:        Mediator Narrow Extra Bold (Para Type foundry)
Fallback:         Arial, Calibri

Font Sizes:
  Action Title:   24-28pt, Bold, Open Sans
  Body Large:     16-18pt, Regular, Open Sans
  Body Standard:  13-15pt, Regular, Open Sans
  Chart Labels:   11-13pt, Regular, Open Sans
  Footnotes:      9-10pt, Regular, Open Sans

Line Spacing:     1.4-1.5
```

### Deloitte Slide Structure (Tier 1 Slide Format)
```
┌──────────────────────────────────────────────────────────────┐
│  ZONE 1 — ACTION TITLE                                       │ ← Declarative sentence
│  Largest font on the slide. States a conclusion.             │    24-28pt Bold
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ZONE 2 — BODY                                               │
│  Charts, diagrams, tables proving the title.                 │ ← Core content area
│  Everything connects to and supports the title.              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ ▌ ZONE 3 — BUMPER (optional): The single most important      │ ← Takeaway box
│ ▌ "so what" insight reinforced.                              │    12-14pt Bold
├──────────────────────────────────────────────────────────────┤
│  Source: [citation]                              Slide X/Y   │
└──────────────────────────────────────────────────────────────┘
```

### Deloitte TIM Framework (Quality Gate Per Slide)
Every slide must pass:
- **T (Topic):** What is this slide about?
- **I (Intention):** Why is this being shown?
- **M (Message):** What should the audience DO with this?

If you cannot articulate all three, the slide is not ready.

### Deloitte Signature Elements
- **Green dot motif:** Starting point for pie charts, focal element in bubble charts, highlight marker
- **Pentagram design system:** Data visualization templates developed with Pentagram
- **Bold grid system:** Inspired by tax ledgers — evokes rigor, order, confidence
- **20+ chart and infographic templates** with production-ready Illustrator files
- **Restrained palette:** Limited colors so green dot stands out
- **Sparing animation:** Only when it enhances clarity

---

## 2.5 Universal Executive Summary Format (All Firms)

The **bold-bullet format** used at McKinsey, BCG, and Bain:

```
SITUATION: [1-2 sentences of baseline context the audience already knows]

COMPLICATION: [1-2 sentences of what changed and why action is needed]

RESOLUTION:
  **Key claim #1 as a bold complete sentence**
    - Supporting evidence with specific data (e.g., "revenue declined 12% YoY")
    - Additional supporting detail or implication

  **Key claim #2 as a bold complete sentence**
    - Supporting evidence with specific data
    - Additional detail

  **Key claim #3 as a bold complete sentence**
    - Supporting evidence with specific data
    - Additional detail
```

**Rule:** Resolution = 60-70% of executive summary content.

---

## 2.6 Firm Comparison Matrix

| Element | McKinsey | BCG | Bain | Deloitte |
|---------|----------|-----|------|----------|
| **Primary Color** | Deep Navy #003A70 | Green #006B3F | Scarlet Red #CC0000 | Green #86BC24 |
| **Font** | Georgia (titles) + Arial (body) | Trebuchet MS | Futura/Lapidia-style | Open Sans |
| **Action Title Size** | 24-28pt | 22-26pt | 22-26pt | 24-28pt |
| **Body Text Size** | 14-16pt | 13-15pt | 13-15pt | 13-15pt |
| **Subheading** | Present | Eliminated (newer) | Varies | Present |
| **Bumper/Takeaway Box** | Rare | Formal standard | Used | Optional (Zone 3) |
| **Emphasis Method** | Bold phrases | Yellow highlight | Red standout color | Green dot focal |
| **Slide Density** | Higher (text-heavy) | Moderate (graphics-heavy) | Lower (simplest) | Balanced |
| **Tone** | Methodical, authoritative | Intellectually ambitious | Direct, practical | Professional, structured |
| **Signature Chart** | Waterfall/bridge | Growth-Share Matrix | Marimekko/Mekko | Gantt/process flow |

---

# PART 3: SLIDE ARCHITECTURE PATTERNS

## 3.1 Waterfall Logic (Sequential Flow)

Each slide logically leads to the next. Audience cannot understand slide N without slide N-1.

```
Context → Trigger → Impact → Options → Recommendation → Implementation
```

**Use for:** Due diligence walk-throughs, financial model builds, root cause analysis
**Risk:** If audience loses thread, subsequent argument collapses
**Mitigation:** Signposting slides, mini-recaps, visual roadmap

## 3.2 Parallel Structure

Multiple independent arguments support the same governing thought. Sections consumed in any order.

```
GOVERNING THOUGHT: "Three factors support entering Market X"
  ├── Section A: Market Attractiveness (3-5 slides)
  ├── Section B: Competitive Advantage (3-5 slides)
  └── Section C: Financial Returns (3-5 slides)
SYNTHESIS: "All three factors confirm recommendation"
```

**Use for:** Strategy recommendations, multi-workstream updates, comparative analyses
**Design:** Section dividers with consistent numbering, each section has own mini-SCR

## 3.3 Problem-Solution Pairs

Each problem immediately followed by its solution. Creates cognitive satisfaction.

```
Problem 1 → Solution 1
Problem 2 → Solution 2
Problem 3 → Solution 3
SYNTHESIS: Combined recommendation
```

**Use for:** Operational improvement, risk assessment, gap analysis, audit findings
**Rule:** NEVER present a problem without a solution

## 3.4 Evidence-Conclusion Patterns

**Top-down (deductive — the consulting default):**
```
CONCLUSION: "We recommend X"
  Evidence Slide 1: Because A
  Evidence Slide 2: Because B
  Evidence Slide 3: Because C
```

**Bottom-up (inductive — use sparingly):**
```
Evidence A → Evidence B → Evidence C → CONCLUSION: "Therefore, X"
```

Use bottom-up only when: conclusion is controversial, audience is skeptical, evidence trail IS the story

---

# PART 4: PRESENTATION TYPE BLUEPRINTS

## 4.1 Board / Executive Presentation

```yaml
Audience:         C-suite, board directors
Framework:        Pyramid Principle (top-down) + SCR executive summary
Slide Count:      15-25 slides main deck + appendix (2-3x main deck length)
Key Principle:    Lead with the answer. First slide after cover = recommendation.

Structure:
  1. Cover slide (1)
  2. Executive summary — SCR with bold-bullet format (1-2)
  3. Supporting argument sections (3-4 sections, 3-5 slides each)
  4. Implementation and next steps (2-3)
  5. Appendix — detailed analysis (15-50+ slides)

Design Rules:
  - Every slide stands alone with clear action title
  - Horizontal read tells complete story
  - Heavy "so what?" — every data point connects to implication
  - Appendix = safety net for any question the board asks
  - Numbers, not adjectives ("grew 12%" not "grew significantly")
```

## 4.2 Strategy Presentation

```yaml
Audience:         C-suite, strategy team
Framework:        SCQA + Hypothesis-driven
Slide Count:      40-80 slides
Key Principle:    Both diagnosis and prescription required.

Structure:
  1. Executive summary — SCR (2-3)
  2. Market assessment — size, growth, trends, segments (5-8)
  3. Competitive landscape — positioning, share, competitor strategy (5-8)
  4. Internal capability assessment — strengths, gaps (5-8)
  5. Strategic options evaluation — 3 options against criteria (5-8)
  6. Recommended strategy — chosen option with rationale (5-8)
  7. Implementation roadmap — phased plan with milestones (5-8)
  8. Financial impact — business case, investment, returns (3-5)
  9. Risks and mitigants (2-3)
  10. Next steps and governance (1-2)
```

## 4.3 Sales / Pitch Deck

```yaml
Audience:         Prospects, investors
Framework:        AIDA or Before-After-Bridge
Slide Count:      15-25 slides
Key Principle:    Build understanding and desire before the ask.

AIDA Structure:
  1. Hook / attention grabber (1-2)
  2. Problem definition + market context (4-6)
  3. Solution + proof points (5-8): demos, case studies, ROI
  4. Call to action with specific next steps (1-2)

Startup Pitch Variant:
  1. Problem (1)
  2. Solution (1)
  3. Market size — TAM/SAM/SOM (1)
  4. Business model (1)
  5. Traction (1-2)
  6. Competition (1)
  7. Team (1)
  8. Financials (1)
  9. The Ask (1)

Design: More visual, less text. Strong social proof. Clear specific ask on final slide.
```

## 4.4 Implementation / Project Update

```yaml
Audience:         Steering committee, project sponsors
Framework:        Action-oriented with traffic-light status
Slide Count:      10-15 slides
Key Principle:    Exception-based reporting — detail only on what's off-track.

Structure:
  1. Overall status summary (1)
  2. Key accomplishments since last update (1-2)
  3. Issues and risks requiring decisions (2-3)
  4. Upcoming milestones / look-ahead (1-2)
  5. Detailed workstream updates (3-5)
  6. Action items with owners and deadlines (1)

Design: Harvey balls, RAG indicators, Gantt charts, consistent template across all updates
```

## 4.5 Due Diligence Presentation

```yaml
Audience:         Investment committee, PE partners
Framework:        Issue-driven (MECE due diligence framework)
Slide Count:      60-100+ slides
Key Principle:    Exhaustive, evidence-heavy, read more than presented.

Structure:
  1. Executive summary — deal thesis + key findings (2-3)
  2. Market and competitive assessment (10-15)
  3. Financial analysis — historical + projected (10-15)
  4. Operational assessment (8-12)
  5. Management assessment (3-5)
  6. Risk analysis with mitigants (5-8)
  7. Valuation (5-8)
  8. Recommendations and conditions (2-3)
  9. Appendix (20-40+)

Design: Waterfall charts for financial decomposition, tornado charts for sensitivity,
        benchmarking tables, clear separation of facts vs. management claims vs. assumptions
```

## 4.6 Transformation Roadmap

```yaml
Audience:         Executive team, transformation office
Framework:        SCR + Action-oriented
Slide Count:      30-50 slides
Key Principle:    Connect current pain to future vision with a credible path.

Structure:
  1. Burning platform / case for change (3-5)
  2. Current state assessment — maturity levels, pain points (5-8)
  3. Vision and target operating model (3-5)
  4. Transformation pillars — 3-5 major workstreams (5-10)
  5. Phased roadmap — Foundation → Build → Scale (3-5)
  6. Quick wins — value in first 90 days (1-2)
  7. Investment and benefits timeline (2-3)
  8. Governance and decision rights (1-2)
  9. Risk management (1-2)
  10. Next steps (1)

Design: Swim lane diagrams, phase gates, maturity models (5 levels),
        benefits realization curves, change management plan
```

## 4.7 Workshop Facilitation Deck

```yaml
Audience:         Workshop participants (interactive)
Framework:        Process-driven, non-linear
Slide Count:      20-40 slides (many are instruction/template slides)
Key Principle:    The facilitator IS the narrative, not the slides.

Structure:
  1. Welcome + objectives (1)
  2. Context setting — brief, <10% of total time (2-3)
  3. Activity 1 + instructions (2-3)
  4. Debrief + synthesis (1)
  5. Activity 2 + instructions (2-3)
  6. [Repeat activity/debrief cycle]
  7. Summary of outputs + next steps (1-2)

Design: Minimal text, clear activity instructions (timing, expected output,
        group composition, materials). Include templates: 2x2 matrices,
        prioritization grids, impact-effort charts. Visual timers.
```

---

# PART 5: DATA VISUALIZATION

## 5.1 Chart Selection Decision Tree

```
What is the analytical purpose?
  │
  ├── COMPOSITION (what makes up the whole?)
  │     → Stacked bar, Marimekko, treemap, 100% stacked bar
  │
  ├── COMPARISON (how do items differ?)
  │     → Bar chart, grouped bar, spider/radar, bullet chart
  │
  ├── RELATIONSHIP (how are variables connected?)
  │     → Scatter plot, bubble chart, heatmap
  │
  ├── DISTRIBUTION (how is data spread?)
  │     → Histogram, box plot, violin plot
  │
  ├── TREND OVER TIME (how has it changed?)
  │     → Line chart, area chart, slope graph
  │
  ├── FLOW / CHANGE (what contributed to the change?)
  │     → Waterfall, Sankey, dumbbell chart
  │
  └── GEOGRAPHIC (where?)
        → Choropleth map, bubble map
```

**Data point count guidelines:**
- Fewer than 5: simple text or clean bar chart
- 5-20: bar chart, line chart, scatter plot
- 20-100: scatter plot with annotations, heatmap
- 100+: heatmap, density plot, or aggregate first

## 5.2 The "Big Six" Chart Families

| Family | Variants | Best For |
|--------|----------|----------|
| **Bar/Column** | Simple, grouped, stacked, 100% stacked, horizontal, diverging | Categorical comparison, ranking |
| **Line** | Simple, multi-line, area, stacked area | Time series, trends |
| **Waterfall/Bridge** | Revenue bridge, cost bridge, EBITDA bridge | How a value changes through sequential contributions |
| **Marimekko/Mekko** | Standard Mekko, bar Mekko, spine chart | Two-dimensional part-to-whole |
| **Scatter** | Simple, bubble (adds 3rd variable via size), quadrant | Relationship, clustering, outliers |
| **100% Charts** | 100% stacked bar, 100% stacked area | Mix analysis, composition over time |

## 5.3 Specialized Consulting Charts

| Type | Description | Use Case |
|------|-------------|----------|
| **Tornado/Sensitivity** | Horizontal bars left/right from center | Sensitivity analysis: "Which assumptions matter most?" |
| **Harvey Balls** | Circles filled to varying degrees | Capability assessments, vendor evaluations |
| **Gantt** | Horizontal bars on timeline | Implementation roadmaps, project plans |
| **Swim Lane** | Process flow in horizontal lanes by actor | Operating model design, RACI |
| **Spider/Radar** | Polygon on circular grid | Maturity assessments, multi-dimension benchmarking |
| **RAG Indicators** | Red/Amber/Green status | Project dashboards, risk registers |
| **2x2 Matrix** | Four quadrants, two axes | BCG Matrix, Effort-Impact, Risk-Likelihood |
| **Treemap** | Nested rectangles by area | Portfolio composition, budget allocation |
| **Sankey** | Flow diagram, width = quantity | Customer journey, value chain, revenue flow |
| **Bullet Chart** | Compact bar showing actual vs. target | KPI dashboards |
| **Dumbbell/Connected Dot** | Two dots connected by a line | Before/after, gap analysis |

## 5.4 Edward Tufte's Principles

**Data-Ink Ratio:** Maximize by removing every element that doesn't represent data. Remove chart borders, background colors, decorative gridlines, unnecessary legends, redundant axis labels.

**Chartjunk:** Useless visual elements to eliminate — gratuitous patterns, 3D effects, decorative gridlines, clip art, excessive color variation.

**Lie Factor:** Size of effect shown in graphic ÷ Size of effect in data. Must equal ~1.0. Common violations: area/volume for linear quantities, truncated y-axes, inconsistent scales.

**Small Multiples:** Series of identical charts, each showing different data slice. Enables direct comparison. "At the heart of quantitative reasoning: Compared to what?"

**Sparklines:** Tiny word-sized graphics embedded in text/tables. Show trends without disrupting flow.

## 5.5 Cole Nussbaumer Knaflic's Six Lessons

**1. Understand Context:** WHO is the audience? WHAT should they DO? HOW will you communicate? Distill into the Big Idea (point of view + stakes + action).

**2. Choose Appropriate Display:**
- Simple text: 1-2 numbers → make the number large
- Tables: audience needs to look up specific values
- Line charts: continuous data and time series
- Bar charts: categorical comparisons (always start y-axis at zero)
- Scatter plots: relationship between two variables
- **Avoid:** pie charts, 3D charts, secondary y-axes, donut charts

**3. Eliminate Clutter:** Every element adds cognitive load. Remove: chart borders, background fills, gridlines (or make very faint), data markers on line charts, excessive decimals, redundant labels, legends (label directly).

**4. Focus Attention (Preattentive Attributes):** Use color, size, position sparingly. **"If everything is bold, nothing is bold."** Single accent color for the key data point; everything else in gray.

**5. Think Like a Designer:** Alignment to invisible grid. Accessibility (8% of men are colorblind). Aesthetics support tolerance for complexity.

**6. Tell a Story:** Beginning (setup) → Middle (conflict) → End (resolution). State key message 3 times: title, annotation, verbal. Horizontal read = storyline test.

## 5.6 Universal Chart Design Rules (All Firms)

```yaml
Action Title:        States the CONCLUSION, not a description
                     "Revenue grew 15% driven by pricing" NOT "Revenue by Year"
Y-Axis:              Start at zero for bar/column charts (non-negotiable)
Legends:             Eliminate — label data series directly on the chart
Color Strategy:      Accent color for key data point; gray for everything else
                     McKinsey: Navy blue accent
                     BCG: Yellow highlight
                     Bain: Red standout
                     Deloitte: Green dot focal
Chart Junk:          Remove 3D effects, decorative gridlines, backgrounds, borders
Gridlines:           Light gray, 0.5pt, only if needed for reading values
Data Labels:         Direct on chart, 10-12pt, clearly readable
Source Citation:      MANDATORY on every data exhibit — no exceptions
                     Format: "Source: [name], [date]" at bottom, 9pt
Aspect Ratio:        Maintain proportional relationships
Consistency:         Same scales across related charts for comparison
Annotations:         OUTSIDE chart area — never overlay on data
                     Use callout boxes, leader lines, or side panels
```

---

# PART 6: THE GHOST DECK METHODOLOGY

The single most important process in consulting presentation creation. Used at McKinsey, BCG, Bain, and Deloitte.

## 6.1 The 8-Step Process

```
Step 1: Define the Governing Thought
  → Single sentence: the main recommendation the deck must convey
  → This sits at the apex of the Pyramid

Step 2: Build the SCR Narrative
  → Outline Situation, Complication, Resolution for the overall deck

Step 3: Draft Action Titles Only
  → Write one action title per planned slide
  → Each title is a complete sentence stating the "so what"
  → NO body content at this stage

Step 4: Apply the Storyline Test (Horizontal Read)
  → Read all titles in sequence
  → Do they tell a coherent, logical, MECE story?
  → Does the narrative flow S → C → R?
  → Fix any gaps before proceeding

Step 5: Sketch Exhibits
  → Add rough sketches of charts/tables for each slide
  → Use placeholder boxes and annotations

Step 6: Annotate
  → Mark what data exists, what needs gathering
  → Assign owners per slide
  → Note required analyses

Step 7: Team Review and Iteration
  → Review with project leader / partner
  → Validate storyline, identify gaps
  → Iterate until approved

Step 8: Build the Final Deck
  → ONLY after ghost deck is approved
  → Populate slides with data, charts, visuals
  → This step is where most time is spent — but only on validated slides
```

## 6.2 The Horizontal Read Test

```
Print or view all slides. Read ONLY the action titles in order.

PASS criteria:
  ✅ Tells a coherent, persuasive, self-contained story
  ✅ No gaps in logic
  ✅ Each title follows naturally from the previous
  ✅ MECE structure is evident
  ✅ You understand the full argument without seeing any body content

FAIL criteria:
  ❌ Titles read like a table of contents (topic labels)
  ❌ Logical gaps between consecutive titles
  ❌ Redundant titles saying the same thing
  ❌ Cannot identify the governing thought
  ❌ S-C-R structure not apparent
```

---

# PART 7: QUALITY GATES

## 7.1 Pre-Flight Checklist

### Narrative Check
- [ ] Each slide logically follows the previous (horizontal flow)
- [ ] Clear beginning, middle, end (S-C-R arc)
- [ ] Can state the deck's governing thought in one sentence
- [ ] Transitions between sections are smooth
- [ ] Action titles alone tell the complete story

### Evidence Check
- [ ] Every data point has a source citation
- [ ] Calculations are accurate and verifiable
- [ ] Charts match the data (no distortion, Lie Factor ~1.0)
- [ ] No unsupported claims
- [ ] Numbers include context (benchmarks, trends, comparisons)

### Design Check
- [ ] **3-5 Second Test:** Main point identifiable in 3-5 seconds per slide
- [ ] **6-Foot Test:** Readable from 6 feet away when projected
- [ ] One message per slide
- [ ] Consistent design throughout (fonts, sizes, positions, colors)
- [ ] Contrast ratios meet WCAG AA (4.5:1 minimum)
- [ ] Action titles in same position on every slide (locked in place)

### Message Check
- [ ] Every slide supports the governing thought
- [ ] No redundant information
- [ ] Clear call-to-action present
- [ ] Ruthlessly edited — no filler slides

## 7.2 The Density Test (Per Slide)

| Test | Pass Criteria | Action if Fail |
|------|--------------|----------------|
| **Content density** | 60-70% of slide area used | Merge with related slide |
| **Presentation time** | 45-90 seconds to present | Merge or add substance |
| **Unique insight** | Cannot merge without losing clarity | Merge if redundant |
| **Ghost deck coherence** | Removing breaks the narrative | Remove if no impact |
| **Action title strength** | Complete sentence with a number | Rewrite title |

**Rule:** If a slide fails 2+ tests → merge or remove.

## 7.3 The Consolidation Principle

**Each slide must earn its place.** Consolidate when:
1. Two slides support the same action title
2. Charts show complementary aspects of one insight
3. Removing a slide wouldn't break the storyline
4. Slide feels like filler (<40% content density)

**Section Dividers Decision:**
- <15 slides → skip dividers
- 15-25 slides → maybe (depends on flow)
- 25+ slides → yes (3-4 dividers)

## 7.4 Contrast Verification

```yaml
Test Tool:        WebAIM Contrast Checker (webaim.org/resources/contrastchecker)

Minimum Ratios:
  Body text:      4.5:1 (WCAG AA)
  Critical text:  7.0:1 (WCAG AAA)
  Large text:     3.0:1 (WCAG AA for 18pt+ or 14pt+ bold)

Common Failures:
  ❌ Light text on light background (contrast ~1:1)
  ❌ Medium gray text on white (#999 on #FFF = 2.85:1 — FAILS)
  ❌ Default chart colors on dark backgrounds

Rules:
  Light background → dark text (always)
  Dark background → light text (always)
  Never assume — always verify with the checker
```

## 7.5 Typography Minimum Sizes

| Element | Minimum | Recommended | Never Below |
|---------|---------|-------------|-------------|
| Action title | 22pt | 24-28pt | 20pt |
| Body text | 13pt | 14-16pt | 12pt |
| Chart labels | 10pt | 11-13pt | 9pt |
| Footnotes | 9pt | 9-10pt | 8pt |
| Source line | 9pt | 9-10pt | 8pt |

**Boldness Rule:** 11pt bold > 12pt regular for readability. Boldness improves contrast more than size.

---

# PART 8: PYTHON-PPTX IMPLEMENTATION CONSTANTS

## 8.0 PptxGenJS Slide Setup (CRITICAL)

**CRITICAL:** The built-in `LAYOUT_16x9` in PptxGenJS is 10" x 5.625", NOT consulting standard.

### Consulting Slide Dimensions
```javascript
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();

// ALWAYS define custom consulting layout - built-in LAYOUT_16x9 is WRONG
pres.defineLayout({ name: 'CONSULTING_16x9', width: 13.333, height: 7.5 });
pres.layout = 'CONSULTING_16x9';

// DO NOT USE: pres.layout = 'LAYOUT_16x9';  // ❌ This is 10" x 5.625"
```

### Why This Matters
- Built-in `LAYOUT_16x9` = 10" x 5.625" (EMU: 9144000 x 5143500)
- Consulting standard = 13.333" x 7.5" (EMU: 12192000 x 6858000)
- Using wrong dimensions causes all content to overflow since margins/positions are calculated for 13.333" width

## 8.1 Universal Constants

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ─── Slide Dimensions ──────────────────────────────
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

# ─── Margins ───────────────────────────────────────
MARGIN_LEFT = Inches(1.0)
MARGIN_RIGHT = Inches(1.0)
MARGIN_TOP = Inches(0.5)
MARGIN_BOTTOM = Inches(0.6)
CONTENT_WIDTH = SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT  # ~11.333"

# ─── Title Zone ────────────────────────────────────
TITLE_X = MARGIN_LEFT
TITLE_Y = MARGIN_TOP
TITLE_WIDTH = CONTENT_WIDTH
TITLE_HEIGHT = Inches(0.9)
TITLE_FONT_SIZE = Pt(26)

# ─── Subtitle Zone ─────────────────────────────────
SUBTITLE_Y = Inches(1.5)
SUBTITLE_HEIGHT = Inches(0.4)
SUBTITLE_FONT_SIZE = Pt(15)

# ─── Body Zone ─────────────────────────────────────
BODY_Y = Inches(2.0)
BODY_HEIGHT = Inches(4.7)

# ─── Footer Zone ───────────────────────────────────
FOOTER_Y = Inches(6.9)
FOOTER_FONT_SIZE = Pt(9)
SEPARATOR_Y = Inches(6.85)

# ─── Spacing ───────────────────────────────────────
CARD_HEIGHT = Inches(0.95)
CARD_SPACING = Inches(0.15)
CARD_START_Y = Inches(2.3)
ELEMENT_GAP = Inches(0.2)
COLUMN_GAP = Inches(0.5)
INTERNAL_PADDING = Inches(0.25)
```

## 8.2 McKinsey Colors

```python
MCK_DEEP_NAVY = RGBColor(0, 58, 112)
MCK_BLUE = RGBColor(0, 93, 170)
MCK_TEAL = RGBColor(0, 133, 124)
MCK_CHARCOAL = RGBColor(51, 51, 51)
MCK_MEDIUM_GRAY = RGBColor(153, 153, 153)
MCK_LIGHT_GRAY = RGBColor(245, 245, 245)
MCK_CHART_GRAY = RGBColor(192, 197, 201)
MCK_WHITE = RGBColor(255, 255, 255)
```

## 8.3 BCG Colors

```python
BCG_GREEN_DARK = RGBColor(0, 107, 63)
BCG_GREEN_LIGHT = RGBColor(0, 166, 81)
BCG_YELLOW = RGBColor(255, 215, 0)
BCG_SOFT_RED = RGBColor(224, 64, 64)
BCG_ELECTRIC_BLUE = RGBColor(0, 119, 200)
BCG_CHARCOAL = RGBColor(45, 45, 45)
BCG_MEDIUM_GRAY = RGBColor(128, 128, 128)
BCG_CARD_FILL = RGBColor(242, 242, 242)
```

## 8.4 Bain Colors

```python
BAIN_SCARLET = RGBColor(204, 0, 0)
BAIN_LIGHT_RED = RGBColor(224, 64, 64)
BAIN_BLACK = RGBColor(0, 0, 0)
BAIN_DARK_GRAY = RGBColor(51, 51, 51)
BAIN_MEDIUM_GRAY = RGBColor(128, 128, 128)
BAIN_MUTED_GRAY = RGBColor(204, 204, 204)
BAIN_LIGHT_GRAY = RGBColor(245, 245, 245)
```

## 8.5 Deloitte Colors

```python
DEL_GREEN = RGBColor(134, 188, 36)
DEL_BLACK = RGBColor(0, 0, 0)
DEL_CHARCOAL = RGBColor(51, 51, 51)
DEL_MEDIUM_GRAY = RGBColor(128, 128, 128)
DEL_LIGHT_GRAY = RGBColor(245, 245, 245)
DEL_GREEN_TINT = RGBColor(232, 245, 214)
```

## 8.6 Dark Theme Colors (Production-Verified from Kimi PPT)

```python
# Primary (verified against Presentation Design Mastery.pptx extraction)
DARK_BG = RGBColor(25, 25, 25)           # #191919 — slide background
DARK_CARD = RGBColor(38, 38, 38)         # #262626 — card backgrounds
DARK_BORDER = RGBColor(51, 51, 51)       # #333333 — card borders, separators
DARK_ACCENT = RGBColor(99, 102, 241)     # #6366F1 — indigo, primary accent
DARK_TEXT_PRIMARY = RGBColor(239, 239, 239)   # #EFEFEF — headings, primary text
DARK_TEXT_SECONDARY = RGBColor(143, 143, 143) # #8F8F8F — body text, descriptions
DARK_SUCCESS = RGBColor(16, 185, 129)    # #10B981 — positive indicators, green
DARK_WARNING = RGBColor(245, 158, 11)    # #F59E0B — caution/attention, amber
DARK_DANGER = RGBColor(239, 68, 68)      # #EF4444 — risks/negatives, red
```

**Note:** The original dark-modern-consulting-design skill used #111111 (RGB 17,17,17) for background and #1E1E1E (RGB 30,30,30) for cards. The production Kimi PPT uses #191919 and #262626 respectively — slightly lighter, better contrast. Use the production-verified values above.

---

# PART 9: OPEN-SOURCE TOOLS & RESOURCES

## 9.1 GitHub Repositories

### Consulting PowerPoint Toolbars
| Repo | Description |
|------|-------------|
| [iappyx/Instrumenta](https://github.com/iappyx/Instrumenta) | Free, MIT-licensed consulting-style PPT toolbar. Mail merge, table optimization, watermarking, slide anonymization, formatting tools. Built by 10-year strategy consulting veteran. |
| [rodrigolourencofarinha/ProDeck](https://github.com/rodrigolourencofarinha/ProDeck) | PPT add-in for consultants to assemble, format, and clean decks |

### AI Presentation Generation
| Repo | Description |
|------|-------------|
| [icip-cas/PPTAgent](https://github.com/icip-cas/PPTAgent) | Agentic framework for reflective PPT generation. V2 includes deep research, free-form design, text-to-image, 20+ tools |
| [presenton/presenton](https://github.com/presenton/presenton) | Open-source AI presentation generator. Gamma/Beautiful.ai alternative. PPTX + PDF export |
| [allweonedev/presentation-ai](https://github.com/allweonedev/presentation-ai) | Open-source AI slide generator with customizable themes |
| [vakovalskii/presentation_claude_prompt](https://github.com/vakovalskii/presentation_claude_prompt) | Claude-specific system prompts for consulting-quality slides |
| [GongRzhe/Office-PowerPoint-MCP-Server](https://github.com/GongRzhe/Office-PowerPoint-MCP-Server) | MCP server for PPT manipulation via python-pptx |

### Programmatic Tools
| Repo | Description |
|------|-------------|
| [scanny/python-pptx](https://github.com/scanny/python-pptx) | The foundational Python library for creating/editing PPTX |
| [m3dev/pptx-template](https://github.com/m3dev/pptx-template) | Build PPT from template + JSON data |
| [mckinsey/vizro](https://github.com/mckinsey/vizro) | McKinsey/QuantumBlack's low-code data viz toolkit |
| [mckinsey/qbstyles](https://github.com/mckinsey/qbstyles) | Matplotlib styles following McKinsey/QuantumBlack visual standards |

### Presentation-as-Code
| Tool | Description |
|------|-------------|
| [reveal.js](https://revealjs.com/) | HTML presentation framework |
| [Marp](https://marp.app/) | Markdown to slides (MIT, VS Code extension) |
| [Slidev](https://sli.dev/) | Developer slides with Vue components |

## 9.2 Free Real Consulting Decks (For Study)

| Source | Content |
|--------|---------|
| [Analyst Academy](https://www.theanalystacademy.com/consulting-presentations/) | 600+ real decks from McKinsey, BCG, Bain, Deloitte |
| [Slideworks](https://slideworks.io/resources/47-real-mckinsey-presentations) | 47 McKinsey, 105 BCG, 30 Bain presentations |
| [Ampler](https://ampler.io/) | 50+ McKinsey, 60+ BCG, 40+ Bain slide decks |
| [SlideScience](https://slidescience.co/mckinsey-presentations/) | 60+ McKinsey presentations with analysis |

## 9.3 Educational Guides

| Resource | Focus |
|----------|-------|
| [Slideworks.io](https://slideworks.io/) | Templates + guides by ex-McKinsey/BCG consultants |
| [SlideScience.co](https://slidescience.co/) | Action titles, SCQA, Mekko charts, strategy decks |
| [StrategyU.co](https://strategyu.co/) | 100+ templates, Pyramid Principle, SCQA, issue trees |
| [Stratechi.com](https://www.stratechi.com/) | 150+ strategy topics, free chart templates "the McKinsey way" |
| [Deckary.com](https://deckary.com/blog/pillar-consulting-presentations-guide) | Comprehensive MBB presentation guide |

## 9.4 Design Systems (Official / Open-Source)

| System | Description |
|--------|-------------|
| [Bain ADAPT](https://designsystem.adapt.bain.com/) | Bain's open-source Figma + React design system with colors, typography, components |
| [Deloitte Insights (Pentagram)](https://www.pentagram.com/work/deloitte-insights) | Deloitte's data viz design system case study |
| [BCG DataViz (Rare Volume)](https://rarevolume.com/work/bcg-dataviz/) | BCG's formal data visualization design system |

---

# PART 10: QUICK REFERENCE CARDS

## 10.1 The 10 Non-Negotiable Principles (All Firms)

1. **Action titles that tell the story** when read in sequence
2. **Top-down communication** — conclusion first, evidence second
3. **MECE logic** at every level (Mutually Exclusive, Collectively Exhaustive)
4. **SCR/SCQA** for narrative framing and executive summaries
5. **Pyramid Principle** for argument architecture
6. **Source citations** on every data exhibit — no exceptions
7. **Executive summary** as the single most critical slide
8. **Ghost deck** before building any content
9. **Every slide earns its place** — no filler, no decoration
10. **Chart titles are conclusions** — not descriptions

## 10.2 Action Title Checklist

- [ ] Complete sentence with subject and verb?
- [ ] States the "so what," not the topic?
- [ ] Includes a number or specific data point?
- [ ] Fewer than 15 words?
- [ ] Maximum 2 lines?
- [ ] Assertive (no "may," "could," "might")?
- [ ] Would make sense to someone who sees no other content?

## 10.3 Slide Quality Quick Test

```
THE 3 TESTS EVERY SLIDE MUST PASS:

1. 3-Second Test:   Show slide for 3 seconds. Can viewer state the main point?
2. 6-Foot Test:     Print full size, tape to wall, step back 6 feet. Can you read it?
3. "So What?" Test: Does every element connect to an implication or action?

If any test fails → redesign the slide.
```

## 10.4 Build Sequence

```
1. Write ghost deck (titles only)         ← Validate storyline BEFORE visuals
2. Build executive summary                 ← Forces clarity on recommendation
3. Create body slides                      ← Prove what exec summary claims
4. Review for consolidation                ← Merge weak slides (QUALITY JUMP)
5. Remove section dividers (if <15 slides) ← Declutter
6. Fix contrast issues                     ← WebAIM check all text
7. Test 6-foot readability                 ← Print and wall-test
8. Final horizontal read                   ← Titles alone tell the story
```

---

# PART 11: KIMI PRESENTATION DESIGN MASTERY — PRODUCTION REFERENCE

Extracted from `Presentation Design Mastery.pptx` (12 slides, Kimi-generated). This section documents the exact measurements, typography, spacing, and skill content from a production-grade dark-theme consulting deck. Use these values as the ground truth for dark-theme implementations.

## 11.1 Production Design System (Exact Measurements)

### Slide Dimensions
```yaml
Width:            13.333 inches (12,192,000 EMU)
Height:           7.500 inches (6,858,000 EMU)
Aspect Ratio:     16:9 widescreen
```

### Font
```yaml
Primary Font:     Liter (custom sans-serif)
Fallback:         Calibri, Arial, Helvetica, sans-serif
Usage:            ALL text on ALL slides — one font family throughout
```

### Production Typography Scale

| Level | Size | Weight | Color | Use |
|-------|------|--------|-------|-----|
| Hero Title | 45-54pt | Bold | #EFEFEF / #6366F1 (split-color) | Title slides only |
| Slide Title | 22.5-27pt | Bold | #EFEFEF | Standard slide headings |
| Accent Tag | 8.8-10.5pt | Bold | #6366F1 | Slide category labels (top of slide) |
| Slide Description | 11.2-13.5pt | Regular | #8F8F8F | Subtitle / slide description |
| Card Heading | 12.5-16.9pt | Bold | #EFEFEF | Card titles within body |
| Body Text | 10-12pt | Regular | #8F8F8F | Card descriptions, details |
| Labels/Captions | 7.5-9pt | Regular | #8F8F8F | Footnotes, small labels |
| Number Badges | 10.5-16.9pt | Bold | #6366F1 or #FFFFFF | Numbered circles |

### Production Color Palette

```yaml
Background:       #191919, RGB(25, 25, 25)      — Slide background (all slides)
Card Background:  #262626, RGB(38, 38, 38)      — Card/container fill
Card Border:      #333333, RGB(51, 51, 51)      — Borders, separators (0.8pt width)
Accent Primary:   #6366F1, RGB(99, 102, 241)    — Indigo — tags, numbers, highlights, CTAs
Text Primary:     #EFEFEF, RGB(239, 239, 239)   — Near-white — headings, key content
Text Secondary:   #8F8F8F, RGB(143, 143, 143)   — Gray — body text, descriptions
Success:          #10B981, RGB(16, 185, 129)     — Green — positive indicators
Danger:           #EF4444, RGB(239, 68, 68)      — Red — risks, negatives
Warning:          #F59E0B, RGB(245, 158, 11)     — Amber — caution (from design system)
```

### Production Spacing Patterns

```yaml
Line Spacing:
  Tight Headers:      0.8-0.9    — Compact multi-line titles
  Standard:           1.0-1.2    — Normal text and card headings
  Body/Descriptions:  1.3-1.4    — Readable body paragraphs

Text Margins (inside shapes):
  Standard Shapes:    L=0.000", T=0.000", R=0.000", B=0.000"  — No internal padding
  Freeform Shapes:    L=0.100", T=0.050", R=0.100", B=0.050"  — Minimal padding

Card Borders:         0.8pt width, #333333 color
Card Border Radius:   Freeform rounded rectangles (not MSO_SHAPE.ROUNDED_RECTANGLE)

Common Card Widths:
  Full-width:         ~11.5" (slide width minus margins)
  Half-width:         ~6.2" (for 2-column layouts)
  Third-width:        ~3.8" (for 3-column layouts)
  Quarter-width:      ~3.0" (for 4-column or 2x2 grids)
  Fifth-width:        ~2.4" (for 5-column layouts)

Column Gap:           ~0.15-0.25" between cards in grid layouts
Row Gap:              ~0.15-0.20" between card rows
```

## 11.2 The 12 Core Skill Areas (From Kimi PPT)

The Kimi PPT organizes presentation mastery into 6 categories, 12 skills:

### Category 1: Strategic Thinking & Frameworks (Slide 3)

**Three foundational frameworks presented in equal-width columns:**

**Pyramid Principle — Top-Down Communication**
- Start with the answer/recommendation
- Support with 2-3 key arguments
- Back each with evidence
- Example: "Recommend expanding to APAC market" → supported by market size, competitive gap, operational readiness

**MECE Structuring — Mutually Exclusive, Collectively Exhaustive**
- Break problems into non-overlapping, complete categories
- Example: Revenue = Existing customers + New customers (no overlap, nothing missing)
- Test: Can you assign every data point to exactly one category with none left over?

**SCR Framework — Situation-Complication-Resolution**
- S: Market growing 15% annually
- C: Our share declining 8%
- R: Three initiatives to reverse trend
- Resolution = 60-70% of the executive summary

### Category 2: Action Title Mastery (Slide 4)

**Weak Titles vs. Action Titles (side-by-side comparison):**

| Weak Title (Red #EF4444) | Action Title (Green #10B981) |
|--------------------------|------------------------------|
| "Revenue Analysis" | "Revenue grew 23% YoY driven by enterprise expansion" |
| "Market Overview" | "Market consolidation creates $2B acquisition opportunity" |
| "Team Structure" | "Restructuring sales team will reduce CAC by 35%" |

**Three validation tests:**
1. **Executive Scan Test:** Can the title be understood without any body content?
2. **"So What" Test:** Does the title state why this matters, not just what happened?
3. **Action Verbs:** Use verbs like "drove," "reduced," "accelerated" — not "is," "shows," "contains"

### Category 3: Visual Hierarchy (Slide 5)

**7 principles for guiding the viewer's eye:**

1. **Size & Scale:** Largest element = most important. Hero numbers 3-5x the size of supporting text.
2. **Color & Contrast:** Accent color (#6366F1) for the ONE most important element. Gray everything else.
3. **Typography:** Font weight and size create natural reading order (bold title → regular body → light caption).
4. **Whitespace:** Empty space separates sections, prevents cognitive overload. Target 30-40% whitespace.
5. **Position & Alignment:** Top-left → bottom-right reading flow. Align to invisible grid. Snap to 0.1" increments.
6. **Repetition & Patterns:** Same pattern = same meaning. Consistent card styling, icon treatment, color usage.
7. **Proximity:** Related items grouped together. Unrelated items separated by whitespace or dividers.

### Category 4: One Slide One Message (Slide 6)

**Cognitive science basis:**
- **Miller's Law:** Working memory holds 3-5 chunks of information (not 7±2 as commonly misquoted)
- If a slide has >5 elements competing for attention, cognitive load exceeds capacity
- Result: audience retains nothing

**Decision Framework:**
- Can the slide message be stated in ONE sentence? → Keep as one slide
- Does it have TWO distinct insights? → Split into two slides
- Is content density <40%? → Merge with a related slide
- Does it take >90 seconds to present? → Split

**Visual comparison from the PPT:**
- **Cluttered slide** (red border #EF4444): 8 bullet points, tiny text, multiple competing messages
- **Focused slide** (green border #10B981): 2 key data points + one supporting mini-chart, clear visual hierarchy

### Category 5: Data Visualization Excellence (Slide 7)

**Chart Selection Decision Tree (from the PPT):**

| Chart Type | When to Use |
|-----------|-------------|
| **Bar Chart** | Compare categories, show rankings |
| **Line Chart** | Show trends over time, continuous data |
| **Pie Chart** | Show parts of a whole (max 5 segments, use sparingly) |
| **Scatter Plot** | Show correlation between two variables |
| **Histogram** | Show distribution of a single variable |

**Professional Principles:**
1. **Direct Labeling:** Label data series ON the chart — eliminate legends
2. **Remove Gridlines:** Or make them very faint (#333333, 0.5pt)
3. **Highlight What Matters:** One accent color for the key data point; gray everything else

**Before/After Pattern (from the PPT):**
- Before: cluttered chart with legend, heavy gridlines, multiple colors
- After: clean chart with direct labels, minimal gridlines, single accent color + gray

### Category 6: Storytelling Frameworks (Slide 8)

**Four narrative structures (presented as visual flow diagrams):**

1. **Problem-Solution:**
   - PROBLEM (red bar) → SOLUTION (blue bar) → OUTCOME (green bar)
   - Best for: operational improvement, gap remediation, audit findings

2. **What Is / What Could Be:**
   - WHAT IS (gray) → WHAT COULD BE (blue) → WHAT IS (gray) → WHAT COULD BE (blue) → NEW BLISS (green)
   - Best for: transformation narratives, vision-setting, change management
   - Alternates between current pain and future possibility to build urgency

3. **Before-During-After:**
   - BEFORE (gray) → DURING (blue) → AFTER (green)
   - Best for: case studies, project retrospectives, implementation stories

4. **Nested Loops:**
   - MAIN STORY (blue) → SUB-STORY (gray) → MAIN STORY (blue)
   - Best for: complex multi-layered narratives, keynotes, thought leadership
   - Opens multiple narrative threads, resolves them in reverse order

### Category 7: Typography & Color System (Slide 9)

**Typography Hierarchy (exact from PPT):**

| Level | Size Range | Weight | Purpose |
|-------|-----------|--------|---------|
| Headlines | 24-28pt | Bold | Slide titles, action titles |
| Body Text | 16-18pt | Regular | Main content, descriptions |
| Labels | 12-14pt | Light | Chart labels, captions, metadata |

**Font Selection Principles:**
- Use sans-serif fonts for professional contexts (Liter, Calibri, Arial)
- Limit to 1-2 font families maximum per deck
- Match font tone to audience (serif = traditional/formal, sans-serif = modern/clean)

**Color System Rules:**
- **Restrained Palette:** Maximum 3 colors per slide (background + primary text + 1 accent)
- **Functional Color:** Every color has a meaning (green = positive, red = negative, indigo = accent/CTA)
- **Consistency:** Same color = same meaning throughout the entire deck
- **Accessibility:** Minimum 4.5:1 contrast ratio (WCAG AA). Test with WebAIM Contrast Checker.

### Category 8: The 5-Stage Professional Workflow (Slide 10)

```
Stage 1: STRATEGIC DISCOVERY
  - Define audience, objectives, constraints
  - Identify the governing thought
  - Determine presentation type (board, strategy, pitch, etc.)
  Key deliverable: Creative brief / problem statement

Stage 2: NARRATIVE ARCHITECTURE
  - Build SCR/SCQA narrative arc
  - Write ghost deck (action titles only)
  - Apply horizontal read test
  - Validate with stakeholders
  Key deliverable: Approved ghost deck

Stage 3: VISUAL CONCEPT
  - Choose design system (firm-specific or dark theme)
  - Define color palette, typography, component library
  - Sketch exhibit layouts (hand-drawn or wireframe)
  Key deliverable: Design system + exhibit sketches

Stage 4: CONTENT INTEGRATION
  - Build slides with data, charts, visuals
  - Apply one-message-per-slide rule
  - Direct-label all charts, cite all sources
  - Maintain consistent formatting
  Key deliverable: Complete draft deck

Stage 5: REFINEMENT & DELIVERY
  - Run quality gates (3-second, 6-foot, "so what?" tests)
  - Contrast check all text elements
  - Consolidation review (merge weak slides)
  - Final horizontal read
  - Add speaker notes
  Key deliverable: Presentation-ready deck
```

**Workflow Principles (from the PPT):**
- **Timeline Expectations:** Stage 1-2 take 30% of total time; Stages 3-4 take 50%; Stage 5 takes 20%
- **Collaboration Points:** Ghost deck review (Stage 2), design concept approval (Stage 3), draft review (Stage 4)
- **Iteration Cycles:** Expect 2-3 iterations minimum. Ghost deck iteration is cheapest; final slide iteration is most expensive.

### Category 9: Quality Assurance Checklist (Slide 11)

**Four-quadrant review framework (presented as 2x2 grid with green checkmarks):**

**Quadrant 1 — Storyline Check (Title-Only Review):**
- [ ] Read all action titles in sequence — do they tell a complete story?
- [ ] Does the narrative follow S-C-R arc?
- [ ] Are there logical gaps between consecutive titles?

**Quadrant 2 — Evidence Check (Source Verification):**
- [ ] Every data point has a cited source
- [ ] Numbers are accurate and internally consistent
- [ ] Charts match the underlying data (no distortion)

**Quadrant 3 — Design Check (3-5 Second Test):**
- [ ] Main point identifiable in 3-5 seconds per slide
- [ ] Visual hierarchy is clear (eye flows naturally)
- [ ] Consistent design throughout (locked title position, same fonts/colors)

**Quadrant 4 — Message Check (Ruthless Editing):**
- [ ] Every slide supports the governing thought
- [ ] No redundant slides (each earns its place)
- [ ] Clear call-to-action present

**The PPT's insight:** "Never skip the review process. Even the most experienced consultants follow the checklist — it's what separates good from great."

## 11.3 Production Slide Templates (From Kimi PPT Extraction)

### Template A: Title Slide (Slide 1 Pattern)

```yaml
Background:       Full-bleed image with dark gradient overlay
                  (or solid #191919)

Accent Tag:
  Position:       Centered, y≈2.5"
  Font:           10.5pt Bold, #6366F1
  Text:           Short category label (e.g., "Enterprise Presentation Skills")

Hero Title:
  Position:       Centered, y≈3.0"
  Font:           54pt Bold
  Color:          Split — first line #EFEFEF, second line #6366F1
  Example:        "Presentation" (#EFEFEF) / "Design Mastery" (#6366F1)

Subtitle:
  Position:       Centered, y≈4.0"
  Font:           18pt Regular, #8F8F8F
  Text:           One-line description

Bottom Metrics:
  Position:       y≈6.0", horizontal row of 3 items
  Font:           9-10pt, #8F8F8F
  Items:          Icon + label pairs (e.g., "12 Core Skills", "McKinsey-Grade")
```

### Template B: Grid Cards Slide (Slide 2 Pattern)

```yaml
Accent Tag:       Top, 10pt Bold, #6366F1
Slide Title:      22.5-27pt Bold, #EFEFEF
Slide Description: 11-13pt Regular, #8F8F8F

Card Grid:        2 columns x 3 rows (or 3 columns, or 4+3, etc.)
Card Background:  #262626
Card Border:      0.8pt, #333333, rounded corners (freeform)
Card Width:       ~6.2" (half-width) or ~3.0" (quarter-width)
Card Height:      ~1.3-1.6" (varies by content)

Inside Each Card:
  Number Circle:  ~0.35" diameter, #6366F1 fill, white text (10.5-16.9pt Bold)
  Card Title:     12.5-16.9pt Bold, #EFEFEF
  Card Body:      10-12pt Regular, #8F8F8F
  Internal Gap:   ~0.15" between number and title
```

### Template C: Multi-Column Framework Slide (Slide 3 Pattern)

```yaml
Accent Tag:       Top, #6366F1
Slide Title:      22.5pt Bold, #EFEFEF

Columns:          3 equal-width columns, ~3.8" each
Column Gap:       ~0.2"
Column Background: #262626 cards with #333333 border

Each Column:
  Framework Icon:  Small accent shape, #6366F1
  Framework Name:  14pt Bold, #EFEFEF
  Subtitle:        10pt Regular, #8F8F8F
  Content:         Bullet points or example text, 10-11pt, #8F8F8F

Bottom Insight Bar:
  Full-width:      ~11.5"
  Background:      #6366F1 (solid accent color)
  Text:            12pt Bold, #FFFFFF (white on accent)
  Purpose:         Key takeaway / summary statement
```

### Template D: Before/After Comparison Slide (Slide 4 Pattern)

```yaml
Layout:           Two columns — left (Weak/Before) vs. right (Strong/After)

Left Column:
  Header:         "Weak Titles" or "Before"
  Border Color:   #EF4444 (red) — signals "wrong"
  Content:        Examples of what NOT to do

Right Column:
  Header:         "Action Titles" or "After"
  Border Color:   #10B981 (green) — signals "correct"
  Content:        Examples of the correct approach

Bottom Row:       3 tip cards with icons + short descriptions
```

### Template E: Closing Slide (Slide 12 Pattern)

```yaml
Background:       Full-bleed image with dark gradient overlay (or #191919)

Accent Tag:       Centered, 10pt Bold, #6366F1 ("Your Journey Begins")

Title:            Centered, 45pt Bold
                  Split-color: "Your Path to" (#EFEFEF) / "Mastery" (#6366F1)

Body:             Centered, 13-15pt Regular, #8F8F8F
                  2-3 lines of closing message

Bottom Cards:     3 equal-width cards
                  #262626 background, #333333 border
                  Icon + title (#EFEFEF) + body (#8F8F8F)

Footer:           Centered, 9pt, #8F8F8F
                  "Presentation Design Mastery - [Project Name]"
```

---
# APPEND THIS TO YOUR EXISTING consulting-powerpoint-master-SKILL.md FILE
---

# PART 12: PPTXGENJS IMPLEMENTATION GUIDE

## 12.1 Critical Setup — Slide Dimensions (THE #1 MISTAKE)

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

pres.author = 'Boston Consulting Group';
pres.title = 'Your Presentation Title';
```

**Consulting Standard Dimensions:**
- Width: 13.333 inches (12,192,000 EMU)
- Height: 7.5 inches (6,858,000 EMU)
- Aspect Ratio: 16:9 widescreen

---

## 12.2 Firm-Specific Constants

### BCG (Boston Consulting Group)
```javascript
const BCG = {
  // Colors
  greenDark: "006B3F",      // BCG Green (Dark) — primary
  greenLight: "00A651",     // BCG Green (Light) — accent
  yellow: "FFD700",         // Sharp Yellow — data emphasis (signature!)
  red: "E04040",           // Soft Red — alerts
  blue: "0077C8",          // Electric Blue — info
  charcoal: "2D2D2D",      // Dark Charcoal — body text
  mediumGray: "808080",    // Medium Gray
  white: "FFFFFF",
  cardFill: "F2F2F2",      // Light Gray
  
  // Layout
  MARGIN_LEFT: 0.8,        // BCG: 0.8-1.0"
  MARGIN_RIGHT: 0.8,
  CONTENT_WIDTH: 11.7,     // 13.333 - 0.8 - 0.8
  TITLE_Y: 0.4,            // BCG: 0.4" (not 0.5")
  TITLE_HEIGHT: 0.8,
  BODY_Y: 1.4,             // No subheading
  BODY_HEIGHT: 5.0,        // 4.8-5.0"
  BUMPER_Y: 6.5,
  FOOTER_Y: 7.1,
  
  // Typography
  FONT: "Trebuchet MS",    // Exclusive BCG font
  FONT_ACTION_TITLE: 24,   // 22-26pt Bold
  FONT_BODY: 13,           // 13-15pt Regular
  FONT_CHART: 11,          // 11-13pt
  FONT_BUMPER: 13,         // 12-14pt Bold
  FONT_FOOTER: 9           // 9-10pt
};
```

### McKinsey & Company
```javascript
const MCK = {
  // Colors
  deepNavy: "003A70",      // Deep Navy Blue — primary
  blue: "005DAA",          // McKinsey Blue — accent
  teal: "00857C",          // Teal — secondary
  charcoal: "333333",
  mediumGray: "999999",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  chartGray: "C0C5C9",
  
  // Layout
  MARGIN_LEFT: 1.0,
  MARGIN_RIGHT: 1.0,
  CONTENT_WIDTH: 11.333,   // 13.333 - 1.0 - 1.0
  TITLE_Y: 0.5,
  TITLE_HEIGHT: 0.8,
  SUBTITLE_Y: 1.5,         // McKinsey keeps subheadings
  SUBTITLE_HEIGHT: 0.4,
  BODY_Y: 2.0,
  BODY_HEIGHT: 4.5,        // 4.5-4.8"
  FOOTER_Y: 6.9,
  
  // Typography
  FONT_TITLE: "Georgia",   // Serif for action titles (2020 redesign)
  FONT_BODY: "Arial",      // Sans-serif for body
  FONT_ACTION_TITLE: 26,   // 24-28pt Bold
  FONT_SUBTITLE: 15,       // 18-20pt Regular
  FONT_BODY: 14,           // 14-16pt Regular
  FONT_CHART: 12,          // 12-14pt
  FONT_FOOTER: 9
};
```

### Deloitte
```javascript
const DEL = {
  // Colors
  green: "86BC24",         // Deloitte Green — PANTONE 368 C
  black: "000000",
  charcoal: "333333",
  mediumGray: "808080",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  greenTint: "E8F5D6",     // 10% tint
  
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
  FONT: "Open Sans",       // Primary (fallback: Calibri)
  FONT_ACTION_TITLE: 24,   // 24-28pt Bold
  FONT_BODY: 13,           // 13-15pt Regular
  FONT_CHART: 11,
  FONT_FOOTER: 9
};
```

### Bain & Company
```javascript
const BAIN = {
  // Colors
  scarlet: "CC0000",       // Bain Scarlet Red — primary
  lightRed: "E04040",
  black: "000000",
  charcoal: "333333",
  mediumGray: "808080",
  mutedGray: "CCCCCC",     // For non-key data
  white: "FFFFFF",
  lightGray: "F5F5F5",
  
  // Layout
  MARGIN_LEFT: 0.8,
  MARGIN_RIGHT: 0.8,
  CONTENT_WIDTH: 11.7,
  TITLE_Y: 0.4,
  TITLE_HEIGHT: 0.8,
  BODY_Y: 1.3,
  BODY_HEIGHT: 5.0,
  FOOTER_Y: 7.0,
  
  // Typography
  FONT: "Arial",           // Practical fallback (Futura often unavailable)
  FONT_ACTION_TITLE: 24,   // 22-26pt Bold
  FONT_BODY: 13,           // 13-15pt Regular
  FONT_CHART: 11,
  FONT_FOOTER: 9
};
```

---

## 12.3 BCG Bumper Statement Implementation

BCG bumper statements are **required on every content slide**. This is BCG's formal design standard.

```javascript
// BCG Bumper Statement (gray background)
slide.addShape(pres.shapes.RECTANGLE, {
  x: BCG.MARGIN_LEFT, 
  y: BCG.BUMPER_Y, 
  w: BCG.CONTENT_WIDTH, 
  h: 0.45,
  fill: { color: BCG.cardFill }
});

// Left green accent bar (signature BCG element)
slide.addShape(pres.shapes.RECTANGLE, {
  x: BCG.MARGIN_LEFT, 
  y: BCG.BUMPER_Y, 
  w: 0.08, 
  h: 0.45,
  fill: { color: BCG.greenDark }
});

slide.addText("Your key takeaway reinforcing the action title", {
  x: BCG.MARGIN_LEFT + 0.2, 
  y: BCG.BUMPER_Y + 0.1, 
  w: BCG.CONTENT_WIDTH - 0.2, 
  h: 0.25,
  fontSize: BCG.FONT_BUMPER, 
  bold: true, 
  color: BCG.charcoal, 
  fontFace: BCG.FONT
});
```

**BCG Yellow Bumper (for critical insights):**
```javascript
// Use yellow background for THE most important slide
slide.addShape(pres.shapes.RECTANGLE, {
  x: BCG.MARGIN_LEFT, 
  y: BCG.BUMPER_Y, 
  w: BCG.CONTENT_WIDTH, 
  h: 0.45,
  fill: { color: BCG.yellow }  // ← Yellow, not gray
});

slide.addText("55% growth represents strongest recovery in portfolio", {
  x: BCG.MARGIN_LEFT + 0.2, 
  y: BCG.BUMPER_Y + 0.1, 
  w: BCG.CONTENT_WIDTH - 0.2, 
  h: 0.25,
  fontSize: BCG.FONT_BUMPER, 
  bold: true, 
  color: BCG.charcoal, 
  fontFace: BCG.FONT
});
```

---

## 12.4 Chart Implementation

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
  w: CONTENT_WIDTH,      // Full width or split left/right
  h: BODY_HEIGHT,        // CRITICAL: Use full body height
  
  barDir: "col",         // Column chart (vertical bars)
  chartColors: ["006B3F"],  // Firm primary color (hex, not name!)
  
  chartArea: { fill: { color: "FFFFFF" } },
  
  catAxisLabelColor: "2D2D2D",
  valAxisLabelColor: "2D2D2D",
  catAxisLabelFontSize: 10,
  valAxisLabelFontSize: 10,
  
  valGridLine: { color: "E0E0E0", size: 0.5 },  // Faint horizontal
  catGridLine: { style: "none" },               // No vertical
  
  showValue: false,      // Usually cleaner without data labels
  showLegend: false      // Direct label preferred
});
```

### Chart Sizing Rules
- **Full-width:** w = CONTENT_WIDTH (11.333" or 11.7")
- **Left/right split:** Left = 6.0-6.5", Right = 4.8-5.7"
- **Height:** ALWAYS use full BODY_HEIGHT (4.5-5.0")
- **Font sizes:** Axis labels 9-11pt, data labels 10-12pt

---

## 12.5 Implementation Roadmap Table

Professional consulting presentations require actionable next steps with clear ownership.

```javascript
const actionItems = [
  // Header row
  ["#", "Action", "Owner/POC", "Target Date"],
  
  // Data rows (specific actions, named owners, real dates)
  ["1", "Finalize Q1 demand plan and secure inventory", "Supply Chain Director", "15-Mar-26"],
  ["2", "Align manufacturing capacity with forecast", "Operations VP", "22-Mar-26"],
  ["3", "Launch targeted marketing campaigns", "Marketing Director", "01-Apr-26"],
  ["4", "Deepen distributor partnerships", "Channel Sales Manager", "15-Apr-26"],
  ["5", "Establish monthly forecast review cadence", "Finance Director", "01-May-26"],
  ["6", "Implement leading indicator dashboard", "Analytics Manager", "15-May-26"],
  ["7", "Conduct quarterly variance analysis", "Planning Manager", "Quarterly"]
];

slide.addTable(actionItems, {
  x: MARGIN_LEFT,
  y: BODY_Y,
  w: CONTENT_WIDTH,
  h: BODY_HEIGHT,
  
  border: { type: "solid", pt: 1, color: "808080" },
  fill: { color: "FFFFFF" },
  
  fontFace: "Trebuchet MS",  // Firm font
  fontSize: 11,
  color: "2D2D2D",
  align: "left",
  valign: "middle",
  
  rowH: 0.64,  // Calculate: BODY_HEIGHT ÷ (rows + header)
  colW: [0.5, 5.5, 3.2, 2.5],  // Must sum to CONTENT_WIDTH!
  
  // Custom styling per row
  rowProps: [
    // Header: Firm color background, white text, bold, centered
    { 
      fill: { color: "006B3F" },  // Firm primary color
      color: "FFFFFF", 
      bold: true, 
      fontSize: 12, 
      align: "center" 
    },
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

**Table Column Sizing:**
- **Sl. No.:** 0.4-0.5"
- **Action:** 5.0-5.5" (largest — the description)
- **Owner/POC:** 2.5-3.5"
- **Target Date:** 1.5-2.5"
- **Total must equal CONTENT_WIDTH**

---

## 12.6 Shadow Effects

Use shadows consistently for depth without distraction.

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

**CRITICAL:** Never reuse the same shadow object. Always call `makeShadow()` to create a fresh object, or you'll get corruption.

---

## 12.7 Complete Slide Templates

### BCG Content Slide (Full Template)
```javascript
let slide = pres.addSlide();
slide.background = { color: BCG.white };

// Action title (< 15 words!)
slide.addText("Revenue grew 23% YoY driven by enterprise expansion", {
  x: BCG.MARGIN_LEFT, 
  y: BCG.TITLE_Y, 
  w: BCG.CONTENT_WIDTH, 
  h: BCG.TITLE_HEIGHT,
  fontSize: BCG.FONT_ACTION_TITLE, 
  bold: true, 
  color: BCG.charcoal, 
  fontFace: BCG.FONT
});

// Body content (chart example)
slide.addChart(pres.charts.BAR, chartData, {
  x: BCG.MARGIN_LEFT, 
  y: BCG.BODY_Y, 
  w: BCG.CONTENT_WIDTH, 
  h: BCG.BODY_HEIGHT,
  barDir: "col",
  chartColors: [BCG.greenDark],
  // ... rest of chart config
});

// BCG BUMPER STATEMENT (required!)
slide.addShape(pres.shapes.RECTANGLE, {
  x: BCG.MARGIN_LEFT, 
  y: BCG.BUMPER_Y, 
  w: BCG.CONTENT_WIDTH, 
  h: 0.45,
  fill: { color: BCG.cardFill }
});

slide.addShape(pres.shapes.RECTANGLE, {
  x: BCG.MARGIN_LEFT, 
  y: BCG.BUMPER_Y, 
  w: 0.08, 
  h: 0.45,
  fill: { color: BCG.greenDark }
});

slide.addText("Enterprise growth positions company for market leadership", {
  x: BCG.MARGIN_LEFT + 0.2, 
  y: BCG.BUMPER_Y + 0.1, 
  w: BCG.CONTENT_WIDTH - 0.2, 
  h: 0.25,
  fontSize: BCG.FONT_BUMPER, 
  bold: true, 
  color: BCG.charcoal, 
  fontFace: BCG.FONT
});

// Footer
slide.addText("Source: Company data", {
  x: BCG.MARGIN_LEFT, 
  y: BCG.FOOTER_Y, 
  w: 10, 
  h: 0.3,
  fontSize: BCG.FONT_FOOTER, 
  color: BCG.mediumGray, 
  fontFace: BCG.FONT
});

slide.addText("5", {  // Slide number
  x: BCG.MARGIN_LEFT + BCG.CONTENT_WIDTH - 0.5, 
  y: BCG.FOOTER_Y, 
  w: 0.5, 
  h: 0.3,
  fontSize: BCG.FONT_FOOTER, 
  color: BCG.mediumGray, 
  fontFace: BCG.FONT, 
  align: "right"
});
```

### McKinsey Content Slide (Full Template)
```javascript
let slide = pres.addSlide();
slide.background = { color: MCK.white };

// Action title (Georgia serif — McKinsey 2020 redesign)
slide.addText("Market consolidation creates $2B acquisition opportunity", {
  x: MCK.MARGIN_LEFT, 
  y: MCK.TITLE_Y, 
  w: MCK.CONTENT_WIDTH, 
  h: MCK.TITLE_HEIGHT,
  fontSize: MCK.FONT_ACTION_TITLE, 
  bold: true, 
  color: MCK.deepNavy, 
  fontFace: MCK.FONT_TITLE  // Georgia (serif!)
});

// Subtitle (Arial)
slide.addText("Addressable market size by segment, $B, 2024-2027", {
  x: MCK.MARGIN_LEFT, 
  y: MCK.SUBTITLE_Y, 
  w: MCK.CONTENT_WIDTH, 
  h: MCK.SUBTITLE_HEIGHT,
  fontSize: MCK.FONT_SUBTITLE, 
  color: "666666", 
  fontFace: MCK.FONT_BODY  // Arial
});

// Body content
slide.addChart(pres.charts.BAR, data, {
  x: MCK.MARGIN_LEFT, 
  y: MCK.BODY_Y, 
  w: MCK.CONTENT_WIDTH, 
  h: MCK.BODY_HEIGHT,
  chartColors: [MCK.deepNavy],
  // ... rest of chart config
});

// Footer
slide.addText("Source: Market research, McKinsey analysis", {
  x: MCK.MARGIN_LEFT, 
  y: MCK.FOOTER_Y, 
  w: 10, 
  h: 0.3,
  fontSize: MCK.FONT_FOOTER, 
  color: MCK.mediumGray, 
  fontFace: MCK.FONT_BODY
});

slide.addText("3", {
  x: MCK.MARGIN_LEFT + MCK.CONTENT_WIDTH - 0.5, 
  y: MCK.FOOTER_Y, 
  w: 0.5, 
  h: 0.3,
  fontSize: MCK.FONT_FOOTER, 
  color: MCK.mediumGray, 
  fontFace: MCK.FONT_BODY, 
  align: "right"
});
```

---

## 12.8 Common Pitfalls & Solutions

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

## 12.9 Quality Checklist

**Before Generation:**
- [ ] Slide dimensions set to 13.333" x 7.5"?
- [ ] Action title < 15 words and states conclusion?
- [ ] Correct firm margins? (BCG/Bain: 0.8", McKinsey/Deloitte: 1.0")
- [ ] Chart uses full BODY_HEIGHT (4.5-5.0")?
- [ ] Firm colors are hex codes, not names?
- [ ] Correct firm font? (Trebuchet for BCG, Georgia for McKinsey titles)

**After Generation:**
- [ ] Open in PowerPoint — all elements within slide boundaries?
- [ ] No overflow on right or bottom edges?
- [ ] Fonts render correctly?
- [ ] Action titles max 2 lines?
- [ ] Every data slide has source citation?
- [ ] BCG slides have bumper statements?
- [ ] Slide numbers present and positioned correctly?

---

## 12.10 Firm Comparison Quick Reference

| Element | BCG | McKinsey | Deloitte | Bain |
|---------|-----|----------|----------|------|
| **Primary Color** | #006B3F | #003A70 | #86BC24 | #CC0000 |
| **Font** | Trebuchet MS | Georgia + Arial | Open Sans | Arial |
| **Left Margin** | 0.8" | 1.0" | 1.0" | 0.8" |
| **Title Y** | 0.4" | 0.5" | 0.5" | 0.4" |
| **Body Y** | 1.4" | 2.0" | 2.0" | 1.3" |
| **Subheading** | No | Yes | Yes | Varies |
| **Bumper** | Required | Rare | Optional | No |
| **Signature** | Yellow highlight | Waterfall | Green dot | Red standout |
| **Body Height** | 5.0" | 4.5" | 4.5" | 5.0" |

---

## End of PptxGenJS Implementation Guide


---

## Metadata

- **Skill Version:** 2.0
- **Created:** 2026-02-11
- **Updated:** 2026-02-11 (integrated Kimi PPT extraction with production-verified measurements)
- **Sources:** McKinsey (Pyramid Principle, SCR, Ghost Deck), BCG (Growth-Share Matrix, Bumper Statements, DataViz System), Bain (Results Philosophy, Standout Color, Marimekko), Deloitte (TIM Framework, Tier 1 Slide Format, Pentagram Design System), Edward Tufte (Data-Ink Ratio, Chartjunk, Lie Factor), Cole Nussbaumer Knaflic (Storytelling with Data, Six Lessons), Kimi Presentation Design Mastery PPT (production-verified design system, 12 skill areas, 5 slide templates), plus existing dark-modern-consulting-design and MBB-implementation-learnings skills
- **Compatibility:** python-pptx, PowerPoint 2016+, Google Slides (partial)
- **Integrates With:** dark-modern-consulting-design-SKILL.md (for dark theme), MBB-implementation-learnings-SKILL.md (for production lessons), Presentation Design Mastery.pptx (source reference deck)
