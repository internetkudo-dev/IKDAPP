// Simple in-memory + file-backed store for demo account purchases.
// In production you should replace this with a real database.

import fs from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), "data", "account-purchases.json");

function ensureStoreFile() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
      fs.writeFileSync(STORE_FILE, JSON.stringify({ purchases: [] }, null, 2));
    }
  } catch {
    // fail silently – we'll fall back to in-memory only
  }
}

let memoryStore = { purchases: [] };

function loadStore() {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw || "{}");
    memoryStore = {
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : []
    };
  } catch {
    // ignore parse errors, keep memoryStore as-is
  }
}

function saveStore() {
  try {
    ensureStoreFile();
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ purchases: memoryStore.purchases }, null, 2),
      "utf8"
    );
  } catch {
    // ignore write errors in demo mode
  }
}

export function addPurchase(purchase) {
  if (!purchase || !purchase.email || !purchase.iccid) return;

  if (!memoryStore.purchases) {
    memoryStore.purchases = [];
  }

  const basePrice =
    typeof purchase.basePrice === "number"
      ? purchase.basePrice
      : typeof purchase.amount === "number"
      ? purchase.amount
      : 0;

  const effectivePrice =
    typeof purchase.effectivePrice === "number"
      ? purchase.effectivePrice
      : basePrice;

  const record = {
    id: purchase.id || `order-${Date.now()}`,
    email: purchase.email.toLowerCase(),
    iccid: purchase.iccid,
    packageTemplateId: purchase.packageTemplateId || null,
    packageName: purchase.packageName || "",
    basePrice,
    effectivePrice,
    cashbackAmount:
      typeof purchase.cashbackAmount === "number"
        ? purchase.cashbackAmount
        : 0,
    discountAmount:
      typeof purchase.discountAmount === "number"
        ? purchase.discountAmount
        : 0,
    rewardType: purchase.rewardType || null,
    currency: purchase.currency || "€",
    purchasedAt: purchase.purchasedAt || new Date().toISOString(),
    status: purchase.status || "Active"
  };

  memoryStore.purchases.unshift(record);
  saveStore();

  return record;
}

export function getUserPurchases(email) {
  if (!email) return [];
  if (!memoryStore.purchases || memoryStore.purchases.length === 0) {
    loadStore();
  }
  const normalized = email.toLowerCase();

  return memoryStore.purchases.filter((p) => p.email === normalized);
}


