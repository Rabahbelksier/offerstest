export type OfferType = "normal" | "currency" | "super" | "bigsave" | "bundle";

export interface OfferTypeOption {
  value: OfferType;
  label: string;
}

export const OFFER_TYPE_OPTIONS: OfferTypeOption[] = [
  { value: "normal", label: "عرض عادي" },
  { value: "currency", label: "عرض عملات" },
  { value: "super", label: "عرض السوبر" },
  { value: "bigsave", label: "عرض البيڤ سايف" },
  { value: "bundle", label: "عرض الحزمات" },
];

export const HIDE_SELLER_COUPON: OfferType[] = ["super", "bigsave", "bundle"];
export const SHOW_PRICE3PCS: OfferType[] = ["bundle"];

/**
 * API responses may come from Drizzle (offerType) or from raw SQL/legacy
 * payloads (offer_type). Keep the conversion in one place at the client
 * boundary so an absent or unknown value cannot silently change the UI rules.
 */
export function normalizeOfferType(value: unknown): OfferType {
  return OFFER_TYPE_OPTIONS.some(option => option.value === value)
    ? (value as OfferType)
    : "normal";
}

export function getOfferTypeLabel(value: unknown): string {
  const type = normalizeOfferType(value);
  return OFFER_TYPE_OPTIONS.find(option => option.value === type)?.label ?? "عرض عادي";
}