import React, { useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Anchor, 
  FileCheck2, 
  CheckCircle2, 
  X, 
  KeyRound, 
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface SecurityCertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityCertificatesModal: React.FC<SecurityCertificatesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const certificates = [
    {
      id: 'ssl-tls',
      title: isEn ? '256-Bit SSL Encryption TLS 1.3 & SHA-256' : 'Cifrado SSL 256-Bit TLS 1.3 & SHA-256',
      authority: isEn ? 'Global Cryptographic Security Certificate' : 'Certificado de Seguridad Criptográfica Global',
      badge: isEn ? 'Active Cryptography' : 'Criptografía Activa',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Lock,
      description: isEn 
        ? 'All financial and operational data transfer between client and Google Cloud Platform is protected with bank-grade TLS 1.3 encryption and SHA-256 authentication algorithms.'
        : 'Toda la transferencia de datos financieros y operativos entre el cliente y Google Cloud Platform está protegida con cifrado de grado bancario TLS 1.3 y algoritmos de autenticación SHA-256.',
      spec: isEn ? 'TLS 1.3 Protocol / AES-256-GCM / SHA-256 Digest' : 'Protocolo TLS 1.3 / AES-256-GCM / Digest SHA-256'
    },
    {
      id: 'sct-marina',
      title: isEn ? 'SCT & Mexico Port Captaincy Regulations' : 'Normativa SCT & Capitanía de Puerto México',
      authority: isEn ? 'Merchant Marine & Tourist Docking Regulation' : 'Regulación de Marina Mercante & Atraque Turístico',
      badge: isEn ? '2026 Compliance' : 'Cumplimiento 2026',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: Anchor,
      description: isEn
        ? 'Slip registration, departure/docking time calculations, and dock fee collection comply with official regulations for tourist vessels and private yachts in Cancun and Isla Mujeres.'
        : 'El registro de folios, cálculo de tiempos de zarpe/desembarque y cobranza por concepto de muellaje se apega al reglamento oficial para embarcaciones turísticas y yates privados de Cancún e Isla Mujeres.',
      spec: isEn ? 'Cancun Port Captaincy • Hotel Zone Km 4.5' : 'Capitanía de Puerto Cancún • Zona Hotelera Km 4.5'
    },
    {
      id: 'safe-harbor',
      title: 'Safe Maritime Harbor Protocol 2026',
      authority: isEn ? 'International Nautical Safety Standard' : 'Estándar Internacional de Seguridad Náutica',
      badge: isEn ? 'Verified' : 'Verificado',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: Award,
      description: isEn
        ? 'Validation of vendor civil liability insurance, maximum passenger capacity allowed by vessel length (adult, child, infant PAX), and active life jacket protocols.'
        : 'Validación de seguros de responsabilidad civil de proveedores, cupos máximos permitidos por eslora (PAX adultos, niños e infantes) y protocolos de salvavidas vigentes.',
      spec: isEn ? 'Safe Harbor Marina Standard • Continuous Audit' : 'Safe Harbor Marina Standard • Auditoría Continua'
    },
    {
      id: 'sat-fiscal',
      title: isEn ? 'Fiscal Audit of Income & VAT' : 'Auditoría Fiscal de Ingresos & IVA',
      authority: isEn ? 'Financial Control & SAT Tax Reconciliation' : 'Control Financiero & Conciliación SAT',
      badge: isEn ? 'Automated Reconciliation' : 'Conciliación Automática',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      icon: FileCheck2,
      description: isEn
        ? 'Standardized structure for sales reps net commissions, house commission withholding, and non-taxable dock fee accounting separation.'
        : 'Estructuración estandarizada para comisiones netas de vendedores, retención de comisiones de casa y separación contable del impuesto por derecho de muelle no gravable.',
      spec: isEn ? 'Federal Tax Code • Weekly Audited Report' : 'Código Fiscal Federal • Reporte Semanal Auditado'
    },
    {
      id: 'rate-limit',
      title: isEn ? 'Anti-Brute Force Protection & Rate Limiting' : 'Protección Anti Fuerza Bruta & Rate Limiting',
      authority: isEn ? 'Active Perimeter Defense System' : 'Sistema de Defensa Perimetral Activa',
      badge: isEn ? 'Active Shield' : 'Escudo Activo',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: KeyRound,
      description: isEn
        ? 'Automatic detection of unauthorized access attempts, 5-attempt threshold with exponential lockout, and sync saturation protection.'
        : 'Detección automática de intentos no autorizados de acceso, límite de 5 intentos con bloqueo exponencial temporal y protección contra saturación de sincronización.',
      spec: '5 Max Tries • Timing Jitter Defense • Multi-session Check'
    }
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#002147] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#001733] relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full bg-radial from-[#00A3E0]/20 to-transparent pointer-events-none" />
            <div className="flex items-center space-x-3.5 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white shadow-lg shadow-[#00A3E0]/30 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{isEn ? 'Certifications & Trust Badges' : 'Certificaciones & Sellos de Confianza'}</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isEn ? 'Cancun Lighthouse Marina • 2026 Audit & Operational Security' : 'Cancun Lighthouse Marina • Auditoría y Seguridad Operativa 2026'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer relative z-10"
              title={isEn ? 'Close modal' : 'Cerrar modal'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl text-xs text-sky-900 dark:text-sky-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00A3E0] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isEn
                  ? 'This portal operates under strict data integrity and maritime financial confidentiality policies. All operations and transactions are timestamped and cryptographically verified.'
                  : 'Este portal opera bajo estrictas políticas de integridad de datos y confidencialidad financiera marítima. Todas las operaciones y transacciones se registran con firma de tiempo y validación criptográfica.'}
              </p>
            </div>

            <div className="space-y-3">
              {certificates.map((cert) => {
                const IconComponent = cert.icon;
                return (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-[#002147] text-[#00A3E0] dark:bg-[#00A3E0]/20 dark:text-cyan-300">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {cert.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {cert.authority}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${cert.badgeColor}`}>
                        {cert.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                      {cert.description}
                    </p>

                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span>{cert.spec}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {isEn ? 'Status: Valid 2026' : 'Estado: Válido 2026'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-center sm:text-left">
              {isEn ? 'System ID:' : 'ID de Sistema:'} <strong className="text-slate-700 dark:text-slate-200 font-mono">CLM-SEC-2026-PROD</strong>
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#002147] hover:bg-[#002b5c] dark:bg-[#00A3E0] dark:hover:bg-[#008ec4] text-white font-semibold transition cursor-pointer"
            >
              {isEn ? 'Understood' : 'Entendido'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
