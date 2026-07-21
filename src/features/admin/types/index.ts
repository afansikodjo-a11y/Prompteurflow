/**
 * Types du domaine « admin ».
 */
export interface AdminAffiliateRow {
  affiliateId: string;
  email: string;
  referredCount: number;
  accruedTotalXof: number;
  paidTotalXof: number;
}
