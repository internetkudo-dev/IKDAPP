import { deliverPackageByEmail } from "../../../lib/packageDelivery";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    email,
    customerName,
    productName,
    packageTemplateId,
    validityPeriod,
    accountForSubs
  } = req.body || {};

  if (!email || !packageTemplateId) {
    return res
      .status(400)
      .json({ error: "email and packageTemplateId are required" });
  }

  try {
    const details = await deliverPackageByEmail({
      email,
      customerName,
      productName,
      packageTemplateId,
      validityPeriod,
      accountForSubs
    });

    // TODO: here you can also persist the (userId, iccid, packageTemplateId, etc.) to your DB.

    return res.status(200).json({
      success: true,
      package: details
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deliver-package error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to deliver package"
    });
  }
}


