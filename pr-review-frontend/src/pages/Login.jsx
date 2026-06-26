import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit } from 'lucide-react';

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#05060f] flex items-center justify-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/12 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-purple-600/8 rounded-full blur-[80px]" />
        <div className="grid-bg absolute inset-0 opacity-50" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="glass-card rounded-2xl p-8 border border-[#1e2d45]/60 glow text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow">
              <BrainCircuit size={28} className="text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-[#e8eaf6] mb-1">AI PR Review</h1>
            <p className="text-[#8892b0] text-sm mb-6 leading-relaxed">
              Review PRs with AI.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <GithubIcon />
              Continue with GitHub
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 text-xs text-[#4a5568] leading-relaxed"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-400 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>.
          </motion.p>
        </div>

        {/* Floating particles */}
        <div className="absolute -top-4 -left-4 w-3 h-3 bg-indigo-500/40 rounded-full blur-sm float-animation" style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-4 -right-4 w-2 h-2 bg-purple-500/40 rounded-full blur-sm float-animation" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 -left-8 w-1.5 h-1.5 bg-indigo-400/30 rounded-full float-animation" style={{ animationDelay: '4s' }} />
      </motion.div>
    </div>
  );
}