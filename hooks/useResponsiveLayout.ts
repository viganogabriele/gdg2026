/**
 * useResponsiveLayout — Cross-platform responsive breakpoint detection.
 *
 * NativeWind md:/lg: prefixes only work on web, so we use useWindowDimensions()
 * to detect breakpoints on all platforms (iOS, Android tablets, web).
 */
import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  /** Current window width */
  width: number;
  /** Current window height */
  height: number;
  /** true when width < 768 */
  isMobile: boolean;
  /** true when 768 <= width < 1024 */
  isTablet: boolean;
  /** true when width >= 1024 */
  isDesktop: boolean;
  /** true when width >= 768 (tablet OR desktop) */
  isWide: boolean;
  /** Recommended content max-width for the current breakpoint */
  contentMaxWidth: number;
  /** Recommended horizontal padding for the current breakpoint */
  contentPadding: number;
  /** Number of columns for grid layouts */
  columns: number;
}

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  const isMobile = width < TABLET_BREAKPOINT;
  const isTablet = width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT;
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const isWide = width >= TABLET_BREAKPOINT;

  const contentMaxWidth = isDesktop ? 960 : isTablet ? 720 : width;
  const contentPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    contentMaxWidth,
    contentPadding,
    columns,
  };
}
