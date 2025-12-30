import { useMemo } from "react";

export default function RegionsCountriesSection({ packages = [] }) {
  const regions = useMemo(
    () =>
      Array.from(
        new Set(
          (packages || [])
            .filter((p) => p.showInRegions !== false)
            .map((p) => p.regionGroup)
            .filter((v) => typeof v === "string" && v.trim() !== "")
        )
      ).sort(),
    [packages]
  );

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          (packages || [])
            .filter((p) => p.showInCountries !== false)
            .map((p) => {
              // Show regionGroup name instead of countries array
              if (p.regionGroup && typeof p.regionGroup === "string" && p.regionGroup.trim()) {
                return p.regionGroup.trim();
              }
              return null;
            })
            .filter((v) => v !== null && typeof v === "string" && v.trim() !== "")
        )
      ).sort(),
    [packages]
  );

  // Since we're now showing region names in countries, we don't need to separate flags
  // All countries entries are now region names (text)
  const regionNames = countries;

  const regionCounts = useMemo(() => {
    const map = new Map();
    (packages || []).forEach((p) => {
      const key = typeof p?.regionGroup === "string" ? p.regionGroup.trim() : "";
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [packages]);

  const flagCounts = useMemo(() => {
    const map = new Map();
    (packages || []).forEach((p) => {
      const list = Array.isArray(p?.countries) ? p.countries : [];
      list.forEach((c) => {
        if (typeof c !== "string") return;
        const key = c.trim();
        if (!/[\u{1F1E6}-\u{1F1FF}]{2}/u.test(key)) return;
        map.set(key, (map.get(key) || 0) + 1);
      });
    });
    return map;
  }, [packages]);

  if (regions.length === 0 && countries.length === 0) {
    return null;
  }

  return (
    <section className="section" id="regions-countries">
      <div className="container">
        <div className="regions-countries-grid">
          <div className="regions-countries-group">
            <h3 className="regions-countries-label">Regions</h3>
            <div className="hero-card-grid">
              {regions.map((region) => (
                <article key={region} className="hero-card hero-card--compact">
                  <div className="hero-card-header">
                    <span className="hero-card-label">Region</span>
                    <span className="hero-card-region">{region}</span>
                  </div>
                  <div className="hero-card-main">
                    <div className="hero-card-price">
                      <span className="hero-card-amount">eSIM</span>
                      <span className="hero-card-note">ready</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {regionNames.length > 0 && (
            <div className="regions-countries-group">
              <h3 className="regions-countries-label">Countries</h3>
              <div className="hero-card-grid">
                {regionNames.map((regionName) => (
                  <article key={regionName} className="hero-card hero-card--compact">
                    <div className="hero-card-header">
                      <span className="hero-card-label">Country</span>
                      <span className="hero-card-region">{regionName}</span>
                    </div>
                    <div className="hero-card-main">
                      <div className="hero-card-price">
                        <span className="hero-card-amount">LTE/5G</span>
                        <span className="hero-card-note">where supported</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

