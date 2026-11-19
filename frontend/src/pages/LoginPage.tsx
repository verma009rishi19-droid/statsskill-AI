import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { authApi } from '../services/api';
import {
  AlertCircle, Eye, EyeOff, LogIn, UserPlus, CheckCircle2,
} from 'lucide-react';

type Tab = 'signin' | 'register';

const ROLES = [
  { value: 'learner',  label: 'Learner',  desc: 'Statistical officer / analyst seeking training' },
  { value: 'trainer',  label: 'Trainer',  desc: 'NSSTA faculty or domain expert' },
  { value: 'manager',  label: 'Manager',  desc: 'Department head / reporting officer' },
];

export const LoginPage: React.FC = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>('signin');

  /* ── Sign-in state ───────────────────────────────── */
  const [siEmail,    setSiEmail]    = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPwd,  setSiShowPwd]  = useState(false);
  const [siError,    setSiError]    = useState<string | null>(null);
  const [siLoading,  setSiLoading]  = useState(false);

  /* ── Register state ──────────────────────────────── */
  const [regName,     setRegName]     = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm,  setRegConfirm]  = useState('');
  const [regRole,     setRegRole]     = useState('learner');
  const [regDesig,    setRegDesig]    = useState('');
  const [regShowPwd,  setRegShowPwd]  = useState(false);
  const [regError,    setRegError]    = useState<string | null>(null);
  const [regLoading,  setRegLoading]  = useState(false);
  const [regSuccess,  setRegSuccess]  = useState(false);

  /* ── Handlers ────────────────────────────────────── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError(null);
    if (!siEmail.trim())   { setSiError('Email address is required.');  return; }
    if (!siPassword)       { setSiError('Password is required.');        return; }
    setSiLoading(true);
    try {
      await login(siEmail.trim(), siPassword);
      navigate('/', { replace: true });
    } catch (err: any) {
      setSiError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSiLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim())       { setRegError('Full name is required.');           return; }
    if (!regEmail.trim())      { setRegError('Email address is required.');        return; }
    if (regPassword.length < 8){ setRegError('Password must be at least 8 characters.'); return; }
    if (regPassword !== regConfirm) { setRegError('Passwords do not match.');      return; }

    setRegLoading(true);
    try {
      const payload = {
        full_name:   regName.trim(),
        email:       regEmail.trim(),
        password:    regPassword,
        role:        regRole,
        designation: regDesig.trim() || 'Statistical Officer',
      };
      const res = await authApi.register(payload);
      const data = res.data;

      // Store token & user just like login
      localStorage.setItem('statskill_token', data.access_token);
      localStorage.setItem('statskill_user',  JSON.stringify({
        id:        data.user_id,
        email:     data.email,
        full_name: data.full_name,
        role:      data.role,
      }));

      setRegSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setRegError(typeof detail === 'string' ? detail : 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  /* ── UI helpers ──────────────────────────────────── */
  const inputCls = `w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50
                    placeholder:text-slate-400 focus:outline-none focus:ring-2
                    focus:ring-gov-blue/20 focus:border-gov-blue
                    disabled:opacity-50 transition`;

  const tabCls = (active: boolean) =>
    `flex-1 py-2 text-sm font-semibold rounded-lg transition ${
      active
        ? 'bg-gov-blue text-white shadow'
        : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">

          {/* Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gov-blue text-white text-2xl font-bold shadow-lg shadow-gov-blue/20">
              Σ
            </div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">StatSkill AI</h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              AI-Powered Competency Development Platform for India's Official Statistical System
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

            {/* Tab switcher */}
            <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100">
              <button className={tabCls(tab === 'signin')}   onClick={() => { setTab('signin');   setSiError(null); }}>
                <LogIn  className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                Sign In
              </button>
              <button className={tabCls(tab === 'register')} onClick={() => { setTab('register'); setRegError(null); }}>
                <UserPlus className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                Create Account
              </button>
            </div>

            {/* ── SIGN IN ────────────────────────────────── */}
            {tab === 'signin' && (
              <div className="p-6 space-y-4">
                {siError && <ErrorBanner msg={siError} />}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <Field label="Email Address">
                    <input
                      type="email" value={siEmail} autoComplete="email"
                      onChange={e => setSiEmail(e.target.value)}
                      placeholder="name@mospi.gov.in"
                      disabled={siLoading} className={inputCls}
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={siShowPwd ? 'text' : 'password'} value={siPassword}
                        autoComplete="current-password"
                        onChange={e => setSiPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={siLoading}
                        className={inputCls + ' pr-10'}
                      />
                      <PwdToggle show={siShowPwd} onToggle={() => setSiShowPwd(v => !v)} />
                    </div>
                  </Field>

                  <button
                    type="submit" disabled={siLoading}
                    className="w-full py-2.5 bg-gov-blue text-white text-sm font-semibold rounded-lg
                               hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2
                               focus:ring-gov-blue/30 disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2 transition"
                  >
                    {siLoading
                      ? <><Spinner /> Signing in…</>
                      : <><LogIn className="h-4 w-4" /> Sign In</>
                    }
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400 pt-1">
                  Don't have an account?{' '}
                  <button
                    className="text-gov-blue font-semibold hover:underline"
                    onClick={() => setTab('register')}
                  >
                    Create one
                  </button>
                </p>
              </div>
            )}

            {/* ── CREATE ACCOUNT ─────────────────────────── */}
            {tab === 'register' && (
              <div className="p-6 space-y-4">

                {/* Success state */}
                {regSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    <p className="text-base font-semibold text-navy-900">Account Created!</p>
                    <p className="text-sm text-slate-500">Redirecting to your dashboard…</p>
                  </div>
                ) : (
                  <>
                    {regError && <ErrorBanner msg={regError} />}

                    <form onSubmit={handleRegister} className="space-y-4">

                      <Field label="Full Name">
                        <input
                          type="text" value={regName} autoComplete="name"
                          onChange={e => setRegName(e.target.value)}
                          placeholder="e.g. Priya Sharma"
                          disabled={regLoading} className={inputCls}
                        />
                      </Field>

                      <Field label="Official Email">
                        <input
                          type="email" value={regEmail} autoComplete="email"
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="name@mospi.gov.in"
                          disabled={regLoading} className={inputCls}
                        />
                      </Field>

                      <Field label="Role">
                        <select
                          value={regRole}
                          onChange={e => setRegRole(e.target.value)}
                          disabled={regLoading} className={inputCls}
                        >
                          {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Designation (optional)">
                        <input
                          type="text" value={regDesig}
                          onChange={e => setRegDesig(e.target.value)}
                          placeholder="e.g. Deputy Director (Statistics)"
                          disabled={regLoading} className={inputCls}
                        />
                      </Field>

                      <Field label="Password">
                        <div className="relative">
                          <input
                            type={regShowPwd ? 'text' : 'password'} value={regPassword}
                            autoComplete="new-password"
                            onChange={e => setRegPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            disabled={regLoading}
                            className={inputCls + ' pr-10'}
                          />
                          <PwdToggle show={regShowPwd} onToggle={() => setRegShowPwd(v => !v)} />
                        </div>
                        {regPassword && (
                          <PasswordStrength password={regPassword} />
                        )}
                      </Field>

                      <Field label="Confirm Password">
                        <input
                          type={regShowPwd ? 'text' : 'password'} value={regConfirm}
                          autoComplete="new-password"
                          onChange={e => setRegConfirm(e.target.value)}
                          placeholder="Re-enter your password"
                          disabled={regLoading}
                          className={inputCls + (regConfirm && regConfirm !== regPassword
                            ? ' border-red-400 focus:border-red-400 focus:ring-red-200'
                            : '')}
                        />
                      </Field>

                      <button
                        type="submit" disabled={regLoading}
                        className="w-full py-2.5 bg-gov-blue text-white text-sm font-semibold rounded-lg
                                   hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2
                                   focus:ring-gov-blue/30 disabled:opacity-60 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2 transition"
                      >
                        {regLoading
                          ? <><Spinner /> Creating account…</>
                          : <><UserPlus className="h-4 w-4" /> Create Account</>
                        }
                      </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 pt-1">
                      Already have an account?{' '}
                      <button
                        className="text-gov-blue font-semibold hover:underline"
                        onClick={() => setTab('signin')}
                      >
                        Sign in
                      </button>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-400">
          Ministry of Statistics &amp; Programme Implementation &nbsp;·&nbsp; National Statistical Systems Training Academy
        </p>
        <p className="text-[11px] text-slate-300 mt-1">StatSkill AI — Competency Development Platform</p>
      </footer>
    </div>
  );
};

/* ── Small reusable sub-components ─────────────────────── */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-600">{label}</label>
    {children}
  </div>
);

const ErrorBanner: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
    <span>{msg}</span>
  </div>
);

const Spinner = () => (
  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const PwdToggle: React.FC<{ show: boolean; onToggle: () => void }> = ({ show, onToggle }) => (
  <button
    type="button" onClick={onToggle} tabIndex={-1}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
  >
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score-1] : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="text-[11px] text-slate-400">
        Strength: <span className="font-semibold">{labels[score - 1] ?? 'Too short'}</span>
        {score < 4 && ' — add uppercase, numbers, symbols'}
      </p>
    </div>
  );
};
