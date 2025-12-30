/**
 * API Route: Purchase/Assign Package to Subscriber
 * Description: Assigns a prepaid package to a subscriber by ICCID
 */

const API_URL = 'https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt';
const API_TOKEN = '4pr1udO0uaCCqBNZgmKMOnFt';

// Helper function to log errors
function logError(message) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
}

// Function to assign package to subscriber
async function affectPackageToSubscriber(iccid, packageTemplateId, validityPeriod = null) {
  try {
    const requestBody = {
      affectPackageToSubscriber: {
        packageTemplateId: packageTemplateId,
        subscriber: {
          iccid: iccid
        }
      }
    };

    // Add validity period if provided
    if (validityPeriod) {
      requestBody.affectPackageToSubscriber.validityPeriod = validityPeriod;
    }

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
      return { success: false, error: `API request failed with status: ${response.status}` };
    }

    const data = await response.json();

    if (data && data.status && data.status.code === 0) {
      return {
        success: true,
        data: data.affectPackageToSubscriber || {},
        message: 'Package successfully assigned'
      };
    }

    logError(`API response error: ${JSON.stringify(data)}`);
    return {
      success: false,
      error: data.status?.msg || 'Failed to assign package',
      errorCode: data.status?.code
    };
  } catch (error) {
    logError(`API request exception: ${error.message}`);
    return {
      success: false,
      error: `API request exception: ${error.message}`
    };
  }
}

// Function to send confirmation SMS
async function sendConfirmationSms(imsi, packageName, validityDays, iccid) {
  try {
    const message = `Pakoja juaj ${packageName} eshte aktivizuar me sukses! Vlefshmeria: ${validityDays} dite. Kontrolloni gjendjen: https://gjendja.internetkudo.com/?iccid=${iccid}`;
    
    if (message.length > 160) {
      // Shortened version if too long
      const shortMessage = `Pakoja ${packageName} aktivizuar! ${validityDays} dite. https://gjendja.internetkudo.com/?iccid=${iccid}`;
      
      if (shortMessage.length > 160) {
        logError('SMS message too long even after shortening');
        return false;
      }
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
          text: message.length <= 160 ? message : `Pakoja ${packageName} aktivizuar! ${validityDays} dite.`,
          senderId: 'IKD'
        }
      })
    });

    if (!response.ok) {
      logError(`SMS send failed with status: ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data && data.status && data.status.code === 0;
  } catch (error) {
    logError(`SMS send exception: ${error.message}`);
    return false;
  }
}

// Function to get IMSI from ICCID
async function getImsiFromIccid(iccid) {
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
      return null;
    }

    const data = await response.json();

    if (data && data.status && data.status.code === 0 && data.listSubscriber && data.listSubscriber.subscriberList) {
      const subscribers = data.listSubscriber.subscriberList;
      for (const subscriber of subscribers) {
        if (subscriber.imsiList && subscriber.imsiList.length > 0) {
          return subscriber.imsiList[0].imsi;
        }
      }
    }

    return null;
  } catch (error) {
    logError(`Get IMSI exception: ${error.message}`);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    iccid,
    packageTemplateId,
    validityPeriod,
    packageName,
    email,
    price,
    rewardType,
    couponCode
  } = req.body;

  if (!iccid || iccid.trim().length < 10) {
    return res.status(400).json({ error: 'Valid ICCID is required' });
  }

  if (!packageTemplateId) {
    return res.status(400).json({ error: 'Package template ID is required' });
  }

  // Email is optional – if provided we can attach the purchase to an account.

  const trimmedIccid = iccid.trim();
  const priceNumber =
    typeof price === "number" ? price : price ? Number(price) : 0;

  let cashbackAmount = 0;
  let discountAmount = 0;
  let effectivePrice = priceNumber;

  if (priceNumber > 0) {
    if (rewardType === "discount") {
      discountAmount = +(priceNumber * 0.03).toFixed(2);
      effectivePrice = +(priceNumber - discountAmount).toFixed(2);
    } else if (rewardType === "cashback") {
      cashbackAmount = +(priceNumber * 0.1).toFixed(2);
    } else if (rewardType === "coupon" && couponCode) {
      // Simple demo coupon: SAVE5 → 5% discount
      if (couponCode.toUpperCase() === "SAVE5") {
        discountAmount = +(priceNumber * 0.05).toFixed(2);
        effectivePrice = +(priceNumber - discountAmount).toFixed(2);
      }
    }
  }

  // Assign package to subscriber
  const result = await affectPackageToSubscriber(trimmedIccid, packageTemplateId, validityPeriod);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error || 'Failed to assign package',
      errorCode: result.errorCode
    });
  }

  // Try to send confirmation SMS
  let smsStatus = 'not_sent';
  const imsi = await getImsiFromIccid(trimmedIccid);
  
  if (imsi && packageName && validityPeriod) {
    const smsSent = await sendConfirmationSms(imsi, packageName, validityPeriod, trimmedIccid);
    smsStatus = smsSent ? 'sent' : 'failed';
  }

  // Persist basic purchase info for account overview (demo store).
  if (email) {
    try {
      const { addPurchase } = await import("../../../lib/accountStore");
      addPurchase({
        email,
        iccid: trimmedIccid,
        packageTemplateId,
        packageName,
        basePrice: priceNumber,
        effectivePrice,
        cashbackAmount,
        discountAmount,
        rewardType,
        couponCode: couponCode || null,
        currency: "€",
        status: "Active"
      });
    } catch (e) {
      logError(`Failed to persist purchase: ${e.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Package successfully assigned',
    data: result.data,
    smsStatus: smsStatus,
    imsi: imsi,
    pricing: {
      basePrice: priceNumber,
      effectivePrice,
      cashbackAmount,
      discountAmount,
      rewardType: rewardType || null,
      currency: "€"
    }
  });
}

