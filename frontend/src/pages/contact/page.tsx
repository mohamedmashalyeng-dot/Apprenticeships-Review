import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

type FormStatus = "idle" | "submitting" | "success" | "error";

const commonTopics = [
  { icon: "ri-information-line", title: "General enquiry", description: "Questions about the platform, how to use it, or anything else not covered below." },
  { icon: "ri-error-warning-line", title: "Report a data error", description: "Found incorrect provider data, a broken link, or outdated information on a provider profile." },
  { icon: "ri-flag-line", title: "Report a review", description: "A review appears to violate our community guidelines. You can also report directly from the review card." },
  { icon: "ri-building-2-line", title: "Provider listing update", description: "You represent a provider and need to update registration details, standards delivered, or contact information." },
  { icon: "ri-chat-check-line", title: "Verification issue", description: "You submitted a review and have not received a status update, or your verification was declined and you want to understand why." },
  { icon: "ri-service-line", title: "Partnership or press", description: "Media enquiries, partnership proposals, or requests to use our data in research or publications." },
];

export default function Contact() {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const honeypot = formData.get("phone_alt") as string;
    if (honeypot && honeypot.trim() !== "") {
      setFormStatus("success");
      form.reset();
      return;
    }

    // Basic validation
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    if (!name || !name.trim() || !email || !email.trim() || !subject || !subject.trim() || !message || !message.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (message.length > 500) {
      setFormError("Message must be 500 characters or fewer.");
      return;
    }

    setFormStatus("submitting");

    try {
      const res = await fetch("https://readdy.ai/api/form/d958edlmi650so75e8vg", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }).toString(),
      });

      const responseText = await res.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // ignore parse errors
      }

      if (!res.ok) {
        const serverMsg = (parsed?.meta as Record<string, string>)?.message || responseText || "Something went wrong. Please try again.";
        setFormError(typeof serverMsg === "string" ? serverMsg : "Something went wrong. Please try again.");
        setFormStatus("error");
        return;
      }

      if (parsed?.code === "OK") {
        setFormStatus("success");
        form.reset();
        setCharCount(0);
      } else {
        const serverMsg = (parsed?.meta as Record<string, string>)?.message || (parsed?.meta as Record<string, string>)?.detail || JSON.stringify(parsed);
        if (typeof serverMsg === "string" && (serverMsg.includes("spam") || serverMsg.includes("form data is spam"))) {
          setFormStatus("success");
          form.reset();
          return;
        }
        setFormError(typeof serverMsg === "string" ? serverMsg : "Something went wrong. Please try again.");
        setFormStatus("error");
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setFormStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <style>{`
        .hp-field { position: absolute; left: -9999px; opacity: 0; height: 0; width: 0; overflow: hidden; }
      `}</style>

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/3b4c46c741794d28851b2d3f6aa67155.png"
            alt="Abstract composition suggesting communication and connection"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/15 backdrop-blur-sm rounded-full border border-background-50/20 mb-8">
              <i className="ri-mail-line text-white text-sm" />
              <span className="text-sm text-white font-medium">Get In Touch</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Contact us
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Have a question, spotted an error, or want to discuss a partnership? We would love to hear from you. Use the form below or browse our topic guide to help us route your message to the right person.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="p-6 md:p-8 bg-background-100 rounded-xl border border-background-200/70">
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground-950 mb-2">Send us a message</h2>
                  <p className="text-sm text-foreground-600 mb-6">Fill out the form below and we will get back to you within 2 working days.</p>

                  {formStatus === "success" ? (
                    <div className="p-5 bg-green-50 border border-green-200/70 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-checkbox-circle-line text-green-600 text-lg" />
                        <span className="text-sm font-semibold text-green-800">Message sent</span>
                      </div>
                      <p className="text-sm text-green-700 leading-relaxed">
                        Thank you for getting in touch. We have received your message and will respond within 2 working days. If your enquiry is urgent, please reference your subject line when following up.
                      </p>
                      <button
                        type="button"
                        className="mt-4 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-colors whitespace-nowrap"
                        onClick={() => {
                          setFormStatus("idle");
                          setFormError("");
                        }}
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form ref={formRef} onSubmit={handleSubmit} data-readdy-form noValidate>
                      {/* Honeypot */}
                      <div className="hp-field">
                        <input type="text" name="phone_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly />
                      </div>

                      {formStatus === "error" && formError && (
                        <div className="p-4 bg-red-50 border border-red-200/70 rounded-lg mb-5 flex items-start gap-2">
                          <i className="ri-error-warning-line text-red-600 text-sm flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{formError}</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-5">
                        {/* Name */}
                        <div>
                          <label htmlFor="contact-name" className="block text-sm font-medium text-foreground-700 mb-1.5">
                            Your name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            name="name"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
                            placeholder="e.g. Sarah Williams"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="contact-email" className="block text-sm font-medium text-foreground-700 mb-1.5">
                            Email address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors"
                            placeholder="sarah@example.com"
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground-700 mb-1.5">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="contact-subject"
                            name="subject"
                            required
                            className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-lg text-sm text-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors appearance-none"
                            style={{
                              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 1rem center",
                              paddingRight: "2.5rem",
                            }}
                          >
                            <option value="">Select a topic</option>
                            <option value="General enquiry">General enquiry</option>
                            <option value="Report a data error">Report a data error</option>
                            <option value="Report a review">Report a review</option>
                            <option value="Provider listing update">Provider listing update</option>
                            <option value="Verification issue">Verification issue</option>
                            <option value="Partnership or press">Partnership or press</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Message */}
                        <div>
                          <label htmlFor="contact-message" className="block text-sm font-medium text-foreground-700 mb-1.5">
                            Your message <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="contact-message"
                            name="message"
                            required
                            rows={5}
                            maxLength={500}
                            className="w-full px-4 py-3 bg-background-50 border border-background-200 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-colors resize-none"
                            placeholder="Tell us what you need help with. The more detail you provide, the faster we can help."
                            onChange={(e) => setCharCount(e.target.value.length)}
                          />
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-foreground-400">
                              Be as specific as possible — it helps us route your message faster.
                            </p>
                            <span className={`text-xs ${charCount > 450 ? "text-amber-600" : "text-foreground-400"}`}>
                              {charCount}/500
                            </span>
                          </div>
                        </div>

                        {/* Consent */}
                        <div className="flex items-start gap-2">
                          <input
                            id="contact-consent"
                            name="consent"
                            type="checkbox"
                            required
                            className="mt-1 w-4 h-4 rounded border-background-300 text-primary-500 focus:ring-primary-300"
                          />
                          <label htmlFor="contact-consent" className="text-xs text-foreground-600 leading-relaxed">
                            I understand that my message will be processed in accordance with our review policy and that my contact details will only be used to respond to this enquiry.
                          </label>
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={formStatus === "submitting"}
                          className="w-full sm:w-auto px-8 py-3.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {formStatus === "submitting" ? (
                            <span className="inline-flex items-center gap-2">
                              <i className="ri-loader-4-line animate-spin" />
                              Sending...
                            </span>
                          ) : (
                            "Send message"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h3 className="font-heading text-base font-semibold text-foreground-900 mb-4">What can we help with?</h3>
                  <div className="flex flex-col gap-3">
                    {commonTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 bg-background-100 rounded-lg border border-background-200/70"
                      >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <i className={`${topic.icon} text-sm`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground-800">{topic.title}</p>
                          <p className="text-xs text-foreground-500 mt-0.5 leading-relaxed">{topic.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-secondary-50 dark:bg-secondary-950/40 rounded-xl border border-secondary-200/70 dark:border-secondary-800/40">
                  <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-3">Before you contact us</h3>
                  <ul className="flex flex-col gap-2.5">
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-secondary-600 text-sm flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground-600 leading-relaxed">
                        Check our <Link to="/methodology" className="text-primary-600 hover:text-primary-700 font-medium">Methodology</Link> page for questions about how scores are calculated.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-secondary-600 text-sm flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground-600 leading-relaxed">
                        Read the <Link to="/review-policy" className="text-primary-600 hover:text-primary-700 font-medium">Review Policy</Link> for questions about verification or moderation.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-secondary-600 text-sm flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground-600 leading-relaxed">
                        Use the report button on a review card to flag a specific review directly.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-secondary-600 text-sm flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground-600 leading-relaxed">
                        For provider comparison questions, try our <Link to="/compare" className="text-primary-600 hover:text-primary-700 font-medium">Compare tool</Link> first.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Looking for something else?
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base">
                Here are the most common destinations people look for when they visit our contact page.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Compare Providers", href: "/compare", icon: "ri-arrow-left-right-line" },
                { label: "Standards", href: "/standards", icon: "ri-file-list-3-line" },
                { label: "Reviews", href: "/reviews", icon: "ri-chat-quote-line" },
                { label: "Help Centre", href: "/help", icon: "ri-graduation-cap-line" },
                { label: "For Providers", href: "/claim-provider", icon: "ri-building-4-line" },
                { label: "Methodology", href: "/methodology", icon: "ri-pie-chart-2-line" },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex flex-col items-center gap-2 p-5 bg-background-50 rounded-xl border border-background-200/70 hover:border-primary-200 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                    <i className={`${link.icon} text-lg`} />
                  </div>
                  <span className="text-xs font-medium text-foreground-700 group-hover:text-foreground-900 transition-colors text-center">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}