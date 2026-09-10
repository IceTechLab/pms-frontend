import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  InventoryDrug,
  Supplier,
  DoctorOrder,
  Sale,
  User,
  PurchaseOrder,
  ExpiryClaim,
  CartItem,
  UserRole,
  StockStatus
} from './types';
import { api } from './api';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const FALLBACK_USER: User = {
  id: 'USR-001',
  name: 'Admin',
  email: 'admin@pms.com',
  contact: '',
  role: 'pharmacist',
};

interface PharmacyContextType {
  // Bootstrap
  ready: boolean;

  // Auth & Roles
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Inventory
  inventory: InventoryDrug[];
  addDrug: (drug: Omit<InventoryDrug, 'id' | 'status' | 'daysToExpiry'>) => void;
  updateDrug: (id: string, drug: Partial<InventoryDrug>) => void;
  deleteDrug: (id: string) => void;
  receiveStock: (id: string, addedQty: number, newBatch?: string, newExpiry?: string) => void;

  // POS & Cart
  cart: CartItem[];
  addToCart: (drug: InventoryDrug, qty?: number) => void;
  removeFromCart: (drugId: string) => void;
  updateCartQuantity: (drugId: string, quantity: number) => void;
  clearCart: () => void;
  processSale: (details: {
    patientName: string;
    patientNhis?: string;
    tenderType: 'CASH' | 'CARD' | 'TRANSFER' | 'HMO';
    paidAmount: number;
    discount?: number;
    isTaxExempt?: boolean;
  }) => Sale;

  // Doctor Orders
  doctorOrders: DoctorOrder[];
  createDoctorOrder: (order: Omit<DoctorOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => DoctorOrder;
  verifyDoctorOrder: (id: string, notes?: string) => void;
  rejectDoctorOrder: (id: string, reason?: string) => void;
  sendOrderToPos: (orderId: string) => void;
  pickupDoctorOrder: (id: string) => void;

  // Suppliers & Procurement
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => void;
  receivePurchaseOrder: (poId: string) => void;

  // Expiry Claims
  expiryClaims: ExpiryClaim[];
  submitExpiryClaim: (drugId: string, quantity: number) => void;

  // Sales
  sales: Sale[];

  // Toasts
  toasts: ToastNotification[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // Search
  globalSearch: string;
  setGlobalSearch: (s: string) => void;

  // Stats
  metrics: {
    totalRevenue: number;
    rxCount: number;
    totalInventoryValue: number;
    expiringCount: number;
    oosCount: number;
    lowStockCount: number;
    pendingDocOrders: number;
    verifiedDocOrders: number;
  };
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

function calculateStatus(quantity: number, expireDate: string): { status: StockStatus; daysToExpiry: number } {
  const now = new Date();
  const exp = new Date(expireDate);
  const diffTime = exp.getTime() - now.getTime();
  const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: StockStatus = 'GOOD';
  if (quantity <= 0) {
    status = 'OUT_OF_STOCK';
  } else if (daysToExpiry <= 0) {
    status = 'EXPIRED';
  } else if (daysToExpiry <= 60) {
    status = 'EXPIRING';
  } else if (quantity <= 15) {
    status = 'LOW';
  }

  return { status, daysToExpiry };
}

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  const [currentUser, setCurrentUser] = useState<User>(FALLBACK_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryDrug[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [doctorOrders, setDoctorOrders] = useState<DoctorOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [expiryClaims, setExpiryClaims] = useState<ExpiryClaim[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Toast Helper
  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Report a persistence failure without breaking the optimistic UI update.
  const failToast = useCallback((action: string, err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    showToast(`${action} could not be saved`, `${message}. Check the server connection and retry.`, 'error');
  }, [showToast]);

  // Hydrate all collections from the Express API on first mount.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [u, inv, sup, ord, sls, po, claims] = await Promise.all([
          api.get<{ users: User[] }>('/users'),
          api.get<{ inventory: InventoryDrug[] }>('/inventory'),
          api.get<{ suppliers: Supplier[] }>('/suppliers'),
          api.get<{ doctorOrders: DoctorOrder[] }>('/doctor-orders'),
          api.get<{ sales: Sale[] }>('/sales'),
          api.get<{ purchaseOrders: PurchaseOrder[] }>('/purchase-orders'),
          api.get<{ expiryClaims: ExpiryClaim[] }>('/expiry-claims'),
        ]);
        if (!active) return;

        setUsers(u.users);
        setInventory(inv.inventory);
        setSuppliers(sup.suppliers);
        setDoctorOrders(ord.doctorOrders);
        setSales(sls.sales);
        setPurchaseOrders(po.purchaseOrders);
        setExpiryClaims(claims.expiryClaims);

        // Restore last active user by id if available, else default account.
        let nextUser = u.users[0] ?? FALLBACK_USER;
        try {
          const lastId = localStorage.getItem('pharmacare_currentUser_id');
          const match = lastId ? u.users.find(x => x.id === lastId) : undefined;
          if (match) nextUser = match;
        } catch { /* ignore */ }
        setCurrentUser(nextUser);
      } catch (err) {
        if (active) {
          failToast('Data load', err);
        }
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [failToast]);

  // Remember the active user id between reloads (client-side convenience only).
  useEffect(() => {
    try {
      localStorage.setItem('pharmacare_currentUser_id', currentUser.id);
    } catch { /* ignore */ }
  }, [currentUser]);

  // Auth
  const switchRole = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast('Shift Changed', `Active session switched to ${found.name} (${found.role})`, 'info');
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'USR-' + (users.length + 1).toString().padStart(3, '0')
    };
    setUsers(prev => [...prev, newUser]);
    showToast('Account Created', `Created user ${newUser.name} with role ${newUser.role}`);
    api.post('/users', newUser).catch(err => failToast('Account creation', err));
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const nextUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
    const updated = nextUsers.find(u => u.id === id);
    setUsers(nextUsers);
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...userData }));
    }
    showToast('Account Updated', 'User credentials and permissions saved');
    if (updated) {
      api.put(`/users/${id}`, updated).catch(err => failToast('Account update', err));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('Account Removed', 'User account successfully deleted', 'warning');
    api.delete(`/users/${id}`).catch(err => failToast('Account removal', err));
  };

  // Inventory
  const addDrug = (drugData: Omit<InventoryDrug, 'id' | 'status' | 'daysToExpiry'>) => {
    const { status, daysToExpiry } = calculateStatus(drugData.quantity, drugData.expireDate);
    const newDrug: InventoryDrug = {
      ...drugData,
      id: 'med-' + Date.now(),
      status,
      daysToExpiry
    };
    setInventory(prev => [newDrug, ...prev]);
    showToast('Stock Received', `Added ${newDrug.name} (${newDrug.quantity} units) to inventory`);
    api.post('/inventory', newDrug).catch(err => failToast('Stock receive', err));
  };

  const updateDrug = (id: string, drugData: Partial<InventoryDrug>) => {
    const nextInventory = inventory.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...drugData };
      const { status, daysToExpiry } = calculateStatus(updated.quantity, updated.expireDate);
      return { ...updated, status, daysToExpiry };
    });
    const updated = nextInventory.find(i => i.id === id);
    setInventory(nextInventory);
    showToast('Inventory Updated', 'Drug formulation record updated');
    if (updated) {
      api.put(`/inventory/${id}`, updated).catch(err => failToast('Inventory update', err));
    }
  };

  const deleteDrug = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Drug Removed', 'Medicine archived from active dispensary inventory', 'warning');
    api.delete(`/inventory/${id}`).catch(err => failToast('Drug removal', err));
  };

  const receiveStock = (id: string, addedQty: number, newBatch?: string, newExpiry?: string) => {
    const nextInventory = inventory.map(item => {
      if (item.id !== id) return item;
      const newQty = item.quantity + addedQty;
      const newExp = newExpiry || item.expireDate;
      const { status, daysToExpiry } = calculateStatus(newQty, newExp);
      return {
        ...item,
        quantity: newQty,
        batchId: newBatch || item.batchId,
        expireDate: newExp,
        status,
        daysToExpiry
      };
    });
    const updated = nextInventory.find(i => i.id === id);
    setInventory(nextInventory);
    showToast('Restocked Successfully', `Added ${addedQty} units to inventory`);
    if (updated) {
      api.put(`/inventory/${id}`, updated).catch(err => failToast('Restock', err));
    }
  };

  // POS Cart
  const addToCart = (drug: InventoryDrug, qty: number = 1) => {
    if (drug.quantity <= 0) {
      showToast('Out of Stock', `${drug.name} is currently out of stock`, 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.drug.id === drug.id);
      if (existing) {
        const targetQty = existing.quantity + qty;
        if (targetQty > drug.quantity) {
          showToast('Stock Limit Reached', `Only ${drug.quantity} packs available in dispensary`, 'warning');
          return prev;
        }
        return prev.map(i => i.drug.id === drug.id ? { ...i, quantity: targetQty, lineTotal: targetQty * drug.price } : i);
      } else {
        return [...prev, { drug, quantity: qty, lineTotal: qty * drug.price }];
      }
    });
  };

  const removeFromCart = (drugId: string) => {
    setCart(prev => prev.filter(i => i.drug.id !== drugId));
  };

  const updateCartQuantity = (drugId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(drugId);
      return;
    }
    const drug = inventory.find(d => d.id === drugId);
    if (drug && quantity > drug.quantity) {
      showToast('Exceeds Stock', `Maximum available is ${drug.quantity}`, 'warning');
      return;
    }
    setCart(prev => prev.map(i => i.drug.id === drugId ? { ...i, quantity, lineTotal: quantity * i.drug.price } : i));
  };

  const clearCart = () => {
    setCart([]);
  };

  const processSale = (details: {
    patientName: string;
    patientNhis?: string;
    tenderType: 'CASH' | 'CARD' | 'TRANSFER' | 'HMO';
    paidAmount: number;
    discount?: number;
    isTaxExempt?: boolean;
  }): Sale => {
    const subtotal = cart.reduce((acc, item) => acc + item.lineTotal, 0);
    const discount = details.discount || 0;
    const taxRate = details.isTaxExempt ? 0 : 0.075; // FIRS 7.5% VAT
    const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
    const totalPrice = Math.round((subtotal - discount + tax) * 100) / 100;
    const balance = Math.max(0, details.paidAmount - totalPrice);

    const now = new Date();
    const txNum = 'TX-' + now.getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const rcpNum = 'RCP-' + Math.floor(1000 + Math.random() * 9000);

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      transactionNumber: txNum,
      receiptNumber: rcpNum,
      cashierName: currentUser.name,
      cashierRole: currentUser.role,
      patientName: details.patientName || 'Walk-in Customer',
      patientNhis: details.patientNhis,
      items: cart.map(c => ({
        drugId: c.drug.id,
        drugName: c.drug.name,
        batchId: c.drug.batchId,
        quantity: c.quantity,
        price: c.drug.price,
        total: c.lineTotal
      })),
      subtotal,
      tax,
      discount,
      totalPrice,
      tenderType: details.tenderType,
      paidAmount: details.paidAmount,
      balance,
      dateTime: now.toISOString()
    };

    // Deduct stock from inventory (single derived pass keeps math consistent).
    const nextInventory = inventory.map(d => {
      const soldItem = cart.find(c => c.drug.id === d.id);
      if (soldItem) {
        const remaining = Math.max(0, d.quantity - soldItem.quantity);
        const { status, daysToExpiry } = calculateStatus(remaining, d.expireDate);
        return { ...d, quantity: remaining, status, daysToExpiry };
      }
      return d;
    });

    setInventory(nextInventory);
    setSales(prev => [newSale, ...prev]);
    setCart([]);
    showToast('Transaction Completed', `Receipt #${rcpNum} printed · ₦${totalPrice.toLocaleString()} settled`);

    // Persist sale and stock movements.
    api.post('/sales', newSale).catch(err => failToast('Sale', err));
    cart.forEach(c => {
      const updated = nextInventory.find(d => d.id === c.drug.id);
      if (updated) {
        api.put(`/inventory/${updated.id}`, updated).catch(err => failToast('Stock deduction', err));
      }
    });

    return newSale;
  };

  // Doctor Orders
  const createDoctorOrder = (orderData: Omit<DoctorOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => {
    const num = 'RX-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: DoctorOrder = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: num,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setDoctorOrders(prev => [newOrder, ...prev]);
    showToast('Prescription Ingested', `Order #${num} for ${newOrder.patientName} submitted to clinical queue`);
    api.post('/doctor-orders', newOrder).catch(err => failToast('Prescription submission', err));
    return newOrder;
  };

  const verifyDoctorOrder = (id: string, notes?: string) => {
    const nextOrders = doctorOrders.map(ord => {
      if (ord.id !== id) return ord;
      return {
        ...ord,
        status: 'verified' as const,
        pomComplianceChecked: true,
        pharmacistNotes: notes || ord.pharmacistNotes,
        verifiedAt: new Date().toISOString()
      };
    });
    const updated = nextOrders.find(o => o.id === id);
    setDoctorOrders(nextOrders);
    showToast('Order Verified', 'Clinical checks passed & POM regulatory sign-off recorded');
    if (updated) {
      api.put(`/doctor-orders/${id}`, updated).catch(err => failToast('Order verification', err));
    }
  };

  const rejectDoctorOrder = (id: string, reason?: string) => {
    const nextOrders = doctorOrders.map(ord => {
      if (ord.id !== id) return ord;
      return {
        ...ord,
        status: 'rejected' as const,
        pharmacistNotes: `Rejected: ${reason || 'Prescription clarification required'}`
      };
    });
    const updated = nextOrders.find(o => o.id === id);
    setDoctorOrders(nextOrders);
    showToast('Order Rejected', 'Order marked as rejected. Notified physician.', 'error');
    if (updated) {
      api.put(`/doctor-orders/${id}`, updated).catch(err => failToast('Order rejection', err));
    }
  };

  const sendOrderToPos = (orderId: string) => {
    const order = doctorOrders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status !== 'verified') {
      verifyDoctorOrder(orderId);
    }

    let addedCount = 0;
    order.prescribedItems.forEach(item => {
      const drug = inventory.find(d => d.id === item.drugId || d.name.toLowerCase().includes(item.drugName.toLowerCase()));
      if (drug) {
        addToCart(drug, item.quantity);
        addedCount++;
      }
    });

    showToast('Pushed to POS', `Loaded ${addedCount} prescribed items for ${order.patientName} into POS Cart`);
  };

  const pickupDoctorOrder = (id: string) => {
    const nextOrders = doctorOrders.map(ord => {
      if (ord.id !== id) return ord;
      return {
        ...ord,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      };
    });
    const updated = nextOrders.find(o => o.id === id);
    setDoctorOrders(nextOrders);
    showToast('Order Picked Up', 'Order completed and patient collection recorded');
    if (updated) {
      api.put(`/doctor-orders/${id}`, updated).catch(err => failToast('Order completion', err));
    }
  };

  // Suppliers
  const addSupplier = (supData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supData,
      id: 'sup-' + Date.now(),
      rating: 5.0,
      creditBalance: 0,
      verified: true
    };
    setSuppliers(prev => [...prev, newSup]);
    showToast('Supplier Registered', `${newSup.name} added to approved procurement directory`);
    api.post('/suppliers', newSup).catch(err => failToast('Supplier registration', err));
  };

  const updateSupplier = (id: string, supData: Partial<Supplier>) => {
    const nextSuppliers = suppliers.map(s => s.id === id ? { ...s, ...supData } : s);
    const updated = nextSuppliers.find(s => s.id === id);
    setSuppliers(nextSuppliers);
    showToast('Supplier Updated', 'Vendor records and terms updated');
    if (updated) {
      api.put(`/suppliers/${id}`, updated).catch(err => failToast('Supplier update', err));
    }
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    showToast('Supplier Removed', 'Vendor deleted from directory', 'warning');
    api.delete(`/suppliers/${id}`).catch(err => failToast('Supplier removal', err));
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => {
    const num = 'PO-2026-' + Math.floor(100 + Math.random() * 900);
    const newPo: PurchaseOrder = {
      ...poData,
      id: 'po-' + Date.now(),
      poNumber: num,
      createdAt: new Date().toISOString()
    };
    setPurchaseOrders(prev => [newPo, ...prev]);
    showToast('Purchase Order Created', `Dispatched electronic PO #${num} to ${poData.supplierName}`);
    api.post('/purchase-orders', newPo).catch(err => failToast('Purchase order creation', err));
  };

  const receivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    // Derive a single inventory snapshot so every PO line applies correctly.
    const nextInventory = inventory.map(d => {
      const line = po.items.find(item =>
        d.name.toLowerCase().includes(item.drugName.toLowerCase()) ||
        item.drugName.toLowerCase().includes(d.name.toLowerCase())
      );
      if (!line) return d;
      const newQty = d.quantity + line.quantity;
      const { status, daysToExpiry } = calculateStatus(newQty, d.expireDate);
      return { ...d, quantity: newQty, status, daysToExpiry };
    });
    const changed = nextInventory.filter((d, i) => d.quantity !== inventory[i].quantity);
    const nextPOs = purchaseOrders.map(p => p.id === poId ? { ...p, status: 'received' as const } : p);
    const updatedPo = nextPOs.find(p => p.id === poId);

    setInventory(nextInventory);
    setPurchaseOrders(nextPOs);
    showToast('Consignment Received', `PO #${po.poNumber} stock received into dispensary inventory`);

    changed.forEach(d => {
      api.put(`/inventory/${d.id}`, d).catch(err => failToast('Consignment receive', err));
    });
    if (updatedPo) {
      api.put(`/purchase-orders/${poId}`, updatedPo).catch(err => failToast('Consignment receive', err));
    }
  };

  // Expiry Claims & Supplier Email
  const submitExpiryClaim = (drugId: string, quantity: number) => {
    const drug = inventory.find(d => d.id === drugId);
    if (!drug) return;

    const claimNum = 'CLM-' + drug.batchId.replace('BAT-', '') + '-' + Math.floor(100 + Math.random() * 900);
    const totalCredit = quantity * drug.unitCost;

    const newClaim: ExpiryClaim = {
      id: 'claim-' + Date.now(),
      claimNumber: claimNum,
      supplierEmail: drug.supplierEmail,
      supplierName: drug.supplierName,
      drugName: drug.name,
      batchId: drug.batchId,
      quantity,
      unitCost: drug.unitCost,
      totalCredit,
      dateIssued: new Date().toISOString().split('T')[0],
      status: 'pending',
      emailSent: true
    };

    setExpiryClaims(prev => [newClaim, ...prev]);

    const nextSuppliers = suppliers.map(s => {
      if (s.email === drug.supplierEmail || s.name === drug.supplierName) {
        return { ...s, creditBalance: (s.creditBalance || 0) + totalCredit };
      }
      return s;
    });
    setSuppliers(nextSuppliers);

    showToast(
      'Email Sent to Supplier',
      `Sent warranty recall claim #${claimNum} (₦${totalCredit.toLocaleString()}) to ${drug.supplierEmail}`,
      'info'
    );

    api.post('/expiry-claims', newClaim).catch(err => failToast('Warranty claim', err));
    nextSuppliers.forEach((s, i) => {
      if (s.creditBalance !== suppliers[i]?.creditBalance) {
        api.put(`/suppliers/${s.id}`, s).catch(err => failToast('Supplier credit', err));
      }
    });
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
    const rxCount = sales.length + doctorOrders.filter(o => o.status === 'completed').length;
    const totalInventoryValue = inventory.reduce((acc, d) => acc + (d.quantity * d.price), 0);
    const expiringCount = inventory.filter(d => d.status === 'EXPIRING').length;
    const oosCount = inventory.filter(d => d.status === 'OUT_OF_STOCK').length;
    const lowStockCount = inventory.filter(d => d.status === 'LOW').length;
    const pendingDocOrders = doctorOrders.filter(o => o.status === 'pending').length;
    const verifiedDocOrders = doctorOrders.filter(o => o.status === 'verified').length;

    return {
      totalRevenue,
      rxCount,
      totalInventoryValue,
      expiringCount,
      oosCount,
      lowStockCount,
      pendingDocOrders,
      verifiedDocOrders
    };
  }, [sales, inventory, doctorOrders]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-3xl text-emerald-100">local_pharmacy</span>
          </div>
          <div className="text-sm font-semibold text-slate-700 mb-1">Connecting to dispensary server…</div>
          <div className="text-xs text-slate-400">Loading inventory, prescriptions &amp; sales ledger</div>
        </div>
      </div>
    );
  }

  return (
    <PharmacyContext.Provider
      value={{
        ready,
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        addUser,
        updateUser,
        deleteUser,
        inventory,
        addDrug,
        updateDrug,
        deleteDrug,
        receiveStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        processSale,
        doctorOrders,
        createDoctorOrder,
        verifyDoctorOrder,
        rejectDoctorOrder,
        sendOrderToPos,
        pickupDoctorOrder,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        purchaseOrders,
        createPurchaseOrder,
        receivePurchaseOrder,
        expiryClaims,
        submitExpiryClaim,
        sales,
        toasts,
        showToast,
        dismissToast,
        globalSearch,
        setGlobalSearch,
        metrics
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
}
