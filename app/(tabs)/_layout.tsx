/**
 * Tab Layout — Home, Roadmap, Profile with custom styled tab bar
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, NucleoIconName> = {
    home: 'house',
    roadmap: 'folder',
    profile: 'face-grin',
  };
  return (
    <View className={`items-center justify-center w-[40px] h-[32px] rounded-[16px] ${focused ? 'bg-[rgba(108,92,231,0.15)]' : ''}`}>
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
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
