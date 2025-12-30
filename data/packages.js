export const PACKAGES = [
  {
    id: "starter-eu",
    name: "Starter EU",
    region: "EU + UK",
    regionGroup: "Europe",
    countries: ["France", "Spain", "Italy", "Germany", "United Kingdom"],
    // Detailed coverage per country for UI display
    countryDetails: [
      {
        name: "France",
        flag: "🇫🇷",
        operators: ["Orange", "SFR", "Bouygues Telecom"]
      },
      {
        name: "Spain",
        flag: "🇪🇸",
        operators: ["Movistar", "Orange", "Vodafone"]
      },
      {
        name: "Italy",
        flag: "🇮🇹",
        operators: ["TIM", "Vodafone", "Wind Tre"]
      },
      {
        name: "Germany",
        flag: "🇩🇪",
        operators: ["Telekom", "Vodafone", "O2"]
      },
      {
        name: "United Kingdom",
        flag: "🇬🇧",
        operators: ["EE", "O2", "Vodafone", "Three"]
      }
    ],
    operators: ["Orange", "Vodafone", "O2", "Telefónica"],
    data: "5 GB",
    duration: "7 days",
    price: "€9",
    bestFor: "Weekend city breaks",
    features: ["4G/5G where available", "Instant eSIM delivery", "No contracts"]
  },
  {
    id: "traveler-eu",
    name: "Traveler EU",
    region: "EU + UK",
    regionGroup: "Europe",
    countries: [
      "France",
      "Spain",
      "Italy",
      "Germany",
      "United Kingdom",
      "Portugal",
      "Netherlands"
    ],
    countryDetails: [
      {
        name: "France",
        flag: "🇫🇷",
        operators: ["Orange", "SFR", "Bouygues Telecom"]
      },
      {
        name: "Spain",
        flag: "🇪🇸",
        operators: ["Movistar", "Orange", "Vodafone"]
      },
      {
        name: "Italy",
        flag: "🇮🇹",
        operators: ["TIM", "Vodafone", "Wind Tre"]
      },
      {
        name: "Germany",
        flag: "🇩🇪",
        operators: ["Telekom", "Vodafone", "O2"]
      },
      {
        name: "United Kingdom",
        flag: "🇬🇧",
        operators: ["EE", "O2", "Vodafone", "Three"]
      },
      {
        name: "Portugal",
        flag: "🇵🇹",
        operators: ["MEO", "Vodafone", "NOS"]
      },
      {
        name: "Netherlands",
        flag: "🇳🇱",
        operators: ["KPN", "Vodafone", "T-Mobile"]
      }
    ],
    operators: ["Orange", "Vodafone", "O2", "Telefónica"],
    data: "20 GB",
    duration: "15 days",
    price: "€24",
    bestFor: "Two-week holidays",
    features: [
      "High-speed data",
      "Personal hotspot support",
      "In-app usage overview"
    ],
    highlighted: true
  },
  {
    id: "nomad-global",
    name: "Nomad Global",
    region: "Over 70 countries",
    regionGroup: "Global",
    countries: ["USA", "Canada", "Mexico", "Japan", "Australia", "Singapore"],
    countryDetails: [
      {
        name: "United States",
        flag: "🇺🇸",
        operators: ["AT&T", "T-Mobile"]
      },
      {
        name: "Canada",
        flag: "🇨🇦",
        operators: ["Rogers", "Bell", "Telus"]
      },
      {
        name: "Mexico",
        flag: "🇲🇽",
        operators: ["Telcel", "AT&T Mexico"]
      },
      {
        name: "Japan",
        flag: "🇯🇵",
        operators: ["NTT Docomo", "KDDI au", "SoftBank"]
      },
      {
        name: "Australia",
        flag: "🇦🇺",
        operators: ["Telstra", "Optus", "Vodafone"]
      },
      {
        name: "Singapore",
        flag: "🇸🇬",
        operators: ["Singtel", "StarHub", "M1"]
      }
    ],
    operators: ["AT&T", "T-Mobile", "Rogers", "Telstra", "NTT Docomo"],
    data: "30 GB",
    duration: "30 days",
    price: "$49",
    bestFor: "Remote workers & long trips",
    features: [
      "Global coverage",
      "Network redundancy",
      "Priority support"
    ]
  }
];


