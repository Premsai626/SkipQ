/**
 * Authoritative Backend Pricing Service
 * Calculates accurate itemized print & Xerox rates
 */

export class PricingService {
  /**
   * Calculate complete price breakdown
   * @param {Array<{ pages: number }>} documents
   * @param {{ service: string, color: string, paperSize: string, sides: string, copies: number, finishing: string }} config
   */
  static calculate(documents, config) {
    const totalRawPages = documents.reduce((acc, doc) => acc + (doc.pages || 1), 0) || 1;
    const copies = Math.max(1, config.copies || 1);

    // Physical sheets per set
    const sheetsPerPageSet = config.sides === 'DOUBLE' 
      ? Math.ceil(totalRawPages / 2) 
      : totalRawPages;

    const totalSheets = sheetsPerPageSet * copies;

    // Base rates (per page)
    const baseRate = config.service === 'XEROX' ? 1.5 : 2.0;
    const baseCost = Math.round(totalRawPages * baseRate * copies);

    // Color surcharge (per page)
    const colorRate = config.color === 'COLOR' ? 6.0 : 0;
    const colorSurcharge = Math.round(totalRawPages * colorRate * copies);

    // Paper size surcharge (A3 is +₹5 per physical sheet)
    const paperRate = config.paperSize === 'A3' ? 5.0 : 0;
    const paperSurcharge = Math.round(totalSheets * paperRate);

    // Duplex adjustment (Duplex saves paper, small green discount ₹0.5 per double-sided sheet)
    const duplexAdjustment = config.sides === 'DOUBLE' 
      ? Math.round(sheetsPerPageSet * 0.5 * copies) 
      : 0;

    // Finishing costs
    let finishingPerCopy = 0;
    if (config.finishing === 'STAPLE') finishingPerCopy = 5;
    if (config.finishing === 'SPIRAL') finishingPerCopy = 25;
    if (config.finishing === 'LAMINATION') finishingPerCopy = 20 * totalSheets;

    const finishingCost = config.finishing === 'LAMINATION' 
      ? finishingPerCopy 
      : finishingPerCopy * copies;

    const total = Math.max(
      5, // Minimum order ₹5
      (baseCost + colorSurcharge + paperSurcharge - duplexAdjustment + finishingCost)
    );

    // Estimated turnaround calculation (in minutes)
    // Base 3 mins + 0.2 mins per printed sheet + 5 mins for spiral binding
    const finishingMinutes = config.finishing === 'SPIRAL' ? 5 : config.finishing === 'LAMINATION' ? 4 : 1;
    const estimatedMinutes = Math.max(4, Math.ceil(3 + totalSheets * 0.15 + finishingMinutes));

    return {
      totalSheets,
      baseCost,
      colorSurcharge,
      paperSurcharge,
      duplexAdjustment,
      copies,
      finishingCost,
      total,
      estimatedMinutes,
    };
  }
}
