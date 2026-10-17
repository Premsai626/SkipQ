import { orderService } from './orderService.js';
import { getStoreRepository } from '../repositories/storeRepository.js';
import { PricingService } from './pricingService.js';

// Explicit Route Allowlists for Role Safety
const ALLOWED_STUDENT_ROUTES = {
  '/student': 'Student Dashboard',
  '/student/orders/new': 'New Print Order (Upload & Specs)',
  '/student/history': 'Order History & Receipts',
  '/student/store': 'Campus Stationery Store',
  '/student/notifications': 'Notifications Center',
  '/student/profile': 'Student Profile',
};

const ALLOWED_STAFF_ROUTES = {
  '/staff': 'Staff Operational Dashboard',
  '/staff/queue': 'Live Queue Control Board',
  '/staff/orders': 'Order Queue Management Table',
  '/staff/store': 'Store Catalog Management',
  '/staff/analytics': 'Operational Analytics',
  '/staff/notifications': 'Staff Notifications',
  '/staff/profile': 'Operator Terminal Profile',
};

export class AiToolHandlers {
  /**
   * Tool A: Search My Orders
   * Retrieves orders scoped to authenticated user
   */
  static async searchMyOrders(args, user) {
    if (!user) {
      return { error: 'Authentication required to search orders.' };
    }

    try {
      const isStudent = user.role === 'student';
      const filters = {
        studentId: isStudent ? user.id : (args.studentId || undefined),
        studentEmail: isStudent ? user.email : undefined,
        status: args.status ? String(args.status).toUpperCase() : undefined,
        search: args.query ? String(args.query).trim() : undefined,
        limit: Math.min(parseInt(args.limit, 10) || 5, 10),
      };

      const result = await orderService.getOrders(filters);
      const orders = (result.orders || []).map((o) => ({
        id: o.id,
        token: o.token,
        orderType: o.orderType,
        status: o.status,
        paymentStatus: o.paymentStatus,
        totalAmount: o.pricing?.total ?? 0,
        pickupCounter: o.pickupCounter || 'Counter #2 • Main Desk',
        createdAt: o.createdAt,
        estimatedMinutes: o.estimatedMinutes,
        queuePosition: o.queuePosition,
        itemsSummary: o.items
          ? o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')
          : (o.documents || []).map((d) => d.originalName || d.name || 'Document').join(', '),
      }));

      return {
        totalFound: result.total || orders.length,
        role: user.role,
        orders,
      };
    } catch (err) {
      return { error: `Failed to search orders: ${err.message}` };
    }
  }

  /**
   * Tool B: Get Order Details
   * Retrieves details for a specific order with strict student data isolation
   */
  static async getOrderDetails(args, user) {
    if (!user) {
      return { error: 'Authentication required to view order details.' };
    }

    const orderIdOrToken = args.orderId || args.token;
    if (!orderIdOrToken) {
      return { error: 'Please provide an order ID (e.g. XF-2026-01027) or token (e.g. XR-1027).' };
    }

    try {
      const order = await orderService.getOrder(orderIdOrToken);
      if (!order) {
        return { error: `Order '${orderIdOrToken}' was not found in the system.` };
      }

      // Strict Student Data Isolation: Student can only view their own order
      if (user.role === 'student') {
        const orderStudentId = order.student?.id || order.studentId;
        const orderStudentEmail = order.student?.email || order.studentEmail;
        const isOwner =
          orderStudentId === user.id ||
          (orderStudentEmail && orderStudentEmail.toLowerCase() === user.email?.toLowerCase());

        if (!isOwner) {
          return { error: 'Forbidden: You do not have permission to view this order.' };
        }
      }

      // Safe representation
      return {
        id: order.id,
        token: order.token,
        orderType: order.orderType,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        pickupCounter: order.pickupCounter,
        estimatedMinutes: order.estimatedMinutes,
        queuePosition: order.queuePosition,
        createdAt: order.createdAt,
        rejectionReason: order.rejectionReason || null,
        pricing: {
          baseCost: order.pricing?.baseCost ?? order.pricing?.basePrice ?? 0,
          finishingCost: order.pricing?.finishingCost ?? 0,
          discount: order.pricing?.duplexAdjustment ?? order.pricing?.discount ?? 0,
          total: order.pricing?.total ?? 0,
        },
        config: order.config || null,
        documents: (order.documents || []).map((d) => ({
          name: d.originalName || d.name || 'Document',
          pageCount: d.pageCount || d.pages || 1,
          sizeBytes: d.fileSize || d.size || 0,
        })),
        items: (order.items || []).map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
        })),
        otpCode: order.status === 'READY_FOR_PICKUP' ? order.otpCode : undefined,
      };
    } catch (err) {
      return { error: `Failed to fetch order details: ${err.message}` };
    }
  }

  /**
   * Tool C: Search Stationery
   * Searches the campus store inventory
   */
  static async searchStationery(args, user) {
    try {
      const storeRepo = getStoreRepository();
      const availableOnly = user?.role === 'student' ? true : (args.availableOnly ?? false);
      const items = await storeRepo.findAll({
        search: args.query ? String(args.query).trim() : undefined,
        category: args.category ? String(args.category).trim() : undefined,
        availableOnly,
      });

      const maxLimit = Math.min(parseInt(args.limit, 10) || 6, 12);
      const formatted = items.slice(0, maxLimit).map((it) => ({
        id: it.id,
        name: it.name,
        description: it.description,
        category: it.category,
        price: it.price,
        stock: it.stock,
        isAvailable: it.isAvailable,
        imageUrl: it.imageUrl,
      }));

      return {
        query: args.query || 'all',
        totalFound: items.length,
        products: formatted,
      };
    } catch (err) {
      return { error: `Failed to search stationery: ${err.message}` };
    }
  }

  /**
   * Tool D: Get Product Details
   * Retrieves individual product information
   */
  static async getProductDetails(args) {
    const identifier = args.productId || args.name;
    if (!identifier) {
      return { error: 'Please provide a productId or product name to look up.' };
    }

    try {
      const storeRepo = getStoreRepository();
      let item = await storeRepo.findById(identifier);

      if (!item) {
        // Fallback search by name
        const matches = await storeRepo.findAll({ search: identifier });
        if (matches.length > 0) {
          item = matches[0];
        }
      }

      if (!item) {
        return { error: `Stationery item '${identifier}' was not found in the catalog.` };
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        stock: item.stock,
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl,
      };
    } catch (err) {
      return { error: `Failed to get product details: ${err.message}` };
    }
  }

  /**
   * Tool E: Explain Printing Options
   * Returns authoritative print specs, pricing rules, paper, and turnaround estimates
   */
  static async explainPrintingOptions(args) {
    return {
      supportedFileFormats: ['PDF (.pdf)', 'Microsoft Word (.doc, .docx)', 'PowerPoint (.ppt, .pptx)', 'Images (.jpg, .jpeg, .png)'],
      maxFileSize: '50 MB per document',
      printServices: [
        {
          code: 'PRINT',
          name: 'Digital Laser Print',
          description: 'High-resolution digital print from uploaded electronic files.',
          baseRate: '₹2.00 per page',
        },
        {
          code: 'XEROX',
          name: 'Document Photocopy (Xerox)',
          description: 'High-speed automated scanning and reproduction.',
          baseRate: '₹1.50 per page',
        },
      ],
      colorModes: [
        { code: 'BW', name: 'Monochrome (Black & White)', surcharge: '₹0.00 (standard rate)' },
        { code: 'COLOR', name: 'High-Density Color Laser', surcharge: '+₹6.00 per page' },
      ],
      paperSizes: [
        { code: 'A4', name: 'A4 Standard Bond (75-80 GSM)', surcharge: 'Standard included' },
        { code: 'A3', name: 'A3 Large Engineering Drafting', surcharge: '+₹5.00 per physical sheet' },
      ],
      printSides: [
        { code: 'SINGLE', name: 'Single-Sided (Simplex)', note: 'Standard printing on 1 side' },
        { code: 'DOUBLE', name: 'Double-Sided (Duplex)', note: 'Eco-friendly paper saver: saves -₹0.50 per duplex sheet' },
      ],
      finishingOptions: [
        { code: 'NONE', name: 'Loose Sheets', cost: '₹0' },
        { code: 'STAPLE', name: 'Top-Left Corner Staple', cost: '₹5 per copy' },
        { code: 'SPIRAL', name: 'Executive Spiral Binding with OHP Sheet', cost: '₹25 per copy' },
        { code: 'LAMINATION', name: 'Thermal Protective Lamination', cost: '₹20 per sheet' },
      ],
      pickupCounters: [
        { name: 'Counter #1 (Stationery Desk)', specialty: 'Campus stationery, files, pens, and express pickups' },
        { name: 'Counter #2 (Main Desk)', specialty: 'Standard A4 lecture notes, lab manuals, assignments' },
        { name: 'Counter #3 (Plotter & A3)', specialty: 'Engineering drawing sheets, CAD charts, large posters' },
      ],
      guidance: 'To submit an order, click "Start New Order" or navigate to /student/orders/new. Upload your files, choose your preferred color, sides, and finishing options, and an instant 4-digit token (XR-XXXX) will be generated for counter collection.',
    };
  }

  /**
   * Tool F: Navigate to Application Pages
   * Validates target page against authenticated role allowlist
   */
  static async navigateToPage(args, user) {
    if (!user) {
      return { error: 'Authentication required to navigate application.' };
    }

    const targetPage = args.targetPage ? String(args.targetPage).trim() : '';
    const isStudent = user.role === 'student';
    const isStaff = user.role === 'staff';

    let allowedMap = isStudent ? ALLOWED_STUDENT_ROUTES : ALLOWED_STAFF_ROUTES;

    // Check direct match or normalized alias
    let matchedRoute = Object.keys(allowedMap).find((r) => r.toLowerCase() === targetPage.toLowerCase());

    if (!matchedRoute) {
      // Check common keywords
      const lower = targetPage.toLowerCase();
      if (isStudent) {
        if (lower.includes('order') && (lower.includes('new') || lower.includes('create') || lower.includes('upload'))) {
          matchedRoute = '/student/orders/new';
        } else if (lower.includes('history') || (lower.includes('my') && lower.includes('order'))) {
          matchedRoute = '/student/history';
        } else if (lower.includes('store') || lower.includes('stationery') || lower.includes('shop')) {
          matchedRoute = '/student/store';
        } else if (lower.includes('notif')) {
          matchedRoute = '/student/notifications';
        } else if (lower.includes('profile')) {
          matchedRoute = '/student/profile';
        } else if (lower.includes('dash') || lower.includes('home')) {
          matchedRoute = '/student';
        }
      } else if (isStaff) {
        if (lower.includes('queue') || lower.includes('board')) {
          matchedRoute = '/staff/queue';
        } else if (lower.includes('order') || lower.includes('table')) {
          matchedRoute = '/staff/orders';
        } else if (lower.includes('store') || lower.includes('catalog') || lower.includes('inventory')) {
          matchedRoute = '/staff/store';
        } else if (lower.includes('analytic') || lower.includes('metric') || lower.includes('chart')) {
          matchedRoute = '/staff/analytics';
        } else if (lower.includes('profile')) {
          matchedRoute = '/staff/profile';
        } else if (lower.includes('notif')) {
          matchedRoute = '/staff/notifications';
        } else if (lower.includes('dash') || lower.includes('home')) {
          matchedRoute = '/staff';
        }
      }
    }

    if (!matchedRoute) {
      return {
        error: `Page '${targetPage}' is not an authorized or recognized route for role '${user.role}'.`,
        availableRoutes: Object.entries(allowedMap).map(([route, name]) => ({ route, name })),
      };
    }

    return {
      success: true,
      targetPage: matchedRoute,
      label: allowedMap[matchedRoute],
      reason: args.reason || `Navigating to ${allowedMap[matchedRoute]}`,
    };
  }
}
