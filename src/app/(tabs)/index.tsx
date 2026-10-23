import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

export default function ProductListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Tabs.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View accessibilityElementsHidden style={styles.iconButton}>
          <View style={styles.menuLines}>
            <View style={styles.menuLineLong} />
            <View style={styles.menuLineLong} />
            <View style={styles.menuLineShort} />
          </View>
        </View>

        <Text style={styles.brand}>PANEL</Text>

        <Pressable
          accessibilityLabel="Nuevo producto"
          accessibilityRole="button"
          onPress={() => router.push('/product/new')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconButtonPressed: {
    opacity: 0.65,
  },
  menuLines: {
    gap: 4,
  },
  menuLineLong: {
    backgroundColor: colors.text,
    height: 2,
    width: 16,
  },
  menuLineShort: {
    backgroundColor: colors.text,
    height: 2,
    width: 10,
  },
  brand: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  addIcon: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 26,
  },
});
