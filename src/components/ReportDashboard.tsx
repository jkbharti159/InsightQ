import React, { useState } from "react";
import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { AnalysisReport, ChartDefinition, DocumentInsight, MetricCard } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Award, CornerDownRight, AlertCircle, Sparkles, Filter, FileText, BarChart3, HelpCircle, Download } from "lucide-react";

interface ReportDashboardProps {
  report: AnalysisReport;
}

// Accent palette for high fidelity chart visuals
const COLORS = ["#10b981", "#06b6d4", "#a1a1aa", "#3b82f6", "#8b5cf6", "#f59e0b", "#6366f1"];

export default function ReportDashboard({ report }: ReportDashboardProps) {
  const [activeChartId, setActiveChartId] = useState<string>(report.charts[0]?.id || "");
  const [insightFilter, setInsightFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"visuals" | "report">("visuals");
  const [chartLayoutMode, setChartLayoutMode] = useState<"spotlight" | "grid">("grid");

  React.useEffect(() => {
    if (report?.charts?.[0]) {
      setActiveChartId(report.charts[0].id);
    }
  }, [report]);

  const currentChart = report.charts.find((c) => c.id === activeChartId) || report.charts[0];

  // Unique categories for insight filter
  const categories = ["All", ...Array.from(new Set(report.insights.map((ins) => ins.category)))];

  const filteredInsights =
    insightFilter === "All"
      ? report.insights
      : report.insights.filter((ins) => ins.category === insightFilter);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    // Let the DOM fully mount the compile template and render all Recharts vectors (1.5 seconds stabilization)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const element = document.getElementById("print-executive-report");
      if (!element) {
        throw new Error("Target print element not found in DOM");
      }

      // Optimize page view for screenshotting by utilizing stable viewport dimensions
      const canvas = await html2canvas(element, {
        scale: 2, // Retinal high fidelity export
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        windowHeight: element.scrollHeight,
      });

      const imgWidth = 210; // A4 standard width in mm
      const pageHeight = 295; // A4 standard height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF("p", "mm", "a4", true);
      let position = 0;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      // Multi-page stitching
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const safeTitle = report.title.replace(/\s+/g, "_");
      pdf.save(`InsightQ_${safeTitle}_Report.pdf`);
    } catch (err) {
      console.error("PDF programmatic render failed, invoking system print fallback:", err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPPT = () => {
    try {
      const pptx = new pptxgen();
      
      // Document Metadata
      pptx.title = report.title;
      pptx.subject = "Business Insights Briefing";
      pptx.author = "InsightQ";
      pptx.company = "InsightQ Strategy";

      // ------------------------------------
      // SLIDE 1: Cover Slide (Sleek Dark Theme)
      // ------------------------------------
      let slide1 = pptx.addSlide();
      slide1.background = { fill: "18181b" }; // zinc-900

      // Accent colored bracket
      slide1.addText("", {
        x: 0.8,
        y: 1.5,
        w: 0.1,
        h: 2.8,
        fill: { color: "10b981" } // emerald-500
      });

      // Title
      slide1.addText(report.title, {
        x: 1.1,
        y: 1.4,
        w: "80%",
        fontFace: "Georgia",
        fontSize: 32,
        bold: true,
        color: "ffffff",
      });

      // Subtitle
      slide1.addText(`${report.documentType || "ANALYSIS REPORT"} | EXECUTIVE STRATEGIC BRIEF`, {
        x: 1.1,
        y: 2.8,
        w: "80%",
        fontFace: "Arial",
        fontSize: 13,
        bold: true,
        color: "a1a1aa", // zinc-400
      });

      // Sub-footer
      slide1.addText(`COMPILED BY INSIGHTQ SYSTEMS • CONFIDENTIAL DISCLOSURE`, {
        x: 1.1,
        y: 3.8,
        w: "40%",
        fontFace: "Arial",
        fontSize: 10,
        color: "71717a", // zinc-500
        charSpacing: 2,
      });

      // Footer brand
      slide1.addText("InsightQ Intelligence Division", {
        x: 0.8,
        y: 6.2,
        w: "80%",
        fontFace: "Arial",
        fontSize: 9,
        color: "52525b",
      });

      // ------------------------------------
      // SLIDE 2: Executive Summary (Editorial Style)
      // ------------------------------------
      let slide2 = pptx.addSlide();
      slide2.background = { fill: "f4f4f5" }; // zinc-100

      // Slide Title
      slide2.addText("I. EXECUTIVE SUMMARY", {
        x: 0.8,
        y: 0.6,
        w: "80%",
        fontFace: "Arial",
        fontSize: 18,
        bold: true,
        color: "18181b",
      });

      // Subtitle indicator
      slide2.addText("Core overview & metadata parameters mapped upon file digestion", {
        x: 0.8,
        y: 1.0,
        w: "80%",
        fontFace: "Arial",
        fontSize: 11,
        color: "71717a",
      });

      // Summary text block (italicized serif quotes)
      slide2.addText(report.summary, {
        x: 0.8,
        y: 1.8,
        w: "80%",
        h: 3.8,
        fontFace: "Georgia",
        fontSize: 15,
        italic: true,
        color: "27272a", // zinc-800
        lineSpacing: 24,
      });

      // ------------------------------------
      // SLIDE 3: Key Operational Indices (Metric Cards)
      // ------------------------------------
      let slide3 = pptx.addSlide();
      slide3.background = { fill: "18181b" }; // Zinc-900

      slide3.addText("II. KEY OPERATIONAL METRICS", {
        x: 0.8,
        y: 0.6,
        w: "80%",
        fontFace: "Arial",
        fontSize: 18,
        bold: true,
        color: "ffffff",
      });

      slide3.addText("Quantifiable indices and trend variance shifts across active nodes", {
        x: 0.8,
        y: 1.0,
        w: "80%",
        fontFace: "Arial",
        fontSize: 11,
        color: "a1a1aa",
      });

      // Map metrics as elegant boxes
      report.metrics.forEach((metric, index) => {
        if (index < 4) {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = 0.8 + col * 4.3;
          const y = 1.8 + row * 2.0;

          // Box block background
          slide3.addText("", {
            x,
            y,
            w: 4.0,
            h: 1.7,
            fill: { color: "27272a" }, // zinc-800
            line: { color: "3f3f46", width: 1 },
          });

          // Metric title
          slide3.addText(metric.label.toUpperCase(), {
            x: x + 0.3,
            y: y + 0.25,
            w: 3.4,
            fontSize: 10,
            fontFace: "Arial",
            bold: true,
            color: "a1a1aa",
          });

          // Metric Value
          slide3.addText(metric.value, {
            x: x + 0.3,
            y: y + 0.55,
            w: 3.4,
            fontSize: 28,
            fontFace: "Georgia",
            bold: true,
            color: "ffffff",
          });

          // Metric Change trend
          if (metric.change) {
            slide3.addText(`Variance: ${metric.change}`, {
              x: x + 0.3,
              y: y + 1.15,
              w: 3.4,
              fontSize: 10,
              fontFace: "Arial",
              bold: true,
              color: metric.isPositive ? "10b981" : "f43f5e",
            });
          }
        }
      });

      // ------------------------------------
      // SLIDE 4: Actionable Business Advisories (Structured List)
      // ------------------------------------
      let slide4 = pptx.addSlide();
      slide4.background = { fill: "f4f4f5" };

      slide4.addText("III. STRATEGIC RECOMMENDATIONS & ADVISORY MAP", {
        x: 0.8,
        y: 0.6,
        w: "80%",
        fontFace: "Arial",
        fontSize: 18,
        bold: true,
        color: "18181b",
      });

      slide4.addText("High-priority action guides parsed to enhance business revenue margins", {
        x: 0.8,
        y: 1.0,
        w: "80%",
        fontFace: "Arial",
        fontSize: 11,
        color: "71717a",
      });

      report.insights.forEach((insight, index) => {
        if (index < 3) {
          const y = 1.6 + index * 1.5;

          // Impact label colored
          slide4.addText(`[${insight.impact.toUpperCase()} IMPACT]`, {
            x: 0.8,
            y,
            w: 1.8,
            fontSize: 10,
            fontFace: "Arial",
            bold: true,
            color: insight.impact === "High" ? "b91c1c" : insight.impact === "Medium" ? "d97706" : "047857",
          });

          // Title
          slide4.addText(insight.title, {
            x: 2.6,
            y,
            w: "65%",
            fontSize: 13,
            fontFace: "Arial",
            bold: true,
            color: "18181b",
          });

          // Description
          slide4.addText(insight.description, {
            x: 2.6,
            y: y + 0.35,
            w: "65%",
            fontSize: 10.5,
            fontFace: "Georgia",
            color: "3f3f46",
          });

          // Line separator
          slide4.addText("", {
            x: 0.8,
            y: y + 1.2,
            w: 8.4,
            h: 0.05,
            fill: { color: "e4e4e7" },
          });
        }
      });

      // ------------------------------------
      // SLIDE 5: Conclusion Presentation
      // ------------------------------------
      let slide5 = pptx.addSlide();
      slide5.background = { fill: "18181b" };

      slide5.addText("INSIGHTQ ADVISORY PLATFORM", {
        x: 1,
        y: 2.2,
        w: "80%",
        fontFace: "Arial",
        fontSize: 11,
        bold: true,
        color: "10b981",
        charSpacing: 3,
      });

      slide5.addText("Analysis Briefing Fully Completed", {
        x: 1,
        y: 2.6,
        w: "80%",
        fontFace: "Georgia",
        fontSize: 36,
        bold: true,
        color: "ffffff",
      });

      slide5.addText(
        "For deep simulations, custom scenario audits, or mathematical models, please utilize our integrated Advisor Chat on your InsightQ operational station.",
        {
          x: 1,
          y: 3.6,
          w: "65%",
          fontFace: "Arial",
          fontSize: 12,
          color: "a1a1aa",
          lineSpacing: 18,
        }
      );

      // Save presentation file
      const safeTitle = report.title.replace(/\s+/g, "_");
      pptx.writeFile({ fileName: `InsightQ_${safeTitle}_Deck.pptx` });
    } catch (err) {
      console.error("PPTX Generation failed:", err);
      alert("Presentation generation encountered an error. Please try generating an Executive PDF instead.");
    }
  };

  // Simple Markdown Parser to render the Gemini report elegantly without styling issues
  const renderMarkdown = (mdString: string, isPrintMode = false) => {
    if (!mdString) return null;
    const lines = mdString.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={idx} className={`text-2xl font-serif italic border-b pb-2 pt-6 mb-4 ${isPrintMode ? "text-zinc-900 border-zinc-350" : "text-zinc-100 border-zinc-800"}`}>
            {trimmed.slice(2)}
          </h1>
        );
      }
      // Heading 2
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className={`text-xl font-serif italic pt-5 mb-3 ${isPrintMode ? "text-zinc-850" : "text-zinc-200"}`}>
            {trimmed.slice(3)}
          </h2>
        );
      }
      // Heading 3 Or bold prefix lines
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className={`text-lg font-serif italic pt-3 mb-2 ${isPrintMode ? "text-zinc-800" : "text-zinc-200"}`}>
            {trimmed.slice(4)}
          </h3>
        );
      }
      // Bullet points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const bulletText = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "$1"); // Simple unbold
        return (
          <li key={idx} className={`ml-5 list-disc text-sm mb-1.5 leading-relaxed ${isPrintMode ? "text-zinc-800 font-sans" : "text-zinc-400 font-serif"}`}>
            {line.includes("**") ? parseInlineBold(trimmed.slice(2), isPrintMode) : bulletText}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        const matches = trimmed.match(/^(\d+)\.\s(.*)/);
        const text = matches ? matches[2] : trimmed;
        return (
          <li key={idx} className={`ml-5 list-decimal text-sm mb-1.5 leading-relaxed ${isPrintMode ? "text-zinc-800 font-sans" : "text-zinc-400 font-serif"}`}>
            {text.includes("**") ? parseInlineBold(text, isPrintMode) : text}
          </li>
        );
      }
      // Empty lines
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Default Paragraph
      return (
        <p key={idx} className={`text-sm leading-relaxed mb-3 ${isPrintMode ? "text-zinc-800 font-serif" : "text-zinc-400 font-serif"}`}>
          {trimmed.includes("**") ? parseInlineBold(trimmed, isPrintMode) : trimmed}
        </p>
      );
    });
  };

  // Helper to highlight markdown bold markers **text** properly
  const parseInlineBold = (text: string, isPrintMode = false) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className={`font-semibold ${isPrintMode ? "text-zinc-950 font-bold" : "text-zinc-100"}`}>{part}</strong> : part));
  };

  const sanitizeChartData = (dataArray: any[], keys: string[]) => {
    if (!dataArray || !Array.isArray(dataArray)) return [];
    return dataArray.map((row) => {
      const newRow = { ...row };
      
      // Build a case-insensitive key mapping for keys present in the current row
      const rowLowerKeys: Record<string, string> = {};
      Object.keys(row).forEach((k) => {
        rowLowerKeys[k.toLowerCase()] = k;
      });

      keys.forEach((key) => {
        let actualKey = key;
        if (newRow[key] === undefined) {
          const lowerKey = key.toLowerCase();
          if (rowLowerKeys[lowerKey]) {
            actualKey = rowLowerKeys[lowerKey];
          }
        }

        let val = newRow[actualKey];
        if (val !== undefined && val !== null) {
          if (typeof val === "string") {
            const cleanVal = val.replace(/[$,\s%]/g, "");
            let multiplier = 1;
            const lower = cleanVal.toLowerCase();
            if (lower.endsWith("m")) {
              multiplier = 1000000;
            } else if (lower.endsWith("k")) {
              multiplier = 1000;
            } else if (lower.endsWith("b")) {
              multiplier = 1000000000;
            }
            const cleanNumberStr = (lower.endsWith("m") || lower.endsWith("k") || lower.endsWith("b"))
              ? cleanVal.slice(0, -1)
              : cleanVal;
            const parsed = parseFloat(cleanNumberStr);
            const finalVal = isNaN(parsed) ? 0 : parsed * multiplier;
            newRow[key] = finalVal;
            newRow[actualKey] = finalVal;
          } else if (typeof val === "number") {
            newRow[key] = val;
            newRow[actualKey] = val;
          } else {
            newRow[key] = 0;
            newRow[actualKey] = 0;
          }
        } else {
          newRow[key] = 0;
        }
      });
      return newRow;
    });
  };

  const renderSelectedChart = (chart: ChartDefinition) => {
    if (!chart || !chart.data || chart.data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
          <HelpCircle className="w-8 h-8 mb-2 stroke-1" />
          <span className="text-xs">No visual data available for this chart.</span>
        </div>
      );
    }

    const { type, xAxisKey, yAxisKeys, data } = chart;
    
    // Normalize xAxisKey casing to match whatever key variation Gemini outputted
    let normalizedData = data;
    let actualXAxisKey = xAxisKey;
    if (data && data.length > 0 && xAxisKey) {
      const firstRow = data[0];
      const lowerXKey = xAxisKey.toLowerCase();
      const matchedKey = Object.keys(firstRow).find(k => k.toLowerCase() === lowerXKey);
      if (matchedKey) {
        actualXAxisKey = matchedKey;
        // Make sure the specified xAxisKey exists on all items pointing to matched value
        normalizedData = data.map((row) => ({
          ...row,
          [xAxisKey]: row[matchedKey],
        }));
      }
    }

    const chartData = sanitizeChartData(normalizedData, yAxisKeys);

    if (type === "pie") {
      // Process pie data
      return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey={yAxisKeys[0]}
              nameKey={actualXAxisKey}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "4px" }}
              itemStyle={{ color: "#f4f4f5" }}
              labelStyle={{ color: "#71717a" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === "line") {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey={actualXAxisKey} stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "4px" }}
              itemStyle={{ color: "#f4f4f5" }}
              labelStyle={{ color: "#71717a" }}
            />
            <Legend />
            {yAxisKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === "area") {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <defs>
              {yAxisKeys.map((key, idx) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey={actualXAxisKey} stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "4px" }}
              itemStyle={{ color: "#f4f4f5" }}
              labelStyle={{ color: "#71717a" }}
            />
            <Legend />
            {yAxisKeys.map((key, idx) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                fill={`url(#grad-${key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: BarChart
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={actualXAxisKey} stroke="#71717a" fontSize={11} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "4px" }}
            itemStyle={{ color: "#f4f4f5" }}
            labelStyle={{ color: "#71717a" }}
          />
          <Legend />
          {yAxisKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={COLORS[idx % COLORS.length]}
              radius={[2, 2, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPrintChart = (chart: ChartDefinition) => {
    if (!chart || !chart.data || chart.data.length === 0) {
      return null;
    }
    const { type, xAxisKey, yAxisKeys, data } = chart;
    const chartData = sanitizeChartData(data, yAxisKeys);
    const printWidth = 640;
    const printHeight = 220;

    const PRINT_COLORS = ["#047857", "#0284c7", "#4f46e5", "#b45309", "#be123c", "#4b5563"];

    if (type === "pie") {
      return (
        <PieChart width={printWidth} height={printHeight}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
            dataKey={yAxisKeys[0]}
            nameKey={xAxisKey}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PRINT_COLORS[index % PRINT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      );
    }

    if (type === "line") {
      return (
        <LineChart width={printWidth} height={printHeight} data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={xAxisKey} stroke="#71717a" fontSize={11} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
          <Tooltip />
          <Legend />
          {yAxisKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={PRINT_COLORS[idx % PRINT_COLORS.length]}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      );
    }

    if (type === "area") {
      return (
        <AreaChart width={printWidth} height={printHeight} data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <defs>
            {yAxisKeys.map((key, idx) => (
              <linearGradient key={key} id={`print-grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRINT_COLORS[idx % PRINT_COLORS.length]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={PRINT_COLORS[idx % PRINT_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={xAxisKey} stroke="#71717a" fontSize={11} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
          <Tooltip />
          <Legend />
          {yAxisKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={PRINT_COLORS[idx % PRINT_COLORS.length]}
              strokeWidth={2}
              fill={`url(#print-grad-${key})`}
            />
          ))}
        </AreaChart>
      );
    }

    return (
      <BarChart width={printWidth} height={printHeight} data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey={xAxisKey} stroke="#71717a" fontSize={11} tickLine={false} />
        <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
        <Tooltip />
        <Legend />
        {yAxisKeys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            fill={PRINT_COLORS[idx % PRINT_COLORS.length]}
            radius={[2, 2, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    );
  };

  return (
    <div id="report-dashboard-container" className="space-y-6">
      {/* Visual Title / Meta */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-sm">
              {report.documentType || "Insight Report"}
            </span>
            <span className="text-zinc-500 text-xs flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              {(report as any).isSimulated ? "OFFLINE SYNTHESIS REEVALUATED" : "AI ANALYSIS COMPLETE"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-zinc-100 italic tracking-tight">{report.title}</h2>
        </div>
 
        {/* Tab switcher + Export button */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center bg-zinc-950 p-1 rounded-sm border border-zinc-800">
            <button
              onClick={() => setViewMode("visuals")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                viewMode === "visuals"
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-850"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              Interactive Visuals
            </button>
            <button
              onClick={() => setViewMode("report")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                viewMode === "report"
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-850"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              Executive Report
            </button>
          </div>

          <button
            onClick={handleDownloadPPT}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-750 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            title="Download interactive presentation deck in Microsoft PowerPoint (.pptx) format"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Download PPTX
          </button>
        </div>
      </div>

      {/* Visual Dashboard Screen */}
      {viewMode === "visuals" ? (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Advisory & Export Actions Panel (Prompting PDF/PPT) */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-sm shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Summary (7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-sm shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif italic text-zinc-200 text-base mb-1">Executive Advisory Summary</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed font-serif">{report.summary}</p>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Durable document model fully processed and indexed.
              </div>
            </div>

            {/* Middle Divider */}
            <div className="hidden lg:block lg:col-span-1 border-r border-zinc-800/60 my-2" />

            {/* Right Column: Generation Invitation & Prompt */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-zinc-950/40 p-4 border border-zinc-800/50 rounded-sm">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">EXPORT DESPATCH</span>
                <h4 className="font-serif text-sm text-zinc-200 italic mb-1.5 font-bold">Generate Presentation PPT?</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Would you like to export your strategic business intelligence report? Select your presentation PPT layout to continue:
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleDownloadPPT}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-zinc-700"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Generate Presentation PPT
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
            {report.metrics.map((metric, idx) => (
              <div
                key={`${metric.label}-${idx}`}
                className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-sm shadow-xl flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] tracking-widest text-zinc-500 font-bold uppercase">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif text-zinc-100">{metric.value}</span>
                  {metric.change && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${
                        metric.isPositive
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                          : "bg-rose-950/40 text-rose-400 border-rose-900/50"
                      }`}
                    >
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Graphical Section */}
          {report.charts.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/10 border border-zinc-800/80 p-4 rounded-sm">
                <div>
                  <h3 className="font-serif italic text-zinc-100 text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400 stroke-[1.5]" />
                    Statistical & Visualization Portfolio
                  </h3>
                  <p className="text-zinc-500 text-xs font-mono mt-0.5">Explore your document data through dynamic comparative visual metrics.</p>
                </div>
                
                {/* Layout Toggler button group */}
                <div className="flex items-center bg-zinc-950 p-1 rounded-sm border border-zinc-800 self-start sm:self-center">
                  <button
                    onClick={() => setChartLayoutMode("grid")}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      chartLayoutMode === "grid"
                        ? "bg-zinc-900 text-emerald-400 border border-zinc-800/60 shadow-md"
                        : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    All Graphs Grid
                  </button>
                  <button
                    onClick={() => setChartLayoutMode("spotlight")}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      chartLayoutMode === "spotlight"
                        ? "bg-zinc-900 text-emerald-400 border border-zinc-800/60 shadow-md"
                        : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    Spotlight Focus
                  </button>
                </div>
              </div>

              {chartLayoutMode === "grid" ? (
                /* Dynamic Bento Chart Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.charts.map((chart) => (
                    <div 
                      key={chart.id}
                      className="p-5 bg-zinc-905 border border-zinc-800/80 rounded-sm flex flex-col justify-between min-h-[380px] shadow-2xl hover:border-zinc-700/60 transition-all bg-zinc-950/20"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-serif italic text-zinc-100 text-sm font-semibold">{chart.title}</h4>
                          <span className="text-zinc-500 text-[10px] font-mono block mt-0.5">Statistical vector distribution</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-sm bg-zinc-950 font-mono text-[9px] uppercase tracking-wider text-emerald-400 border border-zinc-850 shrink-0">
                          {chart.type} Mode
                        </span>
                      </div>
                      <div className="relative w-full h-[280px]">
                        {renderSelectedChart(chart)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Focus Spotlight Selector View */
                <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-sm flex flex-col lg:flex-row gap-6 shadow-xl">
                  {/* Chart Side Controllers */}
                  <div className="lg:w-1/4 flex flex-col gap-2">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-mono">Select Visualization</span>
                    {report.charts.map((chart) => (
                      <button
                        key={chart.id}
                        onClick={() => setActiveChartId(chart.id)}
                        className={`text-left px-4 py-3 rounded-sm border text-xs font-semibold tracking-wide transition-all ${
                          currentChart.id === chart.id
                            ? "bg-zinc-950 border-emerald-500/30 text-emerald-400 shadow-md"
                            : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="font-semibold mb-1 flex items-center justify-between">
                          <span className="font-serif italic">{chart.title}</span>
                          <span className="px-1.5 py-0.5 rounded-sm bg-zinc-950 font-mono text-[8px] uppercase tracking-wider text-zinc-500 border border-zinc-850">
                            {chart.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Chart Render Area */}
                  <div className="flex-1 min-h-[360px] border border-zinc-800/80 p-5 rounded-sm bg-zinc-950/40 flex flex-col justify-between">
                    <div className="mb-4">
                      <h4 className="font-serif italic text-zinc-200 text-sm">{currentChart.title}</h4>
                      <p className="text-zinc-500 text-[11px] font-mono">Dynamic interactive variables mapped across custom scales.</p>
                    </div>
                    <div key={activeChartId} className="relative w-full h-[320px]">
                      {renderSelectedChart(currentChart)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expert Insights Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-serif text-lg text-zinc-200 italic underline underline-offset-8 decoration-zinc-800">Actionable Intelligence Insights</h3>
              </div>

              {/* Insight filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <div className="flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setInsightFilter(cat)}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-sm border transition-all ${
                        insightFilter === cat
                          ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInsights.map((insight, idx) => (
                <div
                  key={`${insight.title}-${idx}`}
                  className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-sm flex items-start gap-4 hover:border-zinc-700 transition-all shadow-xl"
                >
                  <div
                    className={`p-2.5 rounded-sm border ${
                      insight.impact === "High"
                        ? "bg-rose-950/40 text-rose-400 border-rose-900/50"
                        : insight.impact === "Medium"
                        ? "bg-amber-950/30 text-amber-400 border-amber-900/40"
                        : "bg-emerald-950/30 text-emerald-400 border-emerald-950/40"
                    }`}
                  >
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <span className="font-bold text-zinc-200 text-sm">{insight.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider border ${
                          insight.impact === "High"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                            : insight.impact === "Medium"
                            ? "bg-amber-900/20 text-amber-400 border border-amber-900/30"
                            : "bg-emerald-900/20 text-emerald-400 border border-emerald-900/30"
                        }`}
                      >
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">{insight.description}</p>
                    <div className="flex items-center gap-1.5 pt-1.5 text-emerald-400 font-mono text-[10px]">
                      <CornerDownRight className="w-3 h-3 text-emerald-500" />
                      <span>RECOMMENDED: Actionable {insight.category} strategy</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Markdown Report Screen */
        <div className="p-8 bg-zinc-900/40 border border-zinc-800 shadow-xl rounded-sm prose max-w-none animate-fade-in text-zinc-300">
          <div className="border-b border-zinc-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-serif italic text-zinc-100 text-lg">Automated Executive Report</h3>
              <p className="text-zinc-500 text-xs font-mono">Synthesized by the Document Advisory Agent.</p>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([report.markdownReport], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Intelligence_Report_${report.title.replace(/\s+/g, "_")}.md`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-950" />
              Download Report (.md)
            </button>
          </div>
          <div className="space-y-2 select-text font-serif max-w-4xl mx-auto px-2">
            {renderMarkdown(report.markdownReport)}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* HIGH FIDELITY PRINT-ONLY EXECUTIVE PDF TEMPLATE */}
      {/* ========================================== */}
      
      {/* Sleek Progress Compiler Loader Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-zinc-950/95 z-[9999] flex flex-col items-center justify-center backdrop-blur-md animate-fade-in pointer-events-auto select-none">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-5">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 w-16 h-16 border-4 border-emerald-500/10 rounded-full" />
              <span className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <Award className="w-6 h-6 text-emerald-400 absolute" />
            </div>
            <div>
              <h3 className="font-serif italic text-zinc-100 text-lg">Compiling Executive Portfolio</h3>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                InsightQ is executing high-fidelity vector rasterization of your performance charts, frequency distributions, and markdown memos...
              </p>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: "85%" }} />
            </div>
            <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest animate-pulse">
              RASTERIZING GRID LAYERS • EXPORTING PAGES
            </span>
          </div>
        </div>
      )}

      {/* Render printable template */}
      <div 
        className={`select-text bg-white text-zinc-900 p-10 font-serif leading-relaxed print-only-container ${
          isGeneratingPDF 
            ? "absolute" 
            : "hidden print:block max-w-[800px] mx-auto"
        }`} 
        id="print-executive-report"
        style={
          isGeneratingPDF 
            ? { 
                position: "absolute", 
                left: "-9999px", 
                top: "0px", 
                width: "800px", 
                display: "block",
                backgroundColor: "#ffffff",
                color: "#18181b",
                zIndex: -100
              } 
            : {}
        }
      >
        {/* Document Header Band */}
        <div className="border-b-2 border-zinc-900 pb-5 mb-8 flex justify-between items-end">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200 rounded-sm">
              {report.documentType || "ANALYSIS REPORT"}
            </span>
            <h1 className="text-3xl font-bold font-serif text-zinc-900 mt-3 tracking-tight">{report.title}</h1>
            <p className="text-xs text-zinc-500 font-mono mt-1.5">InsightQ Business Audit | Confidential Advisory Log</p>
          </div>
          <div className="text-right text-xs text-zinc-500 font-mono">
            <div>DATE: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="mt-1 text-[10px] text-zinc-400">ENGINE ID: AE-940X</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="mb-10 p-6 bg-zinc-50 border border-zinc-200 rounded-sm break-inside-avoid shadow-inner">
          <h2 className="text-xs font-bold font-mono text-zinc-800 uppercase tracking-[0.15em] border-b border-zinc-200 pb-1.5 mb-3">I. Executive Summary</h2>
          <p className="text-sm text-zinc-700 leading-relaxed font-serif italic">{report.summary}</p>
        </div>

        {/* Section 2: Key Operational Metrics */}
        <div className="mb-10 break-inside-avoid">
          <h2 className="text-xs font-bold font-mono text-zinc-800 uppercase tracking-[0.15em] border-b border-zinc-200 pb-1.5 mb-4">II. Key Operational Indices</h2>
          <div className="grid grid-cols-2 gap-4">
            {report.metrics.map((metric, idx) => (
              <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm">
                <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">{metric.label}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-serif text-zinc-900">{metric.value}</span>
                  {metric.change && (
                    <span className={`text-[11px] font-mono font-bold ${metric.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                      {metric.isPositive ? "▲" : "▼"} {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Visual Charts Analytics (Prints ALL charts!) */}
        <div className="mb-10 page-break-before">
          <h2 className="text-xs font-bold font-mono text-zinc-800 uppercase tracking-[0.15em] border-b border-zinc-200 pb-1.5 mb-4">III. Statistical Charts Portfolio</h2>
          <p className="text-xs text-zinc-500 font-mono mb-6">Complete visual dataset mapping indices across coordinate models.</p>
          <div className="space-y-10">
            {report.charts.map((chart) => (
              <div key={chart.id} className="border border-zinc-200 p-6 rounded-sm bg-white break-inside-avoid">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100">
                  <h3 className="font-serif italic font-bold text-zinc-800 text-sm">{chart.title}</h3>
                  <span className="text-[9px] font-mono uppercase bg-zinc-100 px-2 py-0.5 text-zinc-500 border border-zinc-150 rounded-sm">
                    {chart.type} MAP
                  </span>
                </div>
                <div className="flex justify-center w-full my-2">
                  {renderPrintChart(chart)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Actionable Business Insights */}
        <div className="mb-10 page-break-before break-inside-avoid">
          <h2 className="text-xs font-bold font-mono text-zinc-800 uppercase tracking-[0.15em] border-b border-zinc-200 pb-1.5 mb-4">IV. Actionable Tactical Recommendations</h2>
          <div className="space-y-4">
            {report.insights.map((insight, idx) => (
              <div key={idx} className="p-5 border border-zinc-200 rounded-sm bg-zinc-50 break-inside-avoid">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-zinc-900 text-sm font-serif">{insight.title}</span>
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-sm ${
                    insight.impact === "High"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : insight.impact === "Medium"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}>
                    {insight.impact} IMPACT
                  </span>
                </div>
                <p className="text-zinc-700 text-xs leading-relaxed font-serif">{insight.description}</p>
                <div className="text-[10px] text-emerald-700 font-mono mt-2 flex items-center gap-1.5">
                  <span>▸ REGION: {insight.category} | STRATEGY ACTION TASK</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Synthetic Markdown Text Analysis */}
        <div className="page-break-before break-inside-avoid">
          <h2 className="text-xs font-bold font-mono text-zinc-800 uppercase tracking-[0.15em] border-b border-zinc-200 pb-1.5 mb-4">V. Synthesis Analysis Memorandum</h2>
          <div className="text-zinc-800 text-sm space-y-4 font-serif leading-relaxed antialiased max-w-none">
            {renderMarkdown(report.markdownReport, true)}
          </div>
        </div>

        {/* Stamp Document Footer */}
        <div className="border-t border-zinc-200 pt-5 mt-12 text-center text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
          <div>INSIGHTQ STRATEGIC ADVISORY DIVISION</div>
          <div className="mt-1 text-[8px] text-zinc-350">DATA ENCRYPTION SECURE | NON-REDISTRIBUTABLE COPIES DEEMED CONFIDENTIAL</div>
        </div>
      </div>
    </div>
  );
}
