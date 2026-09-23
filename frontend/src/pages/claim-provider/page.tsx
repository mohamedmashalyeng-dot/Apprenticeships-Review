import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { submitClaim } from "@/services/claims.service";
import { getApiErrorMessage } from "@/contexts/AuthContext";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ClaimProvider() {
  const [searchParams] = useSearchParams();
  const prefillName = searchParams.get("name") ?? "";
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const honeypot = (formData.get("website_alt") as string || "").trim();
    if (honeypot) {
      setFormStatus("success");
      form.reset();
      setCharCount(0);
      return;
    }

    const name = formData.get("organisation_name") as string;
    const contact = formData.get("contact_name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const website = formData.get("website") as string;

    if (!name?.trim() || !contact?.trim() || !email?.trim() || !role?.trim() || !website?.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setFormStatus("submitting");

    try {
      const details = (formData.get("verification_details") as string || "").trim();
      await submitClaim({
        organisationName: name.trim(),
        contactName: contact.trim(),
        email: email.trim(),
        role: role.trim(),
        website: website.trim(),
        verificationDetails: details || undefined,
      });

      setFormStatus("success");
      form.reset();
      setCharCount(0);
    } catch (err) {
      setFormStatus("error");
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
              Claim your provider profile
            </h1>
            <p className="mt-3 text-sm md:text-base text-foreground-600 max-w-2xl mx-auto leading-relaxed">
              Own your listing and manage how your organisation appears on ApprenticeshipsReviews. You'll be
              able to respond to reviews, update your profile, and track your performance.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            {/* Verification notice */}
            <div className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-200/60 dark:border-secondary-800/40 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                <i className="ri-shield-check-line text-base" />
              </div>
              <p className="text-xs text-foreground-600 leading-relaxed">
                Your organisation must be verified before you can manage the profile. We'll confirm your
                connection to the organisation using the details you provide, this usually takes a few working days.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl">
              {formStatus === "success" ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-4">
                    <i className="ri-check-line text-2xl" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground-900 mb-2">Request received</h3>
                  <p className="text-sm text-foreground-600 leading-relaxed">
                    Thank you for submitting your claim request. Our team will verify your details and contact
                    you within 2–3 working days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} data-readdy-form noValidate className="flex flex-col gap-5">
                  {/* Honeypot */}
                  <div className="hp-field">
                    <input type="text" name="website_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly />
                  </div>
                  <style>{`.hp-field { position: absolute; left: -9999px; opacity: 0; height: 0; width: 0; overflow: hidden; }`}</style>

                  {formStatus === "error" && formError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <i className="ri-error-warning-line text-red-600 text-sm flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="organisation_name" className="block text-sm font-medium text-foreground-700 mb-1.5">
                      Organisation name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="organisation_name"
                      name="organisation_name"
                      type="text"
                      required
                      defaultValue={prefillName}
                      placeholder="e.g. Kent Business College"
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact_name" className="block text-sm font-medium text-foreground-700 mb-1.5">
                        Contact person <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact_name"
                        name="contact_name"
                        type="text"
                        required
                        placeholder="Full name"
                        className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-foreground-700 mb-1.5">
                        Your role <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="role"
                        name="role"
                        type="text"
                        required
                        placeholder="e.g. Marketing Director"
                        className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground-700 mb-1.5">
                        Work email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="name@organisation.com"
                        className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-foreground-700 mb-1.5">
                        Provider website <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        required
                        placeholder="https://www.example.com"
                        className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="verification_details" className="block text-sm font-medium text-foreground-700 mb-1.5">
                      Verification information (optional)
                    </label>
                    <textarea
                      id="verification_details"
                      name="verification_details"
                      rows={3}
                      maxLength={500}
                      onChange={(e) => setCharCount(e.target.value.length)}
                      placeholder="Any additional details that help us verify your connection to this organisation (e.g. UKPRN, role details)."
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                    />
                    <p className="text-xs text-foreground-400 mt-1">{charCount}/500</p>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {formStatus === "submitting" ? "Submitting..." : "Submit claim request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
