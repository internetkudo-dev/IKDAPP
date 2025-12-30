// Translation system for English and Albanian

export const translations = {
  en: {
    // Navbar
    nav: {
      packages: "Packages",
      howItWorks: "How it works",
      coverage: "Coverage",
      faq: "FAQ",
      support: "Support",
      checkout: "Checkout",
      balance: "Balance & Top-up"
    },
    
    // Homepage - Hero
    hero: {
      pill: "Mobile data, simplified",
      titleMain: "High-speed data packages",
      titleHighlight: " for every trip.",
      subtitle:
        "Skip the SIM counters and confusing roaming fees. Activate a mobile data package in minutes and stay online from touchdown to takeoff.",
      primaryCta: "View data packages",
      secondaryCta: "How it works",
      footnote: "No contracts. Upfront pricing. Works with most unlocked phones.",
      featuredLabel: "Featured package",
      oneTime: "One-time payment",
      buyFeatured: "Buy this featured package"
    },

    // Homepage - Packages section
    packagesSection: {
      eyebrow: "Packages",
      title: "Pick a data pack that fits",
      description:
        "Filter by country or region, or search a destination to see which mobile data packages are available.",
      searchPlaceholder: "Search a destination or country (e.g. Paris, Spain, USA)",
      regionsLabel: "Regions",
      countriesLabel: "Countries",
      allLabel: "All",
      noRegions: "No regions available",
      noCountries: "No countries available",
      noPackagesLoaded:
        "No packages loaded. Check that your CSV file exists in the project root and restart the dev server.",
      mostPopular: "Most popular",
      countrySingular: "country",
      countryPlural: "countries",
      noCountriesLabel: "No countries",
      moreLabel: "more",
      collapseTooltip: "Click to collapse",
      showTooltip: "Click to show all countries",
      buyButton: "Buy this package"
    },

    // Homepage - Features section
    featuresSection: {
      eyebrow: "Why travelers choose us",
      title: "Everything you need, nothing you don't",
      description:
        "Designed for modern travelers who just need reliable data—so you can order rides, find your hotel, and stay in touch without thinking about it.",
      items: [
        {
          id: "instant",
          title: "Instant activation",
          body:
            "Scan a QR code to activate your eSIM in minutes—no physical SIM swap or store visits."
        },
        {
          id: "pricing",
          title: "Clear, upfront pricing",
          body:
            "Know exactly what you pay before you travel. No surprise roaming fees or long contracts."
        },
        {
          id: "compatibility",
          title: "Works on modern phones",
          body:
            "Compatible with most recent iOS and Android devices that support eSIM technology."
        }
      ]
    },

    // Homepage - How it works section
    howItWorksSection: {
      eyebrow: "How it works",
      title: "From checkout to connection in minutes",
      description:
        "A simple flow that feels as modern as your phone. No paperwork, no counters, just data when you need it.",
      steps: [
        {
          id: "choose-destination",
          step: "01",
          title: "Choose your destination",
          body: "Pick a region and a data amount that matches how long you’ll be abroad."
        },
        {
          id: "purchase-securely",
          step: "02",
          title: "Purchase securely",
          body: "Pay once with your preferred method. No recurring charges or contracts."
        },
        {
          id: "activate-esim",
          step: "03",
          title: "Activate your eSIM",
          body:
            "Receive a QR code and simple instructions. Activate before you fly or on arrival."
        },
        {
          id: "stay-connected",
          step: "04",
          title: "Stay connected",
          body:
            "Use maps, ride-hailing, messaging, and email as if you were at home."
        }
      ]
    },

    // Homepage - FAQ section
    faqSection: {
      eyebrow: "FAQ",
      title: "Answers before you take off",
      description:
        "Still wondering how mobile data packages work? Here are the most common things travelers ask us.",
      items: [
        {
          id: "device-compatible",
          question: "Is my phone compatible with these eSIM data packages?",
          answer:
            "Most recent iOS and Android devices that support eSIM will work. You can check compatibility in your phone settings under cellular or mobile plans."
        },
        {
          id: "keep-number",
          question: "Do I keep my existing phone number?",
          answer:
            "Yes. Your physical SIM stays in your phone, so you can keep your number for calls and SMS while using the eSIM just for data."
        },
        {
          id: "hotspot",
          question: "Can I use hotspot / tethering?",
          answer:
            "Most packages support hotspot. However, it can depend on the local network, so we recommend checking before heavy tethering."
        },
        {
          id: "refunds",
          question: "What if my trip changes?",
          answer:
            "If you haven’t activated the eSIM yet, reach out to support and we’ll help you adjust or move your package where possible."
        }
      ]
    },

    // Homepage - Support section
    supportSection: {
      eyebrow: "Support",
      title: "Need help before you buy?",
      description:
        "Our team can help you confirm device compatibility, pick the right package, or understand how activation works.",
      emailLabel: "Email: support@datakudo.example",
      avgReply: "Average reply time: under 24 hours",
      formTitle: "Send us a message",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@example.com",
      messageLabel: "Message",
      messagePlaceholder: "Tell us about your trip and what you need.",
      submitLabel: "Submit (demo only)",
      footnote:
        "This form is for demo purposes only. In the next phase you can connect it to your support inbox or CRM.",
      deviceButton: "Check if my phone supports eSIM",
      deviceAlert:
        "Most recent iOS and Android devices support eSIM. Tap the button above to jump to the FAQ and see how to check compatibility in your phone settings."
    },

    // Balance Page
    balance: {
      eyebrow: "Balance & Top-up",
      title: "Check and top-up your package",
      description: "Check your package status and buy new data packages instantly.",
      iccidTitle: "Enter ICCID Number",
      iccidLabel: "ICCID Number",
      iccidPlaceholder: "8937204016150001234",
      checkButton: "Check Package",
      checking: "Checking...",
      yourPackages: "Your Active Packages",
      availablePackages: "Available Packages",
      backButton: "Back",
      packageNumber: "Package #",
      lowData: "Low Data",
      active: "Active",
      remaining: "remaining",
      total: "total",
      used: "Used",
      expires: "Expires",
      totalPackages: "Total Packages",
      buyPackage: "Buy Package",
      ourSite: "Our Site",
      activateNow: "Activate Now",
      activating: "Activating...",
      success: "Success!",
      successMessage: "Package activated successfully",
      refreshing: "Refreshing status...",
      smsConfirmed: "SMS confirmation sent to your device.",
      errorIccid: "Please enter a valid ICCID number.",
      errorConnection: "An error occurred while connecting to the server.",
      errorNoData: "No information found for this ICCID.",
      features: {
        data: "of data",
        validity: "Validity",
        instant: "Instant activation"
      },
      price: "price",
      days: "days",
      noPackages: "No packages available at the moment."
    }
    ,

    // Checkout Page
    checkout: {
      eyebrow: "Checkout",
      title: "Checkout",
      description: "Review your selection, then pay securely to complete your order.",
      noSelectionTitle: "No package selected",
      noSelectionBody: "Please choose a package first, then continue to checkout.",
      goToPackages: "View packages",
      packageLabel: "Package",
      priceLabel: "Price",
      payButton: "Pay with card",
      redirecting: "Redirecting…",
      changeSelection: "Change selection",
      fineprint: "You’ll be redirected to our payment provider to complete your purchase.",
      startError: "Could not start checkout. Please try again.",
      linkError: "Checkout link unavailable. Please try again.",
      connectError: "Error connecting to payment provider. Please try again."
    }
  },
  
  sq: {
    // Navbar
    nav: {
      packages: "Pakot",
      howItWorks: "Si funksionon",
      coverage: "Mbulimi",
      faq: "Pyetje",
      support: "Mbështetje",
      checkout: "Pagesa",
      balance: "Bilanci & Rimbushje"
    },
    
    // Homepage - Hero
    hero: {
      pill: "KUDO në botë",
      titleMain: "Pako interneti me shpejtësi të lartë",
      titleHighlight: " për çdo udhëtim.",
      subtitle:
        "Nga blerja deri te aktivizimi e gjitha brenda 1 minuti! Udhëto pa kufij, pa tarifa të fshehura dhe pa pritje.",
      primaryCta: "Shiko pakot e internetit",
      secondaryCta: "Si funksionon",
      footnote:
        "Pa kontrata. Çmime të qarta. Thuaj lamtumirë roaming!",
      featuredLabel: "Pako në ofertë",
      oneTime: "Pagesë e njëherëshme",
      buyFeatured: "Aktivizo këtë pako"
    },

    // Homepage - Packages section
    packagesSection: {
      eyebrow: "Pakot",
      title: "Zgjidh pakon e internetit që të përshtatet",
      description:
        "Filtro sipas shtetit ose rajonit, ose kërko një destinacion për të parë cilat pako interneti janë të disponueshme.",
      searchPlaceholder: "Kërko një destinacion ose shtet (p.sh. Shqipëri, Spanjë, Kosovë)",
      regionsLabel: "Regjionale",
      countriesLabel: "Lokale",
      allLabel: "Të gjitha",
      noRegions: "Asnjë regjion i disponueshëm",
      noCountries: "Asnjë shtet i disponueshëm",
      noPackagesLoaded:
        "Asnjë pako e ngarkuar. Kontrollo që skedari CSV të jetë në rrënjën e projektit dhe rinis serverin e zhvillimit.",
      mostPopular: "Më e preferuara",
      countrySingular: "shtet",
      countryPlural: "shtete",
      noCountriesLabel: "Pa shtete",
      moreLabel: "të tjera",
      collapseTooltip: "Kliko për ta mbyllur",
      showTooltip: "Kliko për të parë të gjitha shtetet",
      buyButton: "Aktivizo"
    },

    // Homepage - Features section
    featuresSection: {
      eyebrow: "Pse udhëtarët na zgjedhin",
      title: "Gjithçka që ju duhet",
      description:
        "Për udhëtarët që duan internet të besueshëm, pa kufij dhe pa pritje.",
      items: [
        {
          id: "instant",
          title: "Aktivizim i menjëhershëm",
          body:
            "Skano një kod QR dhe aktivizo eSIM-in për disa minuta—pa ndërruar SIM fizike dhe pa shkuar në dyqan."
        },
        {
          id: "pricing",
          title: "Çmime të qarta dhe pa surpriza",
          body:
            "E di saktësisht sa paguan para se të udhëtosh. Pa tarifa të fshehura roaming dhe pa kontrata afatgjata."
        },
        {
          id: "compatibility",
          title: "Funksionon në telefonat modernë",
          body:
            "I përputhshëm me shumicën e pajisjeve të fundit iOS dhe Android që mbështesin teknologjinë eSIM."
        }
      ]
    },

    // Homepage - How it works section
    howItWorksSection: {
      eyebrow: "Si funksionon",
      title: "Nga pagesa te lidhja për disa minuta",
      description:
        "Një proces i thjeshtë, po aq modern sa telefoni yt. Pa dokumente, pa sportele—vetëm internet kur të duhet.",
      steps: [
        {
          id: "choose-destination",
          step: "01",
          title: "Zgjidh destinacionin",
          body:
            "Zgjidh rajonin dhe sasinë e internetit që i përshtatet kohëzgjatjes së udhëtimit."
        },
        {
          id: "purchase-securely",
          step: "02",
          title: "Bli në mënyrë të sigurt",
          body: "Paguaj një herë me mënyrën tënde të preferuar. Pa abonime dhe pa kontrata."
        },
        {
          id: "activate-esim",
          step: "03",
          title: "Aktivizo eSIM-in",
          body:
            "Merr një kod QR dhe udhëzime të thjeshta. Mund ta aktivizosh para nisjes ose sapo të mbërrish."
        },
        {
          id: "stay-connected",
          step: "04",
          title: "Qëndro i lidhur",
          body:
            "Përdor hartat, aplikacionet e transportit, mesazhet dhe email-in sikur të ishe në shtëpi."
        }
      ]
    },

    // Homepage - FAQ section
    faqSection: {
      eyebrow: "Pyetje",
      title: "Përgjigje para se të nisesh",
      description:
        "Ende nuk je i sigurt si funksionojnë pakot e internetit? Këto janë pyetjet që na bëjnë më shpesh udhëtarët.",
      items: [
        {
          id: "device-compatible",
          question: "A është telefoni im i përshtatshëm për këto pako eSIM-i?",
          answer:
            "Shumica e pajisjeve të fundit iOS dhe Android që mbështesin eSIM funksionojnë. Mund të kontrollosh nga cilësimet e telefonit, te seksioni për rrjetet celulare."
        },
        {
          id: "keep-number",
          question: "A do ta mbaj numrin tim ekzistues?",
          answer:
            "Po. SIM-i yt fizik qëndron në telefon, kështu që mund të mbash numrin për thirrje dhe SMS, ndërsa eSIM-in e përdor vetëm për internet."
        },
        {
          id: "hotspot",
          question: "A mund të përdor hotspot / ndarje interneti?",
          answer:
            "Shumica e pakove e mbështesin hotspot-in, por kjo varet edhe nga rrjeti lokal. Rekomandojmë ta provosh para përdorimit të gjatë."
        },
        {
          id: "refunds",
          question: "Çfarë ndodh nëse më ndryshon udhëtimi?",
          answer:
            "Nëse nuk e ke aktivizuar ende eSIM-in, na shkruaj dhe do të përpiqemi ta përshtatim ose ta zhvendosim pakon kur është e mundur."
        }
      ]
    },

    // Homepage - Support section
    supportSection: {
      eyebrow: "Mbështetje",
      title: "Ke nevojë për ndihmë para se të blesh?",
      description:
        "Ekipi ynë të ndihmon të kontrollosh pajtueshmërinë e pajisjes, të zgjedhësh pakon e duhur ose të kuptosh si funksionon aktivizimi.",
      emailLabel: "Email: support@internetkudo.com",
      avgReply: "Koha mesatare e përgjigjes: më pak se 24 orë",
      formTitle: "Na dërgo një mesazh",
      nameLabel: "Emri",
      namePlaceholder: "Emri yt",
      emailPlaceholder: "emri@email.com",
      messageLabel: "Mesazhi",
      messagePlaceholder: "Na trego për udhëtimin dhe çfarë ke nevojë.",
      submitLabel: "Dërgo",
      footnote:
        "Kjo formë është vetëm për demonstrim. Në fazën tjetër mund ta lidhësh me email-in ose CRM-në tënde.",
      deviceButton: "Kontrollo nëse telefoni im mbështet eSIM",
      deviceAlert:
        "Shumica e telefonave të fundit iOS dhe Android mbështesin eSIM. Shtyp butonin më sipër për të shkuar te PYETJET dhe për të parë si ta kontrollosh nga cilësimet e telefonit."
    },

    // Balance Page
    balance: {
      eyebrow: "Bilanci & Rimbushje",
      title: "Kontrollo dhe rimbush pakon",
      description: "Kontrolloni gjendjen e pakos suaj dhe blini paketa të reja të dhënash menjëherë.",
      iccidTitle: "Shkruaj numrin ICCID",
      iccidLabel: "Numri ICCID",
      iccidPlaceholder: "8937204016150001234",
      checkButton: "Kontrollo Pakon",
      checking: "Duke kontrolluar...",
      yourPackages: "Pakot tuaja aktive",
      availablePackages: "Pakot e disponueshme",
      backButton: "Kthehu",
      packageNumber: "Pako #",
      lowData: "Pak të dhëna",
      active: "Aktive",
      remaining: "të mbetura",
      total: "totale",
      used: "Përdorur",
      expires: "Skadon",
      totalPackages: "Pakot totale",
      buyPackage: "Blej Pako",
      ourSite: "Faqja Jonë",
      activateNow: "Aktivizo Tani",
      activating: "Duke aktivizuar...",
      success: "Sukses!",
      successMessage: "Pakoja u aktivizua me sukses",
      refreshing: "Duke rifreskuar gjendjen...",
      smsConfirmed: "SMS konfirmimi u dërgua në pajisjen tuaj.",
      errorIccid: "Ju lutemi vendosni një numër ICCID të vlefshëm.",
      errorConnection: "Ndodhi një gabim gjatë lidhjes me serverin.",
      errorNoData: "Nuk u gjet asnjë informacion për këtë ICCID.",
      features: {
        data: "të dhëna",
        validity: "Vlefshmëri",
        instant: "Aktivizim i menjëhershëm"
      },
      price: "çmimi",
      days: "ditë",
      noPackages: "Asnjë pako nuk është e disponueshme në këtë moment."
    }
    ,

    // Checkout Page
    checkout: {
      eyebrow: "Pagesa",
      title: "Pagesa",
      description: "Rishiko përzgjedhjen dhe paguaj në mënyrë të sigurt për të përfunduar porosinë.",
      noSelectionTitle: "Nuk është zgjedhur asnjë pako",
      noSelectionBody: "Zgjidh një pako fillimisht, pastaj vazhdo te pagesa.",
      goToPackages: "Shiko pakot",
      packageLabel: "Pako",
      priceLabel: "Çmimi",
      payButton: "Paguaj me kartë",
      redirecting: "Duke ridrejtuar…",
      changeSelection: "Ndrysho përzgjedhjen",
      fineprint: "Do të ridrejtohesh te ofruesi ynë i pagesave për të përfunduar blerjen.",
      startError: "Nuk u arrit të nisej pagesa. Provo përsëri.",
      linkError: "Linku i pagesës nuk është i disponueshëm. Provo përsëri.",
      connectError: "Gabim gjatë lidhjes me ofruesin e pagesave. Provo përsëri."
    }
  }
};

// Get translation by key path (e.g., "balance.title")
export function getTranslation(lang, keyPath) {
  const keys = keyPath.split('.');
  let value = translations[lang];
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return keyPath; // Return key if translation not found
    }
  }
  
  return value || keyPath;
}

// Get all translations for a section
export function getTranslations(lang, section) {
  return translations[lang]?.[section] || {};
}

