import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/landing/page";
import Home from "@/pages/home/page";
import CompareProviders from "@/pages/compare/page";
import ProviderProfile from "@/pages/provider/page";
import FindProvider from "@/pages/providers/page";
import TopRated from "@/pages/top-rated/page";
import ReviewDetails from "@/pages/review-detail/page";
import Standards from "@/pages/standards/page";
import MarketingExecutiveLevel4 from "@/pages/standards/marketing-executive-level-4/page";
import MarketingManagerLevel6 from "@/pages/standards/marketing-manager-level-6/page";
import AssociateProjectManagerLevel4 from "@/pages/standards/associate-project-manager-level-4/page";
import ProjectControlsProfessionalLevel6 from "@/pages/standards/project-controls-professional-level-6/page";
import Reviews from "@/pages/reviews/page";
import AddReview from "@/pages/add-review/page";
import About from "@/pages/about/page";
import Help from "@/pages/help/page";
import Login from "@/pages/login/page";
import ResetPassword from "@/pages/reset-password/page";
import Dashboard from "@/pages/dashboard/page";
import ProviderDashboard from "@/pages/provider-dashboard/page";
import EditProviderProfile from "@/pages/provider-dashboard/edit/page";
import Admin from "@/pages/admin/page";
import CompetitorsList from "@/pages/competitors/page";
import CompetitorDetailPage from "@/pages/competitors/detail/page";
import ClaimProvider from "@/pages/claim-provider/page";
import Methodology from "@/pages/methodology/page";
import ReviewPolicy from "@/pages/review-policy/page";
import Contact from "@/pages/contact/page";
import PrivacyPolicy from "@/pages/privacy-policy/page";
import DataSources from "@/pages/data-sources/page";
import TermsOfService from "@/pages/terms/page";
import ProtectedRoute from "@/router/ProtectedRoute";

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