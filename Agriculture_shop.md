# Agriculture Retail Anaplan Solution Design

**For:** Agricultural Retail Company (Australia)  
**Business Model:**Farm Supplies Retail through Physical Shops  
**Version:** 1.0  
**Date:** April 28, 2026

---

## Table of Contents
1. [Business Overview](#business-overview)
2. [Solution Architecture](#solution-architecture)
3. [Lists & Dimensions](#lists--dimensions)
4. [DISCO Module Structure](#disco-module-structure)
5. [Product Catalog & Categories](#product-catalog--categories)
6. [12-Month Forecasting Model](#12-month-forecasting-model)
7. [Key Formulas & Line Items](#key-formulas--line-items)
8. [Data Flow Diagram](#data-flow-diagram)

---

## Business Overview

The company operates physical retail shops across Australia, selling agricultural supplies to farmers and primary producers. The business needs to:

- Track product inventory and sales by location and channel
- Forecast demand for agricultural products (fertilisers, crop protection, animal health, equipment)
- Manage seasonal variations in demand
- Track margin and profitability by product category
- Monitor stock levels and order points

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGRICULTURE RETAIL DATA ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│  │   DATA HUB   │────▶│  WAREHOUSE   │────▶│   SALES      │               │
│  │   (Master    │     │  INVENTORY   │     │  MODULAR     │               │
│  │    Data)     │     │   MODELS     │     │  CAPACITY    │               │
│  └──────────────┘     └──────────────┘     └──────────────┘               │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│  │  Products    │     │  Locations   │     │   Time       │               │
│  │  Categories  │     │  Regions     │     │  Dimensions  │               │
│  │  Customers   │     │  Stores      │     │  Calendars   │               │
│  └──────────────┘     └──────────────┘     └──────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Lists & Dimensions

### Default System Lists
| List | Purpose | Key Items |
|------|---------|-----------|
| **Time** | Period tracking | Months, Quarters, Years (FY26-27) |
| **Versions** | Scenario tracking | Actual, Forecast, Budget, Target |
| **Users** | Access control | Store Managers, Analysts, Directors |
| **Organization** | Reporting hierarchy | Australia, Regions, Stores |

### Custom Business Lists

#### 1. Products
*Product catalog for agricultural supplies*

| Product Code | Product Name | Category | Unit | Base Cost (AUD) | Notes |
|--------------|--------------|----------|------|-----------------|-------|
| AG-001 | Blood Meal 12% | Fertiliser | 20kg bag | $28.50 | Nitrogen rich organic fertilizer |
| AG-002 | Super Phos 20% | Fertiliser | 25kg bag | $32.00 | Phosphorus supplement |
| AG-003 | Potash Plus 50% | Fertiliser | 25kg bag | $35.50 | Potassium source |
| AG-004 | NPK 15-15-15 | Fertiliser | 25kg bag | $34.00 | Balanced compound |
| AG-005 | Lime Agricultural | Soil Amendment | 50kg bag | $22.00 | PH adjustment |
| AG-006 | Lime Quick | Soil Amendment | 50kg bag | $19.50 | Fast-acting |
| AG-007 | Copper Sulfate | Crop Protection | 1kg pack | $45.00 | Fungal control |
| AG-008 | Mancozeb 75% | Crop Protection | 500g pack | $52.00 | Broad spectrum fungicide |
| AG-009 | Glyphosate 490g/L | Weed Control | 5L concentrate | $89.00 | Non-selective herbicide |
| AG-010 | Paraquat 240g/L | Weed Control | 1L bottle | $125.00 | Contact herbicide |
| AG-011 | Diclofop 25% | Weed Control | 500ml bottle | $78.00 | Grass selective |
| AG-012 | Wattle Seedling | Tree Seeds | 100 seeds | $15.00 | Indigenous species |
| AG-013 | EucalyptusSeed | Tree Seeds | 100 seeds | $12.00 | Native timber |
| AG-014 | Fertiliser Spreader | Equipment | 1 unit | $450.00 | 3m width |
| AG-015 | Sprayer Backpack | Equipment | 1 unit | $125.00 | 20L capacity |
| AG-016 | Drip Irrigation Kit | Equipment | 1 kit | $85.00 | 50m hose |
| AG-017 | Fertiliser Blending Unit | Equipment | 1 unit | $2,500.00 | 500kg capacity |
| AG-018 | ANU 20% | Animal Health | 10kg tub | $180.00 | Nutrition supplement |
| AG-019 | Selenium Bolus | Animal Health | 50 pack | $95.00 | Trace element |
| AG-020 | Dectomectin 1% | Animal Health | 500ml | $145.00 | Parasite control |

#### 2. Regions
*Geographic segmentation for reporting*

| Region | Stores | Key Farmers | Avg Order Value |
|--------|--------|-------------|-----------------|
| NSW North | 3 | Grain growers | $450 |
| NSW South | 4 | Mixed farm | $520 |
| Victoria | 6 | Dairy & grains | $610 |
| Queensland | 5 | Sugarcane & cattle | $580 |
| South Australia | 4 | Wine & grains | $490 |
| Western Australia | 3 | Wheat & sheep | $540 |

#### 3. Sales Channels
| Channel | Description | Margin Target | Payment Terms |
|---------|-------------|---------------|---------------|
| In-Store | Physical shop purchases | 35% | Net 30 |
| Account Based | Elders Trading Account | 38% | Net 60 |
| Prepaid | Prepayment discount | 32% | Immediate |

#### 4. Store Locations
| Store Code | Store Name | Region | Address | opening_hours |
|------------|------------|--------|---------|---------------|
| STORE-001 | Armidale | NSW North | Main St | 7am-5pm |
| STORE-002 | Tamworth | NSW North | Darling Ave | 7am-5pm |
| STORE-003 | Grafton | NSW North | Canning St | 7am-6pm |
| STORE-004 | Wagga Wagga | NSW South | Victoria St | 7am-5pm |
| STORE-005 | Albury | NSW South | Borella Rd | 7am-6pm |
| STORE-006 | Wagga Wagga | NSW South | The Valley | 7am-5pm |
| STORE-007 | Wagga Wagga | NSW South | Pine St | 7am-5pm |
| STORE-008 | Horsham | Victoria | Karinga St | 7am-5pm |
| STORE-009 | Horsham | Victoria | Hamilton St | 7am-5pm |
| STORE-010 | Horsham | Victoria | Stawell Rd | 7am-5pm |
| STORE-011 | Horsham | Victoria | Wimmera Hwy | 7am-5pm |
| STORE-012 | Horsham | Victoria | Rainbow Rd | 7am-5pm |
| STORE-013 | Horsham | Victoria | Nariel St | 7am-5pm |

#### 5. Product Categories
| Category Code | Category Name | Key Products | Margin Range |
|---------------|---------------|--------------|--------------|
| CAT-001 | Fertilisers | AG-001 to AG-006 | 25-35% |
| CAT-002 | Crop Protection | AG-007 to AG-011 | 30-40% |
| CAT-003 | Weed Control | AG-008 to AG-011 | 30-40% |
| CAT-004 | Tree Seeds | AG-012 to AG-013 | 20-30% |
| CAT-005 | Equipment | AG-014 to AG-017 | 25-35% |
| CAT-006 | Animal Health | AG-018 to AG-020 | 30-40% |

---

## DISCO Module Structure

### D - Data Modules (DAT)
| Module | Purpose | Source | Dimensions |
|--------|---------|--------|------------|
| **DAT01_Products** | Product master data | Product catalog export | Products |
| **DAT02_Stores** | Store locations | Store database | Stores, Regions |
| **DAT03_ExternalSales** | POS sales data import | store sales feeds | Time, Products, Stores, Versions |
| **DAT04_CustomerOrders** | Account-based orders | Order management system | Time, Products, Customers, Stores |

### I - Input Modules (INP)
| Module | Purpose | Dimensions |
|--------|---------|------------|
| **INP01_SalesForecast** | User-entered forecasts | Time, Products, Stores |
| **INP02_CostChanges** | Cost adjustment entries | Time, Products |
| **INP03_Pricing** | Price update entries | Time, Products, Stores |
| **INP04_Language** | Model configuration | Time |

### S - System Modules (SYS)
| Module | Purpose | Dimensions |
|--------|---------|------------|
| **SYS01_TimeSettings** | Fiscal calendar, periods | Time |
| **SYS02_Currencies** | Exchange rates | Time, Currencies (AUD) |
| **SYS03_CostBasis** | Cost calculation parameters | Products |
| **SYS04_MarginTargets** | Target margins by category | Categories |

### C - Calculation Modules (CALC)
| Module | Purpose | Dimensions |
|--------|---------|------------|
| **CALC01_LandedCost** | Calculate final product cost | Products, Time |
| **CALC02_MarginAnalysis** | Gross margin calculations | Time, Products, Stores, Versions |
| **CALC03_SalesAggregation** | Sales summary by category | Time, Categories, Regions |
| **CALC04_InventoryPosition** | Stock levels & turnover | Products, Stores, Time |
| **CALC05_ForecastAccuracy** | Forecast vs Actual comparison | Time, Products, Stores |

### O - Output Modules (REP)
| Module | Purpose | Dimensions |
|--------|---------|------------|
| **REP01_P&L_ByProduct** | Profit by product | Time, Products, Stores, Versions |
| **REP02_MarginSummary** | Margin dashboard | Time, Categories, Regions |
| **REP03_InventoryStatus** | Stock level report | Products, Stores, Time |
| **REP04_SalesTrends** | 12-month trends | Time, Products, Regions |

---

## Product Catalog & Categories

### Fertilisers (CAT-001)
| Product | Use Case | Best Application Time | Storage Requirement |
|---------|----------|----------------------|---------------------|
| AG-001 Blood Meal 12% | Nitrogen boost | PrePlant, EarlySeason | Dry, ventilated |
| AG-002 Super Phos 20% | Root development | Spring, Autumn | Dry, away from metals |
| AG-003 Potash Plus 50% | Yield improvement | Pre-fruiting | Dry, sealed |
| AG-004 NPK 15-15-15 | Balanced nutrition | All seasons | Cool, dry |
| AG-005 Lime Agricultural | PH adjustment | Autumn, Winter | Dry, outdoors |
| AG-006 Lime Quick | PH adjustment | Spring | Dry, sealed |

### Crop Protection (CAT-002)
| Product | Target Pests | Pre-Harvest Interval | Mixing Ratio |
|---------|--------------|---------------------|--------------|
| AG-007 Copper Sulfate | Fungal diseases | 7 days | 50g/10L |
| AG-008 Mancozeb 75% | Broad spectrum | 3 days | 25g/10L |
| AG-009 Glyphosate 490g/L | Invasive weeds | 7 days | 100ml/10L |
| AG-010 Paraquat 240g/L | Contact weed kill | 1 day | 50ml/10L |
| AG-011 Diclofop 25% | Grass weeds | 14 days | 75ml/10L |

### Equipment (CAT-005)
| Product | Type | Maintenance Required | Warranty |
|---------|------|---------------------|----------|
| AG-014 Fertiliser Spreader | Manual | Annual grease | 12 months |
| AG-015 Sprayer Backpack | Portable | Clean after use | 6 months |
| AG-016 Drip Irrigation Kit | Irrigation | Seasonal check | 24 months |
| AG-017 Fertiliser Blending Unit | Stationary | Monthly service | 36 months |

### Animal Health (CAT-006)
| Product | Species | Dosage | Withdrawal Period |
|---------|---------|--------|-------------------|
| AG-018 ANU 20% | Cattle, Sheep | 50g/head | None |
| AG-019 Selenium Bolus | All livestock | 1 bolus | None |
| AG-020 Dectomectin 1% | Cattle, Sheep, Pigs | 1ml/10kg | 28 days |

---

## 12-Month Forecasting Model

### Forecast Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    12-MONTH SALES FORECAST STRUCTURE                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  FISCAL YEAR: FY26-27                                                      │
│  START DATE: July 1, 2026                                                  │
│  END DATE: June 30, 2027                                                   │
│                                                                            │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐ │
│  │  Jul    │  Aug    │  Sep    │  Oct    │  Nov    │  Dec    │  Jan    │ │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤ │
│  │  251K   │  268K   │  302K   │  295K   │  289K   │  315K   │  342K   │ │
│  │  +1.2%  │  +6.8%  │ +12.7%  │  -2.3%  │  -2.0%  │  +9.2%  │  +8.6%  │ │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘ │
│                                                                            │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐ │
│  │  Feb    │  Mar    │  Apr    │  May    │  Jun    │  YTD    │  Target │ │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤ │
│  │  328K   │  315K   │  302K   │  295K   │  289K   │ 3,962K  │ 4,200K  │ │
│  │  -4.1%  │  -4.1%  │  -4.1%  │  -2.3%  │  -2.0%  │         │  +5.9%  │ │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Forecast by Category (Sample - July)

| Category | Product | Jul Forecast | Aug Forecast | Sep Forecast | Q1 Total | YoY Growth |
|----------|---------|--------------|--------------|--------------|----------|------------|
| Fertiliser | AG-001 | 1,250 units | 1,320 units | 1,485 units | 4,055 | +8.2% |
| Fertiliser | AG-004 | 2,100 units | 2,226 units | 2,495 units | 6,821 | +7.5% |
| Crop Protect | AG-008 | 850 units | 893 units | 982 units | 2,725 | +5.3% |
| Equipment | AG-014 | 45 units | 52 units | 61 units | 158 | +13.3% |
| Animal Health | AG-018 | 620 units | 651 units | 718 units | 1,989 | +6.8% |

### Forecast Variables

| Variable | Typical Range | Notes |
|----------|---------------|-------|
| **Seasonality** | -15% to +40% | Spring/autumn peaks |
| **Weather Impact** | -10% to +20% | Rain/drought effects |
| **Economic Indicator** | -5% to +8% | Farm income levels |
| **Price Adjustments** | -5% to +15% | Promotions, volume discounts |

### 12-Month Forecast Formula

```
Forecast_[CurrentMonth] = 
  PreviousMonthForecast * 
  (1 + SeasonalityAdjustment + WeatherImpact + EconomicTrend) +
  NewCustomerIncrement - CustomerChurn
```

---

## Key Formulas & Line Items

### CALC01_LandedCost Module

| Line Item | Format | Summary | Formula |
|-----------|--------|---------|---------|
| **Base Cost** | Currency | Sum | `DAT01_Products.Cost` |
| **Freight In** | Currency | Sum | `SYS02_Currencies.ExchangeRate * DAT01_Products.FreightRate` |
| **Handling** | Currency | Sum | `DAT01_Products.Volume * 0.50` |
| **Import Duty** | Currency | Sum | `Base Cost * 5%` (if applicable) |
| **Landed Cost** | Currency | Sum | `Base Cost + Freight In + Handling + Import Duty` |

### CALC02_MarginAnalysis Module

| Line Item | Format | Summary | Formula |
|-----------|--------|---------|---------|
| **Sales Revenue** | Currency | Sum | `Sales Volume * Sales Price` |
| **COGS** | Currency | Sum | `Sales Volume * Landed Cost` |
| **Gross Margin** | Currency | Sum | `Sales Revenue - COGS` |
| **Margin %** | Percentage | Average | `Gross Margin / Sales Revenue` |
| **Volume Variance** | Currency | Sum | `(Actual Volume - Forecast Volume) * Standard Margin` |
| **Price Variance** | Currency | Sum | `(Actual Price - Standard Price) * Actual Volume` |

### System Parameters (SYS04_MarginTargets)

| Category | Target Margin | Minimum Acceptable | Maximum Discount |
|----------|---------------|-------------------|------------------|
| Fertilisers | 30% | 25% | 15% |
| Crop Protection | 35% | 30% | 10% |
| Equipment | 30% | 25% | 20% |
| Animal Health | 35% | 30% | 15% |

### Inventory Position (CALC04_InventoryPosition)

| Line Item | Format | Summary | Formula |
|-----------|--------|---------|---------|
| **Stock On Hand** | Number | Sum | `DAT02_Inventory.Quantity` |
| **Stock On Order** | Number | Sum | `DAT03_PurchaseOrders.Quantity` |
| **Sales Last 30 Days** | Number | Sum | `SUM(DAT04_Sales[Time=Last30Days])` |
| **Avg Daily Sales** | Number | Average | `Sales Last 30 Days / 30` |
| **Days of Cover** | Number | Average | `Stock On Hand / Avg Daily Sales` |
| **Reorder Point** | Number | Sum | `Avg Daily Sales * Lead Time * 1.5` |
| **Need Order?** | Boolean | Any | `Stock On Hand < Reorder Point` |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  External Data Sources  →  Data Hub (Master Data)  →  DISCO Modules        │
│         │                          │                          │             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐             ┌─────────────┐            ┌───────────┐      │
│  │  POS Systems │             │  Products   │            │   DAT     │      │
│  │  E-commerce  │             │   Stores    │            │  INP      │      │
│  │  Account     │             │   Time      │            │  SYS      │      │
│  │  ERP         │             │   Regions   │            │  CALC     │      │
│  │  Weather     │             │   Categories│            │  REP      │      │
│  └─────────────┘             └─────────────┘            └───────────┘      │
│         │                          │                          │             │
│         ▼                          ▼                          ▼             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                        Data Hub Model                              │     │
│  │  - Central Product List (flat)                                   │     │
│  │  - Master Store Locations                                          │     │
│  │  - Time Calendar Settings                                          │     │
│  │  - Currency Exchange Rates                                         │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Spoke Models (Business Logic)                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Sales    │  │ Inventory│  │ Finance  │  │ Demand   │  │ Margin   │    │
│  │ Forecast │  │ Tracking │  │ Reporting│  │ Forecast │  │ Analysis │    │
│  │          │  │          │  │          │  │          │  │          │    │
│  │ DAT: Sales│ │ DAT: Stock│ │ SYS: FX  │ │ INP:     │ │ CALC:    │    │
│  │ INP:      │ │ SYS: OH   │ │ REP: P&L │ │ Demand   │ │ Margin   │    │
│  │ CALC:     │ │ CALC:    │ │          │ │          │ │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Data Hub** | 2 weeks | Product, Stores, Time models |
| **Phase 2: Base Models** | 3 weeks | DAT, INP, SYS modules complete |
| **Phase 3: Calculation Engine** | 2 weeks | All CALC modules with formulas |
| **Phase 4: Output Reports** | 1 week | REP modules, dashboards |
| **Phase 5: Testing & Validation** | 1 week | UAT, accuracy checks |
| **Total** | **9 weeks** | Production-ready model |

---

## Related Documents

- `Anaplan_Modelling.md` - General DISCO methodology
- `Anaplan_API_Guide.md` - Integration patterns
- `Anaplan_Functions.md` - Formula reference
