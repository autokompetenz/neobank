import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/shared/Layout';
import HomePage from './pages/HomePage';
import SolutionsPage from './pages/SolutionsPage';
import ProjectsPage from './pages/ProjectsPage';
import SimulatorPage from './pages/SimulatorPage';
import CommentCaMarche from './pages/CommentCaMarche';
import FAQPage from './pages/FAQPage';
import Contact from './pages/Contact';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import CGU from './pages/CGU';
import Partenaires from './pages/Partenaires';
import ProjectDetail from './pages/ProjectDetail';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return children;
  return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
}

function SiteLayout({ children }) {
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Site public NEOBANK */}
      <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
      <Route path="/solutions" element={<SiteLayout><SolutionsPage /></SiteLayout>} />
      <Route path="/projets" element={<SiteLayout><ProjectsPage /></SiteLayout>} />
      <Route path="/projets/:slug" element={<SiteLayout><ProjectDetail /></SiteLayout>} />
      <Route path="/simulateur" element={<SiteLayout><SimulatorPage /></SiteLayout>} />
      <Route path="/comment-ca-marche" element={<SiteLayout><CommentCaMarche /></SiteLayout>} />
      <Route path="/faq" element={<SiteLayout><FAQPage /></SiteLayout>} />
      <Route path="/contact" element={<SiteLayout><Contact /></SiteLayout>} />
      <Route path="/mentions-legales" element={<SiteLayout><MentionsLegales /></SiteLayout>} />
      <Route path="/politique-confidentialite" element={<SiteLayout><PolitiqueConfidentialite /></SiteLayout>} />
      <Route path="/cgu" element={<SiteLayout><CGU /></SiteLayout>} />
      <Route path="/partenaires" element={<SiteLayout><Partenaires /></SiteLayout>} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthPage initialMode="register" /></PublicRoute>} />

      {/* Espaces protégés */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#0F1923',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'Outfit, sans-serif',
              padding: '12px 16px',
              border: '0.5px solid rgba(255,255,255,0.1)',
            },
            success: { iconTheme: { primary: '#1D9E75', secondary: '#f8fafc' } },
            error: { iconTheme: { primary: '#E24B4A', secondary: '#f8fafc' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}