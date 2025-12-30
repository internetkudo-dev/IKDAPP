import Stripe from "stripe";
import {
  getStripeProductByPackageId,
  createOrUpdateStripeProduct
} from "../../../lib/stripeProductsStore";

// Re-use the same Telco API config as sync-telco
const API_URL =
  "https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt";
const API_TOKEN = "4pr1udO0uaCCqBNZgmKMOnFt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16"
});

function isAuthed(req) {
  const flag = req.cookies?.admin_auth;
  return flag === "1";
}

function parsePrice(priceString) {
  if (!priceString) return 0;
  const normalized = String(priceString).trim();
  const numericString = normalized
    .replace(/[^\d.,]/g, "")
    .replace(",", ".");
  const amountFloat = parseFloat(numericString);
  return Number.isFinite(amountFloat) && amountFloat > 0 ? amountFloat : 0;
}

function bytesToGb(bytes) {
  return bytes / (1024 * 1024 * 1024);
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.trim() === "") {
    // eslint-disable-next-line no-console
    console.error("[sync-stripe-products] STRIPE_SECRET_KEY not configured");
    res.status(500).json({ error: "Stripe secret key not configured. Please set STRIPE_SECRET_KEY environment variable." });
    return;
  }

  try {
    // 1) Load latest prepaid package templates directly from Telco API
    let response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_TOKEN}`,
          "User-Agent": "InternetKudo-Website/1.0",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9"
        },
        body: JSON.stringify({
          listPrepaidPackageTemplate: {
            resellerId: 567
          }
        })
      });
    } catch (fetchError) {
      // eslint-disable-next-line no-console
      console.error("[sync-stripe-products] Fetch error:", fetchError);
      throw new Error(`Failed to connect to Telco API: ${fetchError.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error(`[sync-stripe-products] Telco API error ${response.status}:`, errorText);
      
      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        throw new Error(
          `Telco API access forbidden (403). Possible causes:\n` +
          `1. API token may be expired or invalid\n` +
          `2. Hostinger server IP may not be whitelisted\n` +
          `3. API may be blocking requests from hosting providers\n` +
          `4. API endpoint or authentication method may have changed\n\n` +
          `Please contact Telco API support to whitelist your server IP or verify API credentials.`
        );
      }
      
      throw new Error(`Telco API request failed: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // eslint-disable-next-line no-console
      console.error("[sync-stripe-products] JSON parse error:", jsonError);
      throw new Error(`Failed to parse Telco API response: ${jsonError.message}`);
    }

    if (!data?.status || data.status.code !== 0) {
      // eslint-disable-next-line no-console
      console.error("[sync-stripe-products] Telco API status error:", data?.status);
      throw new Error(
        data?.status?.msg || `Telco API returned non-zero status code: ${data?.status?.code || "unknown"}`
      );
    }

    const templates = data.listPrepaidPackageTemplate?.template || [];
    
    if (!Array.isArray(templates)) {
      // eslint-disable-next-line no-console
      console.error("[sync-stripe-products] Templates is not an array:", typeof templates);
      throw new Error("Telco API returned invalid template format");
    }

    if (templates.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("[sync-stripe-products] No templates returned from Telco API");
      res.status(200).json({
        success: true,
        results: {
          created: 0,
          updated: 0,
          skipped: 0,
          errors: []
        },
        totalTemplates: 0,
        processedPackages: 0,
        message: "No packages found in Telco API response"
      });
      return;
    }

    // 2) Map Telco templates into a simple package-like shape for Stripe
    const telcoPackages = templates
      .filter((pkg) => !pkg.deleted && pkg.uiVisible !== false)
      .map((pkg) => {
        const id = String(pkg.prepaidpackagetemplateid);
        const dataGB =
          pkg.databyte != null ? bytesToGb(pkg.databyte).toFixed(2) : "0.00";
        const validityDays = pkg.perioddays || 0;
        const cost = pkg.cost || 0;
        const price =
          cost && Number.isFinite(cost) ? `€${cost.toFixed(2)}` : "€0.00";

        return {
          id,
          name:
            pkg.userUiName || pkg.prepaidpackagetemplatename || "Untitled",
          data: `${dataGB} GB`,
          duration: `${validityDays} days`,
          price,
          bestFor:
            pkg.sponsors?.displayname ||
            pkg.sponsors?.sponsorname ||
            "Travel data package"
        };
      });

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // 3) For each Telco package, ensure there is a corresponding Stripe product
    for (const pkg of telcoPackages) {
      try {
        if (!pkg.id || !pkg.name || !pkg.price) {
          results.skipped++;
          continue;
        }

        const priceAmount = parsePrice(pkg.price);
        if (priceAmount <= 0) {
          results.skipped++;
          continue;
        }

        // Check if product already exists
        const existingMapping = getStripeProductByPackageId(pkg.id);
        let productId;
        let priceId;

        if (existingMapping) {
          // Update existing product
          productId = existingMapping.stripeProductId;
          priceId = existingMapping.stripePriceId;

          try {
            // Update product name if needed
            await stripe.products.update(productId, {
              name: pkg.name,
              description: `${pkg.data || ""} - ${pkg.duration || ""} - ${pkg.bestFor || ""}`.trim()
            });

            // Create new price if amount changed
            const existingPrice = await stripe.prices.retrieve(priceId);
            const existingAmount = existingPrice.unit_amount / 100;

            if (Math.abs(existingAmount - priceAmount) > 0.01) {
              // Amount changed, create new price and archive old one
              const newPrice = await stripe.prices.create({
                product: productId,
                unit_amount: Math.round(priceAmount * 100),
                currency: "eur"
              });
              priceId = newPrice.id;

              // Archive old price
              await stripe.prices.update(existingPrice.id, {
                active: false
              });
            }

            try {
              createOrUpdateStripeProduct(pkg.id, productId, priceId);
              results.updated++;
            } catch (writeError) {
              // eslint-disable-next-line no-console
              console.error(`[sync-stripe-products] File write error for package ${pkg.id}:`, writeError);
              results.errors.push({
                packageId: pkg.id,
                packageName: pkg.name,
                error: `Failed to save mapping: ${writeError.message}`
              });
            }
          } catch (stripeError) {
            // If product doesn't exist in Stripe, create new one
            if (stripeError.code === "resource_missing") {
              const product = await stripe.products.create({
                name: pkg.name,
                description: `${pkg.data || ""} - ${pkg.duration || ""} - ${pkg.bestFor || ""}`.trim(),
                metadata: {
                  packageId: pkg.id
                }
              });

              const price = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(priceAmount * 100),
                currency: "eur"
              });

              try {
                createOrUpdateStripeProduct(pkg.id, product.id, price.id);
                results.created++;
              } catch (writeError) {
                // eslint-disable-next-line no-console
                console.error(`[sync-stripe-products] File write error for package ${pkg.id}:`, writeError);
                results.errors.push({
                  packageId: pkg.id,
                  packageName: pkg.name,
                  error: `Failed to save mapping: ${writeError.message}`
                });
              }
            } else {
              throw stripeError;
            }
          }
        } else {
          // Create new product
          const product = await stripe.products.create({
            name: pkg.name,
            description: `${pkg.data || ""} - ${pkg.duration || ""} - ${pkg.bestFor || ""}`.trim(),
            metadata: {
              packageId: pkg.id
            }
          });

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(priceAmount * 100),
            currency: "eur"
          });

          try {
            createOrUpdateStripeProduct(pkg.id, product.id, price.id);
            results.created++;
          } catch (writeError) {
            // eslint-disable-next-line no-console
            console.error(`[sync-stripe-products] File write error for package ${pkg.id}:`, writeError);
            results.errors.push({
              packageId: pkg.id,
              packageName: pkg.name,
              error: `Failed to save mapping: ${writeError.message}`
            });
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[sync-stripe-products] Error processing package ${pkg.id}:`, err);
        results.errors.push({
          packageId: pkg.id,
          packageName: pkg.name,
          error: err.message || "Unknown error"
        });
      }
    }

    res.status(200).json({
      success: true,
      results,
      totalTemplates: templates.length,
      processedPackages: telcoPackages.length
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[admin-packages][sync-stripe-products] error", err);
    // eslint-disable-next-line no-console
    console.error("[admin-packages][sync-stripe-products] error stack", err.stack);
    
    // Provide more helpful error messages
    let errorMessage = err.message || "Failed to sync packages to Stripe products";
    
    // Check for common file system errors
    if (err.message && err.message.includes("not writable")) {
      errorMessage = `File system error: ${err.message}. Please ensure the 'data' directory exists and is writable on the server.`;
    } else if (err.message && err.message.includes("Failed to write")) {
      errorMessage = `File write error: ${err.message}. Check file permissions on Hostinger.`;
    } else if (err.code === "ENOENT" || err.code === "EACCES") {
      errorMessage = `File system permission error: ${err.message}. The 'data' directory may not exist or may not be writable.`;
    } else if (err.message && err.message.includes("403")) {
      errorMessage = err.message; // Already formatted with helpful info
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      code: err.code || undefined
    });
  }
}

