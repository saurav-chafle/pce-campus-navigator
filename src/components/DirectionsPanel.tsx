import { motion } from 'framer-motion';
import { Navigation, ArrowRight, ArrowLeft, CornerUpRight, CornerUpLeft, Circle, MapPin } from 'lucide-react';
import { DirectionStep } from '@/utils/pathfinding';
import { formatDistance } from '@/utils/navigation';

interface DirectionsPanelProps {
  steps: DirectionStep[];
  totalDistance: number;
  destinationName: string;
}

export function DirectionsPanel({ steps, totalDistance, destinationName }: DirectionsPanelProps) {
  const getIcon = (instruction: string) => {
    if (instruction.includes('Turn right')) return <CornerUpRight className="w-5 h-5" />;
    if (instruction.includes('Turn left')) return <CornerUpLeft className="w-5 h-5" />;
    if (instruction.includes('Bear right')) return <ArrowRight className="w-5 h-5" />;
    if (instruction.includes('Bear left')) return <ArrowLeft className="w-5 h-5" />;
    if (instruction.includes('Start')) return <Circle className="w-5 h-5" />;
    if (instruction.includes('Arrive')) return <MapPin className="w-5 h-5" />;
    return <Navigation className="w-5 h-5" />;
  };

  const getIconColor = (instruction: string) => {
    if (instruction.includes('Start')) return 'text-primary bg-primary/10';
    if (instruction.includes('Arrive')) return 'text-destructive bg-destructive/10';
    return 'text-muted-foreground bg-secondary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card rounded-xl overflow-hidden mt-3"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-primary/5 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Directions to {destinationName}</span>
          <span className="text-sm text-primary font-semibold">{formatDistance(totalDistance)}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="max-h-48 overflow-y-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(step.instruction)}`}>
              {getIcon(step.instruction)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{step.instruction}</p>
              {step.distance > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Walk {formatDistance(step.distance)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
