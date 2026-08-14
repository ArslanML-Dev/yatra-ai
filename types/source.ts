/**
 * A citable source for a factual claim used elsewhere in the data layer.
 * Every Place references one of these by id rather than repeating URLs.
 */
export interface Source {
  id: string;
  label: string;
  url?: string;
}

/** How confident we are in a record's accuracy. */
export type VerificationStatus = "VERIFIED_STATIC" | "CURATED" | "ESTIMATED";

/** Where a record's content ultimately comes from. */
export type DataType = "VERIFIED_STATIC" | "CURATED" | "DEMO";
