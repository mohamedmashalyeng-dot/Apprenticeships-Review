import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { useAuth, getApiErrorMessage } from "@/contexts/AuthContext";
import { getCompanyBySlug, updateCompany } from "@/services/companies.service";
import LoadingIndicator from "@/components/base/LoadingIndicator";

function listToText(items: string[]): string {
  return items.join("\n");
}

function textToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function ListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-700 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="One per line"
        className="w-full px-3 py-2.5 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors resize-none"
      />
    </div>
  );
}

export default function EditProviderProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const slug = user?.managedCompanySlug ?? null;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [tradingName, setTradingName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryModel, setDeliveryModel] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [bestFor, setBestFor] = useState("");

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    getCompanyBySlug(slug)
      .then((company) => {
        if (!company) return;
        setTradingName(company.trading_name);
        setLegalName(company.legal_name || "");
        setWebsite(company.website || "");
        setLocation(company.location || "");
        setDeliveryModel(company.delivery_model || "");
        setDescription(company.description || "");
        setLogoUrl(company.logoUrl || "");
        setStrengths(listToText(company.strengths || []));
        setWeaknesses(listToText(company.weaknesses || []));
        setBestFor(listToText(company.best_for || []));
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setError("");
    setSaved(false);
    setIsSaving(true);

    updateCompany(slug, {
      trading_name: tradingName.trim(),
      legal_name: legalName.trim(),
      website: website.trim(),
      location: location.trim(),
      delivery_model: deliveryModel.trim(),
      description: description.trim(),
      logo_url: logoUrl.trim(),
      strengths: textToList(strengths),
      weaknesses: textToList(weaknesses),
      best_for: textToList(bestFor),
    })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">Manage profile</h1>
              <p className="mt-2 text-sm text-foreground-600">
                Update how your organisation appears on ApprenticeshipsReviews.
              </p>
            </div>
            {slug && (
              <Link
                to={`/provider/${slug}`}
                className="px-4 py-2.5 bg-background-100 text-foreground-700 text-sm font-semibold rounded-full hover:bg-background-200 transition-colors whitespace-nowrap"
              >
                View public profile
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <LoadingIndicator />
            ) : !slug ? (
              <div className="p-8 bg-background-100 rounded-2xl text-center">
                <p className="text-sm text-foreground-600">
                  Your account isn't linked to a provider yet.{" "}
                  <Link to="/claim-provider" className="text-primary-600 hover:text-primary-700 font-medium">
                    Claim your provider profile
                  </Link>{" "}
                  first.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <i className="ri-error-warning-line text-red-600 text-sm flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                {saved && (
                  <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-2">
                    <i className="ri-check-line text-primary-600 text-sm flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-700">Profile updated.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">Trading name</label>
                    <input
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">Legal entity name</label>
                    <input
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">Location</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. London, UK"
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5">Delivery model</label>
                  <input
                    value={deliveryModel}
                    onChange={(e) => setDeliveryModel(e.target.value)}
                    placeholder="e.g. Blended, Online, In-person"
                    className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5">Logo URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://www.example.com/logo.png"
                    className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ListField label="Strengths" value={strengths} onChange={setStrengths} />
                  <ListField label="Weaknesses" value={weaknesses} onChange={setWeaknesses} />
                  <ListField label="Best for" value={bestFor} onChange={setBestFor} />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/provider-dashboard")}
                    className="px-6 py-3 text-sm text-foreground-500 hover:text-foreground-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
