import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building2, 
  TreePine, 
  Church, 
  UtensilsCrossed, 
  Briefcase 
} from 'lucide-react';
import { CampusLocation } from '@/data/campusLocations';

interface QuickCategoriesProps {
  onCategorySelect: (category: CampusLocation['category']) => void;
  selectedCategory: CampusLocation['category'] | null;
}

const categories = [
  { id: 'academic' as const, label: 'Academic', icon: GraduationCap, color: '#4285F4' },
  { id: 'facility' as const, label: 'Facilities', icon: Building2, color: '#34A853' },
  { id: 'recreation' as const, label: 'Recreation', icon: TreePine, color: '#FBBC04' },
  { id: 'religious' as const, label: 'Religious', icon: Church, color: '#EA4335' },
  { id: 'food' as const, label: 'Food', icon: UtensilsCrossed, color: '#FF6D00' },
  { id: 'admin' as const, label: 'Admin', icon: Briefcase, color: '#9C27B0' },
];

export function QuickCategories({ onCategorySelect, selectedCategory }: QuickCategoriesProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategorySelect(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card text-foreground shadow-card hover:shadow-md'
              }`}
              style={isSelected ? {} : { borderLeft: `3px solid ${category.color}` }}
            >
              <Icon className="w-4 h-4" style={{ color: isSelected ? 'currentColor' : category.color }} />
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
