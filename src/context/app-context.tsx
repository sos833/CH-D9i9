"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, writeBatch, getDocs, query, DocumentReference } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Product, Customer, Transaction, StoreSettings, CashWithdrawal } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  resetStore: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const handleFirestoreError = (error: any, context: { path: string, operation: 'create' | 'update' | 'delete' | 'list' | 'get', requestResourceData?: any }) => {
    if (error.code === 'permission-denied') {
        const customError = new FirestorePermissionError(context);
        errorEmitter.emit('permission-error', customError);
    } else {
        console.error(`Error during ${context.operation} on ${context.path}:`, error);
        toast({ variant: 'destructive', title: 'Firestore Error', description: `Could not perform ${context.operation} operation.` });
    }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();

  const { data: products = [], loading: loadingProducts, setData: setProducts } = useCollection<Product>(firestore ? collection(firestore, 'products') : null);
  const { data: customers = [], loading: loadingCustomers, setData: setCustomers } = useCollection<Customer>(firestore ? collection(firestore, 'customers') : null);
  const { data: transactions = [], loading: loadingTransactions, setData: setTransactions } = useCollection<Transaction>(firestore ? collection(firestore, 'transactions') : null);
  const { data: cashWithdrawals = [], loading: loadingWithdrawals, setData: setCashWithdrawals } = useCollection<CashWithdrawal>(firestore ? collection(firestore, 'cashWithdrawals') : null);
  const { data: storeSettings, loading: loadingSettings, setData: setStoreSettingsData } = useDoc<StoreSettings>(firestore ? doc(firestore, 'config/store') : null);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!firestore) return;
    try {
      const docRef = await addDoc(collection(firestore, 'products'), product);
      setProducts(prev => [...prev, {id: docRef.id, ...product}]);
    } catch (error) {
        handleFirestoreError(error, {
            path: 'products/{productId}',
            operation: 'create',
            requestResourceData: product
        });
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    if (!firestore) return;
    try {
      const productRef = doc(firestore, 'products', productId);
      await setDoc(productRef, data, { merge: true });
      setProducts(prev => prev.map(p => p.id === productId ? {...p, ...data} : p));
    } catch (error) {
       handleFirestoreError(error, {
            path: `products/${productId}`,
            operation: 'update',
            requestResourceData: data
        });
    }
  };
  
  const updateProductsStock = async (items: { productId: string; quantity: number }[]) => {
      if (!firestore) return;
      const batch = writeBatch(firestore);
      
      const stockUpdates = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          const productRef = doc(firestore, 'products', item.productId);
          batch.update(productRef, { stock: newStock });
          return { productId: item.productId, newStock };
        }
        return null;
      }).filter(Boolean);

      try {
        await batch.commit();
        setProducts(prev => prev.map(p => {
          const update = stockUpdates.find(u => u!.productId === p.id);
          return update ? { ...p, stock: update.newStock } : p;
        }));
      } catch (error) {
         handleFirestoreError(error, {
            path: `products/{multiple_products}`,
            operation: 'update',
            requestResourceData: { items: stockUpdates }
        });
      }
  };

  const deleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
        handleFirestoreError(error, {
            path: `products/${productId}`,
            operation: 'delete'
        });
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<DocumentReference | undefined> => {
    if (!firestore) return undefined;
     try {
      const docRef = await addDoc(collection(firestore, 'customers'), customer);
      setCustomers(prev => [...prev, {id: docRef.id, ...customer}]);
      return docRef;
    } catch (error) {
      handleFirestoreError(error, {
        path: 'customers/{customerId}',
        operation: 'create',
        requestResourceData: customer
      });
      return undefined;
    }
  };
  
  const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
     if (!firestore) return;
     try {
       await setDoc(doc(firestore, 'customers', customerId), data, { merge: true });
       setCustomers(prev => prev.map(c => c.id === customerId ? {...c, ...data} : c));
     } catch (error) {
       handleFirestoreError(error, {
            path: `customers/${customerId}`,
            operation: 'update',
            requestResourceData: data
        });
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
            setCustomers(prev => prev.map(c => c.id === customerId ? {...c, totalDebt: newDebt} : c));
        } catch (error) {
            handleFirestoreError(error, {
                path: `customers/${customerId}`,
                operation: 'update',
                requestResourceData: { totalDebt: newDebt }
            });
        }
    }
  };
  
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
     if (!firestore) return;
      try {
        const docRef = await addDoc(collection(firestore, 'transactions'), transaction);
        setTransactions(prev => [...prev, {id: docRef.id, ...transaction}]);
      } catch (error) {
        handleFirestoreError(error, {
            path: 'transactions/{transactionId}',
            operation: 'create',
            requestResourceData: transaction
        });
      }
  };

  const setStoreSettings = async (settings: StoreSettings) => {
    if (!firestore) return;
    try {
      await setDoc(doc(firestore, 'config', 'store'), settings);
      setStoreSettingsData(settings);
    } catch (error) {
      handleFirestoreError(error, {
            path: 'config/store',
            operation: 'update', // setDoc can be create or update
            requestResourceData: settings
      });
    }
  };
  
  const addCashWithdrawal = async (withdrawal: Omit<CashWithdrawal, 'id'>) => {
    if (!firestore) return;
    try {
      const docRef = await addDoc(collection(firestore, 'cashWithdrawals'), withdrawal);
      setCashWithdrawals(prev => [...prev, {id: docRef.id, ...withdrawal}]);
    } catch (error) {
      handleFirestoreError(error, {
        path: 'cashWithdrawals/{withdrawalId}',
        operation: 'create',
        requestResourceData: withdrawal
      });
    }
  };

  const resetStore = async () => {
    if (!firestore) return;

    const collectionsToDelete = ['products', 'customers', 'transactions', 'cashWithdrawals', 'suppliers', 'purchases'];
    
    try {
      const batch = writeBatch(firestore);

      for (const coll of collectionsToDelete) {
        const snapshot = await getDocs(query(collection(firestore, coll)));
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      const storeConfigRef = doc(firestore, 'config', 'store');
      batch.set(storeConfigRef, { initialSetupDone: false, storeName: '', initialCash: 0 });

      await batch.commit();

      setProducts([]);
      setCustomers([]);
      setTransactions([]);
      setCashWithdrawals([]);
      setStoreSettingsData({ initialSetupDone: false, storeName: '', initialCash: 0 });

    } catch (error: any) {
      console.error("Error resetting store:", error);
      handleFirestoreError(error, {
        path: 'multiple collections',
        operation: 'delete',
      });
      throw error;
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

    resetStore,
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
