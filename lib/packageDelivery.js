import nodemailer from "nodemailer";

const API_URL =
  "https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt";

// For now we use a fixed accountForSubs like in the DPL example.
// You can move this to env/config later.
const DEFAULT_ACCOUNT_ID = 2343;

function logError(message) {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.error(`[packageDelivery ${timestamp}] ERROR: ${message}`);
}

export async function affectPackageToSubscriberWithAccount(
  packageTemplateId,
  validityPeriod = 60,
  accountForSubs = DEFAULT_ACCOUNT_ID
) {
  if (!packageTemplateId) {
    throw new Error("packageTemplateId is required");
  }

  const payload = {
    affectPackageToSubscriber: {
      packageTemplateId,
      accountForSubs,
      validityPeriod
    }
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logError(
      `Telco affectPackageToSubscriber failed: status=${res.status} body=${text}`
    );
    throw new Error(`Telco API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data?.status || data.status.code !== 0) {
    logError(`Telco affectPackageToSubscriber status error: ${JSON.stringify(data)}`);
    throw new Error(data?.status?.msg || "Telco API returned non-zero status code");
  }

  const aff = data.affectPackageToSubscriber || {};

  return {
    iccid: aff.iccid || "N/A",
    smdpServer: aff.smdpServer || "N/A",
    activationCode: aff.activationCode || "N/A",
    urlQrCode: aff.urlQrCode || ""
  };
}

export function buildQrCodeUrl(urlQrCode) {
  if (!urlQrCode) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    urlQrCode
  )}&size=150x150`;
}

function ensureTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set in env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

export async function sendPackageEmail({
  to,
  customerName,
  productName,
  packageDetails
}) {
  if (!to) throw new Error("Recipient email (to) is required");

  const iccid = packageDetails.iccid || "N/A";
  const activationCode = packageDetails.activationCode || "N/A";
  const smdpServer = packageDetails.smdpServer || "N/A";
  const qrUrl = buildQrCodeUrl(packageDetails.urlQrCode || "");

  const subject = `Pako juaj - ${productName || "eSIM"}`;

  const qrImg = qrUrl
    ? `<img src="${qrUrl}" alt="QR Code" style="width:150px;height:150px;" />`
    : "";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; text-align: center;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #004ffe; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">InternetKudo eSIM</h2>
      </div>
      <div style="padding: 20px; text-align:left;">
        <p style="font-size: 16px;">I/e nderuar ${customerName || ""},</p>
        <p style="font-size: 14px;">Faleminderit për porosinë tuaj! Më poshtë janë detajet për aktivizim:</p>

        <div style="text-align: center; margin: 20px 0;">
          ${qrImg}
        </div>

        <h4 style="color: #004ffe; font-size: 16px;">Aktivizim Manual:</h4>
        <ul style="font-size: 14px; list-style: none; padding: 0;">
          <li><strong>ICCID:</strong> ${iccid}</li>
          <li><strong>Kodi i Aktivizimit:</strong> ${activationCode}</li>
          <li><strong>Adresa SMDP:</strong> ${smdpServer}</li>
        </ul>

        <p style='text-align: center; margin-top: 20px;'>
          <a href='https://gjendja.internetkudo.com/?iccid=${encodeURIComponent(
            iccid
          )}' style='background: #004ffe; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;'>
            Kontrollo Bilancin / Rimbush pakon
          </a>
        </p>
      </div>
    </div>
  </div>`;

  const transport = ensureTransport();

  await transport.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}

// High-level helper to be called when a user purchases a package.
// In the future you can also persist iccid/user relations here.
export async function deliverPackageByEmail({
  email,
  customerName,
  productName,
  packageTemplateId,
  validityPeriod,
  accountForSubs
}) {
  const packageDetails = await affectPackageToSubscriberWithAccount(
    packageTemplateId,
    validityPeriod,
    accountForSubs
  );

  await sendPackageEmail({
    to: email,
    customerName,
    productName,
    packageDetails
  });

  return packageDetails;
}


