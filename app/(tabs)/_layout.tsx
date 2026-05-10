/**
 * Tab Layout — Home, Roadmap, Profile with custom styled tab bar
 */
import { HapticTab } from '@/components/haptic-tab';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, NucleoIconName> = {
    home: 'house',
    roadmap: 'calendar',
    leaderboard: 'award-blue',
    profile: 'face-grin',
    settings: 'dial',
  };
  return (
    <View
      className={`h-[36px] w-[44px] items-center justify-center self-center rounded-[18px] ${focused ? 'bg-[rgba(108,92,231,0.15)]' : ''
        }`}
    >
      <NucleoIcon
        name={icons[name] || 'folder'}
        size={focused ? 22 : 20}
        className={focused ? 'opacity-100' : 'opacity-50'}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.bg.secondary,
          borderTopColor: Colors.border.subtle,
          borderTopWidth: 1,
          height: 82,
          paddingTop: 6,
          paddingBottom: 16,
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
