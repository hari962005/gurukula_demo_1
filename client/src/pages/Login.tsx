import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { Sparkles, Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await switchDemoRole(role);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed demo login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#1B4332] flex items-center justify-center shadow-lg border-2 border-amber-400 mb-3">
          <span className="text-amber-300 font-serif text-2xl font-bold">शुभ</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1B4332] tracking-wide">
          SHUBHAM KAROTI MAITREYI GURUKULA
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#B45309] font-medium font-serif">
          Child Journey Tracking System — विद्या ददाति विनयं
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#EAE4D7] sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Gurukula Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. teacher@gurukula.org"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Secure Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
            >
              <span>Sign In to Gurukula Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-6 border-t border-[#EAE4D7]">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider text-center mb-3">
              One-Click Role Demonstration Accounts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('teacher')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Teacher / Mentor</div>
                  <div className="text-[10px] text-amber-700">teacher@gurukula.org</div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('coordinator')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Academic Coord</div>
                  <div className="text-[10px] text-emerald-700">coordinator@gurukula.org</div>
                </div>
                <Shield className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admissions')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Admissions Coord</div>
                  <div className="text-[10px] text-blue-700">admissions@gurukula.org</div>
                </div>
                <span className="text-[10px] font-bold">APP</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('management')}
                className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Trustee / Mgmt</div>
                  <div className="text-[10px] text-stone-600">trustee@gurukula.org</div>
                </div>
                <span className="text-[10px] font-bold">KPI</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="sm:col-span-2 p-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">System Administrator (Full Controls)</div>
                  <div className="text-[10px] text-purple-700">admin@gurukula.org</div>
                </div>
                <span className="text-[10px] font-bold">ADMIN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
