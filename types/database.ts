export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  token?: string;
  organization?: Organization;
}

export interface StoredOrganization extends Organization {
  users: StoredUser[];
}

export interface StoredUser extends Omit<User, 'token'> {
  password: string;
}

export interface Income {
  id: string;
  organizationId: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  organizationId: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface Courier {
  id: string;
  organizationId: string;
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
  organizationId: string;
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
  organizationId: string;
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
  organizationId: string;
  type: ActivityType;
  description: string;
  amount?: number;
  relatedId?: string;
  createdBy: string;
  createdAt: string;
}
