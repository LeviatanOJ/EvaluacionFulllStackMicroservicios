export type TransactionType = 1 | 2; // 1=Purchase, 2=Sale

export interface Transaction {
  id: number;
  dateUtc: string;
  type: TransactionType;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  detail: string | null;
}
