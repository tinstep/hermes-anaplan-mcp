const PptxGenJS = require("pptxgenjs");

// DESIGN SYSTEM E — Deloitte Green/Teal (Open Sans)
const S = {
  brandGreen: "86BC25",
  teal: "0097A9",
  black: "000000",
  charcoal: "333333",
  mediumGray: "97999B",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  greenTint: "E3E48D",
  accentRed: "DA291C",
  chartGray: "BBBCBC",

  ML: 0.5, MR: 0.5, CW: 12.333,
  TY: 0.5, TH: 0.8, DIV_Y: 1.35,
  BY: 1.5, FY: 7.1, BUMPER_H: 0.45, BUMPER_Y: 6.55, BH: 4.95,
  COVER_ML: 1.0, COVER_CW: 11.333,

  FONT_TITLE: "Open Sans",
  FONT_BODY: "Open Sans",
  FT: 24, FST: 15, FB: 13, FC: 11, FF: 9,
};

const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.08 });
function addTitle(slide, text) { slide.addText(text, { x: S.ML, y: S.TY, w: S.CW, h: S.TH, fontSize: S.FT, bold: true, color: S.charcoal, fontFace: S.FONT_TITLE }); }
function addDivider(slide) { slide.addShape("rect", { x: S.ML, y: S.DIV_Y, w: S.CW, h: 0.03, fill: { color: S.charcoal } }); }
function addBumper(slide, text) {
  slide.addShape("rect", { x: S.ML, y: S.BUMPER_Y, w: S.CW, h: S.BUMPER_H, fill: { color: S.lightGray } });
  slide.addShape("rect", { x: S.ML, y: S.BUMPER_Y, w: 0.08, h: S.BUMPER_H, fill: { color: S.mediumGray } });
  slide.addText(text, { x: S.ML + 0.2, y: S.BUMPER_Y + 0.1, w: S.CW - 0.2, h: 0.25, fontSize: 13, bold: true, color: S.charcoal, fontFace: S.FONT_BODY });
}
function addFooter(slide, source, pageNum) {
  slide.addText(source, { x: S.ML, y: S.FY, w: 9, h: 0.3, fontSize: S.FF, color: S.mediumGray, fontFace: S.FONT_BODY });
  slide.addText(String(pageNum), { x: S.ML + S.CW - 0.5, y: S.FY, w: 0.5, h: 0.3, fontSize: S.FF, color: S.mediumGray, fontFace: S.FONT_BODY, align: "right" });
}

const pres = new PptxGenJS();
pres.defineLayout({ name: "CONSULTING_16x9", width: 13.333, height: 7.5 });
pres.layout = "CONSULTING_16x9";
pres.author = "API Ventures";
pres.title = "10 Business Opportunities Powered by Open-Source APIs";

// ─── ALL 10 IDEAS ───
const ideas = [
  {
    id: 1, name: "Website Time-Lapse Detective", category: "Intelligence",
    api: "Wayback CDX API", apiType: "Free / Unlimited",
    desc: "Track how a company's messaging evolves over time. Generate a \"change fingerprint\" — new claims, removed claims, wording drift — from historical web captures.",
    biz: "Competitive intelligence SaaS for brand strategists, investors, and M&A due diligence teams.",
    complexity: "Medium", revenue: "High", moat: "Medium",
  },
  {
    id: 2, name: "Invisible City Atlas", category: "Civic Tech",
    api: "Overpass API (OSM)", apiType: "Free / Rate-limited",
    desc: "Map what nobody maps: AEDs, water fountains, public toilets, bicycle pumps, wheelchair entrances. Compute a \"survivability score\" per neighborhood.",
    biz: "B2G civic analytics, real estate intelligence add-on, accessibility consulting tool.",
    complexity: "Medium", revenue: "Medium", moat: "High",
  },
  {
    id: 3, name: "Regulation Diff Bot", category: "Compliance",
    api: "Federal Register API", apiType: "Free / Unlimited",
    desc: "Pick a topic (AI, crypto, trucking). See what changed this week as a red/green diff with plain-English tags and attribution.",
    biz: "Compliance-as-a-service for regulated industries. Weekly digest product for legal teams and lobbyists.",
    complexity: "Low", revenue: "High", moat: "Medium",
  },
  {
    id: 4, name: "Wikipedia Attention Weather", category: "Media Intel",
    api: "Wikimedia Pageviews API", apiType: "Free / Unlimited",
    desc: "Track attention fronts that move across languages and countries over time. Render like a meteorology map — not trending topics, attention systems.",
    biz: "Media monitoring add-on, geopolitical intelligence layer, newsroom planning tool.",
    complexity: "High", revenue: "Medium", moat: "High",
  },
  {
    id: 5, name: "Narrative Drift Observatory", category: "Media Intel",
    api: "GDELT APIs", apiType: "Free / Unlimited",
    desc: "\"How is the world framing Topic X this month vs last month?\" Compare language, locations, sources, and show a framing shift timeline.",
    biz: "PR/comms intelligence, think tank research tool, brand narrative monitoring.",
    complexity: "High", revenue: "High", moat: "High",
  },
  {
    id: 6, name: "CVE Dungeon Crawl", category: "Security",
    api: "NVD Vulnerability + CPE APIs", apiType: "Free / API key",
    desc: "Gamify security: your tech stack is a party, CVEs are monsters. Level up by applying mitigations. Weekly attack cycles.",
    biz: "Developer engagement tool for security teams. Enterprise gamification platform for patch compliance.",
    complexity: "Medium", revenue: "High", moat: "Medium",
  },
  {
    id: 7, name: "Earthquake Sonifier", category: "Experience",
    api: "USGS Earthquake Catalog", apiType: "Free / Unlimited",
    desc: "Turn seismic data into sound and minimalist animation — a \"tectonic music box.\" Magnitude → pitch, depth → timbre, location → stereo field.",
    biz: "Educational installations, museum exhibits, data-art licensing, ambient experience product.",
    complexity: "Medium", revenue: "Low", moat: "Low",
  },
  {
    id: 8, name: "Book Genome Builder", category: "Discovery",
    api: "Open Library Search API", apiType: "Free / Unlimited",
    desc: "Build a family tree for any book: editions, translations, author networks, era clusters. Generate \"adjacent-but-not-obvious\" reading paths.",
    biz: "Publisher analytics, library recommendation engine, book subscription box curation tool.",
    complexity: "Medium", revenue: "Medium", moat: "Medium",
  },
  {
    id: 9, name: "Paper Frontier Radar", category: "Research",
    api: "arXiv API", apiType: "Free / Rate-limited",
    desc: "Detect emerging micro-topics inside arXiv categories by tracking new term co-occurrences. Produce a weekly \"frontier map.\"",
    biz: "R&D intelligence for tech companies, VC deal sourcing signal, academic trend forecasting.",
    complexity: "High", revenue: "Medium", moat: "High",
  },
  {
    id: 10, name: "Museum Loot Generator", category: "Culture",
    api: "Met Collection / Smithsonian API", apiType: "Free / Unlimited",
    desc: "Daily \"loot drops\" from museum collections with constraints: materials, era, place, color mood. Public-domain art discovery engine.",
    biz: "Content pipeline for media companies, print-on-demand integration, educational gamification.",
    complexity: "Low", revenue: "Medium", moat: "Low",
  },
];

// ─── SLIDE 1: COVER ───
{
  const sl = pres.addSlide();
  sl.background = { color: S.black };
  sl.addText("10 Business Opportunities", { x: S.COVER_ML, y: 1.8, w: S.COVER_CW, h: 1.2, fontSize: 44, bold: true, color: S.white, fontFace: S.FONT_TITLE });
  sl.addText("Powered by Open-Source APIs", { x: S.COVER_ML, y: 2.9, w: S.COVER_CW, h: 0.7, fontSize: 30, color: S.brandGreen, fontFace: S.FONT_TITLE });
  sl.addShape("rect", { x: S.COVER_ML, y: 3.8, w: 4.0, h: 0.03, fill: { color: S.mediumGray } });
  sl.addText("Zero licensing cost  |  Production-ready APIs  |  Real revenue potential", { x: S.COVER_ML, y: 4.1, w: S.COVER_CW, h: 0.5, fontSize: 15, color: S.mediumGray, fontFace: S.FONT_BODY });
  sl.addText("February 2026", { x: S.COVER_ML, y: 4.7, w: S.COVER_CW, h: 0.4, fontSize: 13, color: S.mediumGray, fontFace: S.FONT_BODY });
}

// ─── SLIDE 2: EXECUTIVE SUMMARY ───
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "The open API economy enables high-value products with zero licensing cost");
  addDivider(sl);

  const cards = [
    { title: "10 Ventures", value: "10", sub: "curated ideas", detail: "Spanning intel, civic, security, culture" },
    { title: "APIs Used", value: "10+", sub: "open-source APIs", detail: "All free or freemium, production-grade" },
    { title: "Revenue Models", value: "6", sub: "distinct models", detail: "SaaS, B2G, licensing, content, tools" },
  ];
  const cardW = 3.8, cardGap = (S.CW - cardW * 3) / 2;
  cards.forEach((c, i) => {
    const cx = S.ML + i * (cardW + cardGap);
    sl.addShape("rect", { x: cx, y: S.BY, w: cardW, h: 2.4, fill: { color: S.lightGray }, rectRadius: 0.1, shadow: makeShadow() });
    sl.addShape("rect", { x: cx, y: S.BY, w: cardW, h: 0.06, fill: { color: S.mediumGray } });
    sl.addText(c.title, { x: cx + 0.3, y: S.BY + 0.2, w: cardW - 0.6, h: 0.3, fontSize: 13, bold: true, color: S.mediumGray, fontFace: S.FONT_BODY });
    sl.addText(c.value, { x: cx + 0.3, y: S.BY + 0.5, w: cardW - 0.6, h: 0.7, fontSize: 44, bold: true, color: S.charcoal, fontFace: S.FONT_TITLE });
    sl.addText(c.sub, { x: cx + 0.3, y: S.BY + 1.2, w: cardW - 0.6, h: 0.3, fontSize: 13, color: S.mediumGray, fontFace: S.FONT_BODY });
    sl.addText(c.detail, { x: cx + 0.3, y: S.BY + 1.6, w: cardW - 0.6, h: 0.4, fontSize: 11, color: S.brandGreen, fontFace: S.FONT_BODY });
  });

  sl.addText([
    { text: "Key Insight: ", options: { bold: true, color: S.brandGreen } },
    { text: "Open APIs remove the biggest barrier to product development — data acquisition cost. These 10 ideas exploit freely available, well-maintained APIs to build products with genuine commercial potential across intelligence, compliance, culture, and security.", options: { color: S.charcoal } },
  ], { x: S.ML, y: S.BY + 3.0, w: S.CW, h: 0.7, fontSize: 12, fontFace: S.FONT_BODY });

  addBumper(sl, "Every idea uses a free, production-grade API — the moat comes from the product layer, not data access");
  addFooter(sl, "Source: Public API documentation review", 2);
}

// ─── SLIDE 3: LANDSCAPE OVERVIEW (2×5 GRID) ───
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Ten ventures spanning intelligence, safety, culture, security, and discovery");
  addDivider(sl);

  const cols = 2, rows = 5;
  const cardW = 5.9, cardH = 0.88, gapX = 0.5, gapY = 0.12;
  ideas.forEach((idea, idx) => {
    // Vertical ordering: 1-5 left column, 6-10 right column
    const col = idx < 5 ? 0 : 1, row = idx < 5 ? idx : idx - 5;
    const cx = S.ML + col * (cardW + gapX);
    const cy = S.BY + row * (cardH + gapY);
    sl.addShape("rect", { x: cx, y: cy, w: cardW, h: cardH, fill: { color: S.lightGray }, rectRadius: 0.06 });
    sl.addShape("rect", { x: cx, y: cy, w: 0.06, h: cardH, fill: { color: S.mediumGray } });
    // Number badge (wider for double digits)
    const badgeW = idea.id >= 10 ? 0.55 : 0.45;
    sl.addShape("rect", { x: cx + 0.2, y: cy + 0.15, w: badgeW, h: 0.45, fill: { color: S.brandGreen }, rectRadius: 0.06 });
    sl.addText(String(idea.id), { x: cx + 0.2, y: cy + 0.15, w: badgeW, h: 0.45, fontSize: 16, bold: true, color: S.white, fontFace: S.FONT_TITLE, align: "center", valign: "middle" });
    // Name + category
    sl.addText(idea.name, { x: cx + 0.8, y: cy + 0.08, w: cardW - 1.8, h: 0.35, fontSize: 13, bold: true, color: S.charcoal, fontFace: S.FONT_BODY });
    sl.addText(idea.category, { x: cx + 0.8, y: cy + 0.42, w: 1.5, h: 0.3, fontSize: 10, color: S.brandGreen, bold: true, fontFace: S.FONT_BODY });
    // API tag
    sl.addText(idea.api, { x: cx + cardW - 2.8, y: cy + 0.42, w: 2.6, h: 0.3, fontSize: 9, color: S.mediumGray, fontFace: S.FONT_BODY, align: "right" });
  });

  addBumper(sl, "All 10 ideas use free, well-documented APIs with no licensing barriers to entry");
  addFooter(sl, "Source: Public API documentation review", 3);
}

// ─── HELPER: IDEA GROUP SLIDE ───
function makeGroupSlide(title, slideIdeas, bumperText, pageNum) {
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, title);
  addDivider(sl);

  const panelH = (S.BUMPER_Y - 0.1 - S.BY) / slideIdeas.length - 0.08;
  slideIdeas.forEach((idea, i) => {
    const py = S.BY + i * (panelH + 0.08);
    // Card
    sl.addShape("rect", { x: S.ML, y: py, w: S.CW, h: panelH, fill: { color: S.lightGray }, rectRadius: 0.08, shadow: makeShadow() });
    sl.addShape("rect", { x: S.ML, y: py, w: 0.08, h: panelH, fill: { color: S.mediumGray } });
    // Number badge (wider for double digits)
    const badgeW = idea.id >= 10 ? 0.6 : 0.5;
    sl.addShape("rect", { x: S.ML + 0.25, y: py + 0.15, w: badgeW, h: 0.5, fill: { color: S.brandGreen }, rectRadius: 0.08 });
    sl.addText(String(idea.id), { x: S.ML + 0.25, y: py + 0.15, w: badgeW, h: 0.5, fontSize: 20, bold: true, color: S.white, fontFace: S.FONT_TITLE, align: "center", valign: "middle" });
    // Name + API
    sl.addText(idea.name, { x: S.ML + 1.0, y: py + 0.1, w: 5.0, h: 0.35, fontSize: 16, bold: true, color: S.charcoal, fontFace: S.FONT_TITLE });
    sl.addText(idea.api + "  ·  " + idea.apiType, { x: S.ML + 1.0, y: py + 0.42, w: 5.0, h: 0.25, fontSize: 10, italic: true, color: S.brandGreen, fontFace: S.FONT_BODY });
    // Description
    sl.addText(idea.desc, { x: S.ML + 1.0, y: py + 0.7, w: 6.5, h: panelH - 1.0, fontSize: 11, color: S.charcoal, fontFace: S.FONT_BODY });
    // Business case (right side)
    sl.addShape("rect", { x: S.ML + S.CW - 4.2, y: py + 0.1, w: 4.0, h: panelH - 0.2, fill: { color: S.white }, rectRadius: 0.06 });
    sl.addText("Business Case", { x: S.ML + S.CW - 4.1, y: py + 0.15, w: 3.8, h: 0.25, fontSize: 10, bold: true, color: S.brandGreen, fontFace: S.FONT_BODY });
    sl.addText(idea.biz, { x: S.ML + S.CW - 4.1, y: py + 0.4, w: 3.8, h: panelH - 0.6, fontSize: 10, color: S.charcoal, fontFace: S.FONT_BODY });
  });

  addBumper(sl, bumperText);
  addFooter(sl, "Source: Public API documentation review", pageNum);
}

// ─── SLIDE 4: IDEAS 1–3 (INTELLIGENCE & COMPLIANCE) ───
makeGroupSlide(
  "Intelligence and compliance ventures exploit freely available change data at scale",
  [ideas[0], ideas[1], ideas[2]],
  "Web archiving, civic mapping, and regulation tracking — three proven data sources, zero licensing cost",
  4
);

// ─── SLIDE 5: IDEAS 4–5 (MEDIA & NARRATIVE INTELLIGENCE) ───
makeGroupSlide(
  "Attention tracking and narrative analysis serve strategy, media, and PR teams",
  [ideas[3], ideas[4]],
  "Wikipedia attention patterns and GDELT framing shifts — early signals for media, geopolitics, and brand teams",
  5
);

// ─── SLIDE 6: IDEAS 6–7 (SECURITY & EXPERIENCE) ───
makeGroupSlide(
  "Gamified security and data sonification turn technical feeds into engaging products",
  [ideas[5], ideas[6]],
  "CVE gamification drives patch compliance; earthquake sonification creates a new category of data experience",
  6
);

// ─── SLIDE 7: IDEAS 8–10 (DISCOVERY & CULTURE) ───
makeGroupSlide(
  "Content discovery products monetize the world's open knowledge and cultural archives",
  [ideas[7], ideas[8], ideas[9]],
  "Book genomes, research frontiers, and museum loot — content pipelines built on public-domain collections",
  7
);

// ─── SLIDE 8: COMPARISON MATRIX ───
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Build complexity, revenue potential, and competitive moat vary across all ten ideas");
  addDivider(sl);

  const headerRow = [
    { text: "#", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
    { text: "Venture", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY } },
    { text: "Category", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY } },
    { text: "API", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY } },
    { text: "Complexity", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
    { text: "Revenue", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
    { text: "Moat", options: { fill: { color: S.brandGreen }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
  ];

  const ratingColor = (val) => val === "High" ? S.brandGreen : (val === "Medium" ? S.brandGreen : S.mediumGray);
  const tableRows = [headerRow];
  ideas.forEach((idea, i) => {
    const bg = i % 2 === 0 ? S.white : S.lightGray;
    tableRows.push([
      { text: String(idea.id), options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: S.charcoal, align: "center", bold: true } },
      { text: idea.name, options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: S.charcoal, bold: true } },
      { text: idea.category, options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: S.brandGreen } },
      { text: idea.api, options: { fill: { color: bg }, fontSize: 9, fontFace: S.FONT_BODY, color: S.mediumGray } },
      { text: idea.complexity, options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: ratingColor(idea.complexity), align: "center", bold: true } },
      { text: idea.revenue, options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: ratingColor(idea.revenue), align: "center", bold: true } },
      { text: idea.moat, options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: ratingColor(idea.moat), align: "center", bold: true } },
    ]);
  });

  sl.addTable(tableRows, {
    x: S.ML, y: S.BY, w: S.CW,
    border: { type: "solid", pt: 0.5, color: "CCCCCC" },
    colW: [0.4, 2.8, 1.2, 2.5, 1.2, 1.2, 1.2],
    rowH: 0.43,
    fontFace: S.FONT_BODY, fontSize: 10, color: S.charcoal, valign: "middle",
  });

  addBumper(sl, "Three ideas score High on both revenue potential and competitive moat: Narrative Drift, Paper Frontier, and Invisible City");
  addFooter(sl, "Source: Qualitative assessment based on API maturity, market size, and differentiation potential", 8);
}

// ─── SLIDE 9: RECOMMENDED NEXT STEPS ───
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Three ventures to prototype first, with a 90-day validation plan");
  addDivider(sl);

  // Top 3 picks
  const picks = [
    { id: 3, name: "Regulation Diff Bot", why: "Lowest build complexity + highest revenue potential. Compliance SaaS has proven willingness to pay. MVP in 2-3 weeks.", color: S.brandGreen },
    { id: 5, name: "Narrative Drift Observatory", why: "Highest moat + highest revenue. GDELT data is rich but hard to productize — first mover advantage. MVP in 6-8 weeks.", color: S.brandGreen },
    { id: 6, name: "CVE Dungeon Crawl", why: "Novel engagement model in a $4B+ market. Gamification drives retention. Strong virality potential within security teams. MVP in 4-6 weeks.", color: S.charcoal },
  ];

  picks.forEach((p, i) => {
    const cx = S.ML + i * 4.2;
    sl.addShape("rect", { x: cx, y: S.BY, w: 3.9, h: 3.0, fill: { color: S.lightGray }, rectRadius: 0.1, shadow: makeShadow() });
    sl.addShape("rect", { x: cx, y: S.BY, w: 3.9, h: 0.06, fill: { color: S.mediumGray } });
    sl.addShape("rect", { x: cx + 0.2, y: S.BY + 0.25, w: 0.45, h: 0.45, fill: { color: S.brandGreen }, rectRadius: 0.06 });
    sl.addText(String(p.id), { x: cx + 0.2, y: S.BY + 0.25, w: 0.45, h: 0.45, fontSize: 18, bold: true, color: S.white, fontFace: S.FONT_TITLE, align: "center", valign: "middle" });
    sl.addText(p.name, { x: cx + 0.8, y: S.BY + 0.25, w: 2.8, h: 0.45, fontSize: 15, bold: true, color: S.charcoal, fontFace: S.FONT_TITLE, valign: "middle" });
    sl.addText(p.why, { x: cx + 0.3, y: S.BY + 0.9, w: 3.3, h: 1.8, fontSize: 11, color: S.charcoal, fontFace: S.FONT_BODY });
  });

  // 90-day plan
  sl.addText("90-Day Validation Plan", { x: S.ML, y: S.BY + 3.3, w: S.CW, h: 0.35, fontSize: 16, bold: true, color: S.brandGreen, fontFace: S.FONT_TITLE });
  const phases = [
    { phase: "Weeks 1–3", action: "Build Regulation Diff Bot MVP. Validate with 5 compliance teams. Measure engagement and willingness to pay." },
    { phase: "Weeks 4–8", action: "Build Narrative Drift Observatory prototype. Partner with 1 PR agency for pilot. Measure framing detection accuracy." },
    { phase: "Weeks 6–12", action: "Build CVE Dungeon Crawl alpha. Run internal pilot with 3 engineering teams. Measure patch time improvement." },
  ];
  const phaseY = S.BY + 3.75;
  phases.forEach((p, i) => {
    const px = S.ML + i * 4.2;
    sl.addShape("rect", { x: px, y: phaseY, w: 3.9, h: 1.1, fill: { color: S.lightGray }, rectRadius: 0.06 });
    sl.addText(p.phase, { x: px + 0.2, y: phaseY + 0.05, w: 3.5, h: 0.3, fontSize: 12, bold: true, color: S.brandGreen, fontFace: S.FONT_BODY });
    sl.addText(p.action, { x: px + 0.2, y: phaseY + 0.35, w: 3.5, h: 0.7, fontSize: 10, color: S.charcoal, fontFace: S.FONT_BODY });
  });

  addBumper(sl, "Start with Regulation Diff Bot — lowest risk, fastest validation, clearest path to revenue");
  addFooter(sl, "Source: Build complexity and market analysis", 9);
}

// ─── SAVE ───
const fileName = "10_API_Ventures.pptx";
const outputPath = __dirname + "/" + fileName;
pres.writeFile({ fileName: outputPath }).then(() => console.log("Saved:", outputPath)).catch((err) => console.error("Error:", err));
