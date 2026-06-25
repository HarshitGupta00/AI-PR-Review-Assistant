import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import CreateReview from './pages/CreateReview';
import ReviewProcessing from './pages/ReviewProcessing';
import ReviewResults from './pages/ReviewResults';
import ReviewHistory from './pages/ReviewHistory';
import IssueDetail from './pages/IssueDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import './index.css';

function AuthRedirectHandler({ children }) {
  const { markLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'success') {
      markLoggedIn();
      navigate('/dashboard', { replace: true });
    }
  }, [location, markLoggedIn, navigate]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthRedirectHandler>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes inside DashboardLayout */}
            <Route
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repositories" element={<Repositories />} />
              <Route path="/repositories/:repoId" element={<RepositoryDetail />} />
              <Route path="/reviews/new" element={<CreateReview />} />
              <Route path="/reviews/processing/:reviewId" element={<ReviewProcessing />} />
              <Route path="/reviews/:reviewId" element={<ReviewResults />} />
              <Route path="/reviews/:reviewId/issues/:issueId" element={<IssueDetail />} />
              <Route path="/history" element={<ReviewHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthRedirectHandler>
      </AuthProvider>
    </BrowserRouter>
  );
}