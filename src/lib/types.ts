
export type Product = {
  id: string;
  name: string;
  barcode: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
};

export type Transaction = {
  id: string;
  date: string; // Using ISO string for localStorage compatibility
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: 'cash' | 'credit';
  customerId?: string;
  customerName?: string;
};

export type StoreSettings = {
  storeName: string;
  initialSetupDone: boolean;
};

export type DailySummary = {
  id: string; // e.g., '2024-07-26'
  date: string;
  income: number;
  expenses: number;
  profit: number;
  newDebts: number;
};
