
export type Product = {
  id: string;
  name: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
};

export type Customer = {
  id: string;
  name:string;
  phone: string;
  totalDebt: number;
};

export type Transaction = {
  id: string;
  date: string; // Using ISO string for Firestore compatibility
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
  initialCash: number;
  initialSetupDone: boolean;
};

export type CashWithdrawal = {
  id: string;
  date: string;
  amount: number;
};
