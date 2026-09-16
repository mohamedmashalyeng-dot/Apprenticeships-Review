import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "@/router/ProtectedRoute";

// Each page is its own chunk, fetched only when its route is actually visited — keeps the
// initial bundle to shared framework/layout code instead of all ~30 pages at once.
const NotFound = lazy(() => import("@/pages/NotFound"));
const Landing = lazy(() => import("@/pages/landing/page"));
const Home = lazy(() => import("@/pages/home/page"));
const CompareProviders = lazy(() => import("@/pages/compare/page"));
const ProviderProfile = lazy(() => import("@/pages/provider/page"));
const FindProvider = lazy(() => import("@/pages/providers/page"));
const TopRated = lazy(() => import("@/pages/top-rated/page"));
const ReviewDetails = lazy(() => import("@/pages/review-detail/page"));
const Standards = lazy(() => import("@/pages/standards/page"));
const MarketingExecutiveLevel4 = lazy(() => import("@/pages/standards/marketing-executive-level-4/page"));
const MarketingManagerLevel6 = lazy(() => import("@/pages/standards/marketing-manager-level-6/page"));
const AssociateProjectManagerLevel4 = lazy(() => import("@/pages/standards/associate-project-manager-level-4/page"));
const ProjectControlsProfessionalLevel6 = lazy(() => import("@/pages/standards/project-controls-professional-level-6/page"));
const Reviews = lazy(() => import("@/pages/reviews/page"));
const AddReview = lazy(() => import("@/pages/add-review/page"));
const About = lazy(() => import("@/pages/about/page"));
const Help = lazy(() => import("@/pages/help/page"));
const Login = lazy(() => import("@/pages/login/page"));
const ResetPassword = lazy(() => import("@/pages/reset-password/page"));
const Dashboard = lazy(() => import("@/pages/dashboard/page"));
const ProviderDashboard = lazy(() => import("@/pages/provider-dashboard/page"));
const EditProviderProfile = lazy(() => import("@/pages/provider-dashboard/edit/page"));
const Admin = lazy(() => import("@/pages/admin/page"));
const CompetitorsList = lazy(() => import("@/pages/competitors/page"));
const CompetitorDetailPage = lazy(() => import("@/pages/competitors/detail/page"));
const CompetitorLandscapeOverviewPage = lazy(() => import("@/pages/competitors/overview/page"));
const ClaimProvider = lazy(() => import("@/pages/claim-provider/page"));
const Methodology = lazy(() => import("@/pages/methodology/page"));
const ReviewPolicy = lazy(() => import("@/pages/review-policy/page"));
const Contact = lazy(() => import("@/pages/contact/page"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy/page"));
const DataSources = lazy(() => import("@/pages/data-sources/page"));
const TermsOfService = lazy(() => import("@/pages/terms/page"));

const routes: RouteObject[] = [
  { path: "/", element: <Landing /> },
  { path: "/home", element: <Home /> },
  { path: "/landing", element: <Navigate to="/" replace /> },
  { path: "/providers", element: <FindProvider /> },
  { path: "/top-rated", element: <TopRated /> },
  { path: "/compare", element: <CompareProviders /> },
  { path: "/provider/:id", element: <ProviderProfile /> },
  { path: "/review/:id", element: <ReviewDetails /> },
  { path: "/standards", element: <Standards /> },
  { path: "/standards/marketing-executive-level-4", element: <MarketingExecutiveLevel4 /> },
  { path: "/standards/marketing-manager-level-6", element: <MarketingManagerLevel6 /> },
  { path: "/standards/associate-project-manager-level-4", element: <AssociateProjectManagerLevel4 /> },
  { path: "/standards/project-controls-professional-level-6", element: <ProjectControlsProfessionalLevel6 /> },
  { path: "/reviews", element: <Reviews /> },
  { path: "/add-review", element: <AddReview /> },
  { path: "/about", element: <About /> },
  { path: "/help", element: <Help /> },
  { path: "/login", element: <Login /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/provider-dashboard",
    element: (
      <ProtectedRoute role="company_owner">
        <ProviderDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/provider-dashboard/edit",
    element: (
      <ProtectedRoute role="company_owner">
        <EditProviderProfile />
      </ProtectedRoute>
    ),
  },
  { path: "/claim-provider", element: <ClaimProvider /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role={["admin", "moderator"]}>
        <Admin />
      </ProtectedRoute>
    ),
  },
  { path: "/competitors", element: <CompetitorsList /> },
  { path: "/competitors/overview", element: <CompetitorLandscapeOverviewPage /> },
  { path: "/competitors/:id", element: <CompetitorDetailPage /> },
  { path: "/methodology", element: <Methodology /> },
  { path: "/review-policy", element: <ReviewPolicy /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/data-sources", element: <DataSources /> },
  { path: "/terms", element: <TermsOfService /> },
  // Redirects for removed pages
  { path: "/for-learners", element: <Navigate to="/help" replace /> },
  { path: "/for-employers", element: <Navigate to="/help" replace /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
