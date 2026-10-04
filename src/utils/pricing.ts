import { DocumentItem, PrintConfiguration, PriceBreakdown } from '../types';

export function calculatePrice(
  documents: DocumentItem[],
  config: PrintConfiguration
): PriceBreakdown {
  // Total pages across all uploaded documents (default 1 page minimum if empty)
  const totalRawPages = documents.reduce((acc, doc) => acc + (doc.pages || 1), 0) || 1;

  // Calculate physical sheets needed
  // If double-sided, 2 pages fit on 1 sheet
  const sheetsPerPageSet = config.sides === 'DOUBLE' 
    ? Math.ceil(totalRawPages / 2) 
    : totalRawPages;

  const totalSheets = sheetsPerPageSet * config.copies;

  // Base print rate per page
  // Xerox: ₹1.50/page, Print: ₹2.00/page
  const baseRate = config.service === 'XEROX' ? 1.5 : 2.0;
  const baseCost = Math.round(totalRawPages * baseRate * config.copies);

  // Color surcharge (if color is selected, +₹6 per page)
  const colorRate = config.color === 'COLOR' ? 6.0 : 0;
  const colorSurcharge = Math.round(totalRawPages * colorRate * config.copies);

  // Paper surcharge (A3 is +₹5 per sheet compared to standard A4)
  const paperRate = config.paperSize === 'A3' ? 5.0 : 0;
  const paperSurcharge = Math.round(totalSheets * paperRate);

  // Duplex adjustment (Duplex saves paper, small green discount ₹0.5 per double-sided sheet)
  const duplexAdjustment = config.sides === 'DOUBLE' 
    ? Math.round(sheetsPerPageSet * 0.5 * config.copies) 
    : 0;

  // Finishing costs per copy
  let finishingPerCopy = 0;
  if (config.finishing === 'STAPLE') finishingPerCopy = 5;
  if (config.finishing === 'SPIRAL') finishingPerCopy = 25;
  if (config.finishing === 'LAMINATION') finishingPerCopy = 20 * totalSheets;
  const finishingCost = finishingPerCopy * (config.finishing === 'LAMINATION' ? 1 : config.copies);

  // Subtotal calculation
  const total = Math.max(
    5, // minimum order charge ₹5
    (baseCost + colorSurcharge + paperSurcharge - duplexAdjustment + finishingCost)
  );

  return {
    totalSheets,
    baseCost,
    colorSurcharge,
    paperSurcharge,
    duplexAdjustment,
    copies: config.copies,
    finishingCost,
    total,
  };
}
