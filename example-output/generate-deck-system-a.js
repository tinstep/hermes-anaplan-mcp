const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const cellData = JSON.parse(fs.readFileSync(__dirname + "/anaplan_cells.json", "utf-8"));

// DESIGN SYSTEM A — Modern Professional (Green + Trebuchet)
const S = {
  primaryDark: "006B3F",
  primaryLight: "00A651",
  accentYellow: "FFD700",
  accentRed: "E04040",
  accentBlue: "0077C8",
  charcoal: "2D2D2D",
  mediumGray: "808080",
  white: "FFFFFF",
  lightGray: "F2F2F2",
  chartGray: "C0C5C9",
  greenTint: "E8F5D6",

  ML: 0.5, MR: 0.5, CW: 12.333,
  TY: 0.5, TH: 0.8, DIV_Y: 1.35,
  BY: 1.5, FY: 7.1, BUMPER_H: 0.45, BUMPER_Y: 6.55, BH: 4.95,
  COVER_ML: 1.0, COVER_CW: 11.333,

  FONT_TITLE: "Trebuchet MS",
  FONT_BODY: "Trebuchet MS",
  FT: 24, FST: 15, FB: 13, FC: 11, FF: 9,
};

const columns = cellData.columnCoordinates.map((c) => c[0]);
const dataRows = {};
cellData.rows.forEach((r) => {
  dataRows[r.rowCoordinates[0]] = r.cells.map((v) => (v === "" ? null : parseFloat(v)));
});
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
function getMonthlyIndices(fyLabel) {
  const qLabels = ["Q1","Q2","Q3","Q4"].map((q) => `${q} ${fyLabel}`);
  const result = [];
  qLabels.forEach((ql) => { const qi = columns.indexOf(ql); if (qi >= 0) result.push(qi - 3, qi - 2, qi - 1); });
  return result;
}
function getMonthly(fyLabel, rowName) { return getMonthlyIndices(fyLabel).map((i) => dataRows[rowName][i] || 0); }
function getQuarterly(fyLabel, rowName) { const m = getMonthly(fyLabel, rowName); return [sum(m.slice(0,3)), sum(m.slice(3,6)), sum(m.slice(6,9)), sum(m.slice(9,12))]; }

const monthly = { FY24: getMonthly("FY24", "Historical Sales"), FY25: getMonthly("FY25", "Historical Sales"), FY26: getMonthly("FY26", "Forecast"), FY27: getMonthly("FY27", "Forecast") };
const annual = { FY24: sum(monthly.FY24), FY25: sum(monthly.FY25), FY26: sum(monthly.FY26), FY27: sum(monthly.FY27) };
const qFY24 = getQuarterly("FY24", "Historical Sales");
const qFY25 = getQuarterly("FY25", "Historical Sales");
const qFY26 = getQuarterly("FY26", "Forecast");
const qFY27 = getQuarterly("FY27", "Forecast");

const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.08 });
function addTitle(slide, text) { slide.addText(text, { x: S.ML, y: S.TY, w: S.CW, h: S.TH, fontSize: S.FT, bold: true, color: S.primaryDark, fontFace: S.FONT_TITLE }); }
function addDivider(slide) { slide.addShape("rect", { x: S.ML, y: S.DIV_Y, w: S.CW, h: 0.03, fill: { color: S.primaryDark } }); }
function addBumper(slide, text) {
  slide.addShape("rect", { x: S.ML, y: S.BUMPER_Y, w: S.CW, h: S.BUMPER_H, fill: { color: S.lightGray } });
  slide.addShape("rect", { x: S.ML, y: S.BUMPER_Y, w: 0.08, h: S.BUMPER_H, fill: { color: S.primaryDark } });
  slide.addText(text, { x: S.ML + 0.2, y: S.BUMPER_Y + 0.1, w: S.CW - 0.2, h: 0.25, fontSize: 13, bold: true, color: S.charcoal, fontFace: S.FONT_BODY });
}
function addFooter(slide, source, pageNum) {
  slide.addText(source, { x: S.ML, y: S.FY, w: 9, h: 0.3, fontSize: S.FF, color: S.mediumGray, fontFace: S.FONT_BODY });
  slide.addText(String(pageNum), { x: S.ML + S.CW - 0.5, y: S.FY, w: 0.5, h: 0.3, fontSize: S.FF, color: S.mediumGray, fontFace: S.FONT_BODY, align: "right" });
}
function addInsightPanel(slide, title, insights) {
  const panelX = S.ML + S.CW - 3.6, panelW = 3.6, panelH = S.BUMPER_Y - 0.1 - S.BY;
  const itemSpacing = (panelH - 0.8) / insights.length;
  slide.addShape("rect", { x: panelX, y: S.BY, w: panelW, h: panelH, fill: { color: S.lightGray }, rectRadius: 0.1, shadow: makeShadow() });
  slide.addShape("rect", { x: panelX, y: S.BY, w: 0.06, h: panelH, fill: { color: S.primaryDark } });
  slide.addText(title, { x: panelX + 0.3, y: S.BY + 0.2, w: panelW - 0.5, h: 0.4, fontSize: 16, bold: true, color: S.primaryDark, fontFace: S.FONT_TITLE });
  insights.forEach((ins, i) => {
    const iy = S.BY + 0.8 + i * itemSpacing;
    slide.addText(ins.label, { x: panelX + 0.3, y: iy, w: panelW - 0.5, h: 0.25, fontSize: 11, bold: true, color: S.charcoal, fontFace: S.FONT_BODY });
    slide.addText(ins.value, { x: panelX + 0.3, y: iy + 0.25, w: panelW - 0.5, h: 0.3, fontSize: 18, bold: true, color: ins.value.startsWith("+") ? S.primaryLight : (ins.value.startsWith("-") ? S.accentRed : S.primaryDark), fontFace: S.FONT_BODY });
    slide.addText(ins.note, { x: panelX + 0.3, y: iy + 0.55, w: panelW - 0.5, h: 0.3, fontSize: 10, color: S.mediumGray, fontFace: S.FONT_BODY });
  });
}
const chartDefaults = {
  chartArea: { fill: { color: S.white } }, plotArea: { fill: { color: S.white } },
  catAxisLabelColor: S.charcoal, valAxisLabelColor: S.charcoal,
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
  catAxisLabelFontFace: S.FONT_BODY, valAxisLabelFontFace: S.FONT_BODY,
  valGridLine: { color: "E0E0E0", size: 0.5 }, catGridLine: { style: "none" },
  dataLabelColor: S.charcoal, dataLabelFontSize: 8, dataLabelFontFace: S.FONT_BODY,
  valAxisNumFmt: "#,##0", dataLabelFormatCode: "#,##0",
};

const pres = new PptxGenJS();
pres.defineLayout({ name: "CONSULTING_16x9", width: 13.333, height: 7.5 });
pres.layout = "CONSULTING_16x9";
pres.author = "Acme Corporation";
pres.title = "FY26 Sales Forecast - Design System A";

// SLIDE 1: COVER
{
  const sl = pres.addSlide();
  sl.background = { color: S.primaryDark };
  sl.addText("FY26 Sales Forecast", { x: S.COVER_ML, y: 2.0, w: S.COVER_CW, h: 1.2, fontSize: 44, bold: true, color: S.white, fontFace: S.FONT_TITLE });
  sl.addText("Laptop Pro  |  Acme Corporation", { x: S.COVER_ML, y: 3.2, w: S.COVER_CW, h: 0.6, fontSize: 22, color: S.accentYellow, fontFace: S.FONT_BODY });
  sl.addShape("rect", { x: S.COVER_ML, y: 4.0, w: 4.0, h: 0.03, fill: { color: S.white } });
  sl.addText("Sales & Planning Team Review  |  February 2026", { x: S.COVER_ML, y: 4.3, w: S.COVER_CW, h: 0.5, fontSize: 14, color: S.mediumGray, fontFace: S.FONT_BODY });
}

// SLIDE 2: EXECUTIVE SUMMARY
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Laptop Pro forecast projects 18,300 units in FY26, a 55% increase over FY25");
  addDivider(sl);
  const cards = [
    { title: "FY25 Actual", value: "11,800", sub: "units sold", delta: "-3.3% vs FY24", deltaColor: S.accentRed },
    { title: "FY26 Forecast", value: "18,300", sub: "units projected", delta: "+55.1% vs FY25", deltaColor: S.primaryLight },
    { title: "FY27 Outlook", value: "17,700", sub: "units projected", delta: "-3.3% vs FY26", deltaColor: S.accentRed },
  ];
  const cardW = 3.8, cardGap = (S.CW - cardW * 3) / 2;
  cards.forEach((c, i) => {
    const cx = S.ML + i * (cardW + cardGap), cw = cardW;
    sl.addShape("rect", { x: cx, y: S.BY, w: cw, h: 3.0, fill: { color: S.lightGray }, rectRadius: 0.1, shadow: makeShadow() });
    sl.addShape("rect", { x: cx, y: S.BY, w: cw, h: 0.06, fill: { color: i === 1 ? S.primaryLight : S.primaryDark } });
    sl.addText(c.title, { x: cx + 0.3, y: S.BY + 0.25, w: cw - 0.6, h: 0.35, fontSize: 14, bold: true, color: S.mediumGray, fontFace: S.FONT_BODY });
    sl.addText(c.value, { x: cx + 0.3, y: S.BY + 0.6, w: cw - 0.6, h: 0.8, fontSize: 40, bold: true, color: S.charcoal, fontFace: S.FONT_TITLE });
    sl.addText(c.sub, { x: cx + 0.3, y: S.BY + 1.35, w: cw - 0.6, h: 0.3, fontSize: 13, color: S.mediumGray, fontFace: S.FONT_BODY });
    sl.addText(c.delta, { x: cx + 0.3, y: S.BY + 1.75, w: cw - 0.6, h: 0.35, fontSize: 16, bold: true, color: c.deltaColor, fontFace: S.FONT_BODY });
  });
  sl.addText([
    { text: "Key Insight: ", options: { bold: true, color: S.primaryDark } },
    { text: "The 1.5x growth multiplier applied to FY24 actuals produces a strong FY26 forecast, but FY25's slight decline signals potential seasonality risk that warrants monitoring.", options: { color: S.charcoal } },
  ], { x: S.ML, y: S.BY + 3.2, w: S.CW, h: 0.7, fontSize: 13, fontFace: S.FONT_BODY });
  addBumper(sl, "FY26 represents the strongest projected year for Laptop Pro at Acme Corporation");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 2);
}

// SLIDE 3: ANNUAL TREND
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Annual sales trajectory shows 55% growth from FY25 to FY26 forecast");
  addDivider(sl);
  sl.addChart(pres.charts.BAR, [{ name: "Units", labels: ["FY24 (Actual)", "FY25 (Actual)", "FY26 (Forecast)", "FY27 (Forecast)"], values: [annual.FY24, annual.FY25, annual.FY26, annual.FY27] }], {
    x: S.ML, y: S.BY, w: 8.2, h: S.BH, barDir: "col", chartColors: [S.primaryDark], ...chartDefaults, showValue: true, showLegend: false,
  });
  addInsightPanel(sl, "Annual Analysis", [
    { label: "FY24 → FY25", value: "-3.3%", note: "Slight decline in historical sales" },
    { label: "FY25 → FY26", value: "+55.1%", note: "Strong growth from 1.5x multiplier on FY24 base" },
    { label: "FY26 → FY27", value: "-3.3%", note: "Mirrors FY24-FY25 decline pattern" },
    { label: "Peak Quarter", value: "Q4", note: "Consistently strongest quarter across all years" },
  ]);
  addBumper(sl, "Forecast methodology applies a 1.5x multiplier to FY24 actuals, producing consistent seasonal patterns");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module (Historical Sales, Forecast line items)", 3);
}

// SLIDE 4: QUARTERLY
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Q1 and Q4 consistently deliver strongest quarterly performance across all years");
  addDivider(sl);
  sl.addChart(pres.charts.BAR, [
    { name: "FY24", labels: ["Q1","Q2","Q3","Q4"], values: qFY24 },
    { name: "FY25", labels: ["Q1","Q2","Q3","Q4"], values: qFY25 },
    { name: "FY26 (F)", labels: ["Q1","Q2","Q3","Q4"], values: qFY26 },
    { name: "FY27 (F)", labels: ["Q1","Q2","Q3","Q4"], values: qFY27 },
  ], { x: S.ML, y: S.BY, w: S.CW, h: S.BH - 0.8, barDir: "col", barGrouping: "clustered", chartColors: [S.chartGray, S.primaryDark, S.primaryLight, S.accentBlue], ...chartDefaults, showValue: true, showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: S.FONT_BODY, legendColor: S.charcoal });
  addBumper(sl, "Q4 spike driven by November sales — highest single month across all years");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 4);
}

// SLIDE 5: MONTHLY LINE
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Monthly forecast pattern amplifies FY24 seasonality with consistent 1.5x growth");
  addDivider(sl);
  sl.addChart(pres.charts.LINE, [
    { name: "FY24 (Actual)", labels: months, values: monthly.FY24 },
    { name: "FY25 (Actual)", labels: months, values: monthly.FY25 },
    { name: "FY26 (Forecast)", labels: months, values: monthly.FY26 },
  ], { x: S.ML, y: S.BY, w: S.CW, h: S.BH - 0.8, chartColors: [S.chartGray, S.primaryDark, S.primaryLight], lineSize: 1.5, lineSmooth: false, ...chartDefaults, showValue: true, showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: S.FONT_BODY, legendColor: S.charcoal, lineDataSymbol: "circle", lineDataSymbolSize: 3 });
  addBumper(sl, "November is the peak month: 2,000 (FY24), 1,800 (FY25), 3,000 (FY26 forecast)");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 5);
}

// SLIDE 6: METHODOLOGY
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Three forecast methods provide complementary views of expected demand");
  addDivider(sl);
  const methods = [
    { name: "Forecast (Primary)", formula: "Historical Sales (t-24) × 1.5", desc: "Applies a 50% growth multiplier to sales from two years prior.", fy26: "18,300", color: S.primaryDark },
    { name: "Forecast — Previous Year", formula: "Historical Sales (t-12)", desc: "Uses prior year actuals as baseline forecast. Conservative approach.", fy26: "11,800", color: S.accentBlue },
    { name: "Forecast — Mean", formula: "Historical Sales / 12", desc: "Monthly average of annual historical sales. Smooths seasonality.", fy26: "983/mo", color: S.mediumGray },
  ];
  methods.forEach((m, i) => {
    const cy = S.BY + i * 1.45;
    sl.addShape("rect", { x: S.ML, y: cy, w: S.CW, h: 1.3, fill: { color: S.lightGray }, rectRadius: 0.08, shadow: makeShadow() });
    sl.addShape("rect", { x: S.ML, y: cy, w: 0.08, h: 1.3, fill: { color: m.color } });
    sl.addText(m.name, { x: S.ML + 0.3, y: cy + 0.1, w: 5.0, h: 0.3, fontSize: 16, bold: true, color: S.charcoal, fontFace: S.FONT_TITLE });
    sl.addText(m.formula, { x: S.ML + 0.3, y: cy + 0.4, w: 5.0, h: 0.25, fontSize: 12, italic: true, color: S.primaryDark, fontFace: S.FONT_BODY });
    sl.addText(m.desc, { x: S.ML + 0.3, y: cy + 0.7, w: 7.0, h: 0.4, fontSize: 11, color: S.mediumGray, fontFace: S.FONT_BODY });
    sl.addText(m.fy26, { x: 10.3, y: cy + 0.15, w: 2.4, h: 0.55, fontSize: 28, bold: true, color: m.color, fontFace: S.FONT_TITLE, align: "center" });
    sl.addText("FY26", { x: 10.3, y: cy + 0.75, w: 2.4, h: 0.25, fontSize: 11, color: S.mediumGray, fontFace: S.FONT_BODY, align: "center" });
  });
  addBumper(sl, "Primary forecast method selected for planning: 1.5x growth multiplier on FY24 historical baseline");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module (formula definitions)", 6);
}

// SLIDE 7: DATA TABLE
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "FY26 monthly forecast ranges from 300 to 3,000 units with high seasonality");
  addDivider(sl);
  const headerRow = [
    { text: "", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
    ...months.map((m) => ({ text: m, options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } })),
    { text: "Total", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
  ];
  const fmt = (v) => Number(v).toLocaleString();
  const makeRow = (label, data, total, bgColor) => [
    { text: label, options: { fill: { color: bgColor }, bold: true, fontSize: 10, fontFace: S.FONT_BODY, color: S.charcoal } },
    ...data.map((v) => ({ text: fmt(v), options: { fill: { color: bgColor }, fontSize: 10, fontFace: S.FONT_BODY, color: S.charcoal, align: "right" } })),
    { text: fmt(total), options: { fill: { color: bgColor }, bold: true, fontSize: 10, fontFace: S.FONT_BODY, color: S.charcoal, align: "right" } },
  ];
  const yoyGrowth = monthly.FY26.map((v, i) => { if (monthly.FY25[i] === 0) return "N/A"; return Math.round(((v - monthly.FY25[i]) / monthly.FY25[i]) * 100) + "%"; });
  const tableRows = [
    headerRow,
    makeRow("FY24", monthly.FY24, annual.FY24, S.white),
    makeRow("FY25", monthly.FY25, annual.FY25, S.lightGray),
    makeRow("FY26 (F)", monthly.FY26, annual.FY26, S.greenTint),
    makeRow("FY27 (F)", monthly.FY27, annual.FY27, S.lightGray),
    [
      { text: "FY26 YoY %", options: { fill: { color: S.white }, bold: true, fontSize: 10, fontFace: S.FONT_BODY, color: S.primaryDark, italic: true } },
      ...yoyGrowth.map((v) => ({ text: v, options: { fill: { color: S.white }, fontSize: 10, fontFace: S.FONT_BODY, align: "right", italic: true, color: v === "N/A" ? S.mediumGray : (v.startsWith("-") ? S.accentRed : S.primaryLight) } })),
      { text: "+55%", options: { fill: { color: S.white }, bold: true, fontSize: 10, fontFace: S.FONT_BODY, color: S.primaryLight, align: "right", italic: true } },
    ],
  ];
  sl.addTable(tableRows, { x: S.ML, y: S.BY + 0.1, w: S.CW, border: { type: "solid", pt: 0.5, color: "CCCCCC" }, colW: [1.2, ...Array(12).fill(0.86), 0.8], rowH: 0.5, fontFace: S.FONT_BODY, fontSize: 10, color: S.charcoal, valign: "middle" });
  addBumper(sl, "November consistently the peak month: FY26 forecast of 3,000 units represents 16% of annual volume");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 7);
}

// SLIDE 8: RISKS & ACTIONS
{
  const sl = pres.addSlide();
  sl.background = { color: S.white };
  addTitle(sl, "Three risks and five actions to secure FY26 forecast delivery");
  addDivider(sl);
  sl.addText("Key Risks", { x: S.ML, y: S.BY + 0.1, w: 5.2, h: 0.35, fontSize: 18, bold: true, color: S.accentRed, fontFace: S.FONT_TITLE });
  const risks = [
    { risk: "Seasonality Concentration", detail: "57% of FY26 volume falls in Q1 and Q4, creating supply chain pressure" },
    { risk: "FY25 Decline Signal", detail: "FY25 declined 3.3% vs FY24 — organic demand may not support 1.5x growth assumption" },
    { risk: "Zero-Month Vulnerability", detail: "April shows zero historical sales in FY25, creating forecast uncertainty" },
  ];
  risks.forEach((r, i) => {
    const ry = S.BY + 0.6 + i * 1.25;
    sl.addShape("rect", { x: S.ML, y: ry, w: 5.2, h: 1.05, fill: { color: S.lightGray }, rectRadius: 0.08 });
    sl.addShape("rect", { x: S.ML, y: ry, w: 0.06, h: 1.05, fill: { color: S.accentRed } });
    sl.addText(r.risk, { x: S.ML + 0.25, y: ry + 0.08, w: 4.7, h: 0.3, fontSize: 14, bold: true, color: S.charcoal, fontFace: S.FONT_BODY });
    sl.addText(r.detail, { x: S.ML + 0.25, y: ry + 0.42, w: 4.7, h: 0.5, fontSize: 11, color: S.mediumGray, fontFace: S.FONT_BODY });
  });
  sl.addText("Recommended Actions", { x: 6.6, y: S.BY + 0.1, w: 5.7, h: 0.35, fontSize: 18, bold: true, color: S.primaryDark, fontFace: S.FONT_TITLE });
  const actions = [["1","Validate FY26 demand plan with sales team input","Sales Director","Mar 2026"],["2","Build safety stock for Q4 peak demand","Supply Chain","Sep 2026"],["3","Investigate April zero-sales anomaly in FY25","Analytics","Mar 2026"],["4","Set up monthly forecast vs. actual tracking","Finance","Mar 2026"],["5","Prepare downside scenario at 1.2x multiplier","Planning","Mar 2026"]];
  const actionHeader = [
    { text: "#", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY, align: "center" } },
    { text: "Action", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY } },
    { text: "Owner", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY } },
    { text: "Target", options: { fill: { color: S.primaryDark }, color: S.white, bold: true, fontSize: 10, fontFace: S.FONT_BODY } },
  ];
  const actionRows = [actionHeader];
  actions.forEach((a, i) => { const bg = i % 2 === 0 ? S.white : S.lightGray; actionRows.push(a.map((cell, j) => ({ text: cell, options: { fill: { color: bg }, fontSize: 10, fontFace: S.FONT_BODY, color: S.charcoal, align: j === 0 ? "center" : "left" } }))); });
  sl.addTable(actionRows, { x: 6.6, y: S.BY + 0.6, w: 5.7, border: { type: "solid", pt: 0.5, color: "CCCCCC" }, colW: [0.4, 2.5, 1.4, 1.4], rowH: 0.42, valign: "middle" });
  addBumper(sl, "Immediate priority: validate demand assumptions with sales team before Q1 close");
  addFooter(sl, "Source: Anaplan - Sales Forecast Module", 8);
}

const fileName = "FY26_Sales_Forecast_SystemA.pptx";
const outputPath = __dirname + "/" + fileName;
pres.writeFile({ fileName: outputPath }).then(() => console.log("Saved:", outputPath)).catch((err) => console.error("Error:", err));
