import { motion } from 'framer-motion';
import { Navigation, ArrowRight, ArrowLeft, CornerUpRight, CornerUpLeft, Circle, MapPin, MoveRight, ArrowUp } from 'lucide-react';
import { DirectionStep } from '@/utils/pathfinding';
import { formatDistance } from '@/utils/navigation';

interface DirectionsPanelProps {
  steps: DirectionStep[];
  totalDistance: number;
  destinationName: string;
}

export function DirectionsPanel({ steps, totalDistance, destinationName }: DirectionsPanelProps) {
  const getIcon = (step: DirectionStep) => {
    const instruction = step.instruction.toLowerCase();
    
    if (instruction.includes('arrive') || instruction.includes('destination')) {
      return <MapPin className="w-5 h-5" />;
    }
    if (instruction.includes('start') || instruction.includes('depart') || instruction.includes('head')) {
      return <Circle className="w-5 h-5" />;
    }
    
    if (instruction.includes('turn right') || instruction.includes('sharp right')) return <CornerUpRight className="w-5 h-5" />;
    if (instruction.includes('turn left') || instruction.includes('sharp left')) return <CornerUpLeft className="w-5 h-5" />;
    if (instruction.includes('bear right') || instruction.includes('keep right')) return <ArrowRight className="w-5 h-5" />;
    if (instruction.includes('bear left') || instruction.includes('keep left')) return <ArrowLeft className="w-5 h-5" />;
    if (instruction.includes('straight') || instruction.includes('continue')) return <ArrowUp className="w-5 h-5" />;
    
    return <Navigation className="w-5 h-5" />;
  };

  const getIconColor = (step: DirectionStep) => {
    const instruction = step.instruction.toLowerCase();
    if (instruction.includes('start') || instruction.includes('depart') || instruction.includes('head')) {
      return 'text-primary bg-primary/10';
    }
    if (instruction.includes('arrive') || instruction.includes('destination')) {
      return 'text-destructive bg-destructive/10';
    }
    return 'text-muted-foreground bg-secondary';
  };

  // Filter out very short steps or depart steps that don't add value
  const filteredSteps = steps.filter((step, index) => {
    // Always keep first, last, and substantial steps
    if (index === 0 || index === steps.length - 1) return true;
    if (step.distance > 5) return true;
    return false;
  });

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
        {filteredSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(step)}`}>
              {getIcon(step)}
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
