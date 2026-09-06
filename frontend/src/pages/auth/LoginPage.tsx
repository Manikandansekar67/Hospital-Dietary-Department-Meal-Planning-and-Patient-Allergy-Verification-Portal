import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChefHat,
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { HOSPITAL_INFO } from '../../constants';
import { useAuth } from '../../store/AuthContext';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('doctor@hospital.org');
  const [password, setPassword] = useState('hospital-safe-pass');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email);
      redirectToRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive account.');
    }
  };

  const handleQuickLogin = async (role: Role, defaultEmail: string) => {
    setEmail(defaultEmail);
    setError(null);
    try {
      const user = await login(defaultEmail, role);
      redirectToRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  const redirectToRole = (role: Role) => {
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'doctor':
        navigate('/doctor');
        break;
      case 'kitchen':
        navigate('/kitchen');
        break;
      case 'patient':
        navigate('/patient');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Hospital Logo / Badge */}
        <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto shadow-md mb-3">
          <HeartPulse className="w-9 h-9" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          {HOSPITAL_INFO.name}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
          {HOSPITAL_INFO.department}
        </p>
        <span className="inline-block mt-2 text-[11px] text-teal-800 bg-teal-100 font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
          Dietary Meal Planning &amp; Patient Allergy Verification Portal
        </span>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Hospital Staff / Patient Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. doctor@hospital.org"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                <span>Remember me on this workstation</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="font-semibold text-teal-700 hover:text-teal-800"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading}>
              Secure Portal Sign In
            </Button>
          </form>

          {/* Secure Messaging Banner */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Encrypted HIPAA &amp; Clinical Safety Verification</span>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick Role Demo Access (1-Click Switch)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin@hospital.org')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-teal-700 shrink-0" />
                <div className="text-xs">
                  <strong className="block text-slate-800 font-semibold leading-tight">Admin</strong>
                  <span className="text-[10px] text-slate-400">Audits &amp; Foods</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('doctor', 'doctor@hospital.org')}
                className="p-2.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-left transition-colors flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-800 shrink-0" />
                <div className="text-xs">
                  <strong className="block text-teal-950 font-bold leading-tight">Doctor</strong>
                  <span className="text-[10px] text-teal-700">Allergy Approvals</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kitchen', 'kitchen@hospital.org')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-colors flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <strong className="block text-slate-800 font-semibold leading-tight">Kitchen Staff</strong>
                  <span className="text-[10px] text-slate-400">Meal Prep &amp; Safety</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('patient', 'patient@hospital.org')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-colors flex items-center gap-2"
              >
                <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <strong className="block text-slate-800 font-semibold leading-tight">Patient Arun</strong>
                  <span className="text-[10px] text-slate-400">Room 304-B</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setForgotSubmitted(false);
        }}
        title="Reset Clinical Portal Password"
        subtitle="Hospital IT Security Desk"
        maxWidth="sm"
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Recovery Instructions Dispatched</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an active hospital directory record exists for <strong>{forgotEmail}</strong>, an authorized secure reset
              token has been sent.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setIsForgotModalOpen(false);
                setForgotSubmitted(false);
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setForgotSubmitted(true);
            }}
            className="space-y-4"
          >
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered hospital email address. You will receive an authorized authorization PIN.
            </p>
            <Input
              label="Registered Email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. yourname@hospital.org"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Request Password Reset
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
