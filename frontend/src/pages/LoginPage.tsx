import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { AlertCircle, Eye, EyeOff, LogIn, Users } from 'lucide-react';

/** Demo accounts available for quick access */
const DEMO_ACCOUNTS = [
  {
    role: 'Learner',
    name: 'Priya Sharma',
    email: 'priya.sharma@mospi.gov.in',
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    role: 'Trainer',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@mospi.gov.in',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    role: 'Manager',
    name: 'Anita Desai',
    email: 'anita.desai@mospi.gov.in',
    color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    role: 'Admin',
    name: 'Vikram Patel',
    email: 'vikram.patel@mospi.gov.in',
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
] as const;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAs } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  /** Standard email + password login */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Quick demo login by role */
  const handleDemoLogin = async (role: string) => {
    setError(null);
    setLoadingDemo(role);
    try {
      await loginAs(role.toLowerCase() as 'learner' | 'trainer' | 'manager' | 'admin');
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || `Failed to sign in as ${role}. Please try again.`);
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main content — vertically & horizontally centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gov-blue text-white text-2xl font-bold shadow-lg shadow-gov-blue/20">
              Σ
            </div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
              StatSkill AI
            </h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              AI-Powered Competency Development Platform for India's Official Statistical System
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <LogIn className="h-4 w-4 text-gov-blue" />
                Sign In
              </h2>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-600">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mospi.gov.in"
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue
                             disabled:opacity-50 transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg bg-slate-50 placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue
                               disabled:opacity-50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gov-blue text-white text-sm font-semibold rounded-lg
                           hover:bg-blue-700 active:bg-blue-800
                           focus:outline-none focus:ring-2 focus:ring-gov-blue/30
                           disabled:opacity-60 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Access */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-gov-blue" />
                Quick Demo Access
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore the platform instantly with a demo account
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoLogin(account.role)}
                  disabled={!!loadingDemo}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition
                             disabled:opacity-50 disabled:cursor-not-allowed ${account.color}`}
                >
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${account.badge}`}>
                    {account.role}
                  </span>
                  <span className="text-sm font-semibold mt-1.5 leading-tight">
                    {loadingDemo === account.role ? (
                      <span className="flex items-center gap-1.5">
                        <div className="h-3 w-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      account.name
                    )}
                  </span>
                  <span className="text-[11px] opacity-70 truncate w-full mt-0.5">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-400">
          Ministry of Statistics &amp; Programme Implementation &nbsp;·&nbsp; National Statistical Systems Training Academy
        </p>
        <p className="text-[11px] text-slate-300 mt-1">
          StatSkill AI — Competency Development Platform
        </p>
      </footer>
    </div>
  );
};
