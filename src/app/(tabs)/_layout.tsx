import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Productos' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categorías' }} />
    </Tabs>
  );
}
