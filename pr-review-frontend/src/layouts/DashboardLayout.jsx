import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, GitBranch, FileText, BarChart3,
  Settings, Bell, ChevronDown, BrainCircuit, Plus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GitHubStatusBadge from '../components/dashboard/GitHubStatusBadge';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/repositories', icon: GitBranch, label: 'Repositories' },
  { to: '/history', icon: FileText, label: 'Reviews' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const initials = user?.username ? user.username[0].toUpperCase() : 'U';
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#05060f] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -240, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-60 flex-shrink-0 flex flex-col border-r border-[#1e2d45]/60 bg-[#080b16]/80 backdrop-blur-xl z-20"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e2d45]/60">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-sm flex-shrink-0">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">AI PR Review</p>
                <p className="text-xs text-[#8892b0]">Assistant</p>
              </div>
            </div>

            {/* New Review button */}
            <div className="px-3 pt-4 pb-2">
              <button
                onClick={() => navigate('/reviews/new')}
                className="btn-primary w-full justify-center text-xs py-2"
              >
                <Plus size={14} />
                New Review
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-2 space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User section */}
            <div className="px-3 pb-4 border-t border-[#1e2d45]/60 pt-4">
              <button
                onClick={logout}
                className="sidebar-link w-full text-left text-[#8892b0] hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/15"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-6 h-6 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{initials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#e8eaf6] truncate">{user?.username || 'Account'}</p>
                  <p className="text-xs text-[#8892b0] truncate">Sign out</p>
                </div>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-[#1e2d45]/60 bg-[#080b16]/80 backdrop-blur-xl z-10 flex-shrink-0">
          <div className="flex-1 pl-4 hidden sm:flex items-center">
            <div className="flex gap-6 lg:gap-5 text-lg  lg:text-xl font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              <span>Analyze.</span>
              <span>Review.</span>
              <span>Improve.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <GitHubStatusBadge />
            
            <div className="h-5 w-px bg-[#1e2d45]/60 hidden sm:block"></div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#1e2d45]/40 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#1e2d45]/40 transition-all"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{initials}</span>
                  </div>
                )}
                <ChevronDown size={14} className="text-[#8892b0]" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-10 w-44 glass-card rounded-lg shadow-xl z-50 py-1 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-[#1e2d45]/50">
                      <p className="text-xs font-semibold text-[#e8eaf6]">{user?.username || 'Account'}</p>
                      <p className="text-xs text-[#8892b0]">GitHub Connected</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
