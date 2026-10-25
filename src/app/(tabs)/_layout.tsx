import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarIcon } from '@/components/tab-bar-icon';
import { colors } from '@/constants/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { height: 72 + insets.bottom }],
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Productos',
          tabBarAccessibilityLabel: 'Productos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={{ ios: 'house', android: 'home', web: 'home' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorías',
          tabBarAccessibilityLabel: 'Categorías',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={{ ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' }}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 10,
    paddingHorizontal: 28,
  },
  tabBarItem: {
    justifyContent: 'center',
  },
  tabBarIcon: {
    width: 44,
    height: 44,
  },
});
