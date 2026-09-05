import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { 
  authenticateCredentials, 
  getLoginSecurityStatus, 
  LoginSecurityStatus,
  sanitizeInput 
} from '../utils/security';

interface LoginScreenProps {
  onLoginSuccess: (userEmail: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [securityStatus, setSecurityStatus] = useState<LoginSecurityStatus>(getLoginSecurityStatus());

  // Real-time lockout countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const current = getLoginSecurityStatus();
      setSecurityStatus(current);
      if (!current.isLocked && error.includes('bloqueado')) {
        setError('');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityStatus.isLocked) return;

    setError('');

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authenticateCredentials(cleanEmail, cleanPassword);
      if (result.success) {
        onLoginSuccess(cleanEmail);
      } else {
        setError(result.error || 'Credenciales inválidas.');
        setSecurityStatus(getLoginSecurityStatus());
        setIsSubmitting(false);
      }
    } catch {
      setError('Error al procesar la autenticación.');
      setIsSubmitting(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#00A3E0] selection:text-white">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00A3E0]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#002147]/80 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="bg-[#002147] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 text-center border-b border-white/10 bg-gradient-to-b from-[#002b5c] to-[#002147]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00A3E0] shadow-lg shadow-[#00A3E0]/30 text-white mb-4">
              <Anchor className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Cancun Lighthouse Marina
            </h1>
            <p className="text-xs text-slate-300 font-normal mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00A3E0]" />
              Acceso Seguro al Portal de Operaciones
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 bg-slate-900/90 backdrop-blur-md">
            {/* Lockout Warning Banner */}
            {securityStatus.isLocked ? (
              <div className="p-4 mb-5 bg-rose-950/70 border border-rose-600/40 rounded-xl text-center space-y-2 animate-in fade-in">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 mb-1">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-rose-200">Acceso Temporalmente Bloqueado</h3>
                <p className="text-xs text-rose-300/90 leading-relaxed">
                  Por seguridad ante múltiples intentos fallidos, las solicitudes han sido restringidas.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-900/60 rounded-lg text-xs font-mono font-bold text-rose-200 border border-rose-700/50">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Espera: {formatCountdown(securityStatus.remainingLockoutSeconds)}</span>
                </div>
              </div>
            ) : (
              /* Attempt Rate Limit Counter if errors occurred */
              securityStatus.failedAttempts > 0 && (
                <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 flex items-center justify-between">
                  <span>Intentos fallidos: {securityStatus.failedAttempts} de {securityStatus.totalAttemptsAllowed}</span>
                  <span className="font-semibold text-amber-400">
                    {securityStatus.remainingAttempts} restante{securityStatus.remainingAttempts === 1 ? '' : 's'}
                  </span>
                </div>
              )
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Notification */}
              {error && !securityStatus.isLocked && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input (Starts completely blank) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo Electrónico / Usuario
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-email"
                    type="email"
                    autoComplete="username"
                    disabled={securityStatus.isLocked || isSubmitting}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@cancunlighthousemarina.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-[#00A3E0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input (Starts completely blank) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={securityStatus.isLocked || isSubmitting}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-[#00A3E0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={securityStatus.isLocked}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer disabled:opacity-40"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
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
                disabled={securityStatus.isLocked || isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-[#00A3E0] hover:bg-[#008cc0] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-[#00A3E0]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Protección activa con cifrado y límite de intentos</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          © {new Date().getFullYear()} Cancun Lighthouse Marina. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};
