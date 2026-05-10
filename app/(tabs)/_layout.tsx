/**
 * Tab Layout — Home, Roadmap, Leaderboard, Profile, Settings
 *
 * On desktop (>= 1024px): renders a custom fixed top navbar and hides the
 * bottom tab bar entirely.
 * On mobile / tablet: keeps the existing styled bottom tab bar.
 */
import { HapticTab } from '@/components/haptic-tab';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Shared icon map
// ---------------------------------------------------------------------------

const TAB_ICONS: Record<string, NucleoIconName> = {
  home: 'house',
  roadmap: 'calendar',
  leaderboard: 'award-blue',
  profile: 'face-grin',
  settings: 'dial',
};

// ---------------------------------------------------------------------------
// Mobile / tablet bottom-bar icon pill
// ---------------------------------------------------------------------------

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View
      style={{
        height: 36,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 18,
        backgroundColor: focused ? 'rgba(17,86,174,0.15)' : 'transparent',
      }}
    >
      <NucleoIcon
        name={TAB_ICONS[name] || 'folder'}
        size={focused ? 22 : 20}
        style={{ opacity: focused ? 1 : 0.5 }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Desktop top navbar
// ---------------------------------------------------------------------------

const NAV_LINKS: { route: string; label: string }[] = [
  { route: 'index', label: 'Home' },
  { route: 'roadmap', label: 'Roadmap' },
  { route: 'leaderboard', label: 'Ranking' },
  { route: 'profile', label: 'Profile' },
  { route: 'settings', label: 'Settings' },
];

function DesktopNavBar({ state, navigation }: Pick<BottomTabBarProps, 'state' | 'navigation'>) {
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11,21,30,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
        // @ts-ignore web only
        backdropFilter: 'blur(16px)',
        // @ts-ignore web only
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <View
        style={{
          height: 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 40,
          maxWidth: 1200,
          alignSelf: 'center',
          width: '100%',
        }}
      >
        {/* Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <NucleoIcon name="book-open" size={22} />
          <Text
            style={{
              color: Colors.text.primary,
              fontWeight: '800',
              fontSize: 17,
              letterSpacing: -0.3,
            }}
          >
            StudyQuest
          </Text>
        </View>

        {/* Nav links */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          {NAV_LINKS.map((link, index) => {
            const isActive = state.index === index;
            return (
              <Pressable
                key={link.route}
                onPress={() => navigation.navigate(link.route)}
                style={({ hovered }: any) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: isActive
                    ? `${Colors.accent.primary}22`
                    : hovered
                    ? `${Colors.bg.tertiary}99`
                    : 'transparent',
                  borderWidth: isActive ? 1 : 0,
                  borderColor: isActive ? `${Colors.accent.primary}44` : 'transparent',
                })}
              >
                <NucleoIcon
                  name={TAB_ICONS[link.route] || 'folder'}
                  size={15}
                  style={{ opacity: isActive ? 1 : 0.45 }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? Colors.accent.primary : Colors.text.muted,
                    letterSpacing: 0.1,
                  }}
                >
                  {link.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Unified custom tab bar — delegates to desktop or mobile renderer
// ---------------------------------------------------------------------------

function CustomTabBar(props: BottomTabBarProps) {
  const { isDesktop, isWide } = useResponsiveLayout();

  if (isDesktop) {
    return <DesktopNavBar state={props.state} navigation={props.navigation} />;
  }

  // Mobile / tablet: render the default bottom bar via a plain View wrapper.
  // We cannot call the default renderer directly from here, so we replicate
  // the styled tab items manually to keep full parity with the previous
  // screenOptions approach.
  const { state, descriptors, navigation } = props;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{
        backgroundColor: Colors.bg.secondary,
        borderTopColor: Colors.border.subtle,
        borderTopWidth: 1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          height: 82,
          paddingTop: 6,
          paddingBottom: 16,
          ...(isWide ? { paddingHorizontal: 40 } : {}),
        }}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const label = descriptor.options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
              }}
            >
              <TabIcon name={route.name} focused={isFocused} />
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  fontWeight: '500',
                  color: isFocused ? Colors.accent.primary : Colors.text.muted,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function TabLayout() {
  const { isDesktop, isWide } = useResponsiveLayout();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        // Keep these as fallback for any platform that ignores tabBar prop.
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : {
              backgroundColor: Colors.bg.secondary,
              borderTopColor: Colors.border.subtle,
              borderTopWidth: 1,
              height: 82,
              paddingTop: 6,
              paddingBottom: 16,
              ...(isWide ? { paddingHorizontal: 40 } : {}),
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
          alignSelf: 'center',
        },
        sceneStyle: isDesktop ? { paddingTop: 56 } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ focused }) => <TabIcon name="roadmap" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ focused }) => <TabIcon name="leaderboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
