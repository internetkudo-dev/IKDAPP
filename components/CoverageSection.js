import Link from "next/link";
import { COVERAGE } from "../data/coverage";

export default function CoverageSection() {
  const allRegions = COVERAGE.map((c) => c.region).join(", ");

  return (
    <section className="section coverage-shell" id="coverage">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Coverage</div>
          <h2 className="section-title">Roam like a local in key regions</h2>
          <p className="section-description">
            We partner with leading networks across the globe so your data just
            works—at the airport, on the train, or in your hotel lobby. Currently
            available in {allRegions}.
          </p>
        </div>
        <div className="coverage-grid">
          {COVERAGE.map((c) => (
            <Link key={c.slug || c.region} href={`/coverage/${c.slug}`}>
              <article className="coverage-card">
                <div className="coverage-region">{c.region}</div>
                <div className="coverage-countries">{c.countries}</div>
                <p className="coverage-note">{c.note}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

