/**
 * API Route: List Available Packages
 * Description: Fetches available prepaid package templates from Telco Vision API
 */

const API_URL = 'https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt';
const API_TOKEN = '4pr1udO0uaCCqBNZgmKMOnFt';

// Helper function to log errors
function logError(message) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
}

// Function to call the API and get available packages
async function listPrepaidPackages(resellerId = null) {
  try {
    const requestBody = resellerId 
      ? { listPrepaidPackageTemplate: { resellerId: resellerId } }
      : { listPrepaidPackageTemplate: {} };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      logError(`API request failed with status: ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (data && data.status && data.status.code === 0) {
      return data;
    }

    logError(`API response error: ${JSON.stringify(data)}`);
    return false;
  } catch (error) {
    logError(`API request exception: ${error.message}`);
    return false;
  }
}

// Helper function to convert bytes to GB
function bytesToGb(bytes) {
  return bytes / (1024 * 1024 * 1024);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resellerId } = req.query;

  // Get available packages
  const apiResponse = await listPrepaidPackages(resellerId);

  if (!apiResponse || !apiResponse.listPrepaidPackageTemplate || !apiResponse.listPrepaidPackageTemplate.template) {
    return res.status(404).json({ error: 'No packages found' });
  }

  const templates = apiResponse.listPrepaidPackageTemplate.template;

  // Process and format packages
  const packages = templates
    .filter(pkg => !pkg.deleted && pkg.uiVisible !== false) // Only show visible, non-deleted packages
    .map(pkg => ({
      id: pkg.prepaidpackagetemplateid,
      name: pkg.userUiName || pkg.prepaidpackagetemplatename,
      displayName: pkg.prepaidpackagetemplatename,
      dataGB: pkg.databyte ? bytesToGb(pkg.databyte).toFixed(2) : 'N/A',
      dataBytes: pkg.databyte || 0,
      validityDays: pkg.perioddays || 0,
      cost: pkg.cost || 0,
      locationZone: pkg.rdbLocationZones?.locationzonename || 'Global',
      locationZoneId: pkg.locationzoneid || null,
      resellerId: pkg.resellerid || null,
      resellerName: pkg.reseller?.resellername || null,
      sponsor: pkg.sponsors?.displayname || pkg.sponsors?.sponsorname || null,
      startAvailability: pkg.uiStartAvailablePeriod || null,
      endAvailability: pkg.uiEndAvailibilityPeriod || null,
      priority: pkg.priority || 1
    }))
    .sort((a, b) => {
      // Sort by priority first, then by cost
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.cost - b.cost;
    });

  return res.status(200).json({
    success: true,
    packages: packages,
    total: packages.length
  });
}

