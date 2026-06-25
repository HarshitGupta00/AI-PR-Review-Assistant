import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Play, MoreVertical, Unplug, Settings, RefreshCw, Loader } from 'lucide-react';

export default function RepositoryActions({ repo, onDisconnect, onRefresh, isDeleting }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div className="flex items-center gap-2">
      {/* Primary: View Repository */}
      <button
        onClick={() => navigate(`/repositories/${repo._id}`)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium
          bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 
          hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
      >
        <Eye size={13} />
        View
      </button>

      {/* Secondary: Review PR */}
      <button
        onClick={() => navigate('/reviews/new', { state: { repoFullName: repo.fullName } })}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium
          text-[#8892b0] border border-[#1e2d45]/60
          hover:text-[#e8eaf6] hover:border-[#1e2d45] transition-all"
      >
        <Play size={12} />
        Review
      </button>

      {/* Overflow menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#1e2d45]/40 border border-[#1e2d45]/60 transition-all"
        >
          <MoreVertical size={13} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 bottom-full mb-1 w-48 glass-card rounded-lg shadow-xl z-50 py-1 overflow-hidden"
            >
              <button
                onClick={() => { onRefresh?.(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#1e2d45]/40 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh Metadata
              </button>
              <button
                onClick={() => { navigate(`/repositories/${repo._id}`); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#1e2d45]/40 transition-colors"
              >
                <Settings size={12} />
                Repository Settings
              </button>
              <div className="border-t border-[#1e2d45]/40 my-1" />
              <button
                onClick={() => { onDisconnect?.(); setMenuOpen(false); }}
                disabled={isDeleting}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader size={12} className="animate-spin" /> : <Unplug size={12} />}
                Disconnect Repository
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
