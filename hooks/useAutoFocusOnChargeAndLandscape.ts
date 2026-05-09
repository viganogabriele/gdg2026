import * as Battery from 'expo-battery';
import { useRouter, useSegments } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef } from 'react';

export default function useAutoFocusOnChargeAndLandscape(enabled = true) {
  const router = useRouter();
  const segments = useSegments();
  const stateRef = useRef({ charging: false, landscape: false });

  useEffect(() => {
    if (!enabled) return;

    let batterySub: { remove: () => void } | null = null;
    let orientationSub: { remove: () => void } | null = null;

    async function checkNow() {
      try {
        const b = await Battery.getBatteryStateAsync();
        const charging = b === Battery.BatteryState.CHARGING || b === Battery.BatteryState.FULL;
        const o = await ScreenOrientation.getOrientationAsync();
        const landscape = o === ScreenOrientation.Orientation.LANDSCAPE_LEFT || o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

        stateRef.current = { charging, landscape };
        if (charging && landscape) {
          if (!segments?.includes('focus')) router.push('/focus');
        }
      } catch (e) {
        // ignore
      }
    }

    checkNow();

    batterySub = Battery.addBatteryStateListener(({ batteryState }) => {
      stateRef.current.charging = batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL;
      if (stateRef.current.charging && stateRef.current.landscape) {
        if (!segments?.includes('focus')) router.push('/focus');
      }
    });

    orientationSub = ScreenOrientation.addOrientationChangeListener((evt) => {
      const o = evt.orientationInfo.orientation;
      stateRef.current.landscape = o === ScreenOrientation.Orientation.LANDSCAPE_LEFT || o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      if (stateRef.current.landscape && stateRef.current.charging) {
        if (!segments?.includes('focus')) router.push('/focus');
      }
    });

    return () => {
      try {
        batterySub && batterySub.remove && batterySub.remove();
      } catch {}
      try {
        orientationSub && orientationSub.remove && orientationSub.remove();
      } catch {}
    };
  }, [router, segments, enabled]);
}
