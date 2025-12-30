import fs from "fs";
import path from "path";

const ADMIN_PACKAGES_PATH = path.join(process.cwd(), "data", "admin-packages.json");

function ensureFile() {
  try {
    const dataDir = path.dirname(ADMIN_PACKAGES_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
    }
    // Ensure directory is writable
    try {
      fs.accessSync(dataDir, fs.constants.W_OK);
    } catch (accessError) {
      // eslint-disable-next-line no-console
      console.error("[adminPackagesStore] Data directory is not writable:", dataDir, accessError);
      throw new Error(`Data directory is not writable: ${dataDir}. Please check file permissions.`);
    }
    if (!fs.existsSync(ADMIN_PACKAGES_PATH)) {
      fs.writeFileSync(ADMIN_PACKAGES_PATH, "[]", "utf8");
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[adminPackagesStore] Error ensuring file:", err);
    throw err; // Re-throw to surface the error
  }
}

function readAll() {
  ensureFile();
  try {
    const raw = fs.readFileSync(ADMIN_PACKAGES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(items) {
  try {
    ensureFile(); // Ensure directory and file exist before writing
    fs.writeFileSync(
      ADMIN_PACKAGES_PATH,
      JSON.stringify(items ?? [], null, 2),
      "utf8"
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[adminPackagesStore] Error writing file:", err);
    // Re-throw to surface the error instead of silently failing
    throw new Error(`Failed to write admin packages file: ${err.message}`);
  }
}

export function getAllAdminPackages() {
  return readAll();
}

export function replaceAllAdminPackages(items) {
  if (!Array.isArray(items)) {
    writeAll([]);
    return [];
  }
  writeAll(items);
  return items;
}

export function getAdminPackageById(id) {
  if (!id) return null;
  const all = readAll();
  return all.find((p) => p && p.id === id) || null;
}

export function createAdminPackage(data) {
  const all = readAll();
  const now = new Date().toISOString();
  const id =
    data?.id && String(data.id).trim()
      ? String(data.id).trim()
      : `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const pkg = {
    id,
    name: String(data?.name || "").trim() || "Untitled package",
    region: String(data?.region || "").trim() || "Global",
    regionGroup: String(data?.regionGroup || "").trim() || "Global",
    countries: Array.isArray(data?.countries)
      ? data.countries
      : String(data?.countries || "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
    countryDetails: Array.isArray(data?.countryDetails)
      ? data.countryDetails
      : [],
    operators: Array.isArray(data?.operators)
      ? data.operators
      : String(data?.operators || "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
    data: String(data?.data || "").trim(),
    duration: String(data?.duration || "").trim(),
    price: String(data?.price || "").trim(),
    bestFor: String(data?.bestFor || "").trim() || "Travel data package",
    features: Array.isArray(data?.features)
      ? data.features
      : String(data?.features || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
    highlighted: Boolean(data?.highlighted),
    showInRegions: data?.showInRegions !== undefined ? Boolean(data?.showInRegions) : true,
    showInCountries: data?.showInCountries !== undefined ? Boolean(data?.showInCountries) : true
  };

  // If this package is marked as highlighted, ensure it's the ONLY highlighted one.
  // This makes "highlighted" effectively behave as a single featured package.
  let next = all;
  if (pkg.highlighted) {
    next = all.map((p) =>
      p && p.id !== pkg.id
        ? {
            ...p,
            highlighted: false
          }
        : p
    );
  }

  next.push(pkg);
  writeAll(next);
  return pkg;
}

export function updateAdminPackage(id, data) {
  if (!id) return null;
  const all = readAll();
  const index = all.findIndex((p) => p && p.id === id);
  if (index === -1) return null;

  const existing = all[index] || {};
  const updated = {
    ...existing,
    ...data,
    id: existing.id // id is immutable
  };

  // Normalize some fields
  if (typeof updated.name === "string") updated.name = updated.name.trim();
  if (typeof updated.region === "string") updated.region = updated.region.trim();
  if (typeof updated.regionGroup === "string")
    updated.regionGroup = updated.regionGroup.trim();
  if (!Array.isArray(updated.countries)) {
    updated.countries = String(updated.countries || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(updated.features)) {
    updated.features = String(updated.features || "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }
  // Normalize and enforce single highlighted (featured) package
  const wantsHighlight =
    data && Object.prototype.hasOwnProperty.call(data, "highlighted")
      ? Boolean(data.highlighted)
      : existing.highlighted === true;
  updated.highlighted = Boolean(wantsHighlight);
  if (updated.showInRegions !== undefined) {
    updated.showInRegions = Boolean(updated.showInRegions);
  }
  if (updated.showInCountries !== undefined) {
    updated.showInCountries = Boolean(updated.showInCountries);
  }

  let next = [...all];

  if (updated.highlighted) {
    // Clear highlight from all other packages so only this one is featured
    next = all.map((p, i) => {
      if (!p) return p;
      if (i === index) return updated;
      if (p.highlighted) {
        return {
          ...p,
          highlighted: false
        };
      }
      return p;
    });
  } else {
    // No highlight requested: just update this package in place
    next[index] = updated;
  }

  writeAll(next);
  return updated;
}

export function deleteAdminPackage(id) {
  if (!id) return false;
  const all = readAll();
  const next = all.filter((p) => p && p.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}


