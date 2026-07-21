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

export interface AdminCustomerRow {
  id: string;
  email: string;
  role: "user" | "admin";
  phone: string | null;
  disabledAt: string | null;
  createdAt: string;
}
