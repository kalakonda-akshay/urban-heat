import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Satellite, Radio, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/NotificationToast';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    try {
      await login(email, password);
      toast.success('Access granted. Initializing geospatial environment...');
      navigate('/');
    } catch (err: any) {
      setError('Invalid email or password.');
      toast.error('Authentication failure.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-console-bg font-sans">
      <div className="w-full max-w-md glass-panel p-8 rounded-[4px] border border-console-border shadow-none relative z-10 flex flex-col items-center">
        {/* Branding header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative">
            <Radio className="w-8 h-8 text-console-orange animate-pulse" />
            <Satellite className="w-4 h-4 text-console-textSec absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold tracking-tight text-console-text">
              URBANHEAT AI
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-console-textSec font-mono block">
              ISRO BAH Platform
            </span>
          </div>
        </div>

        <p className="text-xs text-console-textSec text-center mb-6 leading-normal max-w-[280px]">
          Provide authorized geospatial officer credentials to access telemetry analytics.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 rounded-[2px] bg-console-extremeBg border border-console-extremeBorder text-console-extreme text-xs flex items-center space-x-2 font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="text-xs text-console-textSec block mb-1.5 font-medium">Officer Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-console-textSec absolute left-3" />
              <input
                type="email"
                placeholder="officer@urbanheatai.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] pl-10 pr-4 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs text-console-textSec font-medium">Access Password</label>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-console-textSec absolute left-3" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] pl-10 pr-4 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-40 overflow-hidden"
          >
            <span>{isLoading ? 'ESTABLISHING HANDSHAKE...' : 'ESTABLISH SECURITY SESSION'}</span>
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-thermal-gradient"></span>
          </button>
        </form>

        {/* Demo Tip Panel */}
        <div className="w-full mt-6 p-3 rounded-[2px] bg-console-bg border border-console-border text-[10px] text-console-textSec font-mono text-center">
          <span className="text-console-orange uppercase tracking-wider block mb-1">Demo Access Credentials</span>
          Email: <span className="text-console-text font-semibold">admin@urbanheatai.gov.in</span> <br/>
          Pass: <span className="text-console-text font-semibold">urbanheatsecretpass</span>
        </div>

        <div className="mt-6 text-xs text-console-textSec font-mono">
          First time here?{' '}
          <Link to="/register" className="text-console-orange hover:underline font-semibold">
            Register officer account
          </Link>
        </div>
      </div>
    </div>
  );
};
