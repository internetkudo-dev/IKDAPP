/**
 * API Route: ICCID Data Usage Check
 * Description: Fetches data usage, IMSI, and packages; sends SMS for the last package
 * Based on: InternetKudo ICCID Data Usage Plugin
 */

const API_URL = 'https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt';
const API_TOKEN = '4pr1udO0uaCCqBNZgmKMOnFt';

// Helper function to log errors (can be extended to write to a file or database)
function logError(message) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
}

// Function to call the API and get data usage and package details
async function callIccidApi(iccid) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        listSubscriberPrepaidPackages: {
          iccid: iccid
        }
      })
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

// Function to call the API and retrieve IMSI for the full ICCID
async function callIccidFullApi(iccid) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        listSubscriber: {
          iccidPrefix: iccid
        }
      })
    });

    if (!response.ok) {
      logError(`API request failed for ICCID full with status: ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (data && data.status && data.status.code === 0) {
      return data;
    }

    logError(`API response error for full ICCID: ${JSON.stringify(data)}`);
    return false;
  } catch (error) {
    logError(`API request exception for full ICCID: ${error.message}`);
    return false;
  }
}

// Function to send SMS
async function sendSmsToImsi(imsi, message, senderId) {
  try {
    // Ensure the message is within SMS character limit (160 characters for ASCII)
    if (message.length > 160) {
      logError(`Message exceeds ASCII character limit: ${message}`);
      return false;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        sendMtSms: {
          imsi: imsi,
          text: message,
          senderId: senderId
        }
      })
    });

    if (!response.ok) {
      logError(`SMS send failed with status: ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (data && data.status && data.status.code === 0) {
      return true;
    }

    logError(`Failed to send SMS: ${JSON.stringify(data)}`);
    return false;
  } catch (error) {
    logError(`SMS send exception: ${error.message}`);
    return false;
  }
}

// Helper function to convert bytes to GB
function bytesToGb(bytes) {
  return bytes / (1024 * 1024 * 1024);
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString || dateString === 'N/A') return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { iccid } = req.body;

  if (!iccid || iccid.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a valid ICCID number' });
  }

  const trimmedIccid = iccid.trim();

  // Get usage details from ICCID
  const apiResponse = await callIccidApi(trimmedIccid);

  if (!apiResponse || !apiResponse.listSubscriberPrepaidPackages || !apiResponse.listSubscriberPrepaidPackages.packages) {
    return res.status(404).json({ error: 'No information found for this ICCID' });
  }

  const packages = apiResponse.listSubscriberPrepaidPackages.packages;
  
  // Process all packages
  const processedPackages = packages.map(pkg => {
    const usedDataInBytes = pkg.useddatabyte || 0;
    const packageDataInBytes = pkg.pckdatabyte || 0;
    const expirationDate = pkg.tsexpirationutc || 'N/A';
    const packageName = pkg.packageTemplate?.prepaidpackagetemplatename || 'N/A';

    const usedDataInGb = bytesToGb(usedDataInBytes);
    const packageDataInGb = bytesToGb(packageDataInBytes);

    return {
      name: packageName,
      usedData: usedDataInGb,
      totalData: packageDataInGb,
      expirationDate: formatDate(expirationDate),
      expirationDateRaw: expirationDate
    };
  });

  // Get the last package for SMS
  const lastPackage = packages[packages.length - 1];
  const lastPackageName = lastPackage.packageTemplate?.prepaidpackagetemplatename || 'N/A';
  const lastPackageUsedGb = bytesToGb(lastPackage.useddatabyte || 0);
  const lastPackageExpirationDate = lastPackage.tsexpirationutc || 'N/A';

  // Retrieve IMSI using full ICCID for sending SMS
  const fullIccidResponse = await callIccidFullApi(trimmedIccid);
  
  let imsi = '';
  let smsStatus = 'not_sent';
  let smsError = null;

  if (fullIccidResponse && fullIccidResponse.listSubscriber && fullIccidResponse.listSubscriber.subscriberList) {
    const subscribers = fullIccidResponse.listSubscriber.subscriberList;
    
    // Get the first IMSI from the subscriber list
    for (const subscriber of subscribers) {
      if (subscriber.imsiList && subscriber.imsiList.length > 0) {
        imsi = subscriber.imsiList[0].imsi || '';
        break;
      }
    }

    // Prepare and send SMS for the last package
    if (imsi) {
      const smsMessage = `Ju keni shpenzuar: ${lastPackageUsedGb.toFixed(2)} GB, Expdate: ${formatDate(lastPackageExpirationDate)} Per te rimbushur pakon tuaj vizitoni https://gjendja.internetkudo.com/?iccid=${trimmedIccid}`;
      
      const smsSent = await sendSmsToImsi(imsi, smsMessage, 'IKD');
      
      if (smsSent) {
        smsStatus = 'sent';
      } else {
        smsStatus = 'failed';
        smsError = 'Failed to send SMS notification';
      }
    } else {
      smsStatus = 'no_imsi';
      smsError = 'Could not retrieve IMSI for SMS notification';
    }
  } else {
    smsStatus = 'no_imsi';
    smsError = 'Could not retrieve subscriber information';
  }

  return res.status(200).json({
    success: true,
    iccid: trimmedIccid,
    imsi: imsi || null,
    packages: processedPackages,
    smsStatus: smsStatus,
    smsError: smsError
  });
}

