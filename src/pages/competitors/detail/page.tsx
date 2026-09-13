import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCompetitor } from "@/services/competitors.service";
import type { CompetitorDetail, CompetitorReview } from "@/types/competitor";

function na(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function pct(value: number | null | undefined): string {
  return na(value) ? "Not available" : `${value.toFixed(1)}%`;
}

function num(value: number | null | undefined): string {
  return na(value) ? "Not available" : value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-background-50 border border-background-200/70 rounded-2xl p-5 md:p-6">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground-900 mb-4">
        <i className={`${icon} text-primary-500`} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-foreground-400">{label}</p>
      <p className="text-sm font-medium text-foreground-900 mt-0.5">{value ?? "Not available"}</p>
    </div>
  );
}

function ReviewList({ reviews, emptyMessage }: { reviews: CompetitorReview[]; emptyMessage: string }) {
  if (reviews.length === 0) return <p className="text-sm text-foreground-500">{emptyMessage}</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {reviews.map((r, i) => (
        <div key={i} className="p-4 bg-background-100 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-foreground-900">{r.reviewer_name?.trim() || "Anonymous"}</span>
            {r.rating_value != null && (
              <span className="text-xs font-semibold text-foreground-700">
                {r.rating_value}/{r.rating_scale}
              </span>
            )}
          </div>
          {r.title && <p className="text-sm font-medium text-foreground-800 mb-1">{r.title}</p>}
          {r.review_text && <p className="text-xs text-foreground-600 leading-relaxed line-clamp-4">{r.review_text}</p>}
          <p className="mt-2 text-xs text-foreground-400">
            {r.review_date ? new Date(r.review_date).toLocaleDateString() : "No date"}
            {r.is_verified && <span className="ml-2 text-primary-600">Verified</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function CompetitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CompetitorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getCompetitor(id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-50">
        <Navbar />
        <div className="py-24">
          <LoadingIndicator />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background-50">
        <Navbar />
        <div className="py-24 text-center text-sm text-foreground-500">Competitor not found.</div>
        <Footer />
      </div>
    );
  }

  const trustpilotSource = data.sources.find((s) => s.source_key === "trustpilot");
  const fatpSource = data.sources.find((s) => s.source_key === "fatp");

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <Link to="/competitors" className="text-xs text-foreground-500 hover:text-primary-600">
              &larr; Provider Intelligence
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">{data.name}</h1>
              <a
                href={data.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {data.website_domain} <i className="ri-external-link-line text-xs" />
              </a>
            </div>
            {data.apar?.ukprn && <p className="mt-1 text-sm text-foreground-500">UKPRN {data.apar.ukprn}</p>}
          </div>
        </div>
      </section>

      <section className="w-full px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* A. Identity / APAR */}
          <SectionCard title="Official Provider Registration (APAR)" icon="ri-government-line">
            {data.apar ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="UKPRN" value={data.apar.ukprn} />
                <Field label="Legal name" value={data.apar.provider_name} />
                <Field label="Application type" value={data.apar.application_type} />
                <Field label="Status" value={data.apar.status} />
                <Field label="Delivers apprenticeships" value={data.apar.delivers_apprenticeships ? "Yes" : "No"} />
                <Field
                  label="Start date"
                  value={data.apar.start_date ? new Date(data.apar.start_date).toLocaleDateString() : null}
                />
                <Field
                  label="Determined date"
                  value={
                    data.apar.application_determined_date
                      ? new Date(data.apar.application_determined_date).toLocaleDateString()
                      : null
                  }
                />
              </div>
            ) : (
              <p className="text-sm text-foreground-500">No APAR registration record found.</p>
            )}
          </SectionCard>

          {/* B. KBC Target Programme Evidence */}
          <SectionCard title="KBC Target Programme Evidence" icon="ri-flag-line">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs font-semibold text-foreground-500 uppercase tracking-wide">
                    <th className="py-2 pr-4">Standard</th>
                    <th className="py-2 pr-4">KBC mapped</th>
                    <th className="py-2 pr-4">FATP current</th>
                    <th className="py-2 pr-4">QAR achievement</th>
                    <th className="py-2 pr-4">Skills England status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.target_programmes.map((t) => (
                    <tr key={t.st_code} className="border-t border-background-100">
                      <td className="py-2.5 pr-4 font-medium text-foreground-900">
                        {t.st_code} · {t.name} (L{t.level})
                      </td>
                      <td className="py-2.5 pr-4">{t.kbc_mapped ? "Yes" : "No"}</td>
                      <td className="py-2.5 pr-4">{t.fatp_current ? "Yes" : "No"}</td>
                      <td className="py-2.5 pr-4">
                        {t.qar ? `${pct(t.qar.achievement_rate)} (${t.qar.period})` : "Not published"}
                      </td>
                      <td className="py-2.5 pr-4">{t.skills_england?.status ?? "Not available"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* C. FATP */}
          <SectionCard title="Find a Training Provider (FATP)" icon="ri-building-4-line">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <Field label="Achievement rate" value={pct(data.fatp.metrics.fatp_achievement_rate?.value ?? null)} />
              <Field label="Active learners" value={num(data.fatp.metrics.fatp_active_learners?.value ?? null)} />
              <Field
                label="Employer feedback"
                value={
                  data.fatp.metrics.fatp_employer_score
                    ? `${data.fatp.metrics.fatp_employer_score.value}/4 (${data.fatp.metrics.fatp_employer_score.count ?? 0} responses)`
                    : "Not available"
                }
              />
              <Field
                label="Apprentice feedback"
                value={
                  data.fatp.metrics.fatp_apprentice_score
                    ? `${data.fatp.metrics.fatp_apprentice_score.value}/4 (${data.fatp.metrics.fatp_apprentice_score.count ?? 0} responses)`
                    : "Not available"
                }
              />
            </div>
            <h3 className="text-sm font-semibold text-foreground-800 mb-2">
              Standards portfolio ({data.fatp.standards.filter((s) => s.is_current).length} current)
            </h3>
            <div className="max-h-64 overflow-y-auto border border-background-200/70 rounded-xl">
              <table className="w-full text-xs">
                <tbody>
                  {data.fatp.standards.map((s, i) => (
                    <tr key={i} className={`border-t border-background-100 first:border-t-0 ${!s.is_current ? "opacity-50" : ""}`}>
                      <td className="py-2 px-3">{s.fatp_standard_title}</td>
                      <td className="py-2 px-3 text-foreground-500">{s.standard_reference ?? "—"}</td>
                      <td className="py-2 px-3 text-foreground-500">{s.level ? `L${s.level}` : "—"}</td>
                      <td className="py-2 px-3 text-foreground-500">{s.max_funding ?? "—"}</td>
                      <td className="py-2 px-3 text-foreground-400">{s.is_current ? "Current" : "No longer listed"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="text-sm font-semibold text-foreground-800 mt-5 mb-2">
              FATP reviews ({data.fatp.reviews.length})
            </h3>
            <ReviewList reviews={data.fatp.reviews} emptyMessage="No FATP written reviews collected." />
            {fatpSource && (
              <p className="mt-3 text-xs text-foreground-400">
                Source: <a href={fatpSource.profile_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{fatpSource.profile_url}</a>
                {fatpSource.last_checked_at && ` · Last checked ${new Date(fatpSource.last_checked_at).toLocaleDateString()}`}
              </p>
            )}
          </SectionCard>

          {/* D. Trustpilot */}
          <SectionCard title="Trustpilot" icon="ri-star-line">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <Field
                label="Rating"
                value={data.trustpilot.summary ? `${data.trustpilot.summary.rating?.toFixed(1)} / 5` : "Not available"}
              />
              <Field label="Total reviews" value={num(data.trustpilot.summary?.review_count ?? null)} />
            </div>
            <h3 className="text-sm font-semibold text-foreground-800 mb-2">
              Stored reviews ({data.trustpilot.reviews.length})
            </h3>
            <ReviewList reviews={data.trustpilot.reviews} emptyMessage="No Trustpilot written reviews collected." />
            {trustpilotSource && (
              <p className="mt-3 text-xs text-foreground-400">
                Source: <a href={trustpilotSource.profile_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{trustpilotSource.profile_url}</a>
                {trustpilotSource.last_checked_at && ` · Last checked ${new Date(trustpilotSource.last_checked_at).toLocaleDateString()}`}
              </p>
            )}
          </SectionCard>

          {/* E. DfE Provider Activity */}
          <SectionCard title="DfE Provider Activity" icon="ri-line-chart-line">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs font-semibold text-foreground-500 uppercase tracking-wide">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Starts</th>
                    <th className="py-2 pr-4">Achievements</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dfe_activity.map((y) => (
                    <tr key={y.time_period} className="border-t border-background-100">
                      <td className="py-2.5 pr-4 font-medium text-foreground-900">{y.period}</td>
                      <td className="py-2.5 pr-4">{num(y.starts)}</td>
                      <td className="py-2.5 pr-4">{num(y.achievements)}</td>
                      <td className="py-2.5 pr-4">
                        {y.is_provisional ? (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                            Provisional
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            Final
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.dfe_activity.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-foreground-500">No DfE activity data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* F. DfE QAR */}
          <SectionCard title="DfE Qualification Achievement Rates (QAR)" icon="ri-award-line">
            <h3 className="text-sm font-semibold text-foreground-800 mb-2">Overall by year</h3>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs font-semibold text-foreground-500 uppercase tracking-wide">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Leavers</th>
                    <th className="py-2 pr-4">Completers</th>
                    <th className="py-2 pr-4">Achievers</th>
                    <th className="py-2 pr-4">Retention</th>
                    <th className="py-2 pr-4">Pass rate</th>
                    <th className="py-2 pr-4">Achievement rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dfe_qar.by_year.map((y) => (
                    <tr key={y.time_period} className="border-t border-background-100">
                      <td className="py-2.5 pr-4 font-medium text-foreground-900">{y.period}</td>
                      <td className="py-2.5 pr-4">{num(y.leavers)}</td>
                      <td className="py-2.5 pr-4">{num(y.completers)}</td>
                      <td className="py-2.5 pr-4">{num(y.achievers)}</td>
                      <td className="py-2.5 pr-4">{pct(y.retention_rate)}</td>
                      <td className="py-2.5 pr-4">{pct(y.pass_rate)}</td>
                      <td className="py-2.5 pr-4 font-semibold">{pct(y.achievement_rate)}</td>
                    </tr>
                  ))}
                  {data.dfe_qar.by_year.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-foreground-500">No QAR data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data.dfe_qar.by_level.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-foreground-800 mb-2">By level (source&apos;s own labels)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.dfe_qar.by_level.map((l) => (
                    <div key={l.level_label} className="p-3 bg-background-100 rounded-xl">
                      <p className="text-xs text-foreground-500">{l.level_label} · {l.period}</p>
                      <p className="text-sm font-semibold text-foreground-900">{pct(l.achievement_rate)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>

          {/* G. Ofsted */}
          <SectionCard title="Ofsted" icon="ri-shield-star-line">
            {data.ofsted.inspections.length === 0 ? (
              <p className="text-sm text-foreground-500">No Ofsted inspection record found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {data.ofsted.inspections.map((insp, i) => (
                  <div key={i} className="p-4 bg-background-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-foreground-900 capitalize">
                        {insp.framework_era} framework — {insp.inspection_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-foreground-500">
                        {insp.first_day_of_inspection ? new Date(insp.first_day_of_inspection).toLocaleDateString() : "Date unknown"}
                        {insp.date_published && ` · Published ${new Date(insp.date_published).toLocaleDateString()}`}
                      </span>
                    </div>
                    {insp.framework_era === "renewed" ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Field label="Safeguarding" value={insp.safeguarding} />
                        <Field label="Inclusion" value={insp.inclusion} />
                        <Field label="Leadership & governance" value={insp.leadership_governance} />
                        <Field label="Meeting skills needs" value={insp.meeting_skills_needs} />
                        <Field label="Curriculum, teaching & training" value={insp.apprenticeships_curriculum_teaching_training} />
                        <Field label="Achievement" value={insp.apprenticeships_achievement} />
                        <Field label="Participation & development" value={insp.apprenticeships_participation_development} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Field label="Overall effectiveness" value={insp.legacy_overall_effectiveness_label} />
                        <Field label="Quality of education" value={insp.legacy_quality_of_education} />
                        <Field label="Behaviour & attitudes" value={insp.legacy_behaviour_and_attitudes} />
                        <Field label="Personal development" value={insp.legacy_personal_development} />
                        <Field label="Leadership & management" value={insp.legacy_leadership_and_management} />
                        <Field label="Safeguarding" value={insp.safeguarding} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {data.ofsted.status && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field label="Has renewed full inspection" value={data.ofsted.status.has_renewed_full_inspection ? "Yes" : "No"} />
                <Field label="Has new provider monitoring" value={data.ofsted.status.has_new_provider_monitoring ? "Yes" : "No"} />
              </div>
            )}
          </SectionCard>

          {/* K. Sources */}
          <SectionCard title="Source Coverage" icon="ri-database-2-line">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs font-semibold text-foreground-500 uppercase tracking-wide">
                    <th className="py-2 pr-4">Source</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Last checked</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sources.map((s) => (
                    <tr key={s.source_key} className="border-t border-background-100">
                      <td className="py-2.5 pr-4 font-medium text-foreground-900 capitalize">{s.source_name}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.approval_status === "approved" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {s.approval_status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-foreground-500">
                        {s.last_checked_at ? new Date(s.last_checked_at).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.google_place_id && (
              <p className="mt-3 text-xs text-foreground-400">
                Google Place ID approved: {data.google_place_id}. Rating/review content is fetched live and not persisted.
              </p>
            )}
          </SectionCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
