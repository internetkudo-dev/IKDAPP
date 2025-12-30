import { getUserPurchases } from "../../../lib/accountStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const purchases = getUserPurchases(email);

  // Group by ICCID so we can later check usage for each.
  const byIccid = {};
  for (const p of purchases) {
    if (!byIccid[p.iccid]) {
      byIccid[p.iccid] = [];
    }
    byIccid[p.iccid].push(p);
  }

  const lastPurchase = purchases[0] || null;
  const totalSpent = purchases.reduce(
    (sum, p) =>
      sum +
      (typeof p.effectivePrice === "number"
        ? p.effectivePrice
        : typeof p.basePrice === "number"
        ? p.basePrice
        : 0),
    0
  );

  return res.status(200).json({
    success: true,
    purchases,
    iccids: Object.keys(byIccid),
    lastPurchase,
    totalSpent
  });
}


