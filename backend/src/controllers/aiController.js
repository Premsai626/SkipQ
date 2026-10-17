import { aiService } from '../services/aiService.js';
import { z } from 'zod';

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(2000, 'History message exceeds max length'),
      })
    )
    .max(20, 'Conversation history cannot exceed 20 messages')
    .optional()
    .default([]),
});

export class AiController {
  /**
   * Check SkipQ AI Service Status (Authenticated)
   */
  static async getStatus(req, res) {
    res.json({
      success: true,
      data: {
        configured: aiService.isConfigured(),
        model: aiService.getModelName(),
        service: 'SkipQ AI Assistant (Gemini)',
        userRole: req.user?.role || 'guest',
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Process Chat Interaction with Gemini (Authenticated)
   */
  static async chat(req, res, next) {
    try {
      // 1. Authoritative identity check
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Valid authenticated session required to chat with SkipQ AI.',
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Validate input payload
      const parseResult = chatMessageSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: parseResult.error.errors[0]?.message || 'Invalid chat request payload',
          timestamp: new Date().toISOString(),
        });
      }

      const { message, conversationHistory } = parseResult.data;

      // 3. Verify Gemini AI configuration
      if (!aiService.isConfigured()) {
        return res.status(503).json({
          success: false,
          code: 'AI_SERVICE_UNAVAILABLE',
          message: 'SkipQ AI is currently offline. Please configure the GEMINI_API_KEY in the server environment.',
          timestamp: new Date().toISOString(),
        });
      }

      // 4. Execute AI reasoning and tool-calling with trusted user context
      const result = await aiService.processChat({
        message,
        conversationHistory,
        user: req.user, // Derived strictly from verified JWT
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Graceful error mapping
      if (err.statusCode === 503) {
        return res.status(503).json({
          success: false,
          code: 'AI_SERVICE_UNAVAILABLE',
          message: err.message,
          timestamp: new Date().toISOString(),
        });
      }

      // Handle Gemini rate limits or quota
      const errMsg = err.message || '';
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
        return res.status(429).json({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'SkipQ AI is experiencing high traffic. Please try your request again in a few seconds.',
          timestamp: new Date().toISOString(),
        });
      }

      console.error('[AiController.chat] Unexpected error:', err.message);
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred while communicating with SkipQ AI. Please try again.',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
