export type Plan = "free" | "pro";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete"
  | null;

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  simplicityLevel: number;
  preferredTopics: string[];
  createdAt: Date;
  razorpayCustomerId: string | null;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPeriodEnd: Date | null;
}

export interface SubscriptionInfo {
  plan: Plan;
  status: SubscriptionStatus;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  dailyMessageCount: number;
  dailyMessageLimit: number | null;
}

export interface Subscription {
  id: string;
  userId: string;
  razorpaySubscriptionId: string;
  razorpayPlanId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  razorpayPaymentId: string;
  amountPaid: number;
  currency: string;
  status: string;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  createdAt: Date;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: "light" | "dark" | "system";
  defaultSimplicity: number;
  language: string;
  allowDataImprovement: boolean;
}

export type SimplicitylLevel = 1 | 2 | 3 | 4 | 5;

export const SIMPLICITY_LABELS: Record<number, string> = {
  1: "5 Year Old",
  2: "12 Year Old",
  3: "Standard",
  4: "Advanced",
  5: "Expert",
};

export interface UsageLog {
  id: string;
  userId: string;
  chatId: string;
  assistantMessageId: string | null;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  simplicityLevel: number;
  durationMs: number;
  createdAt: Date;
}
