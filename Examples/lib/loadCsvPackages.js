import fs from "fs";
import path from "path";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
      if (char === "\r" && next === "\n") {
        i += 1;
      }
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function loadCsvPackages() {
  try {
    const csvPath = path.join(
      process.cwd(),
      "wc-product-export-17-12-2025-1765982456101.csv"
    );
    const raw = fs.readFileSync(csvPath, "utf8");
    const rows = parseCsv(raw);
    if (!rows || rows.length < 2) return { products: [], categories: [] };

    // Normalize headers to avoid subtle issues like UTF-8 BOM (\uFEFF) on the first column.
    const header = (rows[0] || []).map((h) =>
      String(h || "")
        .replace(/^\uFEFF/, "")
        .trim()
    );

    const headerIndex = new Map(
      header.map((h, i) => [h.toLowerCase(), i])
    );

    const idx = (name) => headerIndex.get(String(name).toLowerCase()) ?? -1;

    const idxName = idx("Name");
    const idxRegularPrice = idx("Regular price");
    const idxCategory = idx("Categories");
    const idxWifi = idx("Meta: wifi_data");
    const idxValidity = idx("Meta: validity");
    const idxCountries = idx("Meta: countries_supported");
    const idxLocation = idx("Meta: location_data");

    const required = [
      ["Name", idxName],
      ["Regular price", idxRegularPrice],
      ["Categories", idxCategory]
    ];

    const missing = required.filter(([, i]) => i < 0).map(([n]) => n);
    if (missing.length > 0) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[loadCsvPackages] Missing required CSV columns: ${missing.join(
            ", "
          )}. Found headers: ${header.join(" | ")}`
        );
      }
      return { products: [], categories: [] };
    }

    // Extract unique categories
    const categoriesSet = new Set();
    const products = rows.slice(1).map((row, index) => {
      const name = row[idxName] || "";
      if (!name || name.trim() === "") return null;

      const rawPrice = row[idxRegularPrice] || "";
      const price =
        rawPrice && rawPrice.trim()
          ? `${rawPrice.trim().includes("€") ? "" : "€"}${rawPrice.trim()}`
          : "";

      const data = row[idxWifi] || "";
      const duration = row[idxValidity] || "";
      const countriesSupported = row[idxCountries] || "";
      const location = row[idxLocation] || "";
      const category = row[idxCategory] || "";

      // Handle comma-separated categories
      if (category && category.trim()) {
        const categoryParts = category.split(",").map((c) => c.trim());
        categoryParts.forEach((cat) => {
          if (cat) categoriesSet.add(cat);
        });
      }

      return {
        id: `csv-${index + 1}-${name.replace(/\s+/g, "-").toLowerCase()}`,
        name,
        price,
        data,
        duration,
        countriesSupported,
        location,
        category
      };
    });

    const categories = Array.from(categoriesSet).sort();

    return {
      products: products.filter(Boolean),
      categories
    };
  } catch {
    return { products: [], categories: [] };
  }
}


