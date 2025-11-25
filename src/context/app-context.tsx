
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Product, Customer, Transaction, StoreSettings, CashWithdrawal } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalDebt'>, debt: number) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;

  storeSettings: StoreSettings | null;
  setStoreSettings: (settings: StoreSettings) => Promise<void>;

  cashWithdrawals: CashWithdrawal[];
  setCashWithdrawals: (withdrawals: CashWithdrawal[]) => void;
  addCashWithdrawal: (withdrawal: Omit<CashWithdrawal, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();

  const { data: products = [], setData: setProducts } = useCollection<Product>(firestore ? collection(firestore, 'products') : null);
  const { data: customers = [], setData: setCustomers } = useCollection<Customer>(firestore ? collection(firestore, 'customers') : null);
  const { data: transactions = [], setData: setTransactions } = useCollection<Transaction>(firestore ? collection(firestore, 'transactions') : null);
  const { data: cashWithdrawals = [], setData: setCashWithdrawals } = useCollection<CashWithdrawal>(firestore ? collection(firestore, 'cashWithdrawals') : null);
  const { data: storeSettings, setData: setStoreSettingsDoc } = useDoc<StoreSettings>(firestore ? doc(firestore, 'config/store') : null);
  
  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'products'), product);
    } catch (error) {
      console.error("Error adding product: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add product.' });
    }
  };

  const updateProduct = async (product: Product) => {
    if (!firestore) return;
    try {
      const productRef = doc(firestore, 'products', product.id);
      await setDoc(productRef, product, { merge: true });
    } catch (error) {
      console.error("Error updating product: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update product.' });
    }
  };
  
  const deleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'products', productId));
    } catch (error)
    {
       console.error("Error deleting product: ", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id' | 'totalDebt'>, debt: number) => {
    if (!firestore) return;
     try {
      const customerWithDebt = { ...customer, totalDebt: debt };
      await addDoc(collection(firestore, 'customers'), customerWithDebt);
    } catch (error) {
      console.error("Error adding customer: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add customer.' });
    }
  };
  
  const updateCustomer = async (customer: Customer) => {
     if (!firestore) return;
     try {
       await setDoc(doc(firestore, 'customers', customer.id), customer, { merge: true });
     } catch (error) {
       console.error("Error updating customer: ", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Could not update customer.' });
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
    setProducts: setProducts as any, // This is a bit of a hack, we should not expose setData directly
    addProduct,
    updateProduct,
    deleteProduct,

    customers,
    setCustomers: setCustomers as any,
    addCustomer,
    updateCustomer,
    
    transactions,
    setTransactions: setTransactions as any,
    addTransaction,

    storeSettings: storeSettings || null,
    setStoreSettings,

    cashWithdrawals,
    setCashWithdrawals: setCashWithdrawals as any,
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
