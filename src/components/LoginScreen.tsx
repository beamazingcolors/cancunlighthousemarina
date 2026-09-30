import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  authenticateCredentials, 
  sanitizeInput,
  UserAccount
} from '../utils/security';
import { OfficialLogoMark } from './OfficialLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useLanguage } from '../context/LanguageContext';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, isEn } = useLanguage();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mustResetPassword, setMustResetPassword] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError(isEn ? 'Please fill in all required fields.' : 'Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authenticateCredentials(cleanEmail, cleanPassword);
      setIsSubmitting(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || (isEn ? 'Invalid credentials.' : 'Credenciales inválidas.'));
        if (result.mustResetPassword) {
          setMustResetPassword(true);
        }
        if (typeof result.remainingAttempts === 'number') {
          setRemainingAttempts(result.remainingAttempts);
        }
      }
    } catch {
      setError(isEn ? 'Authentication process error.' : 'Error al procesar la autenticación.');
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSuccess = (resetEmail: string) => {
    setEmail(resetEmail);
    setPassword('');
    setMustResetPassword(false);
    setRemainingAttempts(5);
    setSuccessMessage(
      isEn 
        ? 'Password updated successfully! Your account is unlocked. You can now log in.'
        : '¡Contraseña actualizada exitosamente! Tu cuenta ha sido desbloqueada. Ya puedes iniciar sesión.'
    );
    setTimeout(() => setSuccessMessage(''), 8000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#001733] via-[#002147] to-[#040f21] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Aesthetic Maritime Background Grid & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cyan radial glow */}
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] bg-[#00A3E0]/15 rounded-full blur-[110px]" />
        {/* Navy deep radial glow */}
        <div className="absolute -bottom-32 -left-32 w-[36rem] h-[36rem] bg-[#002b5c]/70 rounded-full blur-[120px]" />
        {/* Subtle grid pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
      </div>

      {/* Language Switcher Pill in Top Right Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <div className="flex items-center bg-white/10 dark:bg-slate-900/60 p-1 rounded-xl border border-white/20 backdrop-blur-md shadow-lg">
          <button
            type="button"
            onClick={() => setLanguage('es')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              language === 'es'
                ? 'bg-gradient-to-r from-sky-500 to-[#00A3E0] text-white shadow-sm ring-1 ring-white/20'
                : 'text-sky-200 hover:text-white hover:bg-white/5'
            }`}
            title="Español (México)"
          >
            <span>🇲🇽</span>
            <span>ES</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              language === 'en'
                ? 'bg-gradient-to-r from-sky-500 to-[#00A3E0] text-white shadow-sm ring-1 ring-white/20'
                : 'text-sky-200 hover:text-white hover:bg-white/5'
            }`}
            title="English (US)"
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>
        </div>
      </div>

      {/* Center Aesthetic Login Box */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,163,224,0.3)] overflow-hidden"
        >
          {/* Card Top Banner with Official Logo */}
          <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-[#052b57]/90 to-transparent border-b border-white/10 relative overflow-hidden">
            {/* Top decorative spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#00A3E0]/20 blur-2xl pointer-events-none" />

            {/* Official Logo Container */}
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white text-[#002147] shadow-xl shadow-black/40 mb-4 transform hover:scale-105 transition-transform">
              <OfficialLogoMark className="w-11 h-11" color="#002147" />
            </div>

            {/* Brand Title */}
            <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white font-sans flex items-center justify-center gap-2">
              <span>CANCUN</span>
              <span className="text-[#00A3E0]">LIGHTHOUSE</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] text-sky-200 uppercase mt-0.5">
              MARINA • OPERATING SYSTEM
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>{isEn ? 'Restricted Access • Authorized Users Only' : 'Acceso Restringido • Usuarios Autorizados'}</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-4">
            {/* Account Locked after 5 failed attempts banner */}
            {mustResetPassword ? (
              <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-center space-y-2.5 animate-in fade-in">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/20 text-rose-400">
                  <LockKeyhole className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                  {isEn ? 'Account Locked — Limit of 5 Attempts Reached' : 'Cuenta Bloqueada — Límite de 5 Intentos'}
                </h3>
                <p className="text-[11px] text-rose-300/90 leading-relaxed">
                  {isEn
                    ? 'For security reasons, you must generate a new password to unlock your account and regain access.'
                    : 'Por seguridad, has alcanzado el máximo de 5 intentos permitidos. Es obligatorio generar una nueva contraseña para desbloquear tu cuenta.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Generate New Password Now' : 'Generar Nueva Contraseña Ahora'}</span>
                </button>
              </div>
            ) : (
              /* Remaining Attempts indicator */
              remainingAttempts !== null && remainingAttempts < 5 && (
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
                  <span>
                    {isEn ? 'Attempts made:' : 'Intentos fallidos:'} {5 - remainingAttempts} de 5
                  </span>
                  <span className="font-semibold text-amber-400">
                    {remainingAttempts} {isEn ? 'remaining' : 'restante' + (remainingAttempts === 1 ? '' : 's')}
                  </span>
                </div>
              )
            )}

            {/* Error Notification */}
            {error && !mustResetPassword && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Password Reset Success Notification */}
            {successMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? 'User Email' : 'Correo Electrónico de Usuario'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-email"
                    type="email"
                    autoComplete="username"
                    disabled={isSubmitting}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@nauticoslighthouse.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-[#00A3E0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide and Forgot Password button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {isEn ? 'Password' : 'Contraseña de Acceso'}
                  </label>
                  {/* Forgot Password Button */}
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-semibold text-[#00A3E0] hover:text-sky-300 transition hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>{isEn ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-[#00A3E0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer disabled:opacity-40"
                    title={showPassword ? (isEn ? 'Hide password' : 'Ocultar contraseña') : (isEn ? 'Show password' : 'Ver contraseña')}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isSubmitting || mustResetPassword}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#00A3E0] to-[#008ec4] hover:from-[#008ec4] hover:to-[#007ba8] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#00A3E0]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isEn ? 'Sign In to Portal' : 'Ingresar al Sistema'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge Footer (No registration link as explicitly commanded) */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>{isEn ? 'Encrypted private portal • TLS 1.3' : 'Portal privado cifrado • TLS 1.3'}</span>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-center mt-5 text-[11px] text-slate-400/80">
          © {new Date().getFullYear()} Cancun Lighthouse Marina. {isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}
        </div>
      </div>

      {/* Forgot Password Modal with Captcha & Strict Rules Validation */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        initialEmail={email}
        onClose={() => setIsForgotPasswordOpen(false)}
        onPasswordResetSuccess={handlePasswordResetSuccess}
      />
    </div>
  );
};
