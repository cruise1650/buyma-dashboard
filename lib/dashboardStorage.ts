import type { Inquiry, InventoryItem, Order } from "./dashboardTypes";

const KEYS = {
  orders: "buyma_dashboard_orders",
  inventory: "buyma_dashboard_inventory",
  inquiries: "buyma_dashboard_inquiries",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("dashboard-data-changed"));
}

export function getOrders(): Order[] {
  return read<Order>(KEYS.orders);
}

export function saveOrders(orders: Order[]) {
  write(KEYS.orders, orders);
}

export function getInventory(): InventoryItem[] {
  return read<InventoryItem>(KEYS.inventory);
}

export function saveInventory(items: InventoryItem[]) {
  write(KEYS.inventory, items);
}

export function getInquiries(): Inquiry[] {
  return read<Inquiry>(KEYS.inquiries);
}

export function saveInquiries(inquiries: Inquiry[]) {
  write(KEYS.inquiries, inquiries);
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
