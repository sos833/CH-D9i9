
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, writeBatch, getDocs, query, DocumentReference, runTransaction } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Product, Customer, Transaction, StoreSettings, CashWithdrawal, Supplier, SupplierTransaction } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AppContextType {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  storeSettings: StoreSettings | null;
  cashWithdrawals: CashWithdrawal[];
  suppliers: Supplier[];
  supplierTransactions: SupplierTransaction[];
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

  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (supplierId: string, data: Partial<Supplier>) => Promise<void>;
  addSupplierTransaction: (transaction: Omit<SupplierTransaction, 'id'>) => Promise<void>;
  
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

  const { data: productsData, loading: loadingProducts, setData: setProducts } = useCollection<Product>(firestore ? collection(firestore, 'products') : null);
  const { data: customersData, loading: loadingCustomers, setData: setCustomers } = useCollection<Customer>(firestore ? collection(firestore, 'customers') : null);
  const { data: transactionsData, loading: loadingTransactions, setData: setTransactions } = useCollection<Transaction>(firestore ? collection(firestore, 'transactions') : null);
  const { data: cashWithdrawalsData, loading: loadingWithdrawals, setData: setCashWithdrawals } = useCollection<CashWithdrawal>(firestore ? collection(firestore, 'cashWithdrawals') : null);
  const { data: suppliersData, loading: loadingSuppliers, setData: setSuppliers } = useCollection<Supplier>(firestore ? collection(firestore, 'suppliers') : null);
  const { data: supplierTransactionsData, loading: loadingSupplierTransactions, setData: setSupplierTransactions } = useCollection<SupplierTransaction>(firestore ? collection(firestore, 'supplierTransactions') : null);
  const { data: storeSettings, loading: loadingSettings, setData: setStoreSettingsData } = useDoc<StoreSettings>(firestore ? doc(firestore, 'config/store') : null);
  
  // Create state for optimistic updates
  const [products, setProductsState] = React.useState<Product[]>([]);
  const [customers, setCustomersState] = React.useState<Customer[]>([]);
  const [transactions, setTransactionsState] = React.useState<Transaction[]>([]);
  const [cashWithdrawals, setCashWithdrawalsState] = React.useState<CashWithdrawal[]>([]);
  const [suppliers, setSuppliersState] = React.useState<Supplier[]>([]);
  const [supplierTransactions, setSupplierTransactionsState] = React.useState<SupplierTransaction[]>([]);

  React.useEffect(() => {
    if (productsData) {
      const sortedProducts = [...productsData].sort((a, b) => a.name.localeCompare(b.name));
      setProductsState(sortedProducts);
    }
  }, [productsData]);
  React.useEffect(() => setCustomersState(customersData), [customersData]);
  React.useEffect(() => setTransactionsState(transactionsData), [transactionsData]);
  React.useEffect(() => setCashWithdrawalsState(cashWithdrawalsData), [cashWithdrawalsData]);
  React.useEffect(() => setSuppliersState(suppliersData), [suppliersData]);
  React.useEffect(() => setSupplierTransactionsState(supplierTransactionsData), [supplierTransactionsData]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!firestore) return;
    const optimisticProduct = { id: `temp-${Date.now()}`, ...product };
    setProductsState(prev => [...prev, optimisticProduct as Product].sort((a,b) => a.name.localeCompare(b.name)));
    try {
      const docRef = await addDoc(collection(firestore, 'products'), product);
      setProducts(prev => prev.map(p => p.id === optimisticProduct.id ? { ...p, id: docRef.id } : p));
    } catch (error) {
        handleFirestoreError(error, {
            path: 'products/{productId}',
            operation: 'create',
            requestResourceData: product
        });
        setProductsState(prev => prev.filter(p => p.id !== optimisticProduct.id));
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    if (!firestore) return;
    const originalProducts = products;
    setProductsState(prev => prev.map(p => p.id === productId ? {...p, ...data} : p));
    try {
      const productRef = doc(firestore, 'products', productId);
      await setDoc(productRef, data, { merge: true });
    } catch (error) {
       handleFirestoreError(error, {
            path: `products/${productId}`,
            operation: 'update',
            requestResourceData: data
        });
        setProductsState(originalProducts);
    }
  };
  
  const updateProductsStock = async (items: { productId: string; quantity: number }[]) => {
      if (!firestore) return;
      const batch = writeBatch(firestore);
      const originalProducts = products;
      
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

      setProductsState(prev => prev.map(p => {
        const update = stockUpdates.find(u => u!.productId === p.id);
        return update ? { ...p, stock: update.newStock } : p;
      }));

      try {
        await batch.commit();
      } catch (error) {
         handleFirestoreError(error, {
            path: `products/{multiple_products}`,
            operation: 'update',
            requestResourceData: { items: stockUpdates }
        });
        setProductsState(originalProducts);
      }
  };

  const deleteProduct = async (productId: string) => {
    if (!firestore) return;
    const originalProducts = products;
    setProductsState(prev => prev.filter(p => p.id !== productId));
    try {
      await deleteDoc(doc(firestore, 'products', productId));
    } catch (error) {
        handleFirestoreError(error, {
            path: `products/${productId}`,
            operation: 'delete'
        });
        setProductsState(originalProducts);
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<DocumentReference | undefined> => {
    if (!firestore) return undefined;
    const optimisticCustomer = { id: `temp-${Date.now()}`, ...customer };
    setCustomersState(prev => [...prev, optimisticCustomer as Customer]);
     try {
      const docRef = await addDoc(collection(firestore, 'customers'), customer);
      setCustomers(prev => prev.map(c => c.id === optimisticCustomer.id ? { ...c, id: docRef.id } : c));
      return docRef;
    } catch (error) {
      handleFirestoreError(error, {
        path: 'customers/{customerId}',
        operation: 'create',
        requestResourceData: customer
      });
      setCustomersState(prev => prev.filter(c => c.id !== optimisticCustomer.id));
      return undefined;
    }
  };
  
  const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
     if (!firestore) return;
     const originalCustomers = customers;
     setCustomersState(prev => prev.map(c => c.id === customerId ? {...c, ...data} : c));
     try {
       await setDoc(doc(firestore, 'customers', customerId), data, { merge: true });
     } catch (error) {
       handleFirestoreError(error, {
            path: `customers/${customerId}`,
            operation: 'update',
            requestResourceData: data
        });
        setCustomersState(originalCustomers);
     }
  };

  const updateCustomerDebt = async (customerId: string, amount: number) => {
    if (!firestore) return;
    const customerRef = doc(firestore, 'customers', customerId);
    const customer = customers.find(c => c.id === customerId);

    if (customer) {
        const newDebt = customer.totalDebt + amount;
        const originalCustomers = customers;
        setCustomersState(prev => prev.map(c => c.id === customerId ? {...c, totalDebt: newDebt} : c));
        try {
            await setDoc(customerRef, { totalDebt: newDebt }, { merge: true });
        } catch (error) {
            handleFirestoreError(error, {
                path: `customers/${customerId}`,
                operation: 'update',
                requestResourceData: { totalDebt: newDebt }
            });
            setCustomersState(originalCustomers);
        }
    }
  };
  
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
     if (!firestore) return;
     const optimisticTransaction = { id: `temp-${Date.now()}`, ...transaction };
     setTransactionsState(prev => [...prev, optimisticTransaction as Transaction]);
      try {
        const docRef = await addDoc(collection(firestore, 'transactions'), transaction);
        setTransactions(prev => prev.map(t => t.id === optimisticTransaction.id ? { ...t, id: docRef.id } : t));
      } catch (error) {
        handleFirestoreError(error, {
            path: 'transactions/{transactionId}',
            operation: 'create',
            requestResourceData: transaction
        });
        setTransactionsState(prev => prev.filter(t => t.id !== optimisticTransaction.id));
      }
  };

  const setStoreSettings = async (settings: StoreSettings) => {
    if (!firestore) return;
    const originalSettings = storeSettings;
    setStoreSettingsData(settings);
    try {
      await setDoc(doc(firestore, 'config', 'store'), settings);
    } catch (error) {
      handleFirestoreError(error, {
            path: 'config/store',
            operation: 'update', // setDoc can be create or update
            requestResourceData: settings
      });
      if(originalSettings) setStoreSettingsData(originalSettings);
    }
  };
  
  const addCashWithdrawal = async (withdrawal: Omit<CashWithdrawal, 'id'>) => {
    if (!firestore) return;
    const optimisticWithdrawal = { id: `temp-${Date.now()}`, ...withdrawal };
    setCashWithdrawalsState(prev => [...prev, optimisticWithdrawal as CashWithdrawal]);
    try {
      const docRef = await addDoc(collection(firestore, 'cashWithdrawals'), withdrawal);
      setCashWithdrawals(prev => prev.map(w => w.id === optimisticWithdrawal.id ? { ...w, id: docRef.id } : w));
    } catch (error) {
      handleFirestoreError(error, {
        path: 'cashWithdrawals/{withdrawalId}',
        operation: 'create',
        requestResourceData: withdrawal
      });
      setCashWithdrawalsState(prev => prev.filter(w => w.id !== optimisticWithdrawal.id));
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    if (!firestore) return;
    const optimisticSupplier = { id: `temp-${Date.now()}`, ...supplier };
    setSuppliersState(prev => [...prev, optimisticSupplier as Supplier]);
    try {
      const docRef = await addDoc(collection(firestore, 'suppliers'), supplier);
      setSuppliers(prev => prev.map(s => s.id === optimisticSupplier.id ? { ...s, id: docRef.id } : s));
    } catch (error) {
      handleFirestoreError(error, { path: 'suppliers/{supplierId}', operation: 'create', requestResourceData: supplier });
      setSuppliersState(prev => prev.filter(s => s.id !== optimisticSupplier.id));
    }
  };
  
  const updateSupplier = async (supplierId: string, data: Partial<Supplier>) => {
    if (!firestore) return;
    const originalSuppliers = suppliers;
    setSuppliersState(prev => prev.map(s => s.id === supplierId ? {...s, ...data} : s));
    try {
      await setDoc(doc(firestore, 'suppliers', supplierId), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, { path: `suppliers/${supplierId}`, operation: 'update', requestResourceData: data });
      setSuppliersState(originalSuppliers);
    }
  };

  const addSupplierTransaction = async (transaction: Omit<SupplierTransaction, 'id'>) => {
    if (!firestore) return;

    try {
      await runTransaction(firestore, async (firestoreTransaction) => {
        const supplierRef = doc(firestore, "suppliers", transaction.supplierId);
        const supplierDoc = await firestoreTransaction.get(supplierRef);
        if (!supplierDoc.exists()) {
          throw "Supplier not found!";
        }
        
        const currentDebt = supplierDoc.data().totalDebt;
        const newDebt = transaction.type === 'purchase' ? currentDebt + transaction.amount : currentDebt - transaction.amount;
        
        firestoreTransaction.update(supplierRef, { totalDebt: newDebt });
        
        const transactionRef = doc(collection(firestore, `suppliers/${transaction.supplierId}/transactions`));
        firestoreTransaction.set(transactionRef, transaction);
      });
      
      // No client-side optimistic update for transactions for now, let Firestore sync handle it.
      // This is safer for transactional operations.
      // We can add optimistic updates later if needed.

    } catch (error) {
       handleFirestoreError(error, {
        path: `suppliers/${transaction.supplierId}/transactions`,
        operation: 'create',
        requestResourceData: transaction
      });
    }
  };
  
  const resetStore = async () => {
    if (!firestore) return;

    const collectionsToDelete = ['products', 'customers', 'transactions', 'cashWithdrawals', 'suppliers'];
    
    try {
      const batch = writeBatch(firestore);

      for (const coll of collectionsToDelete) {
        const snapshot = await getDocs(query(collection(firestore, coll)));
        snapshot.docs.forEach(doc => {
          // Need to delete subcollections for suppliers
          if (coll === 'suppliers') {
            const transactionCollRef = collection(firestore, `suppliers/${doc.id}/transactions`);
            getDocs(transactionCollRef).then(subSnapshot => {
                subSnapshot.forEach(subDoc => batch.delete(subDoc.ref));
            })
          }
          batch.delete(doc.ref);
        });
      }

      const storeConfigRef = doc(firestore, 'config', 'store');
      batch.set(storeConfigRef, { initialSetupDone: false, storeName: '', initialCash: 0 });

      await batch.commit();

      setProductsState([]);
      setCustomersState([]);
      setTransactionsState([]);
      setCashWithdrawalsState([]);
      setSuppliersState([]);
      setSupplierTransactionsState([]);
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
    suppliers,
    supplierTransactions,
    loading: loadingProducts || loadingCustomers || loadingTransactions || loadingSettings || loadingWithdrawals || loadingSuppliers || loadingSupplierTransactions,
    
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

    addSupplier,
    updateSupplier,
    addSupplierTransaction,

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
