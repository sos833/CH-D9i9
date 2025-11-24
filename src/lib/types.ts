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
  date: Date;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: 'cash' | 'credit';
  customerId?: string;
};
