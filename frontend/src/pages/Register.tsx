import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Shield, Radio, Satellite, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/NotificationToast';

export const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('user');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !name) {
      setError('Please fill in all registration inputs.');
      return;
    }

    try {
      await register(email, password, name, role);
      toast.success('Officer profile registered successfully. You may login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      toast.error('Registration failed.');
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
          Create a new Geospatial Officer profile to authorize spatial calculations.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 rounded-[2px] bg-console-extremeBg border border-console-extremeBorder text-console-extreme text-xs flex items-center space-x-2 font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="text-xs text-console-textSec block mb-1.5 font-medium">Officer Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-console-textSec absolute left-3" />
              <input
                type="text"
                placeholder="Dr. Vikram Sarabhai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] pl-10 pr-4 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

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
            <label className="text-xs text-console-textSec block mb-1.5 font-medium">Access Password</label>
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

          <div>
            <label className="text-xs text-console-textSec block mb-1.5 font-medium">Authorization Role</label>
            <div className="relative flex items-center">
              <Shield className="w-4 h-4 text-console-textSec absolute left-3" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] pl-10 pr-4 py-2.5 text-xs text-console-text focus:outline-none transition-colors appearance-none"
              >
                <option value="user" className="bg-console-surface text-console-text">Geospatial Officer (Standard)</option>
                <option value="admin" className="bg-console-surface text-console-text">Lead Administrator (Admin)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-40 overflow-hidden"
          >
            <span>{isLoading ? 'ENROLLING OFFICER...' : 'REGISTER PROFILE'}</span>
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-thermal-gradient"></span>
          </button>
        </form>

        <div className="mt-6 text-xs text-console-textSec font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-console-orange hover:underline font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
