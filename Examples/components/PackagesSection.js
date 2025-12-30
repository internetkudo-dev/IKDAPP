import { useEffect, useMemo, useRef, useState } from "react";
import { PACKAGES } from "../data/packages";
import PackageModal from "./PackageModal";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

export default function PackagesSection({ packages = PACKAGES }) {
  const { language } = useLanguage();
  const t = getTranslations(language, "packagesSection");
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState({ type: null, value: null });
  const [query, setQuery] = useState("");
  const didInitDefaultFilterRef = useRef(false);
  const [expandedCountryIds, setExpandedCountryIds] = useState(() => new Set());

  // Drag-to-scroll handlers for horizontal chip lists
  const makeDragScrollHandlers = () => {
    const state = {
      isDown: false,
      startX: 0,
      startScrollLeft: 0,
      moved: false
    };

    return {
      onMouseDown: (e) => {
        const el = e.currentTarget;
        state.isDown = true;
        state.moved = false;
        state.startX = e.pageX - el.getBoundingClientRect().left;
        state.startScrollLeft = el.scrollLeft;
      },
      onMouseLeave: () => {
        state.isDown = false;
      },
      onMouseUp: () => {
        state.isDown = false;
      },
      onMouseMove: (e) => {
        if (!state.isDown) return;
        const el = e.currentTarget;
        e.preventDefault();
        const x = e.pageX - el.getBoundingClientRect().left;
        const walk = x - state.startX;
        if (Math.abs(walk) > 3) state.moved = true;
        el.scrollLeft = state.startScrollLeft - walk;
      },
      onClickCapture: (e) => {
        // If the user dragged, prevent accidental chip clicks.
        if (state.moved) {
          e.preventDefault();
          e.stopPropagation();
          state.moved = false;
        }
      }
    };
  };

  const regionDragHandlersRef = useRef(null);
  const countryDragHandlersRef = useRef(null);
  if (!regionDragHandlersRef.current)
    regionDragHandlersRef.current = makeDragScrollHandlers();
  if (!countryDragHandlersRef.current)
    countryDragHandlersRef.current = makeDragScrollHandlers();

  const getDisplayCountries = (pkg) => {
    if (!pkg) return [];

    // Prefer structured data when present
    if (Array.isArray(pkg.countryDetails) && pkg.countryDetails.length > 0) {
      return pkg.countryDetails
        .map((c) => (c && typeof c.name === "string" ? c.name.trim() : ""))
        .filter(Boolean);
    }

    const raw = Array.isArray(pkg.countries) ? pkg.countries : [];
    const regionGroup = typeof pkg.regionGroup === "string" ? pkg.regionGroup.trim() : "";
    const region = typeof pkg.region === "string" ? pkg.region.trim() : "";

    const isEmojiOnly = (value) => {
      const s = String(value || "").trim();
      if (!s) return false;
      try {
        return /^\p{Extended_Pictographic}+$/u.test(s);
      } catch {
        // Fallback for environments without Unicode property escapes
        return /^[\uD800-\uDBFF][\uDC00-\uDFFF]+$/.test(s);
      }
    };

    const seen = new Set();
    const cleaned = [];
    for (const item of raw) {
      const s = typeof item === "string" ? item.trim() : "";
      if (!s) continue;
      if (isEmojiOnly(s)) continue;
      if (regionGroup && s === regionGroup) continue;
      if (region && s === region) continue;
      if (seen.has(s.toLowerCase())) continue;
      seen.add(s.toLowerCase());
      cleaned.push(s);
    }
    return cleaned;
  };

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

  // Countries filter now shows region names instead of country flags/text
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

  // Default to "Europa" region if it exists (only once when packages are available).
  useEffect(() => {
    if (didInitDefaultFilterRef.current) return;
    if (!regions || regions.length === 0) return;

    const europa = regions.find(
      (r) => typeof r === "string" && r.trim().toLowerCase() === "europa"
    );
    if (europa) {
      setActiveFilter({ type: "region", value: europa });
      didInitDefaultFilterRef.current = true;
      return;
    }

    // If Europa isn't present, still mark initialized so we don't keep re-checking.
    didInitDefaultFilterRef.current = true;
  }, [regions]);

  const visiblePackages = (packages || []).filter((p) => {
    const q = query.trim().toLowerCase();

    // If user is searching, search across ALL packages regardless of region/country filter.
    if (q) {
      const haystack = [
        p.name,
        p.region,
        p.regionGroup,
        ...(p.countries || []),
        ...(Array.isArray(p.countryDetails) ? p.countryDetails.map((c) => c?.name) : [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    }

    // Apply region filter - only show if showInRegions is not false
    if (activeFilter.type === "region" && activeFilter.value) {
      if (p.showInRegions === false) return false;
      if (p.regionGroup !== activeFilter.value) return false;
    }

    // Apply country filter - only show if showInCountries is not false
    // Countries filter now matches by regionGroup name
    if (activeFilter.type === "country" && activeFilter.value) {
      if (p.showInCountries === false) return false;
      if (p.regionGroup !== activeFilter.value) return false;
    }

    return true;
  });

  return (
    <section className="section" id="packages">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">{t.eyebrow}</div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-description">{t.description}</p>
        </div>

        {(!packages || packages.length === 0) && (
          <div className="package-filter-empty" style={{ marginBottom: "1rem" }}>
            {t.noPackagesLoaded}
          </div>
        )}

        <div className="package-filters">
          <div className="package-search-row">
            <input
              type="text"
              className="package-search-input"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="package-filter-group">
            <div className="package-filter-label">
              {t.regionsLabel}{" "}
              {regions.length > 0 && (
                <span className="filter-count">({regions.length})</span>
              )}
            </div>
            <div
              className="package-filter-chips package-filter-chips-scroll"
              {...regionDragHandlersRef.current}
            >
              <button
                key="all"
                type="button"
                className={
                  "package-filter-chip" +
                  (activeFilter.type !== "region" || activeFilter.value === null
                    ? " is-active"
                    : "")
                }
                onClick={() =>
                  setActiveFilter({ type: null, value: null })
                }
              >
                {t.allLabel}
              </button>
              {regions.length > 0 ? (
                regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    className={
                      "package-filter-chip" +
                      (activeFilter.type === "region" &&
                      activeFilter.value === region
                        ? " is-active"
                        : "")
                    }
                    onClick={() =>
                      setActiveFilter({ type: "region", value: region })
                    }
                  >
                    {region}
                  </button>
                ))
              ) : (
                <div className="package-filter-empty">{t.noRegions}</div>
              )}
            </div>
          </div>

          <div className="package-filter-group">
            <div className="package-filter-label">
              {t.countriesLabel}{" "}
              {countries.length > 0 && (
                <span className="filter-count">({countries.length})</span>
              )}
            </div>
            <div
              className="package-filter-chips package-filter-chips-scroll package-filter-chips-flags"
              {...countryDragHandlersRef.current}
            >
              {countries.length > 0 ? (
                countries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    className={
                      "package-filter-chip package-filter-chip-flag" +
                      (activeFilter.type === "country" &&
                      activeFilter.value === country
                        ? " is-active"
                        : "")
                    }
                    onClick={() =>
                      setActiveFilter({ type: "country", value: country })
                    }
                    title={country}
                  >
                    {country}
                  </button>
                ))
              ) : (
                <div className="package-filter-empty">{t.noCountries}</div>
              )}
            </div>
          </div>
        </div>

        <div className="packages-grid">
          {visiblePackages.map((p) => (
            <article
              key={p.id}
              className={
                "package-card" + (p.highlighted ? " package-card-highlighted" : "")
              }
            >
              {p.highlighted && (
                <div className="package-chip-row">
                  <span className="package-chip">{t.mostPopular}</span>
                </div>
              )}
              <h3 className="package-name">{p.name}</h3>
              {/* Hide descriptive best-for text on the package card */}
              {/* <p className="package-bestfor">{p.bestFor}</p> */}
              <div className="package-main">
                <div>
                  <div className="package-data">{p.data}</div>
                  {/* Show only validity (duration) underneath the data */}
                  <div className="package-duration">{p.duration}</div>
                </div>
                <div className="package-price">
                  <span className="package-amount">{p.price}</span>
                  {/* Show country count below price, parallel to duration */}
                  <span className="package-note">
                    {(() => {
                      const count = getDisplayCountries(p).length;
                      return count > 0
                        ? `${count} ${
                            count === 1 ? t.countrySingular : t.countryPlural
                          }`
                        : t.noCountriesLabel;
                    })()}
                  </span>
                </div>
              </div>
              {/* Hide small feature list text on the package card */}
              {/* <ul className="package-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul> */}
              {(() => {
                const allCountries = getDisplayCountries(p);
                if (allCountries.length === 0) return null;

                const isExpanded = expandedCountryIds.has(p.id);
                const preview = allCountries.slice(0, 4);
                const extra = Math.max(0, allCountries.length - preview.length);

                const text = isExpanded
                  ? allCountries.join(", ")
                  : `${preview.join(", ")}${
                      extra > 0 ? ` +${extra} ${t.moreLabel}` : ""
                    }`;

                return (
                  <button
                    type="button"
                    className={
                      "package-countries-preview" +
                      (isExpanded ? " is-expanded" : "")
                    }
                    onClick={() =>
                      setExpandedCountryIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(p.id)) next.delete(p.id);
                        else next.add(p.id);
                        return next;
                      })
                    }
                    aria-expanded={isExpanded}
                    title={
                      isExpanded ? t.collapseTooltip : t.showTooltip
                    }
                  >
                    {text}
                  </button>
                );
              })()}
              <button
                type="button"
                className="btn-primary package-cta"
                onClick={() => setSelected(p)}
              >
                {t.buyButton}
              </button>
            </article>
          ))}
        </div>
      </div>
      <PackageModal open={!!selected} pkg={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

