import { useState } from 'react';
import { GitBranch, Lock, Globe } from 'lucide-react';

// Language color map (GitHub-inspired)
const langColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4f5d95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Scala: '#c22d40',
};

export default function RepositoryHeader({ repo }) {
  const ownerName = repo.fullName?.split('/')[0] || '';
  const repoName = repo.fullName?.split('/')[1] || repo.fullName;
  const langColor = langColors[repo.language] || '#8892b0';
  const [imgError, setImgError] = useState(false);
  const avatarUrl = `https://github.com/${ownerName}.png?size=80`;

  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Owner Avatar */}
        {!imgError ? (
          <img
            src={avatarUrl}
            alt={ownerName}
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-lg flex-shrink-0 border border-[#1e2d45]/60"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <GitBranch size={18} className="text-indigo-400" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8892b0] truncate">{ownerName}</span>
            <span className="text-[#4a5568] text-xs">/</span>
            <span className="text-sm font-semibold text-[#e8eaf6] truncate">{repoName}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {repo.language && (
              <span className="flex items-center gap-1 text-xs text-[#8892b0]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: langColor }} />
                {repo.language}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visibility badge */}
      {repo.isPrivate ? (
        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex-shrink-0 ml-2 font-medium">
          <Lock size={9} /> Private
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0 ml-2 font-medium">
          <Globe size={9} /> Public
        </span>
      )}
    </div>
  );
}
