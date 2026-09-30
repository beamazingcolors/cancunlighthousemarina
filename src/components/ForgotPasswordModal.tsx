import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  Mail, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  Send,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  fetchBackendCaptcha, 
  requestPasswordReset, 
  completePasswordReset, 
  validatePasswordPolicy, 
  PasswordPolicyCheck 
} from '../utils/security';
import { useLanguage } from '../context/LanguageContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onPasswordResetSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  initialEmail = '',
  onClose,
  onPasswordResetSuccess
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState<string>(initialEmail);
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captcha, setCaptcha] = useState<{ id: string; code: string }>({ id: '', code: '•••••' });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Password reset fields
  const [tokenInput, setTokenInput] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Policy check
  const policy: PasswordPolicyCheck = validatePasswordPolicy(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Refresh captcha from backend
  const handleRefreshCaptcha = async () => {
    try {
      const c = await fetchBackendCaptcha();
      setCaptcha(c);
      setCaptchaInput('');
      setError('');
    } catch {
      // ignore
    }
  };

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setCaptchaInput('');
      setTokenInput('');
      setError('');
      setStep('request');
      setNewPassword('');
      setConfirmPassword('');
      handleRefreshCaptcha();
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  // Step 1: Request code to user's real email
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError(isEn ? 'Please enter your email.' : 'Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!captchaInput.trim()) {
      setError(isEn ? 'Please enter the Captcha code.' : 'Por favor escribe el código Captcha.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestPasswordReset(cleanEmail, captchaInput, captcha.id);
      setIsSubmitting(false);

      if (res.success) {
        // Transition to reset step where user inputs the code received in their email
        setStep('reset');
        setError('');
      } else {
        setError(res.error || (isEn ? 'Verification error' : 'Error en la verificación'));
        handleRefreshCaptcha();
      }
    } catch {
      setIsSubmitting(false);
      setError(isEn ? 'Error connecting to the security server.' : 'Error al conectar con el servidor de seguridad.');
      handleRefreshCaptcha();
    }
  };

  // Step 2: Validate token from email and update password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tokenInput.trim()) {
      setError(isEn ? 'Please enter the verification code sent to your email.' : 'Por favor introduce el código de verificación que recibiste en tu correo.');
      return;
    }

    if (!policy.isValid) {
      setError(isEn ? 'Please fulfill all password requirements.' : 'Por favor cumple con todos los requisitos de la contraseña.');
      return;
    }

    if (!passwordsMatch) {
      setError(isEn ? 'Passwords do not match.' : 'Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await completePasswordReset(email, tokenInput, newPassword);
      setIsSubmitting(false);

      if (res.success) {
        onPasswordResetSuccess(email);
        onClose();
      } else {
        setError(res.error || (isEn ? 'Error updating password.' : 'Error al actualizar la contraseña.'));
      }
    } catch {
      setIsSubmitting(false);
      setError(isEn ? 'Error connecting to the security server.' : 'Error de conexión con el servidor.');
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#0c182b] text-slate-900 dark:text-slate-100 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto cursor-default relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#002147] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#001733] relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-full bg-radial from-[#00A3E0]/20 to-transparent pointer-events-none" />
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white shadow-lg shadow-[#00A3E0]/30 font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {isEn ? 'Password Recovery' : 'Recuperar Contraseña'}
                </h2>
                <p className="text-[11px] text-sky-200 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#00A3E0]" />
                  <span>{isEn ? 'Official Security Server' : 'Servidor Seguro Oficial'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer relative z-10"
              title={isEn ? 'Close' : 'Cerrar'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: SOLICITAR CÓDIGO CON EMAIL Y CAPTCHA */}
            {step === 'request' && (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? 'Enter your registered email and solve the security Captcha. We will send a secure verification code directly to your email inbox.'
                    : 'Ingresa tu correo electrónico registrado y resuelve el Captcha. El servidor enviará un código de verificación seguro directamente a tu correo.'}
                </p>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Registered User Email' : 'Correo Electrónico de Usuario'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@nauticoslighthouse.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                  </div>
                </div>

                {/* Captcha Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? 'Security Captcha' : 'Código de Seguridad Captcha'}
                    </label>
                    <button
                      type="button"
                      onClick={handleRefreshCaptcha}
                      className="text-[11px] text-[#00A3E0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{isEn ? 'New code' : 'Cambiar código'}</span>
                    </button>
                  </div>

                  {/* Stylized Captcha Canvas Box */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gradient-to-r from-slate-900 via-[#002147] to-slate-900 p-3 rounded-xl border border-sky-500/30 flex items-center justify-center relative select-none overflow-hidden shadow-inner">
                      {/* Decorative security pattern */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:8px_8px]" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                        <div className="w-full border-t border-dashed border-sky-300 transform -rotate-6" />
                        <div className="w-full border-t border-dashed border-cyan-400 transform rotate-12" />
                      </div>

                      <span className="font-mono text-lg sm:text-xl font-black tracking-[0.4em] text-white drop-shadow-md relative z-10 transform skew-x-3">
                        {captcha.code}
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder={isEn ? 'Code' : 'Código'}
                      className="w-28 py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-mono font-bold uppercase text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {isEn ? 'Cancel' : 'Cancelar'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#00A3E0] hover:bg-[#008cc0] active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-[#00A3E0]/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isEn ? 'Send Code to Email' : 'Enviar Código al Correo'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INGRESO DE CÓDIGO ENVIADO POR CORREO Y NUEVA CONTRASEÑA */}
            {step === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in duration-200">
                {/* Confirmation banner */}
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-5 h-5 text-[#00A3E0] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">
                        {isEn ? 'Verification code sent to your email' : 'Código de verificación enviado a tu correo'}
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-0.5 text-slate-600 dark:text-slate-300">
                        {isEn
                          ? `We have dispatched a verification code to ${email}. Please check your inbox or spam folder and enter the code below:`
                          : `Hemos enviado un código de verificación a ${email}. Por favor revisa tu bandeja de entrada o spam e ingresa el código a continuación:`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Token / Code Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? 'Verification Code from Email' : 'Código de Verificación Recibido'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Ej: CLM-123456</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                      placeholder="CLM-••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-xs sm:text-sm tracking-wider text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'New Password' : 'Nueva Contraseña'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Confirm Password' : 'Confirmar Contraseña'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mandatory Rules Checklist (The 3 user requirements) */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    {isEn ? 'Mandatory Requirements:' : 'Requisitos Obligatorios:'}
                  </span>

                  {/* Rule 1: Min 8 chars */}
                  <div className="flex items-center space-x-2">
                    <CheckCircle2
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        policy.minLengthOk ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <span className={policy.minLengthOk ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {isEn ? 'Minimum 8 characters' : 'Mínimo 8 caracteres'}
                    </span>
                  </div>

                  {/* Rule 2: Letters, numbers & special chars */}
                  <div className="flex items-center space-x-2">
                    <CheckCircle2
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        policy.charsOk ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <span className={policy.charsOk ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {isEn ? 'Letters, numbers, and special characters' : 'Letras, números y caracteres especiales (@, $, %, #, etc.)'}
                    </span>
                  </div>

                  {/* Rule 3: Min one uppercase letter */}
                  <div className="flex items-center space-x-2">
                    <CheckCircle2
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        policy.upperOk ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <span className={policy.upperOk ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {isEn ? 'At least one uppercase letter' : 'Mínimo una letra en mayúscula'}
                    </span>
                  </div>

                  {/* Rule 4: Match confirmation */}
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <CheckCircle2
                        className={`w-4 h-4 transition-colors shrink-0 ${
                          passwordsMatch ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      />
                      <span className={passwordsMatch ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                        {passwordsMatch 
                          ? (isEn ? 'Passwords match' : 'Las contraseñas coinciden')
                          : (isEn ? 'Passwords do not match' : 'Las contraseñas no coinciden')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('request');
                      handleRefreshCaptcha();
                    }}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Back / Change email' : 'Reenviar / Cambiar'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !policy.isValid || !passwordsMatch || !tokenInput.trim()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isEn ? 'Validate Code & Unlock' : 'Validar Código y Desbloquear'}</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
