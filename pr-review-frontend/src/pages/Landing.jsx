import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, GitPullRequest, Shield, Gauge, Bug, ChevronRight, Check } from 'lucide-react';

const features = [
  {
    icon: Bug,
    title: 'Bug Detection',
    desc: 'Find logical mistakes and edge cases before they reach production.',
    color: 'from-red-500 to-pink-600',
    glow: 'rgba(239,68,68,0.15)',
  },
  {
    icon: Shield,
    title: 'Security Analysis',
    desc: 'Detect common vulnerabilities — SQL injection, XSS, and more — automatically.',
    color: 'from-indigo-500 to-blue-600',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    icon: Gauge,
    title: 'Performance Review',
    desc: 'Identify expensive operations, memory leaks, and bottlenecks.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.15)',
  },
];

const steps = [
  'Connect Repository',
  'Select Pull Request',
  'AI Reviews Code',
  'Get Actionable Feedback',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05060f] text-[#e8eaf6] overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#1e2d45]/40 glass">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">AI PR Review</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-[#8892b0] hover:text-[#e8eaf6] transition-colors">Features</a>
          <a href="#how" className="text-sm text-[#8892b0] hover:text-[#e8eaf6] transition-colors">How it works</a>
          <button onClick={() => navigate('/login')} className="btn-primary text-xs py-2">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            AI-Powered Code Review
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          >
            <span className="gradient-text-hero">AI PR Review</span>
            <br />
            <span className="text-[#e8eaf6]">Assistant</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-[#8892b0] leading-relaxed mb-4 max-w-xl"
          >
            Review pull requests in seconds.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-base text-[#8892b0] leading-relaxed mb-8 max-w-xl"
          >
            Detect bugs, security risks, performance issues, and code quality
            problems <span className="text-[#e8eaf6]">before merge</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mb-10"
          >
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-sm py-3 px-6"
            >
              <GithubIcon />
              Continue with GitHub
              <ArrowRight size={16} />
            </button>
            <a href="#how" className="btn-secondary text-sm py-3 px-6">
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-4 text-xs text-[#8892b0]"
          >
            <span className="font-medium text-[#e8eaf6]">Trusted by Engineering Teams</span>
            <span>·</span>
            <span>GitHub OAuth</span>
            <span>·</span>
            <span>AI Reviews</span>
            <span>·</span>
            <span>Real-Time Analysis</span>
          </motion.div>
        </div>

        {/* Right — PR flow illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:flex items-center justify-center"
        >
          <PRFlowIllustration />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-[#e8eaf6] mb-3">Features</h2>
          <p className="text-[#8892b0]">Everything you need to ship with confidence.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-xl p-6 group cursor-default"
              style={{ boxShadow: `0 0 40px ${f.glow}` }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-[#e8eaf6] mb-2">{f.title}</h3>
              <p className="text-sm text-[#8892b0] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-[#e8eaf6] mb-3">How It Works</h2>
          <p className="text-[#8892b0]">From connect to insights in under a minute.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-0 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex items-center gap-0"
            >
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mb-3 glow-sm">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-[#e8eaf6] max-w-[120px]">{step}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={20} className="text-[#1e2d45] flex-shrink-0 hidden md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-12 text-center glow"
        >
          <h2 className="text-3xl font-bold text-[#e8eaf6] mb-4">Ready to ship better code?</h2>
          <p className="text-[#8892b0] mb-8 max-w-md mx-auto">Connect your GitHub and get your first AI-powered review in seconds.</p>
          <button onClick={() => navigate('/login')} className="btn-primary text-sm py-3 px-8">
            <GithubIcon />
            Continue with GitHub
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e2d45]/40 px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[#e8eaf6]">AI PR Review</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#8892b0]">
            <a href="#" className="hover:text-[#e8eaf6] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[#e8eaf6] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#e8eaf6] transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PRFlowIllustration() {
  return (
    <div className="relative w-[380px] h-[420px]">
      {/* Glow orb */}
      <div className="absolute inset-0 bg-indigo-600/10 rounded-full blur-[80px]" />

      <div className="relative flex flex-col items-center gap-3 float-animation">
        {/* GitHub PR card */}
        <FlowCard
          icon={<GitPullRequest size={16} className="text-indigo-400" />}
          label="GitHub PR"
          title="#127 — Add auth middleware"
          sub="+342 −28 · 8 files"
          borderColor="border-indigo-500/30"
          bgColor="bg-indigo-500/5"
        />

        <FlowArrow />

        {/* AI Review card */}
        <FlowCard
          icon={<Zap size={16} className="text-purple-400" />}
          label="AI Review"
          title="Gemini Flash analyzing..."
          sub="Reviewing 8 files · 2.3s"
          borderColor="border-purple-500/30"
          bgColor="bg-purple-500/5"
          animated
        />

        <FlowArrow />

        {/* Issues card */}
        <div className="glass-card rounded-xl p-4 w-full border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Issues Found</span>
          </div>
          <div className="space-y-2">
            <IssueBadge color="text-red-400 bg-red-500/10 border-red-500/20" label="Critical" text="SQL Injection" />
            <IssueBadge color="text-amber-400 bg-amber-500/10 border-amber-500/20" label="Major" text="Memory Leak" />
            <IssueBadge color="text-blue-400 bg-blue-500/10 border-blue-500/20" label="Minor" text="Code Style" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowCard({ icon, label, title, sub, borderColor, bgColor, animated }) {
  return (
    <div className={`glass-card rounded-xl p-4 w-full border ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-[#8892b0] uppercase tracking-wider">{label}</span>
        {animated && (
          <span className="ml-auto flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1 h-3 bg-purple-500 rounded-full"
                style={{ animation: `shimmer 1s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-[#e8eaf6]">{title}</p>
      <p className="text-xs text-[#8892b0] mt-0.5">{sub}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-px h-4 bg-gradient-to-b from-[#1e2d45] to-indigo-500/50" />
      <div className="w-2 h-2 rotate-45 border-b-2 border-r-2 border-indigo-500/50 -mt-2" />
    </div>
  );
}

function IssueBadge({ color, label, text }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-xs ${color}`}>
      <span className="font-semibold">{label}</span>
      <span className="text-[#8892b0]">—</span>
      <span>{text}</span>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
