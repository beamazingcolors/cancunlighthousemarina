import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NetworkStatusBanner: React.FC<{ onReconnect?: () => void }> = ({ onReconnect }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      if (onReconnect) onReconnect();
      setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onReconnect]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md relative z-50 overflow-hidden"
        >
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-bounce" />
            <span>Sin conexión a Internet. Visualizando datos locales almacenados en memoria.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded text-[11px] font-bold cursor-pointer"
          >
            Reintentar
          </button>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center space-x-2 shadow-md relative z-50 overflow-hidden"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Conexión restablecida! Datos sincronizados con el servidor.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
