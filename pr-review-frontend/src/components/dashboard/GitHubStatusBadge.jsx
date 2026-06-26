import { motion } from 'framer-motion';

function GithubIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function GitHubStatusBadge({ status = 'connected', username = '', provider = 'GitHub' }) {
  // Can be expanded to support 'syncing', 'disconnected' etc.
  const isConnected = status === 'connected';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      title={`${provider} account ${status}`}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1e2d45]/60 bg-[#0d1117]/40 shadow-sm cursor-default hover:bg-[#1e2d45]/20 hover:border-[#1e2d45] hover:shadow-md transition-colors"
    >
      <div className="flex items-center justify-center text-[#e8eaf6]">
        <GithubIcon />
      </div>
      
      <div className="flex items-center gap-2 border-l border-[#1e2d45]/60 pl-2">
        <span className="text-xs font-medium text-[#e8eaf6] tracking-wide">
          {provider}
        </span>
        
        {isConnected && (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400 relative">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
            Connected
          </span>
        )}
      </div>
    </motion.div>
  );
}
