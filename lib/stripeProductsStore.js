import fs from "fs";
import path from "path";

const STRIPE_PRODUCTS_PATH = path.join(process.cwd(), "data", "stripe-products.json");

function ensureFile() {
  try {
    const dataDir = path.dirname(STRIPE_PRODUCTS_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
    }
    // Ensure directory is writable
    try {
      fs.accessSync(dataDir, fs.constants.W_OK);
    } catch (accessError) {
      // eslint-disable-next-line no-console
      console.error("[stripeProductsStore] Data directory is not writable:", dataDir, accessError);
      throw new Error(`Data directory is not writable: ${dataDir}. Please check file permissions.`);
    }
    if (!fs.existsSync(STRIPE_PRODUCTS_PATH)) {
      fs.writeFileSync(STRIPE_PRODUCTS_PATH, "[]", "utf8");
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[stripeProductsStore] Error ensuring file:", err);
    throw err; // Re-throw to surface the error
  }
}

function readAll() {
  try {
    ensureFile();
    const raw = fs.readFileSync(STRIPE_PRODUCTS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[stripeProductsStore] Error reading file:", err);
    // Return empty array on read errors, but log the error
    return [];
  }
}

function writeAll(items) {
  try {
    ensureFile(); // Ensure directory and file exist before writing
    fs.writeFileSync(
      STRIPE_PRODUCTS_PATH,
      JSON.stringify(items ?? [], null, 2),
      "utf8"
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[stripeProductsStore] Error writing file:", err);
    // Re-throw to surface the error instead of silently failing
    throw new Error(`Failed to write stripe products file: ${err.message}`);
  }
}

export function getAllStripeProducts() {
  return readAll();
}

export function getStripeProductByPackageId(packageId) {
  if (!packageId) return null;
  const all = readAll();
  return all.find((p) => p && p.packageId === String(packageId)) || null;
}

export function createOrUpdateStripeProduct(packageId, stripeProductId, stripePriceId) {
  if (!packageId || !stripeProductId || !stripePriceId) {
    return null;
  }

  const all = readAll();
  const existingIndex = all.findIndex((p) => p && p.packageId === String(packageId));

  const mapping = {
    packageId: String(packageId),
    stripeProductId: String(stripeProductId),
    stripePriceId: String(stripePriceId),
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    // Update existing mapping
    const existing = all[existingIndex];
    all[existingIndex] = {
      ...existing,
      ...mapping,
      createdAt: existing.createdAt || new Date().toISOString()
    };
  } else {
    // Create new mapping
    mapping.createdAt = new Date().toISOString();
    all.push(mapping);
  }

  writeAll(all);
  return mapping;
}

export function deleteStripeProduct(packageId) {
  if (!packageId) return false;
  const all = readAll();
  const next = all.filter((p) => p && p.packageId !== String(packageId));
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}

export function replaceAllStripeProducts(items) {
  if (!Array.isArray(items)) {
    writeAll([]);
    return [];
  }
  writeAll(items);
  return items;
}

