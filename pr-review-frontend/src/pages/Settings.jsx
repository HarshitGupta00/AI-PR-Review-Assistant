import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  BrainCircuit, Bell, Moon, Sun, Monitor,
  CheckCircle, ChevronRight, Unlink, Mail, MessageSquare, Lock, AlertTriangle, Loader
} from 'lucide-react';

function Github({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

function Section({ title, children, index }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1e2d45]/60 flex items-center justify-between">
        <h2 className="font-semibold text-[#e8eaf6] text-sm">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </motion.div>
  );
}

function SettingRow({ icon: Icon, label, desc, children, iconColor = 'text-indigo-400', iconBg = 'bg-indigo-500/10', locked = false, onLockedClick }) {
  return (
    <div className={`flex items-start gap-4 py-2 relative ${locked ? 'opacity-60 grayscale-[30%]' : ''}`} onClick={locked ? onLockedClick : undefined}>
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#e8eaf6]">{label}</p>
          {locked && <span className="text-[9px] uppercase tracking-wider font-bold bg-[#1e2d45] text-[#8892b0] px-1.5 py-0.5 rounded border border-[#2a3750] flex items-center gap-1"><Lock size={8}/> Coming Soon</span>}
        </div>
        {desc && <p className="text-xs text-[#8892b0] mt-0.5">{desc}</p>}
      </div>
      <div className={`flex-shrink-0 ${locked ? 'pointer-events-none' : ''}`}>{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange, locked }) {
  return (
    <button
      onClick={() => { if (!locked) onChange(!enabled); }}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 ${enabled ? 'bg-indigo-600' : 'bg-[#1e2d45]'} ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ height: '22px' }}
      disabled={locked}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

const models = [
  { id: 'Gemini Flash', label: 'Gemini Flash', locked: false },
  { id: 'GPT 5', label: 'GPT-5', locked: true },
  { id: 'Claude Sonnet', label: 'Claude 3.5 Sonnet', locked: true },
];

const themes = [
  { id: 'dark', label: 'Dark', icon: Moon, locked: false },
  { id: 'light', label: 'Light', icon: Sun, locked: true },
  { id: 'system', label: 'System', icon: Monitor, locked: true },
];

export default function Settings() {
  const { user, logout, deleteAccount } = useAuth();
  const [defaultModel, setDefaultModel] = useState('Gemini Flash');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: false,
    slack: false,
    github: false,
  });

  const [tooltipMessage, setTooltipMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showTooltip = (msg) => {
    setTooltipMessage(msg);
    setTimeout(() => setTooltipMessage(null), 2000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // Auth context will handle logout/redirect automatically
    } catch (error) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      showTooltip("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pb-24">
      {/* Global Tooltip for locked features */}
      <AnimatePresence>
        {tooltipMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-[#e8eaf6] text-[#0d1117] text-xs font-bold px-4 py-2 rounded-lg shadow-xl border border-white/20 flex items-center gap-2"
          >
            <Lock size={12} />
            {tooltipMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8eaf6]">Settings</h1>
        <p className="text-sm text-[#8892b0] mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-4">
        {/* GitHub */}
        <Section title="GitHub Integration" index={0}>
          <SettingRow
            icon={Github}
            label="Connected Account"
            desc={user?.username ? `${user.username} · github.com/${user.username}` : "Authenticated via GitHub"}
          >
            <div className="flex items-center gap-2">
              <span className="badge-success hidden sm:flex"><CheckCircle size={10} /> Connected</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
              >
                <Unlink size={12} />
                Disconnect
              </button>
            </div>
          </SettingRow>
        </Section>

        {/* AI Settings */}
        <Section title="AI Engine" index={1}>
          <div>
            <p className="text-sm font-medium text-[#e8eaf6] mb-3 flex items-center gap-2">
              <BrainCircuit size={14} className="text-indigo-400" />
              Default Model
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (m.locked) showTooltip(`${m.label} integration is coming soon.`);
                    else setDefaultModel(m.id);
                  }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    defaultModel === m.id
                      ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                      : 'border-[#1e2d45]/60 text-[#8892b0] hover:text-[#e8eaf6] hover:border-[#1e2d45]'
                  } ${m.locked ? 'opacity-60 cursor-not-allowed bg-[#0d1117]/50 grayscale-[50%]' : ''}`}
                >
                  <span className="text-xs font-bold">{m.label}</span>
                  {m.locked && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#1e2d45] rounded-full border border-[#2a3750] flex items-center justify-center shadow-lg">
                      <Lock size={10} className="text-[#8892b0]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" index={2}>
          <SettingRow
            icon={Mail}
            label="Email Notifications"
            desc="Get review results via email"
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
            locked={true}
            onLockedClick={() => showTooltip("Email notifications coming soon.")}
          >
            <Toggle enabled={notifications.email} onChange={v => setNotifications(n => ({ ...n, email: v }))} locked={true} />
          </SettingRow>
          <SettingRow
            icon={MessageSquare}
            label="Slack Notifications"
            desc="Send results to Slack channel"
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
            locked={true}
            onLockedClick={() => showTooltip("Slack integration coming soon.")}
          >
            <Toggle enabled={notifications.slack} onChange={v => setNotifications(n => ({ ...n, slack: v }))} locked={true} />
          </SettingRow>
          <SettingRow
            icon={Github}
            label="GitHub PR Comments"
            desc="Post review as a PR comment automatically"
            locked={true}
            onLockedClick={() => showTooltip("Automated GitHub comments coming soon.")}
          >
            <Toggle enabled={notifications.github} onChange={v => setNotifications(n => ({ ...n, github: v }))} locked={true} />
          </SettingRow>
        </Section>

        {/* Theme */}
        <Section title="Appearance" index={3}>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.locked) showTooltip(`${t.label} theme is coming soon.`);
                  else setTheme(t.id);
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === t.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-[#1e2d45]/60 hover:border-[#1e2d45]'
                } ${t.locked ? 'opacity-60 cursor-not-allowed bg-[#0d1117]/50 grayscale-[50%]' : ''}`}
              >
                <t.icon size={20} className={theme === t.id ? 'text-indigo-400' : 'text-[#8892b0]'} />
                <span className={`text-xs font-medium ${theme === t.id ? 'text-indigo-300' : 'text-[#8892b0]'}`}>{t.label}</span>
                {t.locked && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-[#4a5568]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Danger Zone */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl overflow-hidden border border-red-500/20">
          <div className="px-6 py-4 border-b border-red-500/15 flex items-center gap-2">
            <h2 className="font-semibold text-red-400 text-sm">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#e8eaf6]">Delete Account</p>
                <p className="text-xs text-[#8892b0] mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button 
                className="text-xs text-red-400 font-medium border border-red-500/25 hover:bg-red-500/10 hover:border-red-500/40 px-3 py-2 rounded-lg transition-all"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0f1623] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                
                <h3 className="text-lg font-bold text-[#e8eaf6] mb-2">
                  Delete Account
                </h3>
                
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-[#8892b0] leading-relaxed">
                    You are about to permanently delete your account. This action <strong className="text-red-400">cannot be undone</strong>.
                  </p>
                  
                  <ul className="text-xs text-[#8892b0] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      All your connected repositories will be removed.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      All PR reviews and insights will be permanently deleted.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      Your GitHub connection will be revoked.
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2d45]/50">
                  <button
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#8892b0] hover:text-[#e8eaf6] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Yes, delete my account'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
