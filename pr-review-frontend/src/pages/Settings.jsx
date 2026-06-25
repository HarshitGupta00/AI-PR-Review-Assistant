import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Bell, Moon, Sun, Monitor,
  CheckCircle, ChevronRight, Unlink, Mail, MessageSquare
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
      <div className="px-6 py-4 border-b border-[#1e2d45]/60">
        <h2 className="font-semibold text-[#e8eaf6] text-sm">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </motion.div>
  );
}

function SettingRow({ icon: Icon, label, desc, children, iconColor = 'text-indigo-400', iconBg = 'bg-indigo-500/10' }) {
  return (
    <div className="flex items-start gap-4 py-2">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e8eaf6]">{label}</p>
        {desc && <p className="text-xs text-[#8892b0] mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 ${enabled ? 'bg-indigo-600' : 'bg-[#1e2d45]'}`}
      style={{ height: '22px' }}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

const models = ['Gemini Flash', 'GPT 5', 'Claude Sonnet'];
const themes = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function Settings() {
  const { logout } = useAuth();
  const [defaultModel, setDefaultModel] = useState('Gemini Flash');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    github: true,
  });

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8eaf6]">Settings</h1>
        <p className="text-sm text-[#8892b0] mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-4">
        {/* GitHub */}
        <Section title="GitHub" index={0}>
          <SettingRow
            icon={Github}
            label="Connected Account"
            desc="Harshit · github.com/harshit"
          >
            <div className="flex items-center gap-2">
              <span className="badge-success"><CheckCircle size={10} /> Connected</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all"
              >
                <Unlink size={12} />
                Disconnect
              </button>
            </div>
          </SettingRow>
        </Section>

        {/* AI Settings */}
        <Section title="AI" index={1}>
          <div>
            <p className="text-sm font-medium text-[#e8eaf6] mb-3 flex items-center gap-2">
              <Zap size={14} className="text-indigo-400" />
              Default Model
            </p>
            <div className="grid grid-cols-3 gap-2">
              {models.map(m => (
                <button
                  key={m}
                  onClick={() => setDefaultModel(m)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    defaultModel === m
                      ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                      : 'border-[#1e2d45]/60 text-[#8892b0] hover:text-[#e8eaf6] hover:border-[#1e2d45]'
                  }`}
                >
                  {m}
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
          >
            <Toggle enabled={notifications.email} onChange={v => setNotifications(n => ({ ...n, email: v }))} />
          </SettingRow>
          <SettingRow
            icon={MessageSquare}
            label="Slack Notifications"
            desc="Send results to Slack channel"
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          >
            <Toggle enabled={notifications.slack} onChange={v => setNotifications(n => ({ ...n, slack: v }))} />
          </SettingRow>
          <SettingRow
            icon={Github}
            label="GitHub PR Comments"
            desc="Post review as a PR comment"
          >
            <Toggle enabled={notifications.github} onChange={v => setNotifications(n => ({ ...n, github: v }))} />
          </SettingRow>
        </Section>

        {/* Theme */}
        <Section title="Theme" index={3}>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === t.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-[#1e2d45]/60 hover:border-[#1e2d45]'
                }`}
              >
                <t.icon size={20} className={theme === t.id ? 'text-indigo-400' : 'text-[#8892b0]'} />
                <span className={`text-xs font-medium ${theme === t.id ? 'text-indigo-300' : 'text-[#8892b0]'}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Danger Zone */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl overflow-hidden border border-red-500/15">
          <div className="px-6 py-4 border-b border-red-500/15">
            <h2 className="font-semibold text-red-400 text-sm">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#e8eaf6]">Delete Account</p>
                <p className="text-xs text-[#8892b0] mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button className="text-xs text-red-400 border border-red-500/25 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
