import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Increase request size limits to handle base64 documents (PDFs/Images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure your API key in the secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Endpoint to analyze document data (Excel, CSV, PDF, Image)
app.post("/api/analyze", async (req, res) => {
  try {
    const { fileType, fileName, fileData, userPrompt } = req.body;

    if (!fileType || !fileName) {
      return res.status(400).json({ error: "Missing required fields: fileType, fileName" });
    }

    const ai = getAiClient();

    let contents: any[] = [];
    const systemInstruction = 
      "You are QueryX, an elite Data Science & Business Intelligence AI Agent. " +
      "Your core objective is to parse the uploaded document or dataset, extract meaningful structure, " +
      "generate precise interactive charts and KPIs with raw numeric data, and draft a professional markdown executive report. " +
      "Under no circumstances should you ever use asterisks (*) or double asterisks (**) inside your responses. " +
      "Never say 'here's a human-friendly interpretation' or other conversational filler. Just present data plain, crisp, and simple. " +
      "Return your response strictly in the requested JSON structure. Keep chart coordinates uniform and exact.";

    if (fileType === "pdf" || fileType === "image") {
      if (!fileData) {
        return res.status(400).json({ error: "Missing document file data (base64)" });
      }
      const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg";
      
      contents = [
        {
          inlineData: {
            mimeType,
            data: fileData,
          },
        },
        {
          text: `Please analyze this uploaded document "${fileName}". Extract the core tables, stats, main figures, and key trends. ${userPrompt || ""}`,
        },
      ];
    } else {
      // Excel, CSV, or pure structured data
      contents = [
        {
          text: `Here is the structured spreadsheet data from "${fileName}" (parsed via tabular extractor):\n\n${fileData}\n\nAnalyze this dataset thoroughly. Generate visual charts comparing key parameters, extract main metrics, and write an extensive report. ${userPrompt || ""}`,
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            documentType: { type: Type.STRING },
            summary: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN },
                },
                required: ["label", "value"],
              },
            },
            charts: {
              type: Type.ARRAY,
              description: "You MUST generate exactly 4 distinct charts of different types to visualize the dataset: 1) a 'bar' graph, 2) a 'line' graph, 3) a 'pie' chart, and 4) an 'area' or 'bar' graph for frequency distribution/histograms. Each chart must contain rich, high-quality data entries mapping key vectors.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Visual display type: 'bar' | 'line' | 'area' | 'pie'" },
                  xAxisKey: { type: Type.STRING, description: "Field name for X axis (e.g. 'name' or 'label' or 'month')" },
                  yAxisKeys: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Field names for numeric values (e.g. ['Sales'] or ['Revenue', 'Expenses'])",
                  },
                  data: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      description: "Array of data rows containing xAxisKey and yAxisKeys. For any key listed in yAxisKeys, its value MUST be a raw number (integer or float), never a formatted string with symbols. E.g. write 5310000 instead of '$5.31M' and 1.6 instead of '1.6%'.",
                    },
                  },
                },
                required: ["id", "title", "type", "xAxisKey", "yAxisKeys", "data"],
              },
            },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Growth, Risk, Efficiency, or Financial" },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, description: "High, Medium, or Low" },
                },
                required: ["category", "title", "description", "impact"],
              },
            },
            markdownReport: {
              type: Type.STRING,
              description: "A comprehensive executive report outlining findings in markdown format. Use bullet points, bold headings, and tables.",
            },
          },
          required: ["title", "summary", "metrics", "charts", "insights", "markdownReport"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty analysis response received from Gemini model.");
    }

    const reportData = JSON.parse(text);
    res.json(reportData);
  } catch (err: any) {
    console.error("Analysis Error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze document" });
  }
});

// 2. Chat Endpoint for continuing discussion about the parsed document context
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, documentContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const ai = getAiClient();

    // Prepare system instructions with full document context
    const contextPrompt = `Your name is QueryX, and you are the elite Data Science advisory assistant that analyzed the user's document titled "${documentContext?.title || 'Uploaded Document'}".
You have full memory of this document's stats, summary, and findings.
Here is the summary of the parsed intelligence:
${JSON.stringify({
  title: documentContext?.title,
  summary: documentContext?.summary,
  metrics: documentContext?.metrics,
  insights: documentContext?.insights,
})}

CRITICAL RULES FOR YOUR CONVERSATION:
1. Under no circumstances should you ever use asterisks (*) or double asterisks (**) in your responses. No bold markdown, no italic markers, and no asterisk-based list bullets.
2. If you need to make a list or bullet points, use plain hyphens (- ) or numbers (1. 2.). No asterisk symbols.
3. Do not say "here's a human friendly interpretation of what's happening" or other similar conversational fluff; just reply plain and simple, straight to the point in clean, crisp, business-professional prose.
4. Keep replies professional, crisp, simple, and direct. Use normal capitalized text for emphasis instead of bold asterisks.

When the user asks questions or issues operational tasks:
1. Provide accurate, professional mathematical or statistical answers.
2. If asked to simulate scenarios (e.g. a pricing model, expense reduction, sales boost), generate the numerical simulations and explain step-by-step.
3. Suggest concrete actions with exact numbers based on the data.`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: contextPrompt,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: err.message || "Failed to converse with AI Agent" });
  }
});

async function startServer() {
  // Vite & Static file handler configuration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
