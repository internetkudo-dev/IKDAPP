import {
  getAllAdminPackages,
  replaceAllAdminPackages
} from "../../../lib/adminPackagesStore";

const API_URL =
  "https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt";
const API_TOKEN = "4pr1udO0uaCCqBNZgmKMOnFt";

function isAuthed(req) {
  const flag = req.cookies?.admin_auth;
  return flag === "1";
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

  try {
    // 1) Fetch packages from Telco API
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
      console.error("[sync-telco] Fetch error:", fetchError);
      throw new Error(`Failed to connect to Telco API: ${fetchError.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error(`[sync-telco] Telco API error ${response.status}:`, errorText);
      
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
      console.error("[sync-telco] JSON parse error:", jsonError);
      throw new Error(`Failed to parse Telco API response: ${jsonError.message}`);
    }

    if (!data?.status || data.status.code !== 0) {
      // eslint-disable-next-line no-console
      console.error("[sync-telco] Telco API status error:", data?.status);
      throw new Error(
        data?.status?.msg || `Telco API returned non-zero status code: ${data?.status?.code || "unknown"}`
      );
    }

    const templates = data.listPrepaidPackageTemplate?.template || [];

    const existing = getAllAdminPackages();
    const byId = new Map(
      existing.map((p) => [String(p.id), p])
    );

    const telcoPackages = templates
      .filter((pkg) => !pkg.deleted && pkg.uiVisible !== false)
      .map((pkg) => {
        const id = String(pkg.prepaidpackagetemplateid);
        const existingPkg = byId.get(id);
        if (existingPkg) {
          return existingPkg;
        }

        const dataGB =
          pkg.databyte != null ? bytesToGb(pkg.databyte).toFixed(2) : "0.00";
        const validityDays = pkg.perioddays || 0;
        const locationZone =
          (pkg.rdbLocationZones && pkg.rdbLocationZones.locationzonename) ||
          "Global";

        const cost = pkg.cost || 0;
        const price =
          cost && Number.isFinite(cost) ? `€${cost.toFixed(2)}` : "€0.00";

        return {
          id,
          name: pkg.userUiName || pkg.prepaidpackagetemplatename || "Untitled",
          region: locationZone,
          regionGroup: locationZone,
          countries: [],
          countryDetails: [],
          operators: [],
          data: `${dataGB} GB`,
          duration: `${validityDays} days`,
          price,
          bestFor:
            pkg.sponsors?.displayname ||
            pkg.sponsors?.sponsorname ||
            "Travel data package",
          features: [],
          highlighted: false,
          showInRegions: true,
          showInCountries: false
        };
      });

    // Keep any existing non-Telco/manual packages too
    const telcoIds = new Set(telcoPackages.map((p) => String(p.id)));
    const manualPackages = existing.filter(
      (p) => !telcoIds.has(String(p.id))
    );

    const merged = [...manualPackages, ...telcoPackages];
    
    try {
      replaceAllAdminPackages(merged);
    } catch (writeError) {
      // eslint-disable-next-line no-console
      console.error("[admin-packages][sync-telco] File write error:", writeError);
      throw new Error(`Failed to save packages: ${writeError.message}`);
    }

    res.status(200).json({
      success: true,
      items: merged,
      importedCount: telcoPackages.length
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[admin-packages][sync-telco] error", err);
    // eslint-disable-next-line no-console
    console.error("[admin-packages][sync-telco] error stack", err.stack);
    
    // Provide more helpful error messages
    let errorMessage = err.message || "Failed to sync Telco packages";
    
    // Check for common file system errors
    if (err.message && err.message.includes("not writable")) {
      errorMessage = `File system error: ${err.message}. Please ensure the 'data' directory exists and is writable on the server.`;
    } else if (err.message && err.message.includes("Failed to write")) {
      errorMessage = `File write error: ${err.message}. Check file permissions on Hostinger.`;
    } else if (err.code === "ENOENT" || err.code === "EACCES") {
      errorMessage = `File system permission error: ${err.message}. The 'data' directory may not exist or may not be writable.`;
    } else if (err.message && err.message.includes("Failed to connect")) {
      errorMessage = `Network error: ${err.message}. Check if Telco API is accessible.`;
    } else if (err.message && err.message.includes("Telco API")) {
      errorMessage = `Telco API error: ${err.message}`;
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


