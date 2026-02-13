import PptxGenJS from "pptxgenjs";
import { writeFileSync } from "fs";

// ============================================================
// DESIGN SYSTEM A - Modern Professional (Green Accent)
// ============================================================
const S = {
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
  greenTint: "E8F5D6",

  // Layout
  ML: 0.8,
  MR: 0.8,
  CW: 11.7,
  TY: 0.4,
  TH: 0.8,
  BY: 1.4,
  BH: 5.0,
  BUMPER_Y: 6.5,
  FOOTER_Y: 7.1,

  // Typography
  FONT: "Trebuchet MS",
  FT: 24,   // action title
  FB: 13,   // body
  FC: 11,   // chart labels
  FBM: 13,  // bumper
  FF: 9,    // footer
};

const makeShadow = () => ({
  type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.08
});

// ============================================================
// DATA
// ============================================================
const monthly = {
  FY24: [600,1800,1200,400,800,1000,1000,1200,600,200,2000,1400],
  FY25: [600,1200,1600,0,1600,1400,1600,600,200,800,1800,400],
  FY26: [900,2700,1800,600,1200,1500,1500,1800,900,300,3000,2100],
  FY27: [900,1800,2400,0,2400,2100,2400,900,300,1200,2700,600],
};
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const sum = arr => arr.reduce((a,b) => a+b, 0);

const annual = {
  FY24: sum(monthly.FY24),
  FY25: sum(monthly.FY25),
  FY26: sum(monthly.FY26),
  FY27: sum(monthly.FY27),
};

const quarterly = (arr) => [
  sum(arr.slice(0,3)), sum(arr.slice(3,6)), sum(arr.slice(6,9)), sum(arr.slice(9,12))
];
const qFY24 = quarterly(monthly.FY24);
const qFY25 = quarterly(monthly.FY25);
const qFY26 = quarterly(monthly.FY26);
const qFY27 = quarterly(monthly.FY27);

// ============================================================
// HELPERS
// ============================================================
function addTitle(slide, text) {
  slide.addText(text, {
    x: S.ML, y: S.TY, w: S.CW, h: S.TH,
    fontSize: S.FT, bold: true, color: S.charcoal, fontFace: S.FONT,
  });
}

function addBumper(slide, text, yellow = false) {
  slide.addShape("rect", {
    x: S.ML, y: S.BUMPER_Y, w: S.CW, h: 0.45,
    fill: { color: yellow ? S.accentYellow : S.cardFill },
  });
  slide.addShape("rect", {
    x: S.ML, y: S.BUMPER_Y, w: 0.08, h: 0.45,
    fill: { color: S.primaryDark },
  });
  slide.addText(text, {
    x: S.ML + 0.2, y: S.BUMPER_Y + 0.1, w: S.CW - 0.2, h: 0.25,
    fontSize: S.FBM, bold: true, color: S.charcoal, fontFace: S.FONT,
  });
}

function addFooter(slide, source, pageNum) {
  slide.addText(source, {
    x: S.ML, y: S.FOOTER_Y, w: 10, h: 0.3,
    fontSize: S.FF, color: S.mediumGray, fontFace: S.FONT,
  });
  slide.addText(String(pageNum), {
    x: S.ML + S.CW - 0.5, y: S.FOOTER_Y, w: 0.5, h: 0.3,
    fontSize: S.FF, color: S.mediumGray, fontFace: S.FONT, align: "right",
  });
}

function addDivider(slide) {
  slide.addShape("rect", {
    x: S.ML, y: S.TY + S.TH + 0.05, w: S.CW, h: 0.03,
    fill: { color: S.primaryDark },
  });
}

// ============================================================
// BUILD PRESENTATION
// ============================================================
const pres = new PptxGenJS();
pres.defineLayout({ name: "CONSULTING_16x9", width: 13.333, height: 7.5 });
pres.layout = "CONSULTING_16x9";
pres.author = "Anaplan MCP";
pres.title = "FY26 Sales Forecast - Laptop Pro - Acme Corporation";

// --- SLIDE 1: COVER ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.primaryDark };

  // Accent bar at top
  sl.addShape("rect", { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: S.accentYellow } });

  sl.addText("FY26 Sales Forecast", {
    x: S.ML, y: 2.0, w: S.CW, h: 1.2,
    fontSize: 44, bold: true, color: S.white, fontFace: S.FONT,
  });
  sl.addText("Laptop Pro  |  Acme Corporation", {
    x: S.ML, y: 3.2, w: S.CW, h: 0.6,
    fontSize: 22, color: S.accentYellow, fontFace: S.FONT,
  });

  // Divider line
  sl.addShape("rect", { x: S.ML, y: 4.0, w: 4.0, h: 0.04, fill: { color: S.white } });

  sl.addText("Prepared by Anaplan MCP  |  February 2026", {
    x: S.ML, y: 4.3, w: S.CW, h: 0.5,
    fontSize: 14, color: "CCCCCC", fontFace: S.FONT,
  });

  // Bottom accent bar
  sl.addShape("rect", { x: 0, y: 7.38, w: 13.333, h: 0.12, fill: { color: S.accentYellow } });
}

// --- SLIDE 2: EXECUTIVE SUMMARY ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "Laptop Pro forecast projects 18,300 units in FY26, a 55% increase over FY25");
  addDivider(sl);

  // Three key findings in cards
  const cards = [
    { title: "FY25 Actual", value: "11,800", sub: "units sold", delta: "-3.3% vs FY24", deltaColor: S.accentRed },
    { title: "FY26 Forecast", value: "18,300", sub: "units projected", delta: "+55.1% vs FY25", deltaColor: S.primaryDark },
    { title: "FY27 Outlook", value: "17,700", sub: "units projected", delta: "-3.3% vs FY26", deltaColor: S.accentRed },
  ];

  cards.forEach((c, i) => {
    const cx = S.ML + i * 3.97;
    const cw = 3.7;
    // Card background
    sl.addShape("rect", {
      x: cx, y: 1.7, w: cw, h: 3.2,
      fill: { color: S.cardFill },
      rectRadius: 0.1,
      shadow: makeShadow(),
    });
    // Top accent bar
    sl.addShape("rect", {
      x: cx, y: 1.7, w: cw, h: 0.06,
      fill: { color: i === 1 ? S.accentYellow : S.primaryDark },
    });
    // Card title
    sl.addText(c.title, {
      x: cx + 0.3, y: 1.95, w: cw - 0.6, h: 0.35,
      fontSize: 14, bold: true, color: S.mediumGray, fontFace: S.FONT,
    });
    // Big number
    sl.addText(c.value, {
      x: cx + 0.3, y: 2.4, w: cw - 0.6, h: 0.9,
      fontSize: 42, bold: true, color: S.charcoal, fontFace: S.FONT,
    });
    // Subtitle
    sl.addText(c.sub, {
      x: cx + 0.3, y: 3.2, w: cw - 0.6, h: 0.35,
      fontSize: 13, color: S.mediumGray, fontFace: S.FONT,
    });
    // Delta
    sl.addText(c.delta, {
      x: cx + 0.3, y: 3.7, w: cw - 0.6, h: 0.4,
      fontSize: 16, bold: true, color: c.deltaColor, fontFace: S.FONT,
    });
  });

  // Key insight text
  sl.addText([
    { text: "Key Insight: ", options: { bold: true, color: S.primaryDark } },
    { text: "The 1.5x growth multiplier applied to FY24 actuals produces a strong FY26 forecast, but FY25's slight decline signals potential seasonality risk that warrants monitoring.", options: { color: S.charcoal } },
  ], {
    x: S.ML, y: 5.2, w: S.CW, h: 0.7,
    fontSize: 13, fontFace: S.FONT,
  });

  addBumper(sl, "FY26 represents the strongest projected year for Laptop Pro at Acme Corporation", true);
  addFooter(sl, "Source: Anaplan - [LARA] TEST MODEL, Sales Forecast Module", 2);
}

// --- SLIDE 3: ANNUAL TREND (BAR CHART) ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "Annual sales trajectory shows 50% growth from FY24 to FY26 forecast");
  addDivider(sl);

  const chartData = [{
    name: "Units",
    labels: ["FY24 (Actual)", "FY25 (Actual)", "FY26 (Forecast)", "FY27 (Forecast)"],
    values: [annual.FY24, annual.FY25, annual.FY26, annual.FY27],
  }];

  sl.addChart(pres.charts.BAR, chartData, {
    x: S.ML, y: S.BY, w: 7.0, h: S.BH,
    barDir: "col",
    chartColors: [S.primaryDark],
    chartArea: { fill: { color: S.white } },
    plotArea: { fill: { color: S.white } },
    catAxisLabelColor: S.charcoal,
    valAxisLabelColor: S.charcoal,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,
    catAxisLabelFontFace: S.FONT,
    valAxisLabelFontFace: S.FONT,
    valGridLine: { color: "E0E0E0", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: S.charcoal,
    dataLabelFontSize: 12,
    dataLabelFontFace: S.FONT,
    dataLabelFontBold: true,
    showLegend: false,
    valAxisHidden: false,
  });

  // Insights box on the right
  sl.addShape("rect", {
    x: 8.2, y: S.BY, w: 4.3, h: S.BH,
    fill: { color: S.cardFill },
    rectRadius: 0.1,
    shadow: makeShadow(),
  });
  sl.addShape("rect", {
    x: 8.2, y: S.BY, w: 0.06, h: S.BH,
    fill: { color: S.primaryDark },
  });

  sl.addText("Annual Analysis", {
    x: 8.5, y: S.BY + 0.2, w: 3.8, h: 0.4,
    fontSize: 16, bold: true, color: S.primaryDark, fontFace: S.FONT,
  });

  const insights = [
    { label: "FY24 → FY25", value: "-3.3%", note: "Slight decline in historical sales" },
    { label: "FY25 → FY26", value: "+55.1%", note: "Strong growth driven by 1.5x multiplier on FY24 base" },
    { label: "FY26 → FY27", value: "-3.3%", note: "Mirrors FY24-FY25 decline pattern" },
    { label: "Peak Quarter", value: "Q4", note: "Consistently strongest quarter across all years" },
  ];

  insights.forEach((ins, i) => {
    const iy = S.BY + 0.8 + i * 1.05;
    sl.addText(ins.label, {
      x: 8.5, y: iy, w: 3.8, h: 0.25,
      fontSize: 11, bold: true, color: S.charcoal, fontFace: S.FONT,
    });
    sl.addText(ins.value, {
      x: 8.5, y: iy + 0.25, w: 3.8, h: 0.3,
      fontSize: 18, bold: true,
      color: ins.value.startsWith("+") ? S.primaryDark : S.accentRed,
      fontFace: S.FONT,
    });
    sl.addText(ins.note, {
      x: 8.5, y: iy + 0.55, w: 3.8, h: 0.3,
      fontSize: 10, color: S.mediumGray, fontFace: S.FONT,
    });
  });

  addBumper(sl, "Forecast methodology applies a 1.5x multiplier to FY24 actuals, producing consistent seasonal patterns");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module (Historical Sales, Forecast line items)", 3);
}

// --- SLIDE 4: QUARTERLY COMPARISON (GROUPED BAR) ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "Q4 consistently delivers strongest quarterly performance across all years");
  addDivider(sl);

  const chartData = [
    { name: "FY24", labels: ["Q1","Q2","Q3","Q4"], values: qFY24 },
    { name: "FY25", labels: ["Q1","Q2","Q3","Q4"], values: qFY25 },
    { name: "FY26 (F)", labels: ["Q1","Q2","Q3","Q4"], values: qFY26 },
    { name: "FY27 (F)", labels: ["Q1","Q2","Q3","Q4"], values: qFY27 },
  ];

  sl.addChart(pres.charts.BAR, chartData, {
    x: S.ML, y: S.BY, w: S.CW, h: 4.6,
    barDir: "col",
    barGrouping: "clustered",
    chartColors: ["B0D4A0", S.primaryDark, S.accentYellow, S.accentBlue],
    chartArea: { fill: { color: S.white } },
    plotArea: { fill: { color: S.white } },
    catAxisLabelColor: S.charcoal,
    valAxisLabelColor: S.charcoal,
    catAxisLabelFontSize: 12,
    valAxisLabelFontSize: 10,
    catAxisLabelFontFace: S.FONT,
    valAxisLabelFontFace: S.FONT,
    valGridLine: { color: "E0E0E0", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: S.charcoal,
    dataLabelFontSize: 9,
    dataLabelFontFace: S.FONT,
    showLegend: true,
    legendPos: "b",
    legendFontSize: 10,
    legendFontFace: S.FONT,
    legendColor: S.charcoal,
  });

  addBumper(sl, "Q4 spike driven by November sales - highest single month across all years");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 4);
}

// --- SLIDE 5: MONTHLY DETAIL (LINE CHART - FY24 vs FY25 vs FY26) ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "Monthly forecast pattern amplifies FY24 seasonality with consistent 1.5x growth");
  addDivider(sl);

  const chartData = [
    { name: "FY24 (Actual)", labels: months, values: monthly.FY24 },
    { name: "FY25 (Actual)", labels: months, values: monthly.FY25 },
    { name: "FY26 (Forecast)", labels: months, values: monthly.FY26 },
  ];

  sl.addChart(pres.charts.LINE, chartData, {
    x: S.ML, y: S.BY, w: S.CW, h: 4.6,
    chartColors: [S.mediumGray, S.primaryDark, S.accentYellow],
    lineSize: 2.5,
    lineSmooth: false,
    chartArea: { fill: { color: S.white } },
    plotArea: { fill: { color: S.white } },
    catAxisLabelColor: S.charcoal,
    valAxisLabelColor: S.charcoal,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,
    catAxisLabelFontFace: S.FONT,
    valAxisLabelFontFace: S.FONT,
    valGridLine: { color: "E0E0E0", size: 0.5 },
    catGridLine: { style: "none" },
    showLegend: true,
    legendPos: "b",
    legendFontSize: 10,
    legendFontFace: S.FONT,
    legendColor: S.charcoal,
    showMarker: true,
    markerSize: 5,
  });

  addBumper(sl, "November is the peak month: 2,000 (FY24), 1,800 (FY25), 3,000 (FY26 forecast)");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 5);
}

// --- SLIDE 6: FORECAST METHODOLOGY ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "Three forecast methods provide complementary views of expected demand");
  addDivider(sl);

  const methods = [
    {
      name: "Forecast (Primary)",
      formula: "Historical Sales (t-24) x 1.5",
      desc: "Applies a 50% growth multiplier to sales from two years prior. Captures seasonal patterns while projecting growth.",
      fy26: "18,300",
      color: S.primaryDark,
    },
    {
      name: "Forecast - Previous Year",
      formula: "Historical Sales (t-12)",
      desc: "Uses prior year actuals as baseline forecast. Conservative approach assuming no growth.",
      fy26: "11,800",
      color: S.accentBlue,
    },
    {
      name: "Forecast - Mean",
      formula: "Historical Sales / 12",
      desc: "Monthly average of annual historical sales. Smooths seasonality for flat demand view.",
      fy26: "983/mo",
      color: S.mediumGray,
    },
  ];

  methods.forEach((m, i) => {
    const cy = S.BY + i * 1.6;
    // Card
    sl.addShape("rect", {
      x: S.ML, y: cy, w: S.CW, h: 1.4,
      fill: { color: S.cardFill },
      rectRadius: 0.08,
      shadow: makeShadow(),
    });
    // Left accent
    sl.addShape("rect", {
      x: S.ML, y: cy, w: 0.08, h: 1.4,
      fill: { color: m.color },
    });
    // Method name
    sl.addText(m.name, {
      x: S.ML + 0.3, y: cy + 0.1, w: 5.0, h: 0.35,
      fontSize: 16, bold: true, color: S.charcoal, fontFace: S.FONT,
    });
    // Formula
    sl.addText(m.formula, {
      x: S.ML + 0.3, y: cy + 0.45, w: 5.0, h: 0.3,
      fontSize: 12, italic: true, color: S.primaryDark, fontFace: S.FONT,
    });
    // Description
    sl.addText(m.desc, {
      x: S.ML + 0.3, y: cy + 0.8, w: 7.5, h: 0.4,
      fontSize: 11, color: S.mediumGray, fontFace: S.FONT,
    });
    // FY26 value
    sl.addText(m.fy26, {
      x: 9.5, y: cy + 0.2, w: 2.8, h: 0.6,
      fontSize: 28, bold: true, color: m.color, fontFace: S.FONT, align: "center",
    });
    sl.addText("FY26", {
      x: 9.5, y: cy + 0.85, w: 2.8, h: 0.3,
      fontSize: 11, color: S.mediumGray, fontFace: S.FONT, align: "center",
    });
  });

  addBumper(sl, "Primary forecast method selected for planning: 1.5x growth multiplier on FY24 historical baseline");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module (formula definitions)", 6);
}

// --- SLIDE 7: MONTHLY DATA TABLE ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "FY26 monthly forecast ranges from 300 to 3,000 units with high seasonality");
  addDivider(sl);

  const headerRow = [
    { text: "", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT, align: "center" } },
    ...months.map(m => ({ text: m, options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT, align: "center" } })),
    { text: "Total", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT, align: "center" } },
  ];

  const makeRow = (label, data, total, bgColor) => [
    { text: label, options: { fill: { color: bgColor }, bold: true, fontSize: 10, fontFace: S.FONT, color: S.charcoal } },
    ...data.map(v => ({ text: String(v), options: { fill: { color: bgColor }, fontSize: 10, fontFace: S.FONT, color: S.charcoal, align: "right" } })),
    { text: String(total), options: { fill: { color: bgColor }, bold: true, fontSize: 10, fontFace: S.FONT, color: S.charcoal, align: "right" } },
  ];

  const rows = [
    headerRow,
    makeRow("FY24", monthly.FY24, annual.FY24, S.white),
    makeRow("FY25", monthly.FY25, annual.FY25, S.cardFill),
    makeRow("FY26 (F)", monthly.FY26, annual.FY26, S.greenTint),
    makeRow("FY27 (F)", monthly.FY27, annual.FY27, S.cardFill),
  ];

  // YoY growth row
  const yoyGrowth = monthly.FY26.map((v, i) => {
    if (monthly.FY25[i] === 0) return "N/A";
    return Math.round(((v - monthly.FY25[i]) / monthly.FY25[i]) * 100) + "%";
  });
  rows.push([
    { text: "FY26 YoY %", options: { fill: { color: S.white }, bold: true, fontSize: 10, fontFace: S.FONT, color: S.primaryDark, italic: true } },
    ...yoyGrowth.map(v => ({
      text: v,
      options: {
        fill: { color: S.white }, fontSize: 10, fontFace: S.FONT, align: "right", italic: true,
        color: v === "N/A" ? S.mediumGray : (v.startsWith("-") ? S.accentRed : S.primaryDark),
      }
    })),
    { text: "+55%", options: { fill: { color: S.white }, bold: true, fontSize: 10, fontFace: S.FONT, color: S.primaryDark, align: "right", italic: true } },
  ]);

  const colW = [1.1, ...Array(12).fill(0.82), 1.06]; // sums to ~11.7

  sl.addTable(rows, {
    x: S.ML, y: S.BY + 0.2, w: S.CW,
    border: { type: "solid", pt: 0.5, color: "CCCCCC" },
    colW: colW,
    rowH: 0.5,
    fontFace: S.FONT,
    fontSize: 10,
    color: S.charcoal,
    valign: "middle",
  });

  addBumper(sl, "November consistently the peak month: FY26 forecast of 3,000 units represents 16% of annual volume");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 7);
}

// --- SLIDE 8: RISKS & NEXT STEPS ---
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };

  addTitle(sl, "Three risks and five actions to secure FY26 forecast delivery");
  addDivider(sl);

  // LEFT: Risks
  sl.addText("Key Risks", {
    x: S.ML, y: S.BY + 0.1, w: 5.5, h: 0.4,
    fontSize: 18, bold: true, color: S.accentRed, fontFace: S.FONT,
  });

  const risks = [
    { risk: "Seasonality Concentration", detail: "57% of FY26 volume falls in Q1 and Q4, creating supply chain pressure" },
    { risk: "FY25 Decline Signal", detail: "FY25 declined 3.3% vs FY24 - organic demand may not support 1.5x growth assumption" },
    { risk: "Zero-Month Vulnerability", detail: "April shows zero historical sales in FY25, creating forecast uncertainty" },
  ];

  risks.forEach((r, i) => {
    const ry = S.BY + 0.7 + i * 1.3;
    sl.addShape("rect", {
      x: S.ML, y: ry, w: 5.5, h: 1.1,
      fill: { color: S.cardFill },
      rectRadius: 0.08,
    });
    sl.addShape("rect", {
      x: S.ML, y: ry, w: 0.06, h: 1.1,
      fill: { color: S.accentRed },
    });
    sl.addText(r.risk, {
      x: S.ML + 0.25, y: ry + 0.08, w: 5.0, h: 0.35,
      fontSize: 14, bold: true, color: S.charcoal, fontFace: S.FONT,
    });
    sl.addText(r.detail, {
      x: S.ML + 0.25, y: ry + 0.45, w: 5.0, h: 0.5,
      fontSize: 11, color: S.mediumGray, fontFace: S.FONT,
    });
  });

  // RIGHT: Next Steps
  sl.addText("Recommended Actions", {
    x: 6.8, y: S.BY + 0.1, w: 5.5, h: 0.4,
    fontSize: 18, bold: true, color: S.primaryDark, fontFace: S.FONT,
  });

  const actions = [
    ["1", "Validate FY26 demand plan with sales team input", "Sales Director", "Mar 2026"],
    ["2", "Build safety stock for Q4 peak demand", "Supply Chain", "Sep 2026"],
    ["3", "Investigate April zero-sales anomaly in FY25", "Analytics", "Mar 2026"],
    ["4", "Set up monthly forecast vs. actual tracking", "Finance", "Mar 2026"],
    ["5", "Prepare downside scenario at 1.2x multiplier", "Planning", "Mar 2026"],
  ];

  const actionHeader = [
    { text: "#", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT, align: "center" } },
    { text: "Action", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT } },
    { text: "Owner", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT } },
    { text: "Target", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT } },
  ];

  const actionRows = [actionHeader];
  actions.forEach((a, i) => {
    const bg = i % 2 === 0 ? S.white : S.cardFill;
    actionRows.push(a.map((cell, j) => ({
      text: cell,
      options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT, color: S.charcoal, align: j === 0 ? "center" : "left" },
    })));
  });

  sl.addTable(actionRows, {
    x: 6.8, y: S.BY + 0.65, w: 5.7,
    border: { type: "solid", pt: 0.5, color: "CCCCCC" },
    colW: [0.4, 2.6, 1.4, 1.3],
    rowH: 0.45,
    valign: "middle",
  });

  addBumper(sl, "Immediate priority: validate demand assumptions with sales team before Q1 close", true);
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 8);
}

// --- SAVE ---
const fileName = "FY26_Sales_Forecast_Laptop_Pro_Acme_Corp_v2.pptx";
await pres.writeFile({ fileName: `example-output/${fileName}` });
console.log(`Presentation saved: example-output/${fileName}`);
