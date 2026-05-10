import { NucleoIconName } from '@/components/ui/NucleoIcon';

export interface MedalConfig {
  bg: string;
  border: string;
  text: string;
  icon: NucleoIconName;
}

export const MEDAL: Record<1 | 2 | 3, MedalConfig> = {
  1: { bg: '#3a2a00', border: '#FFD000', text: '#FFD000', icon: 'award-gold'   },
  2: { bg: '#1e2530', border: '#b0bec5', text: '#b0bec5', icon: 'award-silver' },
  3: { bg: '#2a1a0a', border: '#cd7f32', text: '#cd7f32', icon: 'award-bronze' },
};
