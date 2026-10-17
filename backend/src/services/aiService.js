import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config/index.js';
import { AiToolHandlers } from './aiToolHandlers.js';
import { PricingService } from './pricingService.js';

// Tool Function Declarations for Gemini
const TOOL_DECLARATIONS = [
  {
    name: 'search_my_orders',
    description: 'Retrieve authorized print or stationery orders for the current authenticated user. For students, this strictly searches only their own orders. For staff, it searches campus orders.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Optional search text like token prefix (XR-1024), document name, or keyword',
        },
        status: {
          type: Type.STRING,
          description: 'Optional order status filter: PENDING, ACCEPTED, PRINTING, READY_FOR_PICKUP, COLLECTED, REJECTED, CANCELLED',
        },
        limit: {
          type: Type.INTEGER,
          description: 'Maximum number of orders to return (default: 5, max: 10)',
        },
      },
    },
  },
  {
    name: 'get_order_details',
    description: 'Retrieve detailed information for a specific order by its token (e.g., XR-1027) or order ID (e.g., XF-2026-01027). Students can only view their own orders.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: 'The order token (e.g. XR-1027) or order ID (e.g. XF-2026-01027)',
        },
        token: {
          type: Type.STRING,
          description: 'Alternative parameter for the order token',
        },
      },
    },
  },
  {
    name: 'search_stationery',
    description: 'Search the real campus stationery store catalog for items like notebooks, pens, lab aprons, stick files, graph sheets, drawing sheets, calculators, and binders.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Keywords to search (e.g., "notebook", "apron", "pen", "files", "A3")',
        },
        category: {
          type: Type.STRING,
          description: 'Optional category: "Lab Apparel", "Filing & Submission", "Notebooks & Records", "Engineering Graphics", "Writing Instruments"',
        },
        limit: {
          type: Type.INTEGER,
          description: 'Maximum items to return (default: 6)',
        },
      },
    },
  },
  {
    name: 'get_product_details',
    description: 'Retrieve specific details, price, and real-time stock for an individual stationery product by its product ID or exact item name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: 'The product ID (e.g. item_apron_01, item_notebook_05)',
        },
        name: {
          type: Type.STRING,
          description: 'The product name or keyword',
        },
      },
    },
  },
  {
    name: 'explain_printing_options',
    description: 'Explain SkipQ campus printing options, supported file types (PDF, Word, PPT, Image), laser color modes, duplex printing, binding/stapling/lamination finishing options, and pickup counters.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: 'Optional focus topic such as "duplex", "binding", "color", "counters", "pricing"',
        },
      },
    },
  },
  {
    name: 'navigate_to_page',
    description: 'Help the authenticated user navigate to an authorized section of the SkipQ application. Validates permissions for student vs staff roles.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetPage: {
          type: Type.STRING,
          description: 'The target route path (e.g. "/student/orders/new", "/student/store", "/student/history", "/staff/queue", "/staff/orders")',
        },
        reason: {
          type: Type.STRING,
          description: 'Brief reason for navigation (e.g. "To upload your PDF and start printing")',
        },
      },
      required: ['targetPage'],
    },
  },
];

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
];

export class AiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    this.modelName = config.geminiModel || 'gemini-3.5-flash';
    this.client = null;

    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('[AiService] Failed to initialize GoogleGenAI client:', err.message);
      }
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.client);
  }

  getModelName() {
    return this.modelName;
  }

  /**
   * Resilient content generation with automatic model fallback for 429/quota limits
   */
  async callGenerateContent({ contents, config: reqConfig }) {
    const modelsToTry = [
      this.modelName,
      ...CANDIDATE_MODELS.filter((m) => m !== this.modelName),
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents,
          config: reqConfig,
        });

        if (this.modelName !== model) {
          console.log(`[AiService] Switched active Gemini model from ${this.modelName} to ${model}`);
          this.modelName = model;
        }

        return response;
      } catch (err) {
        lastError = err;
        const msg = (err.message || '').toLowerCase();
        const isQuotaOr429 =
          err.status === 429 ||
          msg.includes('429') ||
          msg.includes('quota') ||
          msg.includes('resource_exhausted');

        if (isQuotaOr429) {
          console.warn(`[AiService] Model ${model} exceeded quota or hit rate limit. Trying next candidate model...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  }

  /**
   * Build role-tailored system instructions
   */
  getSystemInstruction(user) {
    const isStudent = user.role === 'student';
    const userName = user.name || (isStudent ? 'Student' : 'Staff Operator');
    const roleTitle = isStudent ? 'Student' : 'Stationery Desk Staff';

    return `You are SkipQ AI, the official, intelligent campus printing and stationery assistant for the SkipQ Digital Xerox & Stationery Ordering System at MLRIT Campus.

CURRENT USER CONTEXT:
- Authenticated User: ${userName}
- User Role: ${roleTitle} (${user.role})
- User Email: ${user.email || 'N/A'}
- Department / ID: ${user.department || user.collegeId || 'Campus Desk'}

CORE RESPONSIBILITIES & BEHAVIOR:
1. Tone: Concise, friendly, professional, and technically accurate.
2. Grounding in Real Data: Prefer actual SkipQ data over assumptions. Always use tools to search orders, lookup order tokens, check stationery prices and stock, or explain platform rules.
3. Anti-Hallucination: Never invent order statuses, product names, prices, stock levels, or payment outcomes. If a product or order is not found, clearly state it.
4. Role Permissions:
   - For Students: Only their own orders can be searched or inspected. Guide them on uploading documents, choosing printing configurations, and buying stationery.
   - For Staff: Assist with queue management, checking orders across counters, and store inventory status.
5. Printing Workflow Guidance:
   - When a student describes printing preferences (e.g. "I want 35 pages of DBMS notes in black and white double sided"), summarize their preferences clearly:
     * Document: Description stated by user
     * Page count: Pages stated by user
     * Color mode: B&W or Color
     * Layout: Double-sided (Duplex) or Single-sided
     * Finishing: Loose, Staple, Spiral, or Laminated
   - Explicitly remind them: "Next step: Upload your file at the New Order page to receive your instant 4-digit collection token."
   - Never claim an order was created or file was uploaded until they complete the real New Order workflow.
6. Navigation: When a user wants to go to a page or action, call 'navigate_to_page' so the UI can provide an interactive 1-click jump button.
7. Output Formatting: Use crisp Markdown with bullet points, bold key terms, and currency in Indian Rupees (₹). Keep responses clean and avoid excessive conversational filler.`;
  }

  /**
   * Conversational Printing Intent Extractor
   * Extracts preferences and calculates an estimated preview
   */
  extractPrintIntent(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    const hasPrintIntent =
      lower.includes('print') ||
      lower.includes('xerox') ||
      lower.includes('pages') ||
      lower.includes('copies') ||
      lower.includes('duplex') ||
      lower.includes('double-sided') ||
      lower.includes('spiral');

    if (!hasPrintIntent) return null;

    // Extract pages
    let pages = 1;
    const pageMatch = text.match(/(\d+)\s*(?:page|pg|sheet|p)/i);
    if (pageMatch) {
      pages = parseInt(pageMatch[1], 10);
    }

    // Extract copies
    let copies = 1;
    const copyMatch = text.match(/(\d+)\s*(?:cop(?:y|ies)|set)/i);
    if (copyMatch) {
      copies = parseInt(copyMatch[1], 10);
    }

    // Extract color
    const isColor = lower.includes('color') || lower.includes('colour');
    const color = isColor ? 'COLOR' : 'BW';

    // Extract sides
    const isDuplex = lower.includes('double') || lower.includes('duplex') || lower.includes('both side');
    const sides = isDuplex ? 'DOUBLE' : 'SINGLE';

    // Extract finishing
    let finishing = 'NONE';
    if (lower.includes('spiral') || lower.includes('bind')) finishing = 'SPIRAL';
    else if (lower.includes('staple')) finishing = 'STAPLE';
    else if (lower.includes('laminat')) finishing = 'LAMINATION';

    // Extract paper size
    const paperSize = lower.includes('a3') ? 'A3' : 'A4';

    // Calculate authoritative estimate preview
    const estimate = PricingService.calculate([{ pages }], {
      service: lower.includes('xerox') ? 'XEROX' : 'PRINT',
      color,
      paperSize,
      sides,
      copies,
      finishing,
    });

    return {
      pages,
      copies,
      color,
      sides,
      finishing,
      paperSize,
      estimatedTotal: estimate.total,
      estimatedMinutes: estimate.estimatedMinutes,
      totalSheets: estimate.totalSheets,
    };
  }

  /**
   * Process a Chat Message with Bounded Tool Execution Loop
   * @param {{ message: string, conversationHistory: Array<{ role: string, content: string }>, user: object }} params
   */
  async processChat({ message, conversationHistory = [], user }) {
    if (!this.isConfigured()) {
      const err = new Error(
        'SkipQ AI is currently offline or unconfigured on this campus server. Please set the GEMINI_API_KEY environment variable.'
      );
      err.statusCode = 503;
      throw err;
    }

    // Format historical messages into Gemini contents
    const contents = [];
    const validHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [];

    for (const h of validHistory) {
      if (h.role === 'user' && typeof h.content === 'string') {
        contents.push({ role: 'user', parts: [{ text: h.content.trim() }] });
      } else if (h.role === 'assistant' && typeof h.content === 'string') {
        contents.push({ role: 'model', parts: [{ text: h.content.trim() }] });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const systemInstruction = this.getSystemInstruction(user);
    const tools = [{ functionDeclarations: TOOL_DECLARATIONS }];

    // Structured artifacts to send alongside textual answer
    const structuredArtifacts = {
      products: [],
      orders: [],
      navigationTarget: null,
      printEstimate: this.extractPrintIntent(message),
    };

    // Bounded Function-Calling Execution Loop (Max 5 iterations)
    const MAX_TOOL_ITERATIONS = 5;
    let iterations = 0;
    let finalAnswer = '';

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const response = await this.callGenerateContent({
        contents,
        config: {
          systemInstruction,
          tools,
          temperature: 0.2, // Low temperature for high factual accuracy
        },
      });

      const candidate = response.candidates?.[0];
      const modelContent = candidate?.content;

      if (!modelContent) {
        finalAnswer = response.text || 'I was unable to process your request at this moment.';
        break;
      }

      // Check for function calls requested by Gemini
      const functionCalls = response.functionCalls || [];

      if (functionCalls.length === 0) {
        // No more tool calls: final answer produced
        finalAnswer = response.text || '';
        break;
      }

      // Append model's tool request turn to conversation contents
      contents.push(modelContent);

      // Execute each tool requested with verified user context
      const toolResponseParts = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let toolResult = null;

        if (name === 'search_my_orders') {
          toolResult = await AiToolHandlers.searchMyOrders(args || {}, user);
          if (toolResult?.orders?.length > 0) {
            structuredArtifacts.orders.push(...toolResult.orders);
          }
        } else if (name === 'get_order_details') {
          toolResult = await AiToolHandlers.getOrderDetails(args || {}, user);
          if (toolResult && !toolResult.error) {
            structuredArtifacts.orders.push(toolResult);
          }
        } else if (name === 'search_stationery') {
          toolResult = await AiToolHandlers.searchStationery(args || {}, user);
          if (toolResult?.products?.length > 0) {
            structuredArtifacts.products.push(...toolResult.products);
          }
        } else if (name === 'get_product_details') {
          toolResult = await AiToolHandlers.getProductDetails(args || {});
          if (toolResult && !toolResult.error) {
            structuredArtifacts.products.push(toolResult);
          }
        } else if (name === 'explain_printing_options') {
          toolResult = await AiToolHandlers.explainPrintingOptions(args || {});
        } else if (name === 'navigate_to_page') {
          toolResult = await AiToolHandlers.navigateToPage(args || {}, user);
          if (toolResult?.success) {
            structuredArtifacts.navigationTarget = {
              path: toolResult.targetPage,
              label: toolResult.label,
              reason: toolResult.reason,
            };
          }
        } else {
          toolResult = { error: `Tool '${name}' is not recognized or permitted.` };
        }

        toolResponseParts.push({
          functionResponse: {
            name,
            response: toolResult,
          },
        });
      }

      // Append function response turn to contents
      contents.push({
        role: 'user',
        parts: toolResponseParts,
      });
    }

    // Deduplicate structured artifacts
    const uniqueProducts = Array.from(
      new Map(structuredArtifacts.products.map((p) => [p.id, p])).values()
    );
    const uniqueOrders = Array.from(
      new Map(structuredArtifacts.orders.map((o) => [o.id || o.token, o])).values()
    );

    return {
      message: finalAnswer.trim() || 'I have retrieved the requested information from SkipQ.',
      data: {
        products: uniqueProducts.length > 0 ? uniqueProducts : undefined,
        orders: uniqueOrders.length > 0 ? uniqueOrders : undefined,
        navigationTarget: structuredArtifacts.navigationTarget || undefined,
        printEstimate: structuredArtifacts.printEstimate || undefined,
      },
      model: this.modelName,
      timestamp: new Date().toISOString(),
    };
  }
}

export const aiService = new AiService();
