
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Product, Customer, Transaction, StoreSettings, CashWithdrawal } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  storeSettings: StoreSettings | null;
  cashWithdrawals: CashWithdrawal[];
  loading: boolean;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  updateProductsStock: (items: { productId: string; quantity: number }[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<DocumentReference | undefined>;
  updateCustomer: (customerId: string, data: Partial<Customer>) => Promise<void>;
  updateCustomerDebt: (customerId: string, amount: number) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;

  setStoreSettings: (settings: StoreSettings) => Promise<void>;
  
  addCashWithdrawal: (withdrawal: Omit<CashWithdrawal, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();

  const { data: products = [], loading: loadingProducts } = useCollection<Product>(firestore ? collection(firestore, 'products') : null);
  const { data: customers = [], loading: loadingCustomers } = useCollection<Customer>(firestore ? collection(firestore, 'customers') : null);
  const { data: transactions = [], loading: loadingTransactions } = useCollection<Transaction>(firestore ? collection(firestore, 'transactions') : null);
  const { data: cashWithdrawals = [], loading: loadingWithdrawals } = useCollection<CashWithdrawal>(firestore ? collection(firestore, 'cashWithdrawals') : null);
  const { data: storeSettings, loading: loadingSettings } = useDoc<StoreSettings>(firestore ? doc(firestore, 'config/store') : null);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'products'), product);
    } catch (error) {
      console.error("Error adding product: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add product.' });
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    if (!firestore) return;
    try {
      const productRef = doc(firestore, 'products', productId);
      await setDoc(productRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating product: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update product.' });
    }
  };
  
  const updateProductsStock = async (items: { productId: string; quantity: number }[]) => {
      if (!firestore) return;
      const batch = writeBatch(firestore);
      
      items.forEach(item => {
          const productRef = doc(firestore, 'products', item.productId);
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock - item.quantity;
            batch.update(productRef, { stock: newStock });
          }
      });
      
      try {
        await batch.commit();
      } catch (error) {
         console.error("Error updating products stock: ", error);
         toast({ variant: 'destructive', title: 'Error', description: 'Could not update stock.' });
      }
  };

  const deleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'products', productId));
    } catch (error) {
       console.error("Error deleting product: ", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    if (!firestore) return;
     try {
      return await addDoc(collection(firestore, 'customers'), customer);
    } catch (error) {
      console.error("Error adding customer: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add customer.' });
    }
  };
  
  const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
     if (!firestore) return;
     try {
       await setDoc(doc(firestore, 'customers', customerId), data, { merge: true });
     } catch (error) {
       console.error("Error updating customer: ", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Could not update customer.' });
     }
  };

  const updateCustomerDebt = async (customerId: string, amount: number) => {
    if (!firestore) return;
    const customerRef = doc(firestore, 'customers', customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        const newDebt = customer.totalDebt + amount;
        try {
            await setDoc(customerRef, { totalDebt: newDebt }, { merge: true });
        } catch (error) {
            console.error("Error updating customer debt: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update customer debt.' });
        }
    }
  };
  
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
     if (!firestore) return;
      try {
        await addDoc(collection(firestore, 'transactions'), transaction);
      } catch (error) {
        console.error("Error adding transaction: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add transaction.' });
      }
  };

  const setStoreSettings = async (settings: StoreSettings) => {
    if (!firestore) return;
    try {
      await setDoc(doc(firestore, 'config', 'store'), settings);
    } catch (error) {
      console.error("Error setting store settings: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
    }
  };
  
  const addCashWithdrawal = async (withdrawal: Omit<CashWithdrawal, 'id'>) => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'cashWithdrawals'), withdrawal);
    } catch (error) {
      console.error("Error adding cash withdrawal: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add withdrawal.' });
    }
  };

  const value: AppContextType = {
    products,
    customers,
    transactions,
    storeSettings,
    cashWithdrawals,
    loading: loadingProducts || loadingCustomers || loadingTransactions || loadingSettings || loadingWithdrawals,
    
    addProduct,
    updateProduct,
    updateProductsStock,
    deleteProduct,

    addCustomer,
    updateCustomer,
    updateCustomerDebt,
    
    addTransaction,

    setStoreSettings,

    addCashWithdrawal,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

    