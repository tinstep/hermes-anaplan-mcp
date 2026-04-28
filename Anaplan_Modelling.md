# Anaplan Modelling & Best Practices Guide

**Last Updated:** April 28, 2026  
**Version:** Anaplan API v2 / Polaris Modeling Experience

---

## Table of Contents
1. [Overview](#overview)
2. [Model Structure & Architecture](#model-structure--architecture)
3. [Best Practices for Model Building](#best-practices-for-model-building)
4. [Module Design](#module-design)
5. [Lists & Dimensions](#lists--dimensions)
6. [Line Items & Formulas](#line-items--formulas)
7. [Data Flow & Integrity](#data-flow--integrity)
8. [Performance Optimization](#performance-optimization)
9. [Common Pitfalls & How to Avoid Them](#common-pitfalls--how-to-avoid-them)
10. [Reference: API Integration Patterns](#reference-api-integration-patterns)

---

## Overview

Anaplan is a cloud-based planning and performance management platform that enables organizations to build sophisticated financial and operational models. The platform uses a **cube-based architecture** where data is organized across:

- **Dimensions** (Lists): The axes of your model (Time, Versions, Organization, Products, etc.)
- **Modules**: The containers where data is entered and calculated
- **Line Items**: The individual cells within modules that store data or formulas

### Core Principles

1. **Separate Input, Calculation, and Output**: Keep data input separate from calculations
2. **Use Dimensions Consistently**: All modules should share the same dimensions where possible
3. **Minimize Cross-Module Refs**: Reduce dependencies between modules for performance
4. **Plan Your Model Structure**: Design the model hierarchy before building
5. **Version Control**: Use Anaplan versions (Actual, Forecast, Draft) for scenario planning

---

## Model Structure & Architecture

### DISCO: Deconstructing the Cube

DISCO (Deconstructing the Cube) is Anaplan's foundational modeling methodology for organizing modules within a model. It provides a structured, performant, and maintainable approach to building Anaplan models by categorizing them into five distinct tiers based on their purpose.

```
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT MODULES (O)                       │
│  - REP01 P&L Summary, REP02 Cash Flow, REP03 Balance Sheet  │
│  - Present information for end users, dashboards, reports   │
│  - Formatted views, summaries for consumption               │
└─────────────────────────────────────────────────────────────┘
                             ▲
                             │
┌─────────────────────────────────────────────────────────────┐
│              CALCULATION MODULES (C)                        │
│  - CALC01 Revenue Forecast, CALC02 Margin Analysis          │
│  - Contain business logic, formulas, transformations        │
│  - Bridge inputs and data to produce outputs                │
└─────────────────────────────────────────────────────────────┘
                             ▲
                             │
┌─────────────────────────────────────────────────────────────┐
│              INPUT MODULES (I)                              │
│  - INP01 Growth Rates, INP01 Volume Assumptions             │
│  - User-entered assumptions, forecasts, targets             │
│  - Drivers that feed into calculations                      │
└─────────────────────────────────────────────────────────────┘
                             ▲
                             │
┌─────────────────────────────────────────────────────────────┐
│              SYSTEM MODULES (S)                             │
│  - SYS01 Time Settings, SYS02 Exchange Rates, SYS03 Tax     │
│  - Store settings, configuration, reference data            │
│  - Provide helper data that other modules depend on         │
└─────────────────────────────────────────────────────────────┘
                             ▲
                             │
┌─────────────────────────────────────────────────────────────┐
│                DATA MODULES (D)                             │
│  - DAT01 Sales Data, DAT02 HR Records, DAT03 Inventory      │
│  - Hold imported raw data from external sources             │
│  - Serve as foundation for calculations in other modules    │
└─────────────────────────────────────────────────────────────┘
```

### D.I.S.C.O. Module Naming Convention

Modules should follow the naming pattern: **`[CategoryCode][Number][ModuleName]`**

| Prefix | Category | Example | Purpose |
|--------|----------|---------|---------|
| **DAT** | Data | DAT01 Sales Data | Imported raw data from external sources |
| **INP** | Input | INP01 Growth Rates | User-entered assumptions, forecasts, targets |
| **SYS** | System | SYS01 Time Settings | Settings, configuration, reference data |
| **CALC** | Calculation | CALC01 Revenue Forecast | Business logic, formulas, transformations |
| **REP** | Output/Reporting | REP01 P&L Summary | Final results, dashboards, reports |

**Naming Rules:**
- Use numeric suffixes for ordering within categories (DAT01, DAT02, INP01, etc.)
- Be descriptive with module names that clearly communicate their purpose
- Keep modules focused: one module should handle one business function
- Use underscores or camelCase for multi-word names: `INP01_Growth_Rates` or `INP01GrowthRates`

### DISCO Module Characteristics

#### D - Data Modules
- **Purpose**: Store raw data imported from external systems
- **Characteristics**:
  - Minimal or no formulas
  - Direct data imports via Anaplan imports or API
  - Often contain transactional or master data
  - Flat structure with minimal hierarchies
- **Best Practices**:
  - Import data once, build all other modules from it
  - Keep data modules simple and focused
  - Consider a separate "Data Hub" model for centralized master data

#### I - Input Modules
- **Purpose**: Where business users enter assumptions and forecasts
- **Characteristics**:
  - User-friendly interfaces for data entry
  - May include validation rules and tooltips
  - Use drivers that feed calculations in other modules
- **Best Practices**:
  - Group related inputs in separate modules
  - Provide clear labels and instructions for users
  - Use versions to capture "What-If" scenarios

#### S - System Modules
- **Purpose**: Store settings, configuration, and reference data
- **Characteristics**:
  - Time settings, exchange rates, tax rates, thresholds
  - Helper dimensions and mappings
  - Reference data used across multiple modules
- **Best Practices**:
  - Centralize time settings and parameters in SYS modules
  - Keep system modules separate from business logic
  - Version system settings to track configuration changes

#### C - Calculation Modules
- **Purpose**: Implement business logic and calculations
- **Characteristics**:
  - Complex formulas and aggregations
  - Bridge inputs and data to produce outputs
  - Often the most complex module tier
- **Best Practices**:
  - Break complex formulas into separate line items for auditability
  - Avoid over-engineering — keep calculations simple where possible
  - Maintain consistent dimensionality with other modules

#### O - Output/Reporting Modules
- **Purpose**: Present information for end users and dashboards
- **Characteristics**:
  - Formatted views and summaries
  - User-facing reports and dashboards
  - Sometimes replicate calculation results for specific views
- **Best Practices**:
  - Keep output modules focused on presentation, not calculation
  - Use pages and row/column selections to drive user navigation
  - Ensure performance by optimizing referenced modules

---

### Core DISCO Principles

1. **Separation of Concerns**: Each module type has a clearly defined responsibility
2. **Data Single Source**: Raw data lives in one place; all other modules reference it
3. **Consistent Dimensions**: Modules should share dimensions where possible for performance
4. **Auditability**: Each calculation step should be traceable through the module chain
5. **Maintainability**: Changes to business logic happen in one place, propagate throughout the model

---

### PLANS Methodology: The Extended Best Practices Framework

Anaplan's broader best practices methodology, of which DISCO is a core component, can be remembered by the acronym **PLANS**:

- **P**erformant: Optimize for speed. Avoid SUM+LOOKUP combinations, minimize text-formatted line items
- **L**ogical: Follow D.I.S.C.O. module structure (Data, Inputs, System, Calculations, Output)
- **A**uditable: Break complex formulas into separate line items; each should have a clear, single purpose
- **N**ecessary: Don't duplicate data. Store once, reference many times
- **S**ustainable: Build for change. Think about process cycles and future updates

---

### Module Architecture Workflow

1. **Start with DISCO planning** before building any modules
2. **Define module responsibilities**: Which modules will handle Data, Inputs, System, Calculations, and Output?
3. **Ensure clean separation**: Avoid mixing responsibilities between modules
4. **Establish consistent dimensions** across the model
5. **Build modules in this order**: System → Data → Input → Calculation → Output
6. **Test performance** after each layer is complete
7. **Document the architecture** for team onboarding and future maintenance

---

### Data Hub and Spoke Pattern

For large deployments, Anaplan recommends the **Data Hub and Spoke** architecture:

- **Data Hub Model**: Central model storing master data (flat lists, transactional data)
- **Spoke Models**: Business logic models that import data from the hub via saved views

**Benefits:**
- Single source of truth for master data
- Easier maintenance (changes in one place)
- Consistency across related models
- Better performance for large datasets

---

### DISCO vs. Traditional 3-Tier Comparison

| Aspect | Traditional 3-Tier | DISCO (5-Tier) |
|--------|-------------------|----------------|
| **Structure** | Input → Calculation → Output | Data, Input, System, Calculation, Output |
| **System Settings** | Mixed with Inputs or Calculations | Centralized in dedicated SYS modules |
| **Raw Data Storage** | Often mixed with inputs | Dedicated DAT modules |
| **Scalability** | Good for small models | Better for large, complex deployments |
| **Auditability** | Variable | High (clear module boundaries) |
| **Best For** | Simple models, small teams | Enterprise models, multiple teams |

---

### Implementation Checklist

- [ ] Plan your DISCO module structure before starting
- [ ] Create System modules first (time settings, parameters)
- [ ] Build Data Hub if using spoke architecture
- [ ] Implement Input modules with clean user interfaces
- [ ] Connect calculations in Calculation modules
- [ ] Build Output modules for user consumption
- [ ] Verify consistent dimensionality across modules
- [ ] Document module responsibilities and relationships
- [ ] Test performance at each stage
- [ ] Review with team for feedback

---

## Best Practices for Model Building

### 1. Planning Phase (Before Building)

**Do:**
- Define the business requirements clearly
- Identify all dimensions needed (Time, Organization, Products, etc.)
- Map out module dependencies
- Establish naming conventions
- Document model assumptions

**Don't:**
- Start building without a plan
- Mix input and calculation in same module
- Create redundant dimensions

### 2. Dimension Design Rules

**General Lists:**
- Use for master data (Products, Customers, Locations)
- Create subsets for module-specific needs
- Use codes for stable references (not names)

**Time Dimension:**
- Match fiscal year to business requirements
- Choose appropriate granularity (Year/Quarter/Month/Week)
- Configure Time Settings in Model Settings

**Versions:**
- Create distinct versions: Actual, Draft, Forecast, Goal
- Use version switchover dates for rolling forecasts
- Limit concurrent active versions

### 3. Module Creation Guidelines

**Before Creating a Module:**
- [ ] What is this module's purpose?
- [ ] What dimensions does it need?
- [ ] Will it be Input, Driver, or Output?
- [ ] Does it need its own dimensions or use shared ones?

**Module Setup Checklist:**
- [ ] Define module name with purpose (e.g., `Input_Revenue`, `Calc_COGS`)
- [ ] Select appropriate dimensions in "Applies To"
- [ ] Create line items with clear names (e.g., `Revenue: Local Currency`, `COGS %`)
- [ ] Set data formats correctly (Number, Text, Date, Boolean)
- [ ] Add line item subsets if selective access needed

---

## Module Design

### Module Structure

Each module should have:
1. **Title**: Clear name indicating purpose
2. **Dimensions**: Rows, Columns, Pages (Time, Versions, Lists)
3. **Line Items**: Data entries or calculations
4. **Views**: Saved layouts for different perspectives

### Example Module: Input_Module_Sales

**Dimensions:**
- **Rows**: Products, Sales Reps
- **Columns**: Time (Months)
- **Pages**: Version (Actual, Forecast), Region

**Line Items:**
- `Revenue: Local Currency` (Data Format: Currency)
- `Revenue: USD` (Data Format: Currency, Formula: `Revenue: Local Currency * Exchange Rate`)
- `Units Sold` (Data Format: Number)
- `Price per Unit` (Data Format: Currency)

**Best Practice:** Keep formulas simple and readable. Use `DIVIDE()` instead of `/` for safer division.

---

## Lists & Dimensions

### List Types

| Type | Description | Use Case |
|------|-------------|----------|
| **General Lists** | User-created lists | Products, Customers, Projects |
| **Time** | Pre-configured | All time-based data |
| **Versions** | Pre-configured | Planning scenarios |
| **Organization** | Pre-configured | Hierarchical structure |
| **Users** | Pre-configured | Access control, user-specific data |

### List Subsets

**Purpose:** Create filtered versions of lists for specific modules.

**Benefits:**
- Better performance (less data to process)
- Selective access control
- Cleaner module interfaces

**Example:**
```
List: Products (100 items)
Subset: Products_Selling (20 items - items this module deals with)
```

### List Hierarchy

**Use parent-child relationships for:**
- Organization structures (Total Company > Region > Country > Office)
- Product categories (Total Products > Category > Subcategory > SKU)

**Benefits:**
- Automatic rollups (SUM, AVERAGE, etc.)
- Single source of truth
- Easier maintenance

---

## Line Items & Formulas

### Line Item Configuration

| Property | Description |
|----------|-------------|
| **Name** | Clear, descriptive name with context |
| **Data Format** | Number, Currency, Date, Boolean, Text |
| **Applies To** | Which dimensions this line item covers |
| **Format** | Currency code, date format, precision |
| **Summary** | SUM, AVERAGE, MIN, MAX, FIRSTNONBLANK, LASTNONBLANK |
| **Formatting** | Show 0, Hide 0, Show Blank, Currency |

### Formula Best Practices

**Do:**
- Use `DIVIDE()` for safe division
- Use `IF THEN ELSE` for conditional logic
- Reference line items by name (not hard-coded)
- Test formulas before deploying
- Use comments in complex formulas

**Don't:**
- Use hardcoded numbers (use drivers instead)
- Create circular references
- Mix text and numbers in same line item
- Overuse nested IF statements

### Formula Examples

```anaplan
# Simple calculation
Revenue USD = Revenue Local * Exchange Rate

# Conditional logic
Discount Applied = IF Order Value > 1000 THEN Order Value * 0.05 ELSE 0

# Safe division
Margin % = DIVIDE(Gross Profit, Revenue)

# Aggregation with mapping
Total Revenue = Revenue by Product [SUM: Products]

# Time-based calculations
MTD Revenue = TIMESUM(Revenue, CURRENTPERIODSTART(), CURRENTPERIODEND())
```

### Common Functions

| Category | Function | Purpose |
|----------|----------|---------|
| **Numeric** | `ABS`, `ROUND`, `MAX`, `MIN`, `LOG`, `EXP` | Mathematical operations |
| **Time** | `DATE`, `MONTH`, `YEAR`, `DAY`, `CURRENTPERIODSTART()` | Date/time operations |
| **Aggregation** | `SUM`, `AVERAGE`, `ALL`, `ANY`, `FIRSTNONBLANK` | Reduce data to single value |
| **Lookup** | `LOOKUP`, `FINDITEM`, `PARENT`, `CODE` | Navigate model structure |
| **Financial** | `NPV`, `IRR`, `FV`, `PMT`, `PRICE`, `YIELD` | Financial calculations |
| **Text** | `FIND`, `LEFT`, `RIGHT`, `MID`, `TRIM` | Text manipulation |

---

## Data Flow & Integrity

### Master Data Flow

```
External System → Import → Model → Calculation → Export → Reporting Tool
```

### Data Integrity Checklist

**Before Import:**
- [ ] Verify source data format
- [ ] Map source columns to Anaplan line items
- [ ] Check for duplicate or missing keys
- [ ] Validate data types (Number, Date, Text)

**After Import:**
- [ ] Verify record count matches source
- [ ] Check for import errors in error dump
- [ ] Validate calculations against source
- [ ] Run test reports to confirm data integrity

### Version Management

**Version States:**
- **Actual**: Historical, locked data
- **Draft**: Work in progress, editable
- **Forecast**: Projected, can be revised
- **Goal**: Target values, often used in planning

**Version Switchover:**
- Set date when Forecast becomes Current
- Lock old versions for historical consistency

---

## Performance Optimization

### Key Performance Indicators (KPIs)

- **Model Load Time**: < 30 seconds for typical model
- **Page Load Time**: < 5 seconds per UX page
- **Calculation Speed**: Immediate on cell edit

### Best Practices for Performance

**1. Reduce Model Complexity**
- Limit cross-module references
- Use summary modules where possible
- Avoid deep list hierarchies

**2. Optimize Lists**
- Keep list sizes reasonable (< 100K items)
- Use list subsets instead of full lists
- Remove unused list items

**3. Efficient Formulas**
- Avoid `MOVINGSUM` over many periods
- Use `TIMESUM` with start/end parameters
- Minimize `LOOKUP` operations

**4. Data Size Management**
- Use compressed imports for large files
- Delete old data versions periodically
- Archive closed models

### Memory Optimization

| Strategy | Impact |
|----------|--------|
| List subsets | High |
| Summary modules | High |
| Optimized formulas | Medium |
| Data cleanup | Medium |

---

## Common Pitfalls & How to Avoid Them

| Pitfall | Symptoms | Solution |
|---------|----------|----------|
| **Circular References** | Module won't calculate, errors | Break the dependency chain |
| **Missing List Items** | #NOTFOUND in cells | Add missing items or use `FINDITEM` with fallback |
| **Wrong Time Periods** | Data appears in wrong period | Verify Time Settings match data |
| **Version Mismatch** | wrong version selected | Set version page selector correctly |
| **Format Inconsistency** | Values display incorrectly | Set format at module level |
| **Over-Nesting** | Slow model, hard to debug | Simplify formulas |

### Debugging Tips

1. **Use Blueprint View**: Visualize module structure and dependencies
2. **Check Cell Values**: Right-click → Show Cell Values to see intermediate results
3. **Test with Smaller Data**: Replicate issue with subset of data
4. **Review Line Item History**: Track when changes were made
5. **Use Audit Trail**: Monitor who made what changes and when

---

## Reference: API Integration Patterns

### Typical Integration Flow

```
1. Authentication → Get Token
2. Discover Workspace → List Workspaces
3. Discover Model → List Models in Workspace
4. Discover Structure → Get Modules, Line Items, Lists
5. Perform Action → Import/Export/Process
6. Monitor → Poll Task Status
7. Retrieve Results → Download Export or Check Errors
```

### API Endpoints Reference

| Action | HTTP Method | Endpoint |
|--------|-------------|----------|
| Auth | POST | `/auth/token` |
| Workspaces | GET | `/workspaces` |
| Models | GET | `/workspaces/{id}/models` |
| Modules | GET | `/workspaces/{id}/models/{id}/modules` |
| Line Items | GET | `/workspaces/{id}/models/{id}/lineitems` |
| Lists | GET | `/workspaces/{id}/models/{id}/lists` |
| Cells Read | GET | `/workspaces/{id}/models/{id}/modules/{id}/cells` |
| Cells Write | POST | `/workspaces/{id}/models/{id}/modules/{id}/cells` |
| Bulk Import | POST | `/workspaces/{id}/models/{id}/imports/{id}` |
| Bulk Export | POST | `/workspaces/{id}/models/{id}/exports/{id}` |

### Bulk Import Format

```csv
# Example for importing Sales Data
Product,Time,Version,Revenue,Units
Product A,Jan-2024,Actual,10000,100
Product B,Jan-2024,Actual,15000,150
Product A,Jan-2024,Actual,12000,120
```

### Python API Wrapper (Example)

```python
import requests

class AnaplanAPI:
    def __init__(self, auth_url, base_url, username, password):
        self.auth_url = auth_url
        self.base_url = base_url
        self.token = self._get_token(username, password)
    
    def _get_token(self, username, password):
        response = requests.post(
            f"{self.auth_url}/auth/token",
            auth=(username, password)
        )
        return response.json()['token']
    
    def get_workspaces(self):
        headers = {"Authorization": f"AnaplanAuthToken {self.token}"}
        response = requests.get(f"{self.base_url}/workspaces", headers=headers)
        return response.json()
    
    def read_cells(self, workspace_id, model_id, module_id, view_id):
        headers = {"Authorization": f"AnaplanAuthToken {self.token}"}
        url = f"{self.base_url}/workspaces/{workspace_id}/models/{model_id}/modules/{module_id}/cells"
        response = requests.get(url, headers=headers, params={"viewId": view_id})
        return response.json()
```

---

## Appendices

### Appendix A: Naming Conventions

| Object Type | Prefix | Example |
|-------------|--------|---------|
| Input Module | `Input_` | `Input_Revenue` |
| Calculation Module | `Calc_` | `Calc_Margins` |
| Output Module | `Output_` | `Output_PNL` |
| Driver Module | `Driver_` | `Driver_ExchangeRates` |
| Input List | `List_` | `List_Countries` |
| Driver List | `List_` | `List_Channels` |
| Line Item | Context + Name | `Revenue: USD`, `COGS %` |
| Line Item Subset | `Subset_` | `Subset_Products_Selling` |

### Appendix B: Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `#NOTFOUND` | List item doesn't exist | Add item or use fallback logic |
| `#CIRCULAR` | Circular reference detected | Break the dependency chain |
| `#LOCKED` | Model or version is locked | Unlock or select different version |
| `#FORMAT` | Data format mismatch | Check line item format settings |
| `#AGGREGATION` | Aggregation function error | Check dimension mapping |

### Appendix C: Quick Reference Card

**Model Building Checklist:**
1. Define business requirements
2. Plan dimensions needed
3. Create Input modules first
4. Create Driver modules for calculations
5. Create Output modules for reporting
6. Test with small data
7. Optimize for performance
8. Document everything

**API Integration Checklist:**
1. Get auth token
2. List workspaces → find target workspace
3. List models → find target model
4. Discover structure → get IDs
5. Prepare data file
6. Upload file → trigger import
7. Monitor task → download results

---

*This guide was compiled from Anaplan API v2 documentation, Help Center resources, and community best practices.*

**Related Documents:**
- `Anaplan_API_Guide.md` - API integration reference
- `Anaplan_Functions.md` - Formula reference (to be created)
