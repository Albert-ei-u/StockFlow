export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  stock: number;
  price: number;
  cost: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  _id: string;
  saleNumber: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: string;
  customerName?: string;
  customerEmail?: string;
  salesperson: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Inventory {
  _id: string;
  product: Product;
  currentStock: number;
  lastRestockDate: string;
  movements: InventoryMovement[];
  lowStockAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  type: 'IN' | 'OUT';
  quantity: number;
  reference: string;
  date: string;
  notes?: string;
}

export interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface TopProduct {
  _id: string;
  product: Product;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DailySales {
  _id: string;
  totalSales: number;
  totalOrders: number;
}
