
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product, Customer, Transaction, StoreSettings, DailySummary, CashWithdrawal } from '@/lib/types';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  dailySummaries: DailySummary[];
  setDailySummaries: React.Dispatch<React.SetStateAction<DailySummary[]>>;
  cashWithdrawals: CashWithdrawal[];
  setCashWithdrawals: React.Dispatch<React.SetStateAction<CashWithdrawal[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue);
        return parsed;
      } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        localStorage.removeItem(key); 
        return fallback;
      }
    }
  }
  return fallback;
};


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => getInitialState('products', []));
  const [customers, setCustomers] = useState<Customer[]>(() => getInitialState('customers', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('transactions', []));
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(() => getInitialState('dailySummaries', []));
  const [cashWithdrawals, setCashWithdrawals] = useState<CashWithdrawal[]>(() => getInitialState('cashWithdrawals', []));
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getInitialState('storeSettings', {
    storeName: '',
    initialCash: 0,
    initialSetupDone: false,
  }));

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('dailySummaries', JSON.stringify(dailySummaries));
  }, [dailySummaries]);

  useEffect(() => {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
  }, [storeSettings]);
  
  useEffect(() => {
    localStorage.setItem('cashWithdrawals', JSON.stringify(cashWithdrawals));
  }, [cashWithdrawals]);

  return (
    <AppContext.Provider value={{ 
      products, setProducts, 
      customers, setCustomers,
      transactions, setTransactions,
      storeSettings, setStoreSettings,
      dailySummaries, setDailySummaries,
      cashWithdrawals, setCashWithdrawals,
    }}>
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
