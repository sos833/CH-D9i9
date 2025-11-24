import type { Product, Customer, Sale } from './types';

export const mockProducts: Product[] = [
  { id: 'PROD001', name: 'Gaufrettes Amigo', barcode: '613000000001', stock: 150, costPrice: 15, sellingPrice: 20 },
  { id: 'PROD002', name: 'Boisson Gazeuse Hamoud', barcode: '613000000002', stock: 200, costPrice: 80, sellingPrice: 100 },
  { id: 'PROD003', name: 'Chips Mahboul', barcode: '613000000003', stock: 300, costPrice: 20, sellingPrice: 25 },
  { id: 'PROD004', name: 'Yaourt Danone', barcode: '613000000004', stock: 100, costPrice: 40, sellingPrice: 50 },
  { id: 'PROD005', name: 'Pain Baguette', barcode: '613000000005', stock: 80, costPrice: 10, sellingPrice: 15 },
  { id: 'PROD006', name: 'Fromage La Vache Qui Rit', barcode: '613000000006', stock: 120, costPrice: 120, sellingPrice: 150 },
  { id: 'PROD007', name: 'Jus Rouiba', barcode: '613000000007', stock: 180, costPrice: 90, sellingPrice: 110 },
];

export const mockCustomers: Customer[] = [
  { id: 'CUST001', name: 'Karim Bennaceur', phone: '0555123456', totalDebt: 1500.00 },
  { id: 'CUST002', name: 'Amina Ziani', phone: '0777654321', totalDebt: 0.00 },
  { id: 'CUST003', name: 'Samir Khelifi', phone: '0666987654', totalDebt: 3250.50 },
  { id: 'CUST004', name: 'Fatima Hadjadj', phone: '0550112233', totalDebt: 780.00 },
  { id: 'CUST005', name: 'Mehdi Bouzid', phone: '0790445566', totalDebt: 120.00 },
];

export const mockRecentSales: Sale[] = [
  { customerName: 'Lina Ait', customerInitials: 'LA', email: 'lina.ait@example.com', amount: '+ د.ج 1,999.00' },
  { customerName: 'Yacine Djebbar', customerInitials: 'YD', email: 'yacine.d@example.com', amount: '+ د.ج 39.00' },
  { customerName: 'Sofia Cherif', customerInitials: 'SC', email: 'sofia.c@example.com', amount: '+ د.ج 299.00' },
  { customerName: 'Mehdi Laouar', customerInitials: 'ML', email: 'mehdi.l@example.com', amount: '+ د.ج 99.00' },
  { customerName: 'Amira Benali', customerInitials: 'AB', email: 'amira.b@example.com', amount: '+ د.ج 3,250.50' },
];
