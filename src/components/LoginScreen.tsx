import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  KeyRound,
  CheckCircle2,
  LockKeyhole,
  ArrowLeft,
  Send,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  authenticateCredentials, 
  sanitizeInput,
  UserAccount,
  requestPasswordReset,
  completePasswordReset,
  validatePasswordPolicy,
  fetchBackendCaptcha
} from '../utils/security';
import { OfficialLogoMark } from './OfficialLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { OceanWavesBackground } from './OceanWavesBackground';
import { useLanguage } from '../context/LanguageContext';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, isEn } = useLanguage();

  // Mode: standard login or embedded change-password form
  const [viewMode, setViewMode] = useState<'login' | 'change-password'>('login');

  // Standard login fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mustResetPassword, setMustResetPassword] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  // Embedded Password Change fields inside LoginScreen
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>('');
  const [isResetSubmitting, setIsResetSubmitting] = useState<boolean>(false);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [codeSentNotice, setCodeSentNotice] = useState<string>('');

  // Captcha for sending code
  const [captcha, setCaptcha] = useState<{ id: string; code: string }>({ id: '', code: '•••••' });
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [showCaptchaField, setShowCaptchaField] = useState<boolean>(false);

  const loadCaptcha = async () => {
    try {
      const c = await fetchBackendCaptcha();
      setCaptcha(c);
      setCaptchaInput('');
    } catch {
      setCaptcha({ id: `local_${Date.now()}`, code: '7K9M2' });
    }
  };

  useEffect(() => {
    if (showCaptchaField) {
      loadCaptcha();
    }
  }, [showCaptchaField]);

  // Handle standard login
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
          setResetEmail(cleanEmail);
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

  // Switch to change password mode
  const handleOpenChangePassword = (targetEmail?: string) => {
    setError('');
    setResetError('');
    setCodeSentNotice('');
    setResetEmail(targetEmail || email);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCaptchaField(false);
    setViewMode('change-password');
  };

  // Dispatch verification code to user's real email
  const handleSendVerificationCode = async () => {
    const cleanEmail = sanitizeInput(resetEmail);
    if (!cleanEmail) {
      setResetError(isEn ? 'Please enter your email to receive the code.' : 'Por favor ingresa tu correo para recibir el código.');
      return;
    }

    if (!showCaptchaField) {
      setShowCaptchaField(true);
      await loadCaptcha();
      return;
    }

    if (!captchaInput.trim()) {
      setResetError(isEn ? 'Please enter the Captcha code.' : 'Por favor introduce el código Captcha.');
      return;
    }

    setResetError('');
    setIsSendingCode(true);

    try {
      const res = await requestPasswordReset(cleanEmail, captchaInput, captcha.id);
      setIsSendingCode(false);

      if (res.success) {
        setCodeSentNotice(
          isEn 
            ? `Verification code dispatched to ${cleanEmail}. Check your inbox or spam.` 
            : `Código de verificación enviado a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`
        );
        setShowCaptchaField(false);
      } else {
        setResetError(res.error || (isEn ? 'Could not send verification code.' : 'No se pudo enviar el código de verificación.'));
        loadCaptcha();
      }
    } catch {
      setIsSendingCode(false);
      setResetError(isEn ? 'Error connecting to the security server.' : 'Error al conectar con el servidor.');
      loadCaptcha();
    }
  };

  // Handle password change submission inside LoginScreen
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const cleanEmail = sanitizeInput(resetEmail);
    const cleanToken = sanitizeInput(resetToken);
    const cleanNewPass = newPassword;

    if (!cleanEmail || !cleanToken || !cleanNewPass) {
      setResetError(isEn ? 'Please complete all required fields.' : 'Por favor completa todos los campos requeridos.');
      return;
    }

    const policy = validatePasswordPolicy(cleanNewPass);
    if (!policy.isValid) {
      setResetError(
        isEn 
          ? 'Password does not fulfill mandatory security requirements.' 
          : 'La contraseña no cumple con los requisitos obligatorios de seguridad (mayúsculas, números, caracteres especiales).'
      );
      return;
    }

    if (cleanNewPass !== confirmPassword) {
      setResetError(isEn ? 'Passwords do not match.' : 'Las contraseñas no coinciden.');
      return;
    }

    setIsResetSubmitting(true);

    try {
      const res = await completePasswordReset(cleanEmail, cleanToken, cleanNewPass);
      setIsResetSubmitting(false);

      if (res.success) {
        setEmail(cleanEmail);
        setPassword('');
        setMustResetPassword(false);
        setRemainingAttempts(5);
        setViewMode('login');
        setSuccessMessage(
          isEn 
            ? 'Password updated successfully! Your account has been unlocked. You can now log in.' 
            : '¡Contraseña actualizada exitosamente! Tu cuenta ha sido desbloqueada. Ya puedes ingresar con tu nueva clave.'
        );
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        setResetError(res.error || (isEn ? 'Could not update password.' : 'No se pudo actualizar la contraseña. Revisa el código de verificación.'));
      }
    } catch {
      setIsResetSubmitting(false);
      setResetError(isEn ? 'Error communicating with security server.' : 'Error de comunicación con el servidor de seguridad.');
    }
  };

  const handlePasswordResetSuccess = (resetEmailDone: string) => {
    setEmail(resetEmailDone);
    setPassword('');
    setMustResetPassword(false);
    setRemainingAttempts(5);
    setViewMode('login');
    setSuccessMessage(
      isEn 
        ? 'Password updated successfully! Your account is unlocked. You can now log in.'
        : '¡Contraseña actualizada exitosamente! Tu cuenta ha sido desbloqueada. Ya puedes iniciar sesión.'
    );
    setTimeout(() => setSuccessMessage(''), 8000);
  };

  return (
    <div className="min-h-screen w-full text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Aesthetic Caribbean Ocean Waves Animated Background */}
      <OceanWavesBackground />

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

      {/* Center Aesthetic Login & Password Reset Box */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,163,224,0.3)] overflow-hidden"
        >
          {/* Card Top Banner with Official Logo */}
          <div className="p-6 sm:p-7 text-center bg-gradient-to-b from-[#052b57]/90 to-transparent border-b border-white/10 relative overflow-hidden">
            {/* Top decorative spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#00A3E0]/20 blur-2xl pointer-events-none" />

            {/* Official Logo Container */}
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white text-[#002147] shadow-xl shadow-black/40 mb-3 transform hover:scale-105 transition-transform">
              <OfficialLogoMark className="w-10 h-10" color="#002147" />
            </div>

            {/* Brand Title */}
            <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white font-sans flex items-center justify-center gap-2">
              <span>CANCUN</span>
              <span className="text-[#00A3E0]">LIGHTHOUSE</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] text-sky-200 uppercase mt-0.5">
              MARINA • OPERATING SYSTEM
            </p>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>
                {viewMode === 'change-password'
                  ? (isEn ? 'Secure Password Recovery & Reset' : 'Cambio Seguro de Contraseña')
                  : (isEn ? 'Restricted Access • Authorized Users Only' : 'Acceso Restringido • Usuarios Autorizados')}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* VIEW MODE 1: STANDARD LOGIN FORM */}
            {viewMode === 'login' && (
              <>
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
                      onClick={() => handleOpenChangePassword(email)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Change Password in LoginScreen Now' : 'Cambiar Contraseña Ahora'}</span>
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
                        onClick={() => handleOpenChangePassword(email)}
                        className="text-[11px] font-semibold text-[#00A3E0] hover:text-sky-300 transition hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>{isEn ? 'Change password?' : '¿Cambiar contraseña?'}</span>
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
              </>
            )}

            {/* VIEW MODE 2: FORMULARIO DE CAMBIO DE CONTRASEÑA DENTRO DE LOGINSCREEN */}
            {viewMode === 'change-password' && (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#00A3E0]" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {isEn ? 'Password Change Form' : 'Formulario de Cambio de Contraseña'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setResetError('');
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>{isEn ? 'Back to Login' : 'Volver al Inicio'}</span>
                  </button>
                </div>

                {/* Reset Error Notification */}
                {resetError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                {/* Code Sent Notice */}
                {codeSentNotice && (
                  <div className="p-3 bg-sky-500/15 border border-sky-500/30 rounded-xl text-xs text-sky-300 flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{codeSentNotice}</span>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isEn ? 'Registered Email' : 'Correo Registrado'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="usuario@nauticoslighthouse.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                  </div>
                </div>

                {/* Captcha popup if requested to send code */}
                {showCaptchaField && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-sky-300">
                        {isEn ? 'Security Captcha Verification' : 'Verificación Captcha de Seguridad'}
                      </span>
                      <button
                        type="button"
                        onClick={loadCaptcha}
                        className="text-slate-400 hover:text-white p-1"
                        title="Actualizar Captcha"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg font-mono font-bold text-sm tracking-widest text-sky-300 select-none">
                        {captcha.code}
                      </div>
                      <input
                        type="text"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                        placeholder={isEn ? 'Type Captcha' : 'Escribe Captcha'}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                      />
                    </div>
                  </div>
                )}

                {/* Token / Code Input with Dispatch Helper */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {isEn ? 'Verification Code from Email' : 'Código de Verificación'}
                    </label>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode}
                      className="text-[11px] font-semibold text-[#00A3E0] hover:text-sky-300 transition hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>{isSendingCode ? (isEn ? 'Sending...' : 'Enviando...') : (isEn ? 'Send code to email' : 'Enviar código a mi correo')}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                      placeholder="CLM-••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono uppercase font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                  </div>
                </div>

                {/* New Password Input with VISUALIZADOR DE FORTALEZA */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* VISUALIZADOR DE FORTALEZA DE CONTRASEÑA (COLOR + REQUISITOS) */}
                  <PasswordStrengthIndicator password={newPassword} isEn={isEn} />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isEn ? 'Confirm New Password' : 'Confirmar Nueva Contraseña'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="text-[10px] text-rose-400 mt-1 block">
                      {isEn ? 'Passwords do not match' : 'Las contraseñas no coinciden'}
                    </span>
                  )}
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isEn ? 'Update Password & Unlock Account' : 'Actualizar Contraseña y Desbloquear'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Badge Footer */}
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
