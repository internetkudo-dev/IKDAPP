import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import { PACKAGES } from "../../data/packages";
import { COVERAGE } from "../../data/coverage";

export default function CoverageRegionPage() {
  const router = useRouter();
  const { slug } = router.query;

  const coverage = COVERAGE.find((c) => c.slug === slug);
  const regionName = coverage ? coverage.region : null;

  const regionPackages = regionName
    ? PACKAGES.filter((p) => p.showInRegions !== false && p.regionGroup === regionName)
    : [];

  const hasLoaded = typeof slug === "string";

  return (
    <Layout>
      <section className="section" id="coverage-region">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Coverage</div>
            <h2 className="section-title">
              {regionName
                ? `Packages in ${regionName}`
                : hasLoaded
                ? "Coverage not found"
                : "Loading coverage..."}
            </h2>
            <p className="section-description">
              {regionName
                ? `Browse all data packages currently available for ${regionName}.`
                : hasLoaded
                ? "We couldn't find any coverage details for this region."
                : "Please wait while we look up coverage details for this region."}
            </p>
          </div>

          {regionName && (
            <>
              <div className="coverage-grid" style={{ marginBottom: "2rem" }}>
                <article className="coverage-card">
                  <div className="coverage-region">{coverage.region}</div>
                  <div className="coverage-countries">
                    {coverage.countries}
                  </div>
                  <p className="coverage-note">{coverage.note}</p>
                </article>
              </div>

              {regionPackages.length > 0 ? (
                <div className="packages-grid">
                  {regionPackages.map((p) => (
                    <article
                      key={p.id}
                      className={
                        "package-card" +
                        (p.highlighted ? " package-card-highlighted" : "")
                      }
                    >
                      <div className="package-chip-row">
                        <span className="package-region">
                          {p.regionGroup
                            ? `${p.regionGroup} · ${p.region}`
                            : p.region}
                        </span>
                        {p.highlighted && (
                          <span className="package-chip">Most popular</span>
                        )}
                      </div>
                      <h3 className="package-name">{p.name}</h3>
                      <p className="package-bestfor">{p.bestFor}</p>
                      <div className="package-main">
                        <div>
                          <div className="package-data">{p.data}</div>
                          <div className="package-duration">{p.duration}</div>
                        </div>
                        <div className="package-price">
                          <span className="package-amount">{p.price}</span>
                          <span className="package-note">
                            {Array.isArray(p.countries) && p.countries.length > 0
                              ? `${p.countries.length} ${p.countries.length === 1 ? 'country' : 'countries'}`
                              : 'No countries'}
                          </span>
                        </div>
                      </div>
                      <ul className="package-features">
                        {p.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="section-description">
                  We don&apos;t have any packages listed for this region yet.
                  Please check back soon or{" "}
                  <Link href="/#packages">browse all packages</Link>.
                </p>
              )}
            </>
          )}

          <div style={{ marginTop: "2.5rem" }}>
            <Link href="/#coverage">
              <button type="button" className="btn-secondary">
                ← Back to coverage overview
              </button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}


