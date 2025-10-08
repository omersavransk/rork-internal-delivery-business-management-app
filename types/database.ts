export interface User {
  id: string;
  username: string;
  name: string;
  createdAt: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  pricePerDelivery: number;
  balance: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Delivery {
  id: string;
  courierId: string;
  quantity: number;
  totalAmount: number;
  date: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  courierId: string;
  amount: number;
  date: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type ActivityType = 'income' | 'expense' | 'delivery' | 'payment' | 'courier_added' | 'courier_deleted';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  amount?: number;
  relatedId?: string;
  createdBy: string;
  createdAt: string;
}
