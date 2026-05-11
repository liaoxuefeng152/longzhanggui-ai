export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  role: 'user' | 'admin';
  shopType?: string;
  trialDays: number;
  isPaid: boolean;
  createdAt: Date;
}

export interface Model {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  totalTokens: number;
  dailyLimit: number;
  modelId: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  modelId: string;
  agentId?: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  type: 'customer_service' | 'marketing' | 'content' | 'other';
  description: string;
  status: 'active' | 'inactive';
  modelId: string;
  promptId?: string;
  calls: number;
  successRate: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  packageType: 'trial' | 'basic' | 'pro' | 'enterprise';
  amount: number;
  days: number;
  status: 'pending' | 'paid' | 'expired';
  createdAt: Date;
}

export interface ModelLog {
  id: string;
  userId: string;
  scene: string;
  modelId: string;
  model: string;
  tokens: number;
  status: 'success' | 'failed';
  error?: string;
  createdAt: Date;
}

export interface DashboardStats {
  todayCalls: number;
  onlineUsers: number;
  todayOrders: number;
  referralUsers: number;
  callTrend: Array<{
    date: string;
    calls: number;
  }>;
}
