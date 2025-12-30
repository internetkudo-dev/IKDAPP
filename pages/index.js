import { useEffect } from "react";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import PackagesSection from "../components/PackagesSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import FAQSection from "../components/FAQSection";
import SupportSection from "../components/SupportSection";

export default function HomePage({ packages }) {
  // Handle hash navigation on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  return (
    <Layout>
      <Hero packages={packages || []} />
      <PackagesSection packages={packages || []} />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <SupportSection />
    </Layout>
  );
}
// Helper to convert bytes from Telco API to GB
function bytesToGb(bytes) {
  return bytes / (1024 * 1024 * 1024);
}

export async function getStaticProps() {
  const API_URL =
    "https://ocs-api.telco-vision.com:7443/ocs-custo/main/v1?token=4pr1udO0uaCCqBNZgmKMOnFt";
  const API_TOKEN = "4pr1udO0uaCCqBNZgmKMOnFt";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        listPrepaidPackageTemplate: {
          resellerId: 567
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Telco API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.status || data.status.code !== 0) {
      throw new Error("Telco API returned non-zero status code");
    }

    const templates = data.listPrepaidPackageTemplate?.template || [];

    const uiPackages = templates
      .filter((pkg) => !pkg.deleted && pkg.uiVisible !== false)
      .map((pkg) => {
        const dataGB =
          pkg.databyte != null ? bytesToGb(pkg.databyte).toFixed(2) : "0.00";
        const validityDays = pkg.perioddays || 0;
        const locationZone =
          (pkg.rdbLocationZones && pkg.rdbLocationZones.locationzonename) ||
          "Global";

        const priceNumber = pkg.cost || 0;
        const price =
          priceNumber && Number.isFinite(priceNumber)
            ? `€${priceNumber.toFixed(2)}`
            : "€0.00";

        const features = [
          `${dataGB} GB of data`,
          `Valid for ${validityDays} days`,
          `Coverage: ${locationZone}`
        ];

        return {
          id: String(pkg.prepaidpackagetemplateid),
          name: pkg.userUiName || pkg.prepaidpackagetemplatename,
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
          features,
          highlighted: false,
          showInRegions: true,
          showInCountries: false
        };
      });

    return {
      props: {
        packages: uiPackages
      },
      revalidate: 60 // refresh Telco packages at most once per minute
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[getStaticProps] Failed to load Telco packages:", err);
    }

    return {
      props: {
        packages: []
      },
      revalidate: 60
    };
  }
}

