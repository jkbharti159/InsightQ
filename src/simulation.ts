import { AnalysisReport } from "./types";

export function generateSimulatedReport(
  fileName: string,
  fileType: string,
  userInstruction: string
): AnalysisReport {
  const normName = fileName.toLowerCase();
  const instructionCallout = userInstruction
    ? `\n\n### Custom Guidance Integration\n* We have applied your custom guidance coordinates: **"${userInstruction}"**.\n* Focus levels have been prioritized towards these specific variables across all charts.`
    : "";

  // 1. SALES / FINANCIAL THEME
  if (
    normName.includes("sale") ||
    normName.includes("finance") ||
    normName.includes("revenue") ||
    normName.includes("profit") ||
    normName.includes("budget") ||
    normName.includes("commercial")
  ) {
    return {
      title: "Commercial Revenue & Performance Advisory",
      documentType: "FINANCIAL REPORT",
      summary: `A comprehensive evaluation of commercial metrics extracted from ${fileName}. The dataset shows strong revenue gains with healthy net profit margins of 58.1%, offset by minor operating cost expansion in Q2. Custom business constraints are fully compiled and indexed.${userInstruction ? ` Focused highlights added for "${userInstruction}".` : ""}`,
      metrics: [
        { label: "Gross Revenue", value: "$452,180", change: "12.4%", isPositive: true },
        { label: "Operating Cost", value: "$189,450", change: "4.2%", isPositive: false },
        { label: "Net Margin", value: "58.1%", change: "8.3%", isPositive: true },
        { label: "Acquisition Cost", value: "$45.20", change: "15.5%", isPositive: true },
      ],
      charts: [
        {
          id: "rev_vs_cost",
          title: "Revenue vs. Operating Costs (Monthly)",
          type: "bar",
          xAxisKey: "period",
          yAxisKeys: ["Revenue", "Costs"],
          data: [
            { period: "Jan", Revenue: 62000, Costs: 31000 },
            { period: "Feb", Revenue: 68000, Costs: 29000 },
            { period: "Mar", Revenue: 74000, Costs: 33000 },
            { period: "Apr", Revenue: 79000, Costs: 34000 },
            { period: "May", Revenue: 81000, Costs: 30000 },
            { period: "Jun", Revenue: 88180, Costs: 32450 },
          ],
        },
        {
          id: "margin_trend",
          title: "Net profit Margin Efficiency",
          type: "line",
          xAxisKey: "period",
          yAxisKeys: ["MarginPct"],
          data: [
            { period: "Jan", MarginPct: 50.0 },
            { period: "Feb", MarginPct: 57.3 },
            { period: "Mar", MarginPct: 55.4 },
            { period: "Apr", MarginPct: 56.9 },
            { period: "May", MarginPct: 62.9 },
            { period: "Jun", MarginPct: 63.1 },
          ],
        },
        {
          id: "channel_share",
          title: "Revenue Generation by Channel",
          type: "pie",
          xAxisKey: "channel",
          yAxisKeys: ["Value"],
          data: [
            { channel: "Direct Sales", Value: 215000 },
            { channel: "Partner Channels", Value: 125000 },
            { channel: "Organic Inbound", Value: 72000 },
            { channel: "Paid Marketing", Value: 40180 },
          ],
        },
        {
          id: "sales_freq_dist",
          title: "Audit: Transaction Value Frequency Distribution",
          type: "bar",
          xAxisKey: "range",
          yAxisKeys: ["Frequency"],
          data: [
            { range: "$0-$100", Frequency: 450 },
            { range: "$100-$250", Frequency: 890 },
            { range: "$250-$500", Frequency: 1240 },
            { range: "$500-$1000", Frequency: 680 },
            { range: "$1000-$5000", Frequency: 180 },
            { range: "$5000+", Frequency: 40 },
          ],
        },
      ],
      insights: [
        {
          category: "Growth",
          title: "Partner Channel Velocity",
          description: "Indirect channels showed 22% quarter-on-quarter expansion. Advise strengthening reseller tier-1 support maps to leverage this trend.",
          impact: "High",
        },
        {
          category: "Financial",
          title: "Operating Cost Stabilization",
          description: "Fixed administrative overhead costs remained stable in Q2 despite scaling transaction volumes, widening the operational margin spread.",
          impact: "Medium",
        },
        {
          category: "Risk",
          title: "Direct Conversion Thresholds",
          description: "Direct enterprise leads showed slight saturation. Recommending shifting 5% budget to strategic account-based marketing efforts.",
          impact: "High",
        },
      ],
      markdownReport: `# Strategic Performance Assessment: ${fileName}

## Executive Advisory Memorandum

A thorough audit of commercial tables in **${fileName}** reveals resilient profitability indicators. Cumulative gross revenues reached **$452,180**, demonstrating a robust **12.4%** expansion rate. Cost-of-goods-sold and peripheral operations are scaling in a highly controlled linear trajectory.

### Key Operational Milestones
* **Enterprise Inbound Traction**: Organic demand coordinates grew significantly, lowering blending customer acquisition costs to a healthy **$45.20**.
* **Capital Efficiency**: Profit margins stabilized above 58% in late Q2, validating pricing elasticity structures.
* **Cost Constraints**: Variable sales costs increased by a marginal 4.2%, well inside targets.${instructionCallout}

## Performance Metrics Grid

| Metric Metric | Value | Variation Trend | Business Status |
| :--- | :--- | :---: | :--- |
| **Gross Revenue** | $452,180 | ▲ 12.4% | Outperforming |
| **Operating Cost** | $189,450 | ▼ 4.2% | Target Met |
| **Net Corporate Margin** | 58.1% | ▲ 8.3% | Optimal |
| **CPA Coefficient** | $45.20 | ▼ 15.5% | Exceptional |

## Strategic Recommendations
1. **Accelerate Reseller Ecosystem**: Partner funnels represent low-hanging volume gains.
2. **Optimise Organic Conversions**: Continue optimizing SEO assets to maintain low blended acquisition costs.
3. **Conduct Pricing Elasticity Drill**: Introduce localized sandbox price points to capture residual buyer surpluses.`,
    };
  }

  // 2. MARKETING / ADS / GO-TO-MARKET THEME
  if (
    normName.includes("marketing") ||
    normName.includes("ad") ||
    normName.includes("traffic") ||
    normName.includes("visit") ||
    normName.includes("campaign") ||
    normName.includes("ctr") ||
    normName.includes("social") ||
    normName.includes("user")
  ) {
    return {
      title: "Digital Acquisition & Campaign Intelligence",
      documentType: "CAMPAIGN AUDIT",
      summary: `A high-fidelity performance mapping of active acquisition pipelines found in ${fileName}. Conversions expanded by 18.2% supported by impressions reaching 1.8M. Digital engagement metrics show strong audience resonance with declining unit acquisition costs.`,
      metrics: [
        { label: "Impressions", value: "1.85 Million", change: "24.1%", isPositive: true },
        { label: "Avg CTR", value: "3.45%", change: "0.8%", isPositive: true },
        { label: "Conversions", value: "14,850", change: "18.2%", isPositive: true },
        { label: "Blended CPA", value: "$12.40", change: "8.1%", isPositive: true },
      ],
      charts: [
        {
          id: "daily_convs",
          title: "Conversional Trend Matrix",
          type: "area",
          xAxisKey: "day",
          yAxisKeys: ["Conversions"],
          data: [
            { day: "Mon", Conversions: 1750 },
            { day: "Tue", Conversions: 1980 },
            { day: "Wed", Conversions: 2100 },
            { day: "Thu", Conversions: 1850 },
            { day: "Fri", Conversions: 2200 },
            { day: "Sat", Conversions: 2450 },
            { day: "Sun", Conversions: 2520 },
          ],
        },
        {
          id: "mktg_pie_share",
          title: "Acquisition Traffic Medium Share",
          type: "pie",
          xAxisKey: "medium",
          yAxisKeys: ["Count"],
          data: [
            { medium: "Paid Ads", Count: 6800 },
            { medium: "Organic Search", Count: 4205 },
            { medium: "Social Media", Count: 2350 },
            { medium: "Referral Web", Count: 1540 },
          ],
        },
        {
          id: "cpa_vs_ctr",
          title: "CPA Coefficient vs Click-Through-Rate",
          type: "line",
          xAxisKey: "day",
          yAxisKeys: ["CTR", "CPA"],
          data: [
            { day: "Mon", CTR: 2.8, CPA: 14.50 },
            { day: "Tue", CTR: 3.1, CPA: 13.90 },
            { day: "Wed", CTR: 3.2, CPA: 13.20 },
            { day: "Thu", CTR: 3.0, CPA: 13.80 },
            { day: "Fri", CTR: 3.6, CPA: 12.10 },
            { day: "Sat", CTR: 3.9, CPA: 11.80 },
            { day: "Sun", CTR: 4.1, CPA: 11.20 },
          ],
        },
        {
          id: "user_score_dist",
          title: "Audit: User Lead Score Frequency Distribution",
          type: "bar",
          xAxisKey: "scoreRange",
          yAxisKeys: ["LeadCount"],
          data: [
            { scoreRange: "0-20 (Cold)", LeadCount: 1540 },
            { scoreRange: "21-40 (Cool)", LeadCount: 2310 },
            { scoreRange: "41-60 (Warm)", LeadCount: 4890 },
            { scoreRange: "61-80 (Active)", LeadCount: 3755 },
            { scoreRange: "81-100 (Hot)", LeadCount: 2360 },
          ],
        },
      ],
      insights: [
        {
          category: "Efficiency",
          title: "Weekend CTR Elasticity",
          description: "Ad engagement spiked significantly on Saturdays and Sundays. Consider concentrating 15% more budget on weekend distribution brackets.",
          impact: "High",
        },
        {
          category: "Growth",
          title: "Blended CPA Contraction",
          description: "High organic search referrals drove down overall campaign user acquisition costs, boosting campaign ROI yields by 14%.",
          impact: "Medium",
        },
        {
          category: "Risk",
          title: "Frequency Saturation",
          description: "Ad frequency metric hit 4.2x in re-targeting campaigns, signaling early content fatigue. Counsel updating ad creative assets.",
          impact: "Medium",
        },
      ],
      markdownReport: `# Digital Performance Audit: ${fileName}

## Executive Summary

Audit analysis of active campaigns inside **${fileName}** indicates an extremely positive ROI trend. Impressions climbed above **1.8M** resulting in **14,850 successful acquisition conversions**. Creative optimizations on dynamic display networks lowered unit acquisition costs to a highly competitive **$12.40**.

### Core Observations
* **High Creative Conversion**: CTR reached **3.45%** average, showing excellent copy resonance with target audiences.
* **Volume Scalability**: Conversions peaked on the weekend due to high search intent clusters.
* **Budget Allocations**: Acquisition efficiencies are currently maximized, leaving room to scale spend.${instructionCallout}

## Campaign Metrics Summary

| Core Parameter | Audit Value | Historical Shift | Pipeline Status |
| :--- | :--- | :---: | :--- |
| **Total Impressions** | 1,850,000 | ▲ 24.1% | Active and Scaling |
| **Avg CTR** | 3.45% | ▲ 0.8% | Healthy Range |
| **Total Conversions** | 14,850 | ▲ 18.2% | Accelerated Growth |
| **Unit CPA** | $12.40 | ▼ 8.1% | Operational High |

## Immediate Go-To-Market Tasks
1. **Refresh Display Assets**: Pivot ad creatives to dodge high-frequency audience saturation.
2. **Weekend Flight Front-loading**: Concentrate ad budgets where audience conversion elasticity peaks.
3. **Double-down Organic Search Cohesion**: Optimize landing pages to boost quality score parameters further.`,
    };
  }

  // 3. DEFAULT SYSTEM / CORE PARSING THEME (fallback)
  return {
    title: `Intelligence Mapping & Analysis: ${fileName}`,
    documentType: "DATA AUDIT REPORT",
    summary: `A rigorous structural breakdown and analytical summary of ${fileName}. Our layout parsing engine successfully mapped and cataloged ${fileName}'s core variables, translating structural matrices into actionable operational indices.`,
    metrics: [
      { label: "Data Integrity", value: "99.8%", change: "0.2%", isPositive: true },
      { label: "Record Count", value: "3,480 Rows", change: "Verified", isPositive: true },
      { label: "Process Velocity", value: "94.2%", change: "5.1%", isPositive: true },
      { label: "Advisory Index", value: "9.2/10", change: "Optimal", isPositive: true },
    ],
    charts: [
      {
        id: "structural_dist",
        title: "Database Volume Distribution Matrix",
        type: "bar",
        xAxisKey: "category",
        yAxisKeys: ["Volume", "Velocity"],
        data: [
          { category: "Segment I", Volume: 1420, Velocity: 92 },
          { category: "Segment II", Volume: 1250, Velocity: 84 },
          { category: "Segment III", Volume: 610, Velocity: 76 },
          { category: "Segment IV", Volume: 200, Velocity: 95 },
        ],
      },
      {
        id: "default_pie_comp",
        title: "Database Column Type Composition",
        type: "pie",
        xAxisKey: "colType",
        yAxisKeys: ["Count"],
        data: [
          { colType: "Numerical Metrics", Count: 18 },
          { colType: "Categorical Tags", Count: 14 },
          { colType: "Timestamp Indexes", Count: 6 },
          { colType: "Unstructured Keys", Count: 4 },
        ],
      },
      {
        id: "accuracy_timeline",
        title: "Operational Precision Curve",
        type: "line",
        xAxisKey: "interval",
        yAxisKeys: ["PrecisionPct"],
        data: [
          { interval: "Q1", PrecisionPct: 91.2 },
          { interval: "Q2", PrecisionPct: 93.5 },
          { interval: "Q3", PrecisionPct: 94.8 },
          { interval: "Q4", PrecisionPct: 99.8 },
        ],
      },
      {
        id: "network_ping_dist",
        title: "Audit: Server Latency Ping Frequency Distribution",
        type: "bar",
        xAxisKey: "pingMs",
        yAxisKeys: ["PingCount"],
        data: [
          { pingMs: "0-15ms", PingCount: 420 },
          { pingMs: "16-30ms", PingCount: 1480 },
          { pingMs: "31-45ms", PingCount: 3950 },
          { pingMs: "46-60ms", PingCount: 2210 },
          { pingMs: "61-100ms", PingCount: 840 },
          { pingMs: "101ms+", PingCount: 180 },
        ],
      },
    ],
    insights: [
      {
        category: "Efficiency",
        title: "Operational Precision Gains",
        description: "Process velocity reached a highly optimized 94.2% rate, driven by a 5% acceleration in localized processing pipelines.",
        impact: "Medium",
      },
      {
        category: "Financial",
        title: "Structural Capital Efficiencies",
        description: "Unmasked duplicate records during extraction. Removing duplicates could free up to 3% variable storage or audit costs.",
        impact: "Low",
      },
      {
        category: "Risk",
        title: "Database Anomaly Coverage",
        description: "Detected missing data points inside secondary rows. Suggesting introducing automated validation constraints to reinforce ingestion maps.",
        impact: "High",
      },
    ],
    markdownReport: `# Intelligence Mapping Report: ${fileName}

## Executive Advisory Memorandum

A thorough structural audit has been executed on **${fileName}**. The underlying database contains **3,480 unique records** with a verified integrity coefficient of **99.8%**. All metrics, trends, and secondary factors have been analyzed to compile this strategic advisory.

### Executive Takeaways
* **Pristine Data Cohesion**: Verified dataset integrity remains exceptionally high, minimizing statistical modeling noise.
* **Process Acceleration**: Modern document formatting metrics rose by **5.1%** inside late intervals.
* **Structural Anomalies**: Detected and cleansed residual null fields during preliminary grid mapping, ensuring chart outputs remain perfectly linear.${instructionCallout}

## Database Quality Indicators

| Audit Attribute | Value | Integrity Trend | Operational Status |
| :--- | :--- | :---: | :--- |
| **Data Integrity Coefficient** | 99.8% | ▲ 0.2% | Verified Sovereign |
| **Total Row Density** | 3,480 Records | Confirmed | Complete Ingest |
| **Synthesizing Velocity** | 94.2% | ▲ 5.1% | Highly Fluid |
| **Advisory Index Spread** | 9.2 / 10 | Target Outperform | Exceptional |

## Tactical Tasks & Optimization Map
1. **Enforce Storage Validation**: Introduce validation hooks to filter structural anomalies going forward.
2. **Compress Archival Buffers**: Target redundant segments to reclaim residual physical storage overhead.
3. **Trigger Pipeline Automation**: Incorporate recurring chron-jobs to automate weekly spreadsheet digests dynamically.`,
  };
}

export function generateSimulatedChatResponse(
  userQuery: string,
  context: AnalysisReport
): string {
  const query = userQuery.toLowerCase();

  if (query.includes("pdf") || query.includes("ppt") || query.includes("powerpoint") || query.includes("slide") || query.includes("export") || query.includes("download") || query.includes("generate")) {
    return `You can export all of these findings directly from the top panel of your QueryX workspace, or inside the Export Despatch card.

1. Executive PDF Report:
   Click Download PDF or Generate Executive PDF. This uses our viewport compiler to render high-fidelity snapshots of all interactive charts, frequency distributions, and line regressions, paired with clean text reports. It provides a standard structured report ideal for stakeholders and print reviews.

2. Corporate Slide Deck:
   Click Generate Presentation PPT. It compiles a dark-themed 5-slide briefing deck containing your cover, summary metrics, advisories list, and strategic conclusion charts.

Which format works best for your team today? I can help summarize or drill down on any slide before you download.`;
  }

  if (query.includes("simulate") || query.includes("pricing") || query.includes("calculation") || query.includes("scenario") || query.includes("math") || query.includes("what if") || query.includes("what-if")) {
    const marginNum = context.metrics[2]?.value || "58.1%";
    return `Based on our current data inside "${context.title}", here is how the numbers shake out under our premium scenario configurations:

Scenario A: Market Expansion (+15% Allocation)
- Underlying Logic: Double-down on our highest-converting acquisition channels and partner lists.
- Topline Impact: We project an increase of $68,000, pushing your gross revenue numbers towards $520,000.
- Customer Acquisition Cost will likely rise to $48.50 due to bidding density, but the customer lifetime volume makes this highly profitable.

Scenario B: Operational Streamlining (8% OpEx Reduction)
- Underlying Logic: Audit and offload redundant software subscriptions and renegotiate partner contracts.
- Savings Impact: Trims approximately $15,150 in overhead costs monthly.
- Bottomline Impact: Pushes your net profit margins from the current baseline of ${marginNum} up to 62.9%.

Our strategic recommendation is a hybrid pivot. If you use the $15,150 saved from Scenario B directly to fund the Scenario A partner referral campaign, you will trigger the expansion of Scenario A with zero net increase in your operating budget.

Does this math align with your targets, or would you like to adjust the assumptions?`;
  }

  if (query.includes("chart") || query.includes("graph") || query.includes("visual") || query.includes("data") || query.includes("trend") || query.includes("pie") || query.includes("bar") || query.includes("distribution")) {
    return `Based on the visual coordinates in "${context.title}":

- Interactive Trends: The primary charts suggest strong chronological momentum. In the ${context.charts[0]?.title || "primary metrics chart"}, month-over-month performance curves are tightening in a highly positive trajectory.
- Frequency Distributions: In the frequency distribution bar graphs, the data forms a balanced grouping, showing that a large portion of your records sit in high-yield brackets.
- Resource Shares: The pie chart maps your compositions, verifying a balanced, diversified matrix.

You can select and toggle different charts directly in the visuals view. Let me know if you would like me to analyze any of these specific trends in deeper detail.`;
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("who are you") || query.includes("help")) {
    return `Hello! I'm QueryX, your dedicated advisory assistant.

I'm here to act as your co-pilot for "${context.title}". Whether you want to simulate what-if scenarios, audit current database metrics, understand distribution trends, or compile executive PDF or PPT files, I'm here to help.

What can we look into first? We can discuss key margin indicators, review frequency distributions, or simulate a growth campaign.`;
  }

  return `Here are the key takeaways from the latest report updates for "${context.title}":

- The Core Theme: ${context.summary}
- Active Performance Metrics: Your primary index has a current value of ${context.metrics[0]?.value || "stable coordinates"} which shows an active growth rate of ${context.metrics[0]?.change || "N/A"}.
- Key Advisory Priority: Among our findings, the "${context.insights[0]?.title || "Tactical Action Item"}" carries an immediate ${context.insights[0]?.impact || "High"} impact advisory. Securing this first will yield the highest returns.

Would you like to run a mathematical simulation on these inputs, review our frequency distribution charts, or should we compile this into a PDF report?`;
}
