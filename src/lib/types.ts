export type UserRole = 'pharmacist' | 'assistantPharmacist' | 'cashier' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  nic?: string;
  docId?: string;
  role: UserRole;
  avatar?: string;
}

export type DrugCategory = 
  | 'all'
  | 'antimalarials'
  | 'antibiotics'
  | 'analgesics'
  | 'diabetes'
  | 'pom'
  | 'otc';

export type StockStatus = 'GOOD' | 'EXPIRING' | 'EXPIRED' | 'LOW' | 'OUT_OF_STOCK';

export interface InventoryDrug {
  id: string;
  name: string;
  genericName: string;
  category: DrugCategory;
  quantity: number;
  batchId: string;
  expireDate: string; // ISO string YYYY-MM-DD
  price: number; // Retail selling price
  unitCost: number; // Wholesale unit cost
  supplierEmail: string;
  supplierName: string;
  shelfLocation: string;
  nafdacReg: string;
  imagePath?: string;
  status: StockStatus;
  daysToExpiry: number;
}

export interface Supplier {
  id: string;
  supplierID: string;
  name: string;
  email: string;
  contact: string;
  drugsAvailable: string;
  address?: string;
  rating?: number;
  creditBalance?: number;
  tier?: string;
  verified?: boolean;
}

export interface PrescribedItem {
  drugId?: string;
  drugName: string;
  dosage: string;
  instructions: string;
  quantity: number;
  price: number;
  inStock: boolean;
  notes?: string;
}

export type DoctorOrderStatus = 'pending' | 'verified' | 'completed' | 'flagged' | 'rejected';

export interface DoctorOrder {
  id: string;
  orderNumber: string; // e.g. RX-9821
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  patientWeight: string;
  patientBloodGroup?: string;
  nhisNumber: string;
  address?: string;
  priority: 'stat' | 'pediatric' | 'routine';
  doctorName: string;
  doctorId: string;
  doctorEmail: string;
  doctorContact: string;
  hospital: string;
  folioNumber?: string;
  prescribedItems: PrescribedItem[];
  totalAmount: number;
  pickupDate: string;
  status: DoctorOrderStatus;
  allergyAlert?: string;
  pharmacistNotes?: string;
  pomComplianceChecked?: boolean;
  createdAt: string;
  verifiedAt?: string;
  completedAt?: string;
}

export interface CartItem {
  drug: InventoryDrug;
  quantity: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  transactionNumber: string;
  receiptNumber: string;
  cashierName: string;
  cashierRole: string;
  patientName: string;
  patientNhis?: string;
  items: {
    drugId: string;
    drugName: string;
    batchId: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number; // e.g. 7.5% VAT or 0 if exempt
  discount: number;
  totalPrice: number;
  tenderType: 'CASH' | 'CARD' | 'TRANSFER' | 'HMO';
  paidAmount: number;
  balance: number;
  dateTime: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: {
    drugName: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  totalAmount: number;
  expectedDate: string;
  status: 'draft' | 'submitted' | 'in_transit' | 'received' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface ExpiryClaim {
  id: string;
  claimNumber: string;
  supplierEmail: string;
  supplierName: string;
  drugName: string;
  batchId: string;
  quantity: number;
  unitCost: number;
  totalCredit: number;
  dateIssued: string;
  status: 'pending' | 'credited' | 'replaced';
  emailSent: boolean;
}
