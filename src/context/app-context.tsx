
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product, Customer, Transaction, StoreSettings, DailySummary } from '@/lib/types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        // A simple migration for old data structure if needed.
        // For example, if a new required field was added to a type.
        // This is a placeholder for any future data migrations.
        const parsed = JSON.parse(storedValue);
        return parsed;
      } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        // If parsing fails, it might be due to old data format.
        // Clearing the specific item can be a recovery strategy.
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
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getInitialState('storeSettings', {
    storeName: '',
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

  return (
    <AppContext.Provider value={{ 
      products, setProducts, 
      customers, setCustomers,
      transactions, setTransactions,
      storeSettings, setStoreSettings,
      dailySummaries, setDailySummaries
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
