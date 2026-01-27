import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  onSkip: () => void;
}

export function LocationPermissionModal({
  isOpen,
  onRequestPermission,
  onSkip,
}: LocationPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-xl"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <Navigation className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-foreground mb-2">
              Enable Location
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Allow PCE Navigator to access your location for real-time navigation and directions within the campus.
            </p>

            <div className="space-y-3">
              <button
                onClick={onRequestPermission}
                className="w-full nav-button-primary"
              >
                <MapPin className="w-5 h-5" />
                <span>Enable Location</span>
              </button>
              
              <button
                onClick={onSkip}
                className="w-full nav-button-secondary"
              >
                <span>Maybe Later</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
