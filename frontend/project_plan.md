# ApprenticeshipsReviews

## 1. Project Description
A UK apprenticeship review, comparison, and decision-intelligence platform. Helps apprentices and employers choose the right apprenticeship training provider using verified reviews, public data, and transparent comparison tools.

**Target users:** Apprentices comparing providers, employers choosing training partners, training providers claiming/updating profiles.

**Brand:** ApprenticeshipsReviews
**Tagline:** Compare apprenticeship providers with confidence.

## 2. Page Structure
- `/` - Home (splash cover + homepage)
- `/providers` - Find a Provider / Search Results
- `/categories` - Apprenticeship Categories (by sector)
- `/top-rated` - Top Rated Providers
- `/compare` - Compare Providers
- `/provider/:id` - Provider Profile
- `/review/:id` - Review Details
- `/add-review` - Write a Review
- `/standards` - Apprenticeship Standards Listing
- `/standards/:id` - Individual Standard pages (4)
- `/reviews` - Browse All Reviews
- `/about` - About
- `/help` - Help Centre / FAQ
- `/login` - Login / Register (apprentice + provider)
- `/dashboard` - Apprentice Dashboard
- `/provider-dashboard` - Provider Dashboard
- `/claim-provider` - Claim Provider Profile
- `/methodology` - Methodology / How Reviews Work
- `/review-policy` - Review Policy & Guidelines
- `/contact` - Contact
- `/privacy-policy` - Privacy Policy
- `/terms` - Terms & Conditions
- `/data-sources` - Data Sources

## 3. Core Features
- [x] Homepage with hero, search, categories, featured providers, recent reviews, CTA
- [x] Provider search with filters (name, location, sector, level, rating)
- [x] Category browsing by apprenticeship sector (scalable)
- [x] Provider profiles with rating summary, distribution, category ratings, reviews
- [x] Rating categories (Overall, Tutor Support, Training Quality, Communication, Learning Resources, Employer Support, EPA Preparation)
- [x] Review details with breakdown, helpful voting, report, provider responses
- [x] Top rated provider rankings (filterable, genuine-data based)
- [x] Provider comparison tool (side-by-side, ratings + evidence + recommendation)
- [x] Review submission form with multi-category ratings
- [x] Apprentice dashboard (reviews, saved providers, settings, notifications)
- [x] Provider dashboard (stats, category performance, respond to reviews, programmes)
- [x] Claim provider profile form
- [x] About, Help/FAQ, Methodology, Review Policy, Contact
- [x] Login/register UI (apprentice + provider) — auth to be connected
- [ ] Connect authentication + database (Readdy Backend / Supabase)
- [ ] Wire review submission, claim form, and dashboards to backend

## 4. Data Model Design
(Using mock data — backend not yet connected)

### Provider
| Field | Type | Description |
|-------|------|-------------|
| provider_id | string | Unique ID |
| trading_name | string | Trading name |
| legal_name | string | Legal entity name |
| UKPRN | string | UK Provider Reference Number |
| website | string | Provider website |
| location | string | Coverage area |
| Ofsted_status | string | Ofsted rating |
| verification_status | string | Verified / Pending |
| data_last_updated | string | Last data refresh date |

### Rating
| Field | Type | Description |
|-------|------|-------------|
| provider_id | string | FK to Provider |
| overall | number | 1-5 average rating |
| review_count | number | Total verified reviews |
| recommendation_percent | number | % who would recommend |
| categories | Record | Per-category averages (7 categories) |
| distribution | Record | Star distribution (5→1) |

### Review
| Field | Type | Description |
|-------|------|-------------|
| review_id | string | Unique ID |
| provider_id | string | FK to Provider |
| standard_id | string | FK to Standard |
| reviewer_type | string | apprentice / employer |
| rating | number | 1-5 |
| review_title / text | string | Review content |
| verification_status | string | Verified / Pending |

## 5. Backend / Third-party Integration Plan
- Readdy Backend / Supabase: required for auth + dashboards (to be connected)
- Shopify / Stripe / Toss / PayPal: not needed
- Form handling: get_form_url for claim-provider, contact, review submission

## 6. Development Phase Plan
- Phase 1: Core shell + homepage + navigation/footer structure (done)
- Phase 2: Search, categories, top-rated, provider profiles (done)
- Phase 3: Reviews, review details, comparison (done)
- Phase 4: Dashboards, claim, auth UI, content pages (done)
- Phase 5: Connect backend/auth and wire data flows (pending)