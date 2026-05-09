import { NucleoIcon } from '@/components/ui/NucleoIcon';
import Animated from 'react-native-reanimated';

export function HelloWave() {
  return (
    <Animated.View
      style={{
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      <NucleoIcon name="face-grin" size={28} />
    </Animated.View>
  );
}
