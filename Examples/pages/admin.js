import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const EMPTY_FORM = {
  id: "",
  name: "",
  region: "",
  regionGroup: "",
  countries: "",
  data: "",
  duration: "",
  price: "",
  bestFor: "",
  highlighted: false,
  showInRegions: true,
  showInCountries: true
};

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingStripe, setSyncingStripe] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin-packages");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setItems(json.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load packages. Check server logs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name || "",
      region: item.region || "",
      regionGroup: item.regionGroup || "",
      countries: Array.isArray(item.countries)
        ? item.countries.join(", ")
        : "",
      data: item.data || "",
      duration: item.duration || "",
      price: item.price || "",
      bestFor: item.bestFor || "",
      highlighted: Boolean(item.highlighted),
      showInRegions: item.showInRegions !== undefined ? Boolean(item.showInRegions) : true,
      showInCountries: item.showInCountries !== undefined ? Boolean(item.showInCountries) : true
    });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Delete this package?");
    if (!ok) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin-packages/${id}`, {
        method: "DELETE"
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to delete: ${res.status}`);
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((pid) => pid !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError("Failed to delete package.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        id: form.id || undefined,
        name: form.name,
        region: form.region,
        regionGroup: form.regionGroup,
        countries: form.countries,
        data: form.data,
        duration: form.duration,
        price: form.price,
        bestFor: form.bestFor,
        highlighted: form.highlighted,
        showInRegions: form.showInRegions,
        showInCountries: form.showInCountries
      };

      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `/api/admin-packages/${editingId}`
        : "/api/admin-packages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status}`);
      }
      const json = await res.json();
      const saved = json.item;
      setItems((prev) => {
        if (isEditing) {
          return prev.map((p) => (p.id === saved.id ? saved : p));
        }
        return [...prev, saved];
      });
      resetForm();
    } catch (err) {
      setError("Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllVisible = (visibleItems) => {
    if (!visibleItems.length) return;
    const visibleIds = visibleItems.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...visibleIds.filter((id) => !prev.includes(id))
      ]);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `Delete ${selectedIds.length} selected package(s)?`
    );
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      const idsToDelete = [...selectedIds];
      const responses = await Promise.all(
        idsToDelete.map((id) =>
          fetch(`/api/admin-packages/${id}`, { method: "DELETE" })
        )
      );
      const anyError = responses.some(
        (res) => !res.ok && res.status !== 204 && res.status !== 404
      );
      setItems((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
      setSelectedIds([]);
      if (editingId && idsToDelete.includes(editingId)) {
        resetForm();
      }
      if (anyError) {
        setError("Some packages could not be deleted.");
      }
    } catch (err) {
      setError("Failed to delete selected packages.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdateDisplay = async (updates) => {
    if (!selectedIds.length) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `Update display settings for ${selectedIds.length} selected package(s)?`
    );
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin-packages/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          updates
        })
      });
      if (!res.ok) {
        throw new Error(`Failed to update: ${res.status}`);
      }
      const json = await res.json();
      const updatedItems = json.items || [];
      setItems((prev) =>
        prev.map((p) => {
          const updated = updatedItems.find((u) => u.id === p.id);
          return updated || p;
        })
      );
      setSelectedIds([]);
    } catch (err) {
      setError("Failed to update selected packages.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncFromTelco = async () => {
    setSyncing(true);
    setError("");
    try {
      const res = await fetch("/api/admin-packages/sync-telco", {
        method: "POST"
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to sync: ${res.status}`);
      }
      const json = await res.json();
      setItems(json.items || []);
      // eslint-disable-next-line no-alert
      alert(`Sync completed! Imported ${json.importedCount || 0} packages from Telco API.`);
    } catch (err) {
      setError(`Failed to sync packages from Telco API: ${err.message}`);
      // eslint-disable-next-line no-console
      console.error("Sync from Telco error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncToStripeProducts = async () => {
    setSyncingStripe(true);
    setError("");
    try {
      const res = await fetch("/api/admin-packages/sync-stripe-products", {
        method: "POST"
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to sync: ${res.status}`);
      }
      const json = await res.json();
      // eslint-disable-next-line no-alert
      alert(
        `Sync completed!\nCreated: ${json.results?.created || 0}\nUpdated: ${json.results?.updated || 0}\nSkipped: ${json.results?.skipped || 0}\nErrors: ${json.results?.errors?.length || 0}`
      );
    } catch (err) {
      setError(`Failed to sync packages to Stripe products: ${err.message}`);
    } finally {
      setSyncingStripe(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = items.filter((p) => {
    const matchesRegion =
      !regionFilter ||
      p.regionGroup === regionFilter ||
      p.region === regionFilter;

    if (!matchesRegion) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      p.name,
      p.region,
      p.regionGroup,
      Array.isArray(p.countries) ? p.countries.join(", ") : p.countries,
      p.data,
      p.duration,
      p.price,
      p.bestFor
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const regionOptions = Array.from(
    new Set(
      items
        .map((p) => p.regionGroup || p.region)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const allVisibleSelected =
    filteredItems.length > 0 &&
    filteredItems.every((p) => selectedIds.includes(p.id));

  return (
    <Layout>
      <section className="section">
        <div className="container">
            <div className="section-header">
              <div className="section-eyebrow">Admin</div>
              <h2 className="section-title">Manage all packages</h2>
              <p className="section-description">
                Create, edit and delete the packages that appear on the public site.
              </p>
            </div>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-grid">
            <div className="admin-form-card">
              <h3 className="admin-form-title">
                {editingId ? "Edit package" : "Create new package"}
              </h3>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-row">
                  <label className="admin-label">
                    Name
                    <input
                      className="admin-input"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>
                <div className="admin-form-row admin-form-row-inline">
                  <label className="admin-label">
                    Region
                    <input
                      className="admin-input"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      placeholder="Europe, Global, etc."
                    />
                  </label>
                  <label className="admin-label">
                    Region group
                    <input
                      className="admin-input"
                      name="regionGroup"
                      value={form.regionGroup}
                      onChange={handleChange}
                      placeholder="Used for filtering"
                    />
                  </label>
                </div>
                <div className="admin-form-row">
                  <label className="admin-label">
                    Countries (comma separated)
                    <input
                      className="admin-input"
                      name="countries"
                      value={form.countries}
                      onChange={handleChange}
                      placeholder="🇦🇱, 🇽🇰, Albania, Kosovo"
                    />
                  </label>
                </div>
                <div className="admin-form-row admin-form-row-inline">
                  <label className="admin-label">
                    Data
                    <input
                      className="admin-input"
                      name="data"
                      value={form.data}
                      onChange={handleChange}
                      placeholder="20 GB"
                    />
                  </label>
                  <label className="admin-label">
                    Duration
                    <input
                      className="admin-input"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="7 days"
                    />
                  </label>
                  <label className="admin-label">
                    Price
                    <input
                      className="admin-input"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="€10"
                    />
                  </label>
                </div>
                <div className="admin-form-row">
                  <label className="admin-label">
                    Best for (short description)
                    <input
                      className="admin-input"
                      name="bestFor"
                      value={form.bestFor}
                      onChange={handleChange}
                      placeholder="Weekend trip, business travel…"
                    />
                  </label>
                </div>
                <div className="admin-form-row admin-form-row-inline">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      name="highlighted"
                      checked={form.highlighted}
                      onChange={handleChange}
                    />
                <span>Mark as "Most popular" (featured in Hero)</span>
                  </label>
                </div>
                <div className="admin-form-row admin-form-row-inline">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      name="showInRegions"
                      checked={form.showInRegions}
                      onChange={handleChange}
                    />
                    <span>Show in Regions</span>
                  </label>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      name="showInCountries"
                      checked={form.showInCountries}
                      onChange={handleChange}
                    />
                    <span>Show in Countries</span>
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? editingId
                        ? "Saving…"
                        : "Creating…"
                      : editingId
                      ? "Save changes"
                      : "Create package"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-list-card">
              <h3 className="admin-form-title">
                All packages (admin only)
              </h3>
              <div className="admin-list-toolbar">
                <div className="admin-list-filters">
                  <input
                    className="admin-input admin-list-search"
                    placeholder="Search by name, region, country…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="admin-input admin-list-select"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option value="">All regions</option>
                    {regionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-list-bulk-actions">
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-btn"
                    onClick={handleSyncFromTelco}
                    disabled={syncing || syncingStripe || saving || loading}
                  >
                    {syncing ? "Syncing…" : "Sync from Telco"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-btn"
                    onClick={handleSyncToStripeProducts}
                    disabled={syncing || syncingStripe || saving || loading}
                  >
                    {syncingStripe ? "Syncing to Stripe…" : "Sync to Stripe Products"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-btn"
                    onClick={() => handleBulkUpdateDisplay({ showInRegions: true, showInCountries: true })}
                    disabled={saving || selectedIds.length === 0}
                  >
                    Show in Both
                  </button>
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-btn"
                    onClick={() => handleBulkUpdateDisplay({ showInRegions: true, showInCountries: false })}
                    disabled={saving || selectedIds.length === 0}
                  >
                    Regions Only
                  </button>
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-btn"
                    onClick={() => handleBulkUpdateDisplay({ showInRegions: false, showInCountries: true })}
                    disabled={saving || selectedIds.length === 0}
                  >
                    Countries Only
                  </button>
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-btn"
                    onClick={() => handleBulkUpdateDisplay({ showInRegions: false, showInCountries: false })}
                    disabled={saving || selectedIds.length === 0}
                  >
                    Show in None
                  </button>
                  <button
                    type="button"
                    className="btn-secondary admin-list-bulk-delete"
                    onClick={handleBulkDelete}
                    disabled={saving || selectedIds.length === 0}
                  >
                    Delete{" "}
                    {selectedIds.length > 0 && `(${selectedIds.length})`}
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="admin-muted">Loading…</div>
              ) : items.length === 0 ? (
                <div className="admin-muted">
                  No packages yet. Use the form to create one.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={() =>
                            handleToggleSelectAllVisible(filteredItems)
                          }
                          aria-label="Select all visible packages"
                        />
                      </th>
                      <th>Name</th>
                      <th>Region</th>
                      <th>Data</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Display</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p.id)}
                            onChange={() => handleToggleSelectOne(p.id)}
                            aria-label={`Select package ${p.name}`}
                          />
                        </td>
                        <td>{p.name}</td>
                        <td>{p.regionGroup || p.region}</td>
                        <td>{p.data}</td>
                        <td>{p.duration}</td>
                        <td>{p.price}</td>
                        <td className="admin-table-display">
                          <span className={`admin-display-badge ${(p.showInRegions !== false) ? 'admin-display-active' : 'admin-display-inactive'}`}>
                            Regions
                          </span>
                          <span className={`admin-display-badge ${(p.showInCountries !== false) ? 'admin-display-active' : 'admin-display-inactive'}`}>
                            Countries
                          </span>
                        </td>
                        <td className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-link"
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-link admin-link-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}


