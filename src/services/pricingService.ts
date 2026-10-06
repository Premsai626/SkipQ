import { DocumentItem, PrintConfiguration, PriceBreakdown } from '../types';
import { pricingApi } from './api';

export class PricingService {
  /**
   * Fast synchronous client-side preview calculation
   */
  static calculatePreview(
    documents: DocumentItem[],
    config: PrintConfiguration
  ): PriceBreakdown & { estimatedMinutes: number } {
    const totalRawPages = documents.reduce((acc, doc) => acc + (doc.pages || 1), 0) || 1;
    const copies = Math.max(1, config.copies || 1);

    // Sheets per set
    const sheetsPerPageSet = config.sides === 'DOUBLE' 
      ? Math.ceil(totalRawPages / 2) 
      : totalRawPages;

    const totalSheets = sheetsPerPageSet * copies;

    // Base rate
    const baseRate = config.service === 'XEROX' ? 1.5 : 2.0;
    const baseCost = Math.round(totalRawPages * baseRate * copies);

    // Color surcharge
    const colorRate = config.color === 'COLOR' ? 6.0 : 0;
    const colorSurcharge = Math.round(totalRawPages * colorRate * copies);

    // Paper size surcharge
    const paperRate = config.paperSize === 'A3' ? 5.0 : 0;
    const paperSurcharge = Math.round(totalSheets * paperRate);

    // Duplex adjustment
    const duplexAdjustment = config.sides === 'DOUBLE' 
      ? Math.round(sheetsPerPageSet * 0.5 * copies) 
      : 0;

    // Finishing
    let finishingPerCopy = 0;
    if (config.finishing === 'STAPLE') finishingPerCopy = 5;
    if (config.finishing === 'SPIRAL') finishingPerCopy = 25;
    if (config.finishing === 'LAMINATION') finishingPerCopy = 20 * totalSheets;

    const finishingCost = config.finishing === 'LAMINATION' 
      ? finishingPerCopy 
      : finishingPerCopy * copies;

    const total = Math.max(
      5,
      (baseCost + colorSurcharge + paperSurcharge - duplexAdjustment + finishingCost)
    );

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
      subtotal: total,
      total,
      estimatedMinutes,
    };
  }

  /**
   * Authoritative backend price calculation
   */
  static async calculateAuthoritative(
    documents: DocumentItem[],
    config: PrintConfiguration
  ): Promise<PriceBreakdown & { estimatedMinutes: number }> {
    try {
      return await pricingApi.calculate(documents, config);
    } catch {
      return this.calculatePreview(documents, config);
    }
  }
}

export const pricingService = PricingService;

export const calculatePrice = (
  documents: DocumentItem[],
  config: PrintConfiguration
): PriceBreakdown => PricingService.calculatePreview(documents, config);
