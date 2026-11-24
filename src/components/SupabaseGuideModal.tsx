import React, { useState } from 'react';
import { 
  X, Check, Copy, ExternalLink, Key, ShieldCheck, 
  HelpCircle, Sparkles, AlertTriangle
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  isSupabaseConfigured 
} from '../services/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'connect'>('guide');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Form state for in-app connection
  const creds = getSupabaseCredentials();
  const [inputUrl, setInputUrl] = useState(creds.url);
  const [inputKey, setInputKey] = useState(creds.anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(inputUrl, inputKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleClear = () => {
    clearCustomSupabaseConfig();
    setInputUrl('');
    setInputKey('');
    if (onConfigUpdated) onConfigUpdated();
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-dark-850 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-dark-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-brand-cyan flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Supabase & Google Auth Setup Guide
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Step-by-Step
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete walkthrough for Google Cloud Console and Supabase OAuth credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-dark-900 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'guide'
                    ? 'bg-brand-purple text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Setup Instructions
              </button>
              <button
                onClick={() => setActiveTab('connect')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'connect'
                    ? 'bg-brand-purple text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                In-App Keys
                {isConfigured && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300">
          {activeTab === 'guide' ? (
            <div className="space-y-6">
              
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-purple/15 via-brand-cyan/10 to-transparent border border-brand-purple/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-white mb-1">
                    How Google Authentication Works with SketchDraw
                  </p>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    SketchDraw uses <strong>Supabase</strong> as the backend authentication provider. Supabase talks securely to <strong>Google Cloud Console</strong> using OAuth 2.0. Follow these 3 easy phases to enable one-click Google Sign-In for your users!
                  </p>
                </div>
              </div>

              {/* Step 1: Google Cloud Console */}
              <div className="p-5 rounded-xl bg-dark-800/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/30">
                      1
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Google Cloud Console Setup
                    </h3>
                  </div>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 transition-colors"
                  >
                    Open Google Cloud Console <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <ol className="list-decimal list-inside space-y-3 text-xs leading-relaxed text-slate-300">
                  <li className="pl-1">
                    <strong>Create or Select a Project:</strong> Log in to the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-brand-cyan underline">Google Cloud Console</a>. Click the project dropdown at the top and click <strong>New Project</strong> (e.g. <em>"SketchDraw"</em>).
                  </li>
                  <li className="pl-1">
                    <strong>Configure OAuth Consent Screen:</strong>
                    <div className="mt-1.5 ml-4 p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1.5">
                      <p>• In the left sidebar, navigate to <strong>APIs & Services &gt; OAuth consent screen</strong>.</p>
                      <p>• Choose <strong>External</strong> and click <strong>Create</strong>.</p>
                      <p>• Enter <strong>App Name</strong>: <code className="text-brand-purple">SketchDraw</code>, and enter your <strong>User support email</strong> and <strong>Developer contact email</strong>.</p>
                      <p>• Click <strong>Save and Continue</strong> through Scopes (the default <code>email</code>, <code>profile</code>, <code>openid</code> are sufficient).</p>
                    </div>
                  </li>
                  <li className="pl-1">
                    <strong>Create OAuth Client ID:</strong>
                    <div className="mt-1.5 ml-4 p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-2">
                      <p>• Navigate to <strong>APIs & Services &gt; Credentials</strong>.</p>
                      <p>• Click <strong>+ CREATE CREDENTIALS &gt; OAuth client ID</strong>.</p>
                      <p>• Application type: Select <strong>Web application</strong>.</p>
                      <p>• Name: <code className="text-brand-cyan">SketchDraw Web Client</code>.</p>
                      <div>
                        <p className="font-semibold text-slate-200 mb-1">
                          • Authorized redirect URIs:
                        </p>
                        <p className="text-slate-400 mb-1.5">
                          Paste your Supabase callback URL in this format:
                        </p>
                        <div className="flex items-center gap-2 bg-dark-850 p-2 rounded border border-slate-700">
                          <code className="text-emerald-400 font-mono text-[11px] flex-1">
                            https://&lt;your-supabase-ref&gt;.supabase.co/auth/v1/callback
                          </code>
                          <button
                            onClick={() => handleCopy('https://<your-supabase-ref>.supabase.co/auth/v1/callback', 1)}
                            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded flex items-center gap-1"
                          >
                            {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedIndex === 1 ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <p>• Click <strong>CREATE</strong>. A dialog will show your <strong>Client ID</strong> and <strong>Client Secret</strong>. Keep them handy!</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Step 2: Supabase Dashboard */}
              <div className="p-5 rounded-xl bg-dark-800/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                      2
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Supabase Dashboard Configuration
                    </h3>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 transition-colors"
                  >
                    Open Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <ol className="list-decimal list-inside space-y-3 text-xs leading-relaxed text-slate-300">
                  <li className="pl-1">
                    <strong>Open your Supabase Project:</strong> Log in at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-brand-cyan underline">supabase.com/dashboard</a> and select your project (or create a free one).
                  </li>
                  <li className="pl-1">
                    <strong>Enable Google Provider:</strong>
                    <div className="mt-1.5 ml-4 p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-2">
                      <p>• In the left sidebar, click <strong>Authentication &gt; Providers</strong>.</p>
                      <p>• Find <strong>Google</strong> in the list and click to expand it.</p>
                      <p>• Toggle <strong>Enable Sign in with Google</strong> to ON.</p>
                      <p>• Paste the <strong>Client ID</strong> from Google Cloud Console.</p>
                      <p>• Paste the <strong>Client Secret</strong> from Google Cloud Console.</p>
                      <p>• Click <strong>Save</strong>.</p>
                    </div>
                  </li>
                  <li className="pl-1">
                    <strong>Copy Supabase URL & Anon Key:</strong>
                    <div className="mt-1.5 ml-4 p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1.5">
                      <p>• In the left sidebar, click <strong>Project Settings &gt; API</strong>.</p>
                      <p>• Copy your <strong>Project URL</strong> (e.g. <code>https://xyzcompany.supabase.co</code>).</p>
                      <p>• Copy your <strong>Project API key</strong> labeled <code>anon</code> / <code>public</code>.</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Step 3: Connect in SketchDraw */}
              <div className="p-5 rounded-xl bg-dark-800/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-brand-purple/20 text-brand-purple font-bold flex items-center justify-center text-sm border border-brand-purple/30">
                    3
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Connect Keys to SketchDraw
                  </h3>
                </div>

                <div className="text-xs space-y-3">
                  <p>
                    You can provide your credentials in either of two convenient ways:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
                      <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-brand-cyan" /> Option A: In-App Keys (Instant)
                      </div>
                      <p className="text-slate-400 mb-2">
                        Click the <strong>In-App Keys</strong> tab above, paste your Supabase URL and Anon Key, and click Save. Ready immediately without reloading!
                      </p>
                      <button
                        onClick={() => setActiveTab('connect')}
                        className="text-xs text-brand-cyan hover:underline font-medium"
                      >
                        Go to In-App Keys tab &rarr;
                      </button>
                    </div>

                    <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
                      <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Option B: .env.local File
                      </div>
                      <p className="text-slate-400 mb-2">
                        Create a file named <code>.env.local</code> in the project root:
                      </p>
                      <div className="bg-dark-850 p-2 rounded font-mono text-[11px] text-slate-300 relative group">
                        <div>VITE_SUPABASE_URL=https://xyz.supabase.co</div>
                        <div>VITE_SUPABASE_ANON_KEY=eyJh...</div>
                        <button
                          onClick={() => handleCopy(`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`, 2)}
                          className="absolute right-2 top-2 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                        >
                          {copiedIndex === 2 ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Connect Tab */
            <form onSubmit={handleSaveConfig} className="space-y-5 max-w-xl mx-auto py-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Configure Supabase Project Keys
                </h3>
                <p className="text-xs text-slate-400">
                  Save your credentials here to activate live Google Authentication and cloud sync.
                </p>
              </div>

              {isConfigured ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Supabase is currently <strong>Connected</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-red-400 hover:text-red-300 underline text-xs"
                  >
                    Disconnect / Reset
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>No custom keys configured. Running in high-performance local demo mode!</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Supabase Project URL</span>
                  <span className="text-[10px] text-slate-500">e.g. https://your-id.supabase.co</span>
                </label>
                <input
                  type="url"
                  placeholder="https://xyzabcdefg.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Supabase Anon Public Key</span>
                  <span className="text-[10px] text-slate-500">Starts with eyJ...</span>
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-sm font-semibold shadow-lg shadow-brand-purple/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <SaveIcon className="w-4 h-4" />
                  Save & Connect Supabase
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                  >
                    Clear Keys
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-medium animate-fadeIn">
                  🎉 Credentials saved successfully! You can now authenticate with Google.
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-dark-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-purple" />
            <span>Need quick testing? Instant Guest Mode is always available with 1 click!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);
